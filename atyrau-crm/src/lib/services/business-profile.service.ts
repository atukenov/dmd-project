import { ObjectId } from "mongodb";
import { DatabaseService } from "./database.service";

/**
 * Service for business profile management operations
 */
export class BusinessProfileService {
  /**
   * Get business profile with services
   */
  static async getBusinessProfile(businessId: string, userId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      // Validate ObjectId
      if (!ObjectId.isValid(businessId)) {
        return { success: false, error: "Invalid business ID" };
      }

      // Get business data
      const business = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId) });

      if (!business) {
        return { success: false, error: "Business not found" };
      }

      // Check if user owns this business
      if (business.userId !== userId) {
        return { success: false, error: "Access denied" };
      }

      // Get services for this business
      const services = await db
        .collection("services")
        .find({ businessId: businessId, isActive: true })
        .toArray();

      // Transform business data to match frontend format
      const businessData = {
        _id: business._id,
        info: {
          name: business.name,
          category: business.category,
          description: business.description,
          phone: business.contacts?.phone || "",
          email: business.contacts?.email || "",
        },
        address: {
          street: business.address?.street || "",
          building: business.address?.building || "",
          city: business.address?.city || "Атырау",
          postalCode: business.address?.postalCode || "",
          landmark: business.address?.landmark || "",
        },
        services: services.map((service) => ({
          id: service._id?.toString(),
          name: service.name,
          duration: service.duration,
          price: service.price,
          description: service.description,
        })),
        workingHours: business.workingHours || {
          monday: { isOpen: true, from: "09:00", to: "18:00" },
          tuesday: { isOpen: true, from: "09:00", to: "18:00" },
          wednesday: { isOpen: true, from: "09:00", to: "18:00" },
          thursday: { isOpen: true, from: "09:00", to: "18:00" },
          friday: { isOpen: true, from: "09:00", to: "18:00" },
          saturday: { isOpen: true, from: "10:00", to: "16:00" },
          sunday: { isOpen: false, from: "10:00", to: "16:00" },
        },
        photos: {
          logo: business.photos?.logo || null,
          coverImage: business.photos?.coverImage || null,
          galleryImages: business.photos?.gallery || [],
        },
        isActive: business.isActive,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt,
      };

      return {
        success: true,
        data: businessData,
      };
    });
  }

  /**
   * Update business profile with services
   */
  static async updateBusinessProfile(
    businessId: string,
    userId: string,
    businessData: Record<string, unknown>
  ) {
    return await DatabaseService.executeOperation(async (db) => {
      // Validate ObjectId
      if (!ObjectId.isValid(businessId)) {
        return { success: false, error: "Invalid business ID" };
      }

      // Validate required fields
      const info = businessData.info as Record<string, unknown>;
      const address = businessData.address as Record<string, unknown>;
      const services = businessData.services as Array<Record<string, unknown>>;

      if (!info?.name || !address?.street || !services?.length) {
        return { success: false, error: "Missing required fields" };
      }

      // Check if business exists and user owns it
      const existingBusiness = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId) });

      if (!existingBusiness) {
        return { success: false, error: "Business not found" };
      }

      if (existingBusiness.userId !== userId) {
        return { success: false, error: "Access denied" };
      }

      // Prepare updated business data
      const photos = businessData.photos as Record<string, unknown>;
      const updatedBusinessDoc = {
        name: info.name,
        category: info.category || "general",
        description: info.description || "",
        contacts: {
          phone: info.phone || "",
          email: info.email || "",
        },
        address: {
          street: address.street,
          building: address.building || "",
          city: address.city || "Атырау",
          postalCode: address.postalCode || "",
          landmark: address.landmark || "",
        },
        workingHours:
          businessData.workingHours || existingBusiness.workingHours,
        photos: {
          logo: photos?.logo || existingBusiness.photos?.logo || "",
          coverImage:
            photos?.coverImage || existingBusiness.photos?.coverImage || "",
          gallery:
            photos?.galleryImages || existingBusiness.photos?.gallery || [],
        },
        updatedAt: new Date(),
      };

      // Update business document
      await db
        .collection("businesses")
        .updateOne(
          { _id: new ObjectId(businessId) },
          { $set: updatedBusinessDoc }
        );

      // Update services - first deactivate all existing services
      await db
        .collection("services")
        .updateMany(
          { businessId: businessId },
          { $set: { isActive: false, updatedAt: new Date() } }
        );

      // Create or update services
      if (services && services.length > 0) {
        for (const service of services) {
          if (service.id && ObjectId.isValid(String(service.id))) {
            // Update existing service
            await db.collection("services").updateOne(
              { _id: new ObjectId(String(service.id)), businessId: businessId },
              {
                $set: {
                  name: service.name,
                  duration: service.duration || 60,
                  price: service.price || 0,
                  description: service.description || "",
                  isActive: true,
                  updatedAt: new Date(),
                },
              }
            );
          } else {
            // Create new service
            const newService = {
              businessId: businessId,
              name: service.name,
              duration: service.duration || 60,
              price: service.price || 0,
              description: service.description || "",
              category: service.category || "default",
              image: service.image || "",
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            await db.collection("services").insertOne(newService);
          }
        }
      }

      return {
        success: true,
        data: {
          message: "Business profile updated successfully",
          businessId: businessId,
        },
      };
    });
  }

  /**
   * Delete (deactivate) business profile
   */
  static async deleteBusinessProfile(businessId: string, userId: string) {
    return await DatabaseService.executeOperation(async (db) => {
      // Validate ObjectId
      if (!ObjectId.isValid(businessId)) {
        return { success: false, error: "Invalid business ID" };
      }

      // Check if business exists and user owns it
      const existingBusiness = await db
        .collection("businesses")
        .findOne({ _id: new ObjectId(businessId) });

      if (!existingBusiness) {
        return { success: false, error: "Business not found" };
      }

      if (existingBusiness.userId !== userId) {
        return { success: false, error: "Access denied" };
      }

      // Soft delete business (mark as inactive)
      await db.collection("businesses").updateOne(
        { _id: new ObjectId(businessId) },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        }
      );

      // Deactivate all services
      await db.collection("services").updateMany(
        { businessId: businessId },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        }
      );

      return {
        success: true,
        data: {
          message: "Business profile deleted successfully",
        },
      };
    });
  }
}
