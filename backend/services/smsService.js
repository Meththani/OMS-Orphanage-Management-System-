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

  // Clean raw input of spaces, dashes, parentheses
  const cleaned = String(to).trim().replace(/[\s\-\(\)\.]/g, '');
  if (!cleaned) {
    return { success: false, provider: 'none', error: 'Invalid recipient phone number' };
  }

  // Build NotifyLK target (947XXXXXXXX) and International target (+947XXXXXXXX)
  let notifyLkPhone = cleaned;
  if (notifyLkPhone.startsWith('+')) {
    notifyLkPhone = notifyLkPhone.slice(1);
  }
  if (notifyLkPhone.startsWith('0') && notifyLkPhone.length === 10) {
    notifyLkPhone = `94${notifyLkPhone.slice(1)}`;
  } else if (!notifyLkPhone.startsWith('94') && notifyLkPhone.length === 9) {
    notifyLkPhone = `94${notifyLkPhone}`;
  }

  let formattedTo = notifyLkPhone.startsWith('+') ? notifyLkPhone : `+${notifyLkPhone}`;

  // 1. Try NotifyLK (Sri Lankan Local Gateway) if configured or explicitly selected
  if (process.env.SMS_PROVIDER === 'notifylk' || (process.env.NOTIFYLK_USER_ID && process.env.NOTIFYLK_API_KEY)) {
    try {
      const notifyLkParams = new URLSearchParams({
        user_id: process.env.NOTIFYLK_USER_ID || '32974',
        api_key: process.env.NOTIFYLK_API_KEY || 'iB6NEU44PMdJQGghktDI',
        sender_id: process.env.NOTIFYLK_SENDER_ID || 'NotifyDEMO',
        to: notifyLkPhone,
        message: message,
      });

      const response = await fetch('https://app.notify.lk/api/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: notifyLkParams.toString(),
      });
      const data = await response.json();

      if (data.status === 'success' || data.code === 200 || data.data === 'Sent') {
        const msgId = typeof data.data === 'object' ? data.data?.msg_id : data.data;
        console.log(`[SMS Service - NotifyLK] Sent SMS to ${notifyLkPhone}. MsgID: ${msgId || 'OK'}`);
        return { success: true, provider: 'notifylk', messageId: String(msgId || 'OK') };
      } else {
        const errMsg = data.message || (typeof data.data === 'string' ? data.data : JSON.stringify(data));
        console.warn(`[SMS Service - NotifyLK Warning] ${errMsg}`);
        return { success: false, provider: 'notifylk', error: errMsg };
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

  // 4. Fallback: Simulation Logger (Guarantees dev environment works reliably without paid credentials)
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

/**
 * Format Cash Donation Receipt SMS content
 */
function buildCashDonationSmsText({ donorName, amount, donationId }) {
  return `RECEIPT: Dear ${donorName}, thank you for your generous donation of LKR ${Number(amount).toLocaleString()} to Hope Haven Orphanage. Ref: ${donationId}. Your kindness empowers our children!`;
}

module.exports = { sendSMS, buildMealSmsText, buildCashDonationSmsText };
