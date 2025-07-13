import { ObjectId } from "mongodb";
import { DatabaseService } from "./database.service";
import { generateTimeSlots } from "@/lib/utils/date-utils";

/**
 * Service for time slot and availability operations
 */
export class TimeSlotService {
  /**
   * Get available time slots for a business on a specific date
   */
  static async getAvailableSlots(
    businessId: string,
    date: Date,
    serviceDuration: number = 60
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Get business working hours
      const business = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId) });

      if (!business) {
        return { success: false, error: "Business not found" };
      }

      // If no working hours set, return empty slots
      if (!business.workingHours) {
        return { success: true, data: { slots: [] } };
      }

      // Get existing appointments for the date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const appointments = await db
        .collection("appointments")
        .find({
          businessId: new ObjectId(businessId),
          startTime: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ["cancelled"] }, // Exclude cancelled appointments
        })
        .toArray();

      // Convert appointments to booked slots
      const bookedSlots = appointments.map((appointment) => ({
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
      }));

      // Generate available time slots
      const slots = generateTimeSlots(
        date,
        business.workingHours,
        serviceDuration,
        bookedSlots
      );

      return {
        success: true,
        data: { slots },
      };
    });
  }

  /**
   * Get business for slot validation
   */
  static async getBusinessForSlots(businessId?: string, userId?: string) {
    return await DatabaseService.executeOperation(async (db) => {
      let targetBusinessId = businessId;

      // If no businessId provided, try to get from user
      if (!targetBusinessId && userId) {
        const user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(userId) });

        if (user?.businessId) {
          targetBusinessId = user.businessId.toString();
        }
      }

      if (!targetBusinessId) {
        return { success: false, error: "Business ID is required" };
      }

      return { success: true, data: { businessId: targetBusinessId } };
    });
  }
}
