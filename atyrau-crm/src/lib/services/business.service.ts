import { ObjectId } from "mongodb";
import { DatabaseService } from "./database.service";

/**
 * Service for business-related operations
 */
export class BusinessService {
  /**
   * Get business by ID
   */
  static async getBusinessById(businessId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      const business = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId) });

      if (!business) {
        throw new Error("Business not found");
      }

      return business;
    });
  }

  /**
   * Get service by ID
   */
  static async getServiceById(serviceId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      const service = await db
        .collection("services")
        .findOne({ _id: new ObjectId(serviceId) });

      if (!service) {
        throw new Error("Service not found");
      }

      return service;
    });
  }

  /**
   * Check for appointment time conflicts
   */
  static async checkTimeConflicts(
    businessId: string,
    startTime: Date,
    endTime: Date
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      const existingAppointments = await db
        .collection("appointments")
        .find({
          businessId: new ObjectId(businessId),
          $or: [
            // Requested time starts during another appointment
            {
              startTime: { $lte: startTime },
              endTime: { $gt: startTime },
            },
            // Requested time ends during another appointment
            {
              startTime: { $lt: endTime },
              endTime: { $gte: endTime },
            },
            // Requested time completely contains another appointment
            {
              startTime: { $gte: startTime },
              endTime: { $lte: endTime },
            },
          ],
        })
        .toArray();

      return existingAppointments.length > 0;
    });
  }

  /**
   * Get or create client record
   */
  static async getOrCreateClient(
    businessId: string,
    clientData: {
      name: string;
      phone: string;
      email?: string;
      userId?: string;
    }
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // First, try to find existing client by phone and business
      const client = await db.collection("clients").findOne({
        businessId: new ObjectId(businessId),
        phone: clientData.phone,
      });

      if (client) {
        // Update client with any new information
        const updateData: Partial<{
          name: string;
          email: string;
          userId: ObjectId;
          updatedAt: Date;
        }> = {
          name: clientData.name,
          updatedAt: new Date(),
        };

        if (clientData.email) {
          updateData.email = clientData.email;
        }

        if (clientData.userId) {
          updateData.userId = new ObjectId(clientData.userId);
        }

        await db
          .collection("clients")
          .updateOne({ _id: client._id }, { $set: updateData });

        return client._id;
      } else {
        // Create new client
        const newClient = {
          businessId: new ObjectId(businessId),
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email || "",
          userId: clientData.userId ? new ObjectId(clientData.userId) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await db.collection("clients").insertOne(newClient);
        return result.insertedId;
      }
    });
  }

  /**
   * Create a new appointment
   */
  static async createAppointment(appointmentData: {
    businessId: string;
    clientId: ObjectId;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    totalAmount: number;
    notes?: string;
  }) {
    return await DatabaseService.executeOperation(async (db) => {
      const appointment = {
        businessId: new ObjectId(appointmentData.businessId),
        clientId: appointmentData.clientId,
        serviceId: new ObjectId(appointmentData.serviceId),
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        status: "scheduled", // scheduled, completed, cancelled, no-show
        paymentStatus: "pending", // pending, paid, refunded
        totalAmount: appointmentData.totalAmount,
        notes: appointmentData.notes || "",
        createdAt: new Date(),
      };

      const result = await db.collection("appointments").insertOne(appointment);

      return {
        appointmentId: result.insertedId,
        appointment: {
          ...appointment,
          _id: result.insertedId,
        },
      };
    });
  }
}
