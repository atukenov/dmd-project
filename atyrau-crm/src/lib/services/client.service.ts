import { ObjectId } from "mongodb";
import { DatabaseService } from "./database.service";

/**
 * Service for client-related operations
 */
export class ClientService {
  /**
   * Create a new client
   */
  static async createClient(
    businessId: string,
    clientData: {
      name: string;
      phone: string;
      email?: string | null;
      notes?: string;
      createdBy: string;
    }
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Check for existing client with same phone
      const existingClient = await db.collection("clients").findOne({
        businessId: new ObjectId(businessId),
        phone: clientData.phone,
      });

      if (existingClient) {
        return {
          success: false,
          error: "A client with this phone number already exists",
        };
      }

      // Create new client
      const newClient = {
        businessId: new ObjectId(businessId),
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email || null,
        notes: clientData.notes || "",
        createdAt: new Date(),
        createdBy: new ObjectId(clientData.createdBy),
      };

      const result = await db.collection("clients").insertOne(newClient);

      return {
        success: true,
        data: {
          message: "Client created successfully",
          clientId: result.insertedId,
          client: {
            ...newClient,
            _id: result.insertedId,
          },
        },
      };
    });
  }

  /**
   * Get client details with appointments and notes
   */
  static async getClientDetails(clientId: string, businessId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      // Get client details
      const client = await db.collection("clients").findOne({
        _id: new ObjectId(clientId),
      });

      if (!client) {
        return { success: false, error: "Client not found" };
      }

      // Check if client belongs to the business
      if (client.businessId.toString() !== businessId) {
        return {
          success: false,
          error: "You do not have permission to view this client",
        };
      }

      // Get client's appointment history
      const appointments = await db
        .collection("appointments")
        .find({ clientId: new ObjectId(clientId) })
        .sort({ startTime: -1 })
        .toArray();

      // Get service details for each appointment
      const appointmentsWithDetails = await Promise.all(
        appointments.map(async (appointment) => {
          let service = null;

          if (appointment.serviceId) {
            service = await db.collection("services").findOne({
              _id: new ObjectId(appointment.serviceId.toString()),
            });
          }

          return {
            ...appointment,
            service: service
              ? {
                  name: service.name,
                  duration: service.duration,
                  price: service.price,
                }
              : null,
          };
        })
      );

      // Get client's notes
      const notes = await db
        .collection("clientNotes")
        .find({ clientId: new ObjectId(clientId) })
        .sort({ createdAt: -1 })
        .toArray();

      return {
        success: true,
        data: {
          client,
          appointments: appointmentsWithDetails,
          notes,
        },
      };
    });
  }

  /**
   * Update client information
   */
  static async updateClient(
    clientId: string,
    businessId: string,
    updateData: Record<string, unknown>
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Get client
      const client = await db.collection("clients").findOne({
        _id: new ObjectId(clientId),
      });

      if (!client) {
        return { success: false, error: "Client not found" };
      }

      // Check if client belongs to the business
      if (client.businessId.toString() !== businessId) {
        return {
          success: false,
          error: "You do not have permission to update this client",
        };
      }

      // If phone is changed, check for conflicts
      if (updateData.phone && updateData.phone !== client.phone) {
        const existingClient = await db.collection("clients").findOne({
          businessId: client.businessId,
          phone: updateData.phone,
          _id: { $ne: new ObjectId(clientId) },
        });

        if (existingClient) {
          return {
            success: false,
            error: "A client with this phone number already exists",
          };
        }
      }

      // Build update object
      const updateFields: Record<string, unknown> = { updatedAt: new Date() };

      if (updateData.name !== undefined) updateFields.name = updateData.name;
      if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
      if (updateData.email !== undefined) updateFields.email = updateData.email;
      if (updateData.notes !== undefined) updateFields.notes = updateData.notes;

      // Update client
      await db
        .collection("clients")
        .updateOne({ _id: new ObjectId(clientId) }, { $set: updateFields });

      // Return updated client
      const updatedClient = await db.collection("clients").findOne({
        _id: new ObjectId(clientId),
      });

      return {
        success: true,
        data: {
          message: "Client updated successfully",
          client: updatedClient,
        },
      };
    });
  }

  /**
   * Get client list with search, pagination, and statistics
   */
  static async getClientList(
    businessId: string,
    options: {
      query?: string;
      limit?: number;
      skip?: number;
    } = {}
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      const { query, limit = 100, skip = 0 } = options;

      // Build query filter
      const filter: Record<string, unknown> = {
        businessId: businessId,
      };

      if (query) {
        filter.$or = [
          { name: { $regex: query, $options: "i" } },
          { phone: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ];
      }

      // Get clients
      const clients = await db
        .collection("clients")
        .find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get total count for pagination
      const totalClients = await db
        .collection("clients")
        .countDocuments(filter);

      // Get appointment statistics for each client
      const clientsWithStats = await Promise.all(
        clients.map(async (client) => {
          const appointmentCount = await db
            .collection("appointments")
            .countDocuments({
              clientId: client._id,
            });

          const completedAppointments = await db
            .collection("appointments")
            .countDocuments({
              clientId: client._id,
              status: "completed",
            });

          const cancelledAppointments = await db
            .collection("appointments")
            .countDocuments({
              clientId: client._id,
              status: "cancelled",
            });

          const noShowAppointments = await db
            .collection("appointments")
            .countDocuments({
              clientId: client._id,
              status: "no-show",
            });

          // Get latest appointment
          const latestAppointment = await db
            .collection("appointments")
            .find({ clientId: client._id })
            .sort({ startTime: -1 })
            .limit(1)
            .toArray();

          return {
            ...client,
            stats: {
              appointmentCount,
              completedAppointments,
              cancelledAppointments,
              noShowAppointments,
              lastVisit:
                latestAppointment.length > 0
                  ? latestAppointment[0].startTime
                  : null,
            },
          };
        })
      );

      return {
        success: true,
        data: {
          clients: clientsWithStats,
          total: totalClients,
          page: Math.floor(skip / limit) + 1,
          limit,
          totalPages: Math.ceil(totalClients / limit),
        },
      };
    });
  }
}
