import { base44 } from '@/api/base44Client';

/**
 * Email Notification Service
 * Handles sending emails for various notification types
 */

export const EmailService = {
  /**
   * Send notification email
   */
  async sendNotification(userEmail, notification) {
    try {
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: notification.title,
        body: this.generateEmailBody(notification)
      });
      return { success: true };
    } catch (error) {
      console.error('Email send failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Send meal reminder
   */
  async sendMealReminder(userEmail, mealType, time) {
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A3E3;">🍽️ Time for ${mealType}!</h2>
        <p>It's ${time} - don't forget to log your ${mealType}.</p>
        <p>Tracking your meals helps you stay on track with your nutrition goals.</p>
        <a href="${window.location.origin}/tracking" 
           style="display: inline-block; padding: 12px 24px; background: #00A3E3; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Log Your Meal
        </a>
      </div>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'DishCore Reminders',
      to: userEmail,
      subject: `⏰ ${mealType} Reminder`,
      body
    });
  },

  /**
   * Send water reminder
   */
  async sendWaterReminder(userEmail) {
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A3E3;">💧 Stay Hydrated!</h2>
        <p>Time to drink some water and stay refreshed.</p>
        <p>Proper hydration is key to maintaining your energy and health.</p>
      </div>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'DishCore Health',
      to: userEmail,
      subject: '💧 Hydration Reminder',
      body
    });
  },

  /**
   * Send weekly progress report
   */
  async sendWeeklyReport(userEmail, reportData) {
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A3E3;">📊 Your Weekly Progress Report</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3>This Week's Stats:</h3>
          <p><strong>Meals Logged:</strong> ${reportData.mealsLogged}</p>
          <p><strong>Average Calories:</strong> ${reportData.avgCalories} kcal/day</p>
          <p><strong>Average Protein:</strong> ${reportData.avgProtein}g/day</p>
          <p><strong>Water Intake:</strong> ${reportData.waterIntake}L total</p>
          <p><strong>Current Streak:</strong> ${reportData.streak} days 🔥</p>
        </div>
        <p>${reportData.insights}</p>
        <a href="${window.location.origin}/progress" 
           style="display: inline-block; padding: 12px 24px; background: #00A3E3; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          View Full Report
        </a>
      </div>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'DishCore Insights',
      to: userEmail,
      subject: '📊 Your Weekly Progress Report',
      body
    });
  },

  /**
   * Send goal achievement notification
   */
  async sendGoalAchieved(userEmail, goalName) {
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #00A3E3; font-size: 48px;">🎉</h1>
        <h2 style="color: #00A3E3;">Congratulations!</h2>
        <p style="font-size: 18px;">You've achieved your goal: <strong>${goalName}</strong></p>
        <p>Keep up the amazing work!</p>
        <a href="${window.location.origin}/achievements" 
           style="display: inline-block; padding: 12px 24px; background: #00A3E3; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          View Your Achievements
        </a>
      </div>
    `;

    await base44.integrations.Core.SendEmail({
      from_name: 'DishCore',
      to: userEmail,
      subject: '🎉 Goal Achieved!',
      body
    });
  },

  /**
   * Generate email body from notification object
   */
  generateEmailBody(notification) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00A3E3;">${notification.title}</h2>
        <p>${notification.message}</p>
        ${notification.action_url ? `
          <a href="${notification.action_url}" 
             style="display: inline-block; padding: 12px 24px; background: #00A3E3; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            View Details
          </a>
        ` : ''}
      </div>
    `;
  }
};

export default EmailService;