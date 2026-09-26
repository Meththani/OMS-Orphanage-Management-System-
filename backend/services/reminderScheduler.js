const { MealDonation } = require('../models/Donation');
const { sendSMS, buildMealSmsText } = require('./smsService');

/**
 * Scan for meal donations scheduled for 3 DAYS in advance (and 1 day in advance) and send SMS reminders to donors.
 */
async function runDailyMealReminders() {
  console.log('[Reminder Scheduler] Running automated daily meal donation SMS check (3 days notice)...');

  try {
    const today = new Date();
    
    // Check 3 days in advance
    const threeDaysStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 0, 0, 0, 0);
    const threeDaysEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 23, 59, 59, 999);

    // Also check 1 day in advance (tomorrow)
    const oneDayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, 0);
    const oneDayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 23, 59, 59, 999);

    const upcomingMeals = await MealDonation.find({
      $or: [
        { mealDate: { $gte: threeDaysStart, $lte: threeDaysEnd } },
        { mealDate: { $gte: oneDayStart, $lte: oneDayEnd } },
      ],
      status: { $ne: 'cancelled' },
    }).populate('donorID');

    console.log(`[Reminder Scheduler] Found ${upcomingMeals.length} meal donation(s) scheduled for upcoming dates (3-day / 1-day check).`);

    let sentCount = 0;
    for (const meal of upcomingMeals) {
      const donor = meal.donorID;
      const phone = donor?.contactDetails;

      if (!phone || phone === 'N/A') {
        console.warn(`[Reminder Scheduler] Skipping meal ID ${meal._id}: No donor phone number available.`);
        continue;
      }

      const mealDateObj = new Date(meal.mealDate);
      const diffTime = mealDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daysNotice = diffDays <= 1 ? 1 : 3;

      const mealDateFormatted = mealDateObj.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const smsText = buildMealSmsText({
        donorName: donor.name || 'Valued Donor',
        mealDateFormatted,
        mealType: meal.mealType,
        quantity: meal.quantity,
        isReminder: true,
        daysNotice,
      });

      const result = await sendSMS({ to: phone, message: smsText });

      // Update donation record with SMS status
      meal.smsSent = result.success;
      meal.lastSmsSentAt = new Date();
      if (!meal.smsLogs) meal.smsLogs = [];
      meal.smsLogs.push({
        sentAt: new Date(),
        type: `automated_reminder_${daysNotice}day`,
        phone,
        message: smsText,
        provider: result.provider,
        status: result.success ? 'success' : 'failed',
        messageId: result.messageId || null,
        error: result.error || null,
      });

      await meal.save();
      if (result.success) sentCount++;
    }

    console.log(`[Reminder Scheduler] Completed daily meal reminders. Successfully processed ${sentCount}/${upcomingMeals.length} SMS message(s).`);
    return { total: upcomingMeals.length, sent: sentCount };
  } catch (err) {
    console.error('[Reminder Scheduler Error]', err.message);
    return { error: err.message };
  }
}

/**
 * Initialize background cron job (Runs every day at 08:00 AM)
 */
function initReminderScheduler() {
  try {
    const cron = require('node-cron');
    // Run every day at 8:00 AM ('0 8 * * *')
    cron.schedule('0 8 * * *', () => {
      runDailyMealReminders();
    });
    console.log('[Reminder Scheduler] Daily cron job scheduled for 08:00 AM every morning.');
  } catch (err) {
    console.warn('[Reminder Scheduler] node-cron not loaded, using fallback daily timer.', err.message);
    // Fallback timer: check once every 24 hours
    setInterval(() => {
      runDailyMealReminders();
    }, 24 * 60 * 60 * 1000);
  }
}

module.exports = { initReminderScheduler, runDailyMealReminders };
