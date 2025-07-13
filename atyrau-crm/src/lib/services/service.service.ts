import { ObjectId } from "mongodb";
import { DatabaseService } from "./database.service";

/**
 * Service for service-related operations
 */
export class ServiceService {
  /**
   * Get services for a business
   */
  static async getServicesByBusiness(businessId: string, userId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      // Verify business ownership
      const business = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId), userId: userId });

      if (!business) {
        return { success: false, error: "Business not found or access denied" };
      }

      // Fetch services for the business
      const services = await db
        .collection("services")
        .find({ businessId: businessId })
        .toArray();

      // Transform services to a more frontend-friendly format
      const transformedServices = services.map((service) => ({
        id: service._id.toString(),
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        image: service.image || null,
        isActive: service.isActive !== false, // Default to true if not specified
      }));

      return { success: true, data: { services: transformedServices } };
    });
  }

  /**
   * Create a new service for a business
   */
  static async createServiceForBusiness(
    businessId: string,
    userId: string,
    serviceData: Record<string, unknown>
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Verify business ownership
      const business = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId), userId: userId });

      if (!business) {
        return { success: false, error: "Business not found or access denied" };
      }

      // Validate required fields
      if (!serviceData.name) {
        return { success: false, error: "Service name is required" };
      }

      // Create the service
      const service = {
        name: serviceData.name,
        description: serviceData.description || "",
        duration: serviceData.duration || 60, // Default 60 minutes
        price: serviceData.price || 0,
        category: serviceData.category || "default",
        image: serviceData.image || null,
        isActive: serviceData.isActive !== false, // Default to true if not specified
        businessId: businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("services").insertOne(service);

      // Return the created service
      return {
        success: true,
        data: {
          id: result.insertedId.toString(),
          ...service,
        },
      };
    });
  }

  /**
   * Update a service
   */
  static async updateService(
    serviceId: string,
    businessId: string,
    updateData: Record<string, unknown>
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Get service
      const service = await db.collection("services").findOne({
        _id: new ObjectId(serviceId),
      });

      if (!service) {
        return { success: false, error: "Service not found" };
      }

      // Check if service belongs to the business
      if (service.businessId.toString() !== businessId) {
        return {
          success: false,
          error: "You do not have permission to update this service",
        };
      }

      // Build update object
      const updateFields: Record<string, unknown> = { updatedAt: new Date() };

      if (updateData.name !== undefined) updateFields.name = updateData.name;
      if (updateData.duration !== undefined)
        updateFields.duration = parseInt(String(updateData.duration), 10);
      if (updateData.price !== undefined)
        updateFields.price = parseFloat(String(updateData.price));
      if (updateData.description !== undefined)
        updateFields.description = updateData.description;
      if (updateData.category !== undefined)
        updateFields.category = updateData.category;

      // Update service
      await db
        .collection("services")
        .updateOne({ _id: new ObjectId(serviceId) }, { $set: updateFields });

      // Return updated service
      const updatedService = await db.collection("services").findOne({
        _id: new ObjectId(serviceId),
      });

      return {
        success: true,
        data: {
          message: "Service updated successfully",
          service: updatedService,
        },
      };
    });
  }

  /**
   * Delete a service
   */
  static async deleteService(serviceId: string, businessId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      // Get service
      const service = await db.collection("services").findOne({
        _id: new ObjectId(serviceId),
      });

      if (!service) {
        return { success: false, error: "Service not found" };
      }

      // Check if service belongs to the business
      if (service.businessId.toString() !== businessId) {
        return {
          success: false,
          error: "You do not have permission to delete this service",
        };
      }

      // Check if service has upcoming appointments
      const upcomingAppointments = await db.collection("appointments").findOne({
        serviceId: new ObjectId(serviceId),
        startTime: { $gte: new Date() },
        status: { $nin: ["cancelled", "completed"] },
      });

      if (upcomingAppointments) {
        return {
          success: false,
          error: "Cannot delete service with upcoming appointments",
        };
      }

      // Delete service
      await db
        .collection("services")
        .deleteOne({ _id: new ObjectId(serviceId) });

      return {
        success: true,
        data: {
          message: "Service deleted successfully",
        },
      };
    });
  }

  /**
   * Get a specific service by ID
   */
  static async getServiceById(
    serviceId: string,
    businessId: string,
    userId: string
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Verify business ownership
      const business = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId), userId: userId });

      if (!business) {
        return { success: false, error: "Business not found or access denied" };
      }

      // Fetch the specific service
      const service = await db.collection("services").findOne({
        _id: new ObjectId(serviceId),
        businessId: businessId,
      });

      if (!service) {
        return { success: false, error: "Service not found" };
      }

      // Transform to a more frontend-friendly format
      const transformedService = {
        id: service._id.toString(),
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        image: service.image || null,
        isActive: service.isActive !== false, // Default to true if not specified
      };

      return { success: true, data: transformedService };
    });
  }

  /**
   * Update a specific service
   */
  static async updateServiceById(
    serviceId: string,
    businessId: string,
    userId: string,
    updateData: Record<string, unknown>
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Verify business ownership
      const business = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId), userId: userId });

      if (!business) {
        return { success: false, error: "Business not found or access denied" };
      }

      // Check if service exists and belongs to the business
      const existingService = await db.collection("services").findOne({
        _id: new ObjectId(serviceId),
        businessId: businessId,
      });

      if (!existingService) {
        return { success: false, error: "Service not found" };
      }

      // Build update object
      const updateFields: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      // Only update fields that are provided
      if (updateData.name !== undefined) updateFields.name = updateData.name;
      if (updateData.description !== undefined)
        updateFields.description = updateData.description;
      if (updateData.duration !== undefined)
        updateFields.duration = updateData.duration;
      if (updateData.price !== undefined) updateFields.price = updateData.price;
      if (updateData.category !== undefined)
        updateFields.category = updateData.category;
      if (updateData.image !== undefined) updateFields.image = updateData.image;
      if (updateData.isActive !== undefined)
        updateFields.isActive = updateData.isActive;

      // Update the service
      await db
        .collection("services")
        .updateOne({ _id: new ObjectId(serviceId) }, { $set: updateFields });

      // Fetch and return the updated service
      const updatedService = await db
        .collection("services")
        .findOne({ _id: new ObjectId(serviceId) });

      return {
        success: true,
        data: {
          id: updatedService!._id.toString(),
          name: updatedService!.name,
          description: updatedService!.description,
          duration: updatedService!.duration,
          price: updatedService!.price,
          category: updatedService!.category,
          image: updatedService!.image || null,
          isActive: updatedService!.isActive !== false,
        },
      };
    });
  }

  /**
   * Delete a specific service
   */
  static async deleteServiceById(
    serviceId: string,
    businessId: string,
    userId: string
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Verify business ownership
      const business = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId), userId: userId });

      if (!business) {
        return { success: false, error: "Business not found or access denied" };
      }

      // Check if service exists and belongs to the business
      const existingService = await db.collection("services").findOne({
        _id: new ObjectId(serviceId),
        businessId: businessId,
      });

      if (!existingService) {
        return { success: false, error: "Service not found" };
      }

      // Delete the service
      await db
        .collection("services")
        .deleteOne({ _id: new ObjectId(serviceId) });

      return {
        success: true,
        data: {
          message: "Service deleted successfully",
          id: serviceId,
        },
      };
    });
  }

  /**
   * Get services for a business
   */
  static async getBusinessServices(businessId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      const services = await db
        .collection("services")
        .find({ businessId })
        .sort({ name: 1 })
        .toArray();

      return {
        success: true,
        data: services,
      };
    });
  }
}
