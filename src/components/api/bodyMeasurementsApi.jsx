// Body Measurements API - Abstraction layer for standalone/integrated modes
import { base44 } from "@/api/base44Client";

class BodyMeasurementsApi {
  async list(sortBy = '-date', limit = 100) {
    return await base44.entities.BodyMeasurement.list(sortBy, limit);
  }

  async create(data) {
    const enriched = { ...data };
    if (data.weight && data.height) {
      enriched.bmi = parseFloat((data.weight / Math.pow(data.height / 100, 2)).toFixed(1));
    }
    if (data.waist && data.height) {
      enriched.waist_height_ratio = parseFloat((data.waist / data.height).toFixed(2));
    }
    return await base44.entities.BodyMeasurement.create(enriched);
  }

  async update(id, data) {
    const enriched = { ...data };
    if (data.weight && data.height) {
      enriched.bmi = parseFloat((data.weight / Math.pow(data.height / 100, 2)).toFixed(1));
    }
    return await base44.entities.BodyMeasurement.update(id, enriched);
  }

  async getLatest() {
    const measurements = await this.list('-date', 1);
    return measurements[0] || null;
  }
}

export const bodyMeasurementsApi = new BodyMeasurementsApi();
export default bodyMeasurementsApi;