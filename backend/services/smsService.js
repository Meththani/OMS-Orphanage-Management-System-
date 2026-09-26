/**
 * SMS Notification Service
 * Supports Twilio, Textbelt Free API, and built-in logger fallback.
 */

let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC_')) {
      try {
        const twilio = require('twilio');
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      } catch (err) {
        console.warn('[SMS Service] Failed to initialize Twilio client:', err.message);
      }
    }
  }
  return twilioClient;
}

/**
 * Send SMS message to donor phone number
 * @param {Object} options
 * @param {string} options.to - Recipient phone number (e.g. +94771234567 or 0771234567)
 * @param {string} options.message - Text message content
 * @returns {Promise<{success: boolean, messageId?: string, provider: string, simulated?: boolean, error?: string}>}
 */
async function sendSMS({ to, message }) {
  if (!to) {
    return { success: false, provider: 'none', error: 'No recipient phone number provided' };
  }

  // Format phone number if local format e.g. 0771234567 to standard format
  let formattedTo = to.trim();
  if (formattedTo.startsWith('0') && formattedTo.length === 10) {
    // Default country code assumed e.g. Sri Lanka (+94) if starts with 0
    formattedTo = `+94${formattedTo.slice(1)}`;
  }

  // 1. Try NotifyLK (Sri Lankan Local Gateway) if configured or explicitly selected
  if (process.env.SMS_PROVIDER === 'notifylk' || (process.env.NOTIFYLK_USER_ID && process.env.NOTIFYLK_API_KEY)) {
    try {
      // NotifyLK expects phone number without leading '+' e.g. 94771234567 or 0771234567
      const notifyLkPhone = formattedTo.startsWith('+') ? formattedTo.slice(1) : formattedTo;
      const notifyLkParams = new URLSearchParams({
        user_id: process.env.NOTIFYLK_USER_ID || '',
        api_key: process.env.NOTIFYLK_API_KEY || '',
        sender_id: process.env.NOTIFYLK_SENDER_ID || 'NotifyDEMO',
        to: notifyLkPhone,
        message: message,
      });

      const response = await fetch(`https://app.notify.lk/api/v1/send?${notifyLkParams.toString()}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.status === 'success' || data.code === 200) {
        console.log(`[SMS Service - NotifyLK] Sent SMS to ${notifyLkPhone}. MsgID: ${data.data?.msg_id || 'OK'}`);
        return { success: true, provider: 'notifylk', messageId: String(data.data?.msg_id || 'OK') };
      } else {
        console.warn(`[SMS Service - NotifyLK Warning] ${data.message || JSON.stringify(data)}`);
      }
    } catch (notifyLkErr) {
      console.error('[SMS Service - NotifyLK Error]', notifyLkErr.message);
    }
  }

  // 2. Try Twilio Gateway if credentials configured
  const client = getTwilioClient();
  if (client && process.env.TWILIO_PHONE_NUMBER && (process.env.SMS_PROVIDER === 'twilio' || !process.env.SMS_PROVIDER)) {
    try {
      const res = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedTo,
      });
      console.log(`[SMS Service - Twilio] Sent SMS to ${formattedTo}. SID: ${res.sid}`);
      return { success: true, provider: 'twilio', messageId: res.sid };
    } catch (twilioErr) {
      console.error('[SMS Service - Twilio Error]', twilioErr.message);
      // Fall through to textbelt / logger simulation
    }
  }

  // 3. Try Textbelt Free API if configured or explicitly selected
  if (process.env.SMS_PROVIDER === 'textbelt' || process.env.TEXTBELT_KEY) {
    try {
      const textbeltKey = process.env.TEXTBELT_KEY || 'textbelt';
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedTo,
          message: message,
          key: textbeltKey,
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log(`[SMS Service - Textbelt] Sent SMS to ${formattedTo}. TextId: ${data.textId}`);
        return { success: true, provider: 'textbelt', messageId: String(data.textId) };
      } else {
        console.warn(`[SMS Service - Textbelt Warning] ${data.error}`);
      }
    } catch (textbeltErr) {
      console.error('[SMS Service - Textbelt Error]', textbeltErr.message);
    }
  }

  // 3. Fallback: Simulation Logger (Guarantees dev environment works reliably without paid credentials)
  const simId = `SIM-${Date.now()}`;
  console.log(`\n==================================================`);
  console.log(`📲 [SMS REMINDER SENT - SIMULATION MODE]`);
  console.log(`To: ${formattedTo}`);
  console.log(`Message:\n"${message}"`);
  console.log(`Simulated ID: ${simId}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log(`==================================================\n`);

  return {
    success: true,
    provider: 'simulation',
    simulated: true,
    messageId: simId,
  };
}

/**
 * Format Meal Donation Confirmation & Reminder SMS content
 * @param {Object} params
 * @param {string} params.donorName
 * @param {string} params.mealDateFormatted
 * @param {string} params.mealType
 * @param {number} params.quantity
 * @param {boolean} [params.isReminder]
 * @param {number} [params.daysNotice] - Days before the meal (default: 3)
 */
function buildMealSmsText({ donorName, mealDateFormatted, mealType, quantity, isReminder = false, daysNotice = 3 }) {
  const slotCapitalized = mealType ? mealType.toUpperCase() : 'MEAL';
  if (isReminder) {
    const noticeStr = daysNotice === 1 ? 'TOMORROW' : `in ${daysNotice} days`;
    return `REMINDER: Dear ${donorName}, your meal donation (${slotCapitalized} for ${quantity} children) is scheduled ${noticeStr} on ${mealDateFormatted}. Thank you for supporting our children! - Hope Haven Orphanage`;
  } else {
    return `CONFIRMATION: Dear ${donorName}, thank you for scheduling a meal donation (${slotCapitalized} for ${quantity} children) on ${mealDateFormatted}. We look forward to your visit! - Hope Haven Orphanage`;
  }
}

module.exports = { sendSMS, buildMealSmsText };
