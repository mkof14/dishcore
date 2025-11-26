// DishCore ↔ BioMath Core Integration Layer
// Handles data synchronization between standalone and integrated modes

import { base44 } from "@/api/base44Client";
import { getAppMode } from './appConfig';

class IntegrationLayer {
  constructor() {
    this.mode = getAppMode();
  }

  // Sync body measurements to BioMath Core
  async syncMeasurements(userId) {
    if (this.mode !== 'integrated') return null;

    try {
      const measurements = await base44.entities.BodyMeasurement.list('-date', 100);
      
      // In integrated mode, these would be sent to BMC API
      const payload = {
        source: 'dishcore',
        userId,
        measurements: measurements.map(m => ({
          timestamp: m.date,
          weight_kg: m.weight,
          height_cm: m.height,
          waist_cm: m.waist,
          hips_cm: m.hips,
          chest_cm: m.chest,
          bmi: m.bmi,
          waist_height_ratio: m.waist_height_ratio,
          body_fat_percentage: m.body_fat_percentage
        }))
      };

      // TODO: POST to BMC /api/biometric/batch
      console.log('Would sync to BMC:', payload);
      return payload;
    } catch (error) {
      console.error('Sync measurements error:', error);
      return null;
    }
  }

  // Sync goals to BioMath Core
  async syncGoals(userId) {
    if (this.mode !== 'integrated') return null;

    try {
      const goals = await base44.entities.BodyGoal.list();
      
      const payload = {
        source: 'dishcore',
        userId,
        goals: goals.map(g => ({
          type: 'body_composition',
          main_goal: g.main_goal,
          target_weight: g.target_weight,
          target_waist: g.target_waist,
          target_date: g.target_date,
          is_active: g.is_active
        }))
      };

      // TODO: POST to BMC /api/goals/sync
      console.log('Would sync goals to BMC:', payload);
      return payload;
    } catch (error) {
      console.error('Sync goals error:', error);
      return null;
    }
  }

  // Sync meal data to BioMath Core
  async syncNutrition(userId, days = 30) {
    if (this.mode !== 'integrated') return null;

    try {
      const logs = await base44.entities.MealLog.list('-date', days * 5);
      
      const payload = {
        source: 'dishcore',
        userId,
        nutritionLogs: logs.map(l => ({
          timestamp: l.date,
          meal_type: l.meal_type,
          calories: l.calories,
          protein_g: l.protein,
          carbs_g: l.carbs,
          fat_g: l.fat
        }))
      };

      // TODO: POST to BMC /api/nutrition/sync
      console.log('Would sync nutrition to BMC:', payload);
      return payload;
    } catch (error) {
      console.error('Sync nutrition error:', error);
      return null;
    }
  }

  // Generate integrated report for BMC Reports Engine
  async generateBMCReport(userId, config) {
    if (this.mode !== 'integrated') {
      console.warn('generateBMCReport called in standalone mode');
      return null;
    }

    try {
      const [measurements, goals, nutrition] = await Promise.all([
        this.syncMeasurements(userId),
        this.syncGoals(userId),
        this.syncNutrition(userId, 30)
      ]);

      return {
        module: 'dishcore',
        userId,
        timestamp: new Date().toISOString(),
        data: {
          measurements,
          goals,
          nutrition
        },
        config
      };
    } catch (error) {
      console.error('Generate BMC report error:', error);
      return null;
    }
  }

  // Receive data from BioMath Core (for bi-directional sync)
  async receiveFromBMC(data) {
    if (this.mode !== 'integrated') return;

    try {
      // Handle incoming user profile updates
      if (data.userProfile) {
        await base44.auth.updateMe(data.userProfile);
      }

      // Handle incoming activity data
      if (data.activityData) {
        // Store activity data in DishCore
        console.log('Received activity data from BMC:', data.activityData);
      }

      return { success: true };
    } catch (error) {
      console.error('Receive from BMC error:', error);
      return { success: false, error };
    }
  }

  // Health check for integration
  async checkIntegrationHealth() {
    return {
      mode: this.mode,
      timestamp: new Date().toISOString(),
      status: this.mode === 'integrated' ? 'connected' : 'standalone',
      features: {
        measurements_sync: this.mode === 'integrated',
        goals_sync: this.mode === 'integrated',
        nutrition_sync: this.mode === 'integrated',
        reports_integration: this.mode === 'integrated'
      }
    };
  }
}

export const integrationLayer = new IntegrationLayer();
export default integrationLayer;