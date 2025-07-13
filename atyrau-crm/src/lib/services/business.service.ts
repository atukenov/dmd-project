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

  /**
   * Get appointments with optional filters
   */
  static async getAppointments(filters: {
    businessId: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) {
    return await DatabaseService.executeOperation(async (db) => {
      const query: {
        businessId: ObjectId;
        startTime?: { $gte?: Date; $lte?: Date };
        status?: string;
      } = {
        businessId: new ObjectId(filters.businessId),
      };

      // Add date range filter if provided
      if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          // Set to start of day (00:00:00.000)
          startDate.setHours(0, 0, 0, 0);
          query.startTime.$gte = startDate;
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          // Set to end of day (23:59:59.999) - start of next day minus 1 millisecond
          endDate.setHours(23, 59, 59, 999);
          query.startTime.$lte = endDate;
        }
      }

      // Add status filter if provided
      if (filters.status) {
        query.status = filters.status;
      }

      // Get appointments with client and service details
      const appointments = await db
        .collection("appointments")
        .find(query)
        .sort({ startTime: 1 })
        .toArray();

      // Populate client and service details
      const appointmentsWithDetails = await Promise.all(
        appointments.map(async (appointment) => {
          // Get client details
          const client = await db.collection("clients").findOne({
            _id: appointment.clientId,
          });

          // Get service details
          const service = await db.collection("services").findOne({
            _id: appointment.serviceId,
          });

          return {
            ...appointment,
            client: client
              ? {
                  _id: client._id,
                  name: client.name,
                  phone: client.phone,
                  email: client.email,
                }
              : null,
            service: service
              ? {
                  _id: service._id,
                  name: service.name,
                  duration: service.duration,
                  price: service.price,
                }
              : null,
          };
        })
      );

      return appointmentsWithDetails;
    });
  }

  /**
   * Check if user has completed business setup
   */
  static async checkBusinessSetup(userId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      // Check if user has a business profile
      const business = await db.collection("businesses").findOne({
        userId,
      });

      if (!business) {
        return {
          hasSetup: false,
          message: "Business profile not found",
        };
      }

      // Check if business has required fields according to schema
      const missingFields: string[] = [];

      if (!business.name) missingFields.push("name");
      if (!business.category) missingFields.push("category");
      if (!business.description) missingFields.push("description");

      // Check contacts object
      if (!business.contacts) {
        missingFields.push("contacts");
      } else {
        if (!business.contacts.phone) missingFields.push("contacts.phone");
        if (!business.contacts.email) missingFields.push("contacts.email");
      }

      // Check address object
      if (!business.address) {
        missingFields.push("address");
      } else {
        if (!business.address.street) missingFields.push("address.street");
        if (!business.address.building) missingFields.push("address.building");
        if (!business.address.city) missingFields.push("address.city");
        if (!business.address.postalCode)
          missingFields.push("address.postalCode");
      }

      if (missingFields.length > 0) {
        return {
          hasSetup: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        };
      }
      console.log(business._id);
      // Check if business has at least one service
      const servicesCount = await db.collection("services").countDocuments({
        businessId: business._id.toString(),
      });

      if (servicesCount === 0) {
        return {
          hasSetup: false,
          message: "No services configured",
          needsServices: true,
        };
      }

      return {
        hasSetup: true,
        business: {
          _id: business._id.toString(), // Convert ObjectId to string
          name: business.name,
          category: business.category,
          description: business.description,
          contacts: business.contacts,
          address: business.address,
        },
        servicesCount,
      };
    });
  }

  /**
   * Update an appointment
   */
  static async updateAppointment(
    appointmentId: string,
    updateData: {
      status?: "scheduled" | "completed" | "cancelled" | "no-show";
      paymentStatus?: "pending" | "paid" | "refunded";
      paymentMethod?: string;
      totalAmount?: number;
      notes?: string;
      cancellationReason?: string;
      cancelledBy?: "client" | "business";
      reminderSent?: boolean;
      feedbackSubmitted?: boolean;
    }
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // First, get the current appointment to verify it exists and get businessId
      const existingAppointment = await db.collection("appointments").findOne({
        _id: new ObjectId(appointmentId),
      });

      if (!existingAppointment) {
        throw new Error("Appointment not found");
      }

      // Prepare update data following the exact schema
      const updateFields: {
        updatedAt: Date;
        status?: string;
        paymentStatus?: string;
        paymentMethod?: string;
        totalAmount?: number;
        notes?: string;
        cancellationReason?: string;
        cancelledBy?: string;
        cancelledAt?: Date;
        reminderSent?: boolean;
        feedbackSubmitted?: boolean;
      } = {
        updatedAt: new Date(),
      };

      // Only update provided fields
      if (updateData.status !== undefined) {
        updateFields.status = updateData.status;

        // If cancelling, add cancellation timestamp
        if (updateData.status === "cancelled") {
          updateFields.cancelledAt = new Date();
          if (updateData.cancellationReason) {
            updateFields.cancellationReason = updateData.cancellationReason;
          }
          if (updateData.cancelledBy) {
            updateFields.cancelledBy = updateData.cancelledBy;
          }
        }
      }

      if (updateData.paymentStatus !== undefined) {
        updateFields.paymentStatus = updateData.paymentStatus;
      }

      if (updateData.paymentMethod !== undefined) {
        updateFields.paymentMethod = updateData.paymentMethod;
      }

      if (updateData.totalAmount !== undefined) {
        updateFields.totalAmount = updateData.totalAmount;
      }

      if (updateData.notes !== undefined) {
        updateFields.notes = updateData.notes;
      }

      if (updateData.reminderSent !== undefined) {
        updateFields.reminderSent = updateData.reminderSent;
      }

      if (updateData.feedbackSubmitted !== undefined) {
        updateFields.feedbackSubmitted = updateData.feedbackSubmitted;
      }

      // Update the appointment
      const result = await db
        .collection("appointments")
        .updateOne(
          { _id: new ObjectId(appointmentId) },
          { $set: updateFields }
        );

      if (result.matchedCount === 0) {
        throw new Error("Appointment not found");
      }

      if (result.modifiedCount === 0) {
        throw new Error("No changes were made to the appointment");
      }

      // Get the updated appointment with populated client and service details
      const updatedAppointment = await db.collection("appointments").findOne({
        _id: new ObjectId(appointmentId),
      });

      if (!updatedAppointment) {
        throw new Error("Failed to retrieve updated appointment");
      }

      // Get client details
      const client = await db.collection("clients").findOne({
        _id: updatedAppointment.clientId,
      });

      // Get service details
      const service = await db.collection("services").findOne({
        _id: updatedAppointment.serviceId,
      });

      // Return the updated appointment with populated details and businessId
      return {
        appointment: {
          ...updatedAppointment,
          client: client
            ? {
                _id: client._id,
                name: client.name,
                phone: client.phone,
                email: client.email,
              }
            : null,
          service: service
            ? {
                _id: service._id,
                name: service.name,
                duration: service.duration,
                price: service.price,
              }
            : null,
        },
        businessId: updatedAppointment.businessId.toString(),
      };
    });
  }
}
