import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Business, Service } from "@/types/models";

/**
 * Get business profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid business ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Get business data
    const business = await db
      .collection<Business>("businesses")
      .findOne({ _id: new ObjectId(businessId) });

    if (!business) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    // Check if user owns this business
    if (business.userId !== token.sub) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Get services for this business
    const services = await db
      .collection<Service>("services")
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

    return NextResponse.json(businessData);
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { message: "Failed to fetch business data" },
      { status: 500 }
    );
  }
}

/**
 * Update business profile by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid business ID" },
        { status: 400 }
      );
    }

    // Get business data from request
    const businessData = await request.json();

    // Validate required fields
    if (
      !businessData.info?.name ||
      !businessData.address?.street ||
      !businessData.services?.length
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if business exists and user owns it
    const existingBusiness = await db
      .collection<Business>("businesses")
      .findOne({ _id: new ObjectId(businessId) });

    if (!existingBusiness) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    if (existingBusiness.userId !== token.sub) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Prepare updated business data
    const updatedBusinessDoc = {
      name: businessData.info.name,
      category: businessData.info.category || "general",
      description: businessData.info.description || "",
      contacts: {
        phone: businessData.info.phone || "",
        email: businessData.info.email || "",
      },
      address: {
        street: businessData.address.street,
        building: businessData.address.building || "",
        city: businessData.address.city || "Атырау",
        postalCode: businessData.address.postalCode || "",
        landmark: businessData.address.landmark || "",
      },
      workingHours: businessData.workingHours || existingBusiness.workingHours,
      photos: {
        logo: businessData.photos?.logo || existingBusiness.photos?.logo || "",
        coverImage:
          businessData.photos?.coverImage ||
          existingBusiness.photos?.coverImage ||
          "",
        gallery:
          businessData.photos?.galleryImages ||
          existingBusiness.photos?.gallery ||
          [],
      },
      updatedAt: new Date(),
    };

    // Update business document
    await db
      .collection<Business>("businesses")
      .updateOne(
        { _id: new ObjectId(businessId) },
        { $set: updatedBusinessDoc }
      );

    // Update services - first deactivate all existing services
    await db
      .collection<Service>("services")
      .updateMany(
        { businessId: businessId },
        { $set: { isActive: false, updatedAt: new Date() } }
      );

    // Create or update services
    if (businessData.services && businessData.services.length > 0) {
      for (const service of businessData.services) {
        if (service.id && ObjectId.isValid(service.id)) {
          // Update existing service
          await db.collection<Service>("services").updateOne(
            { _id: new ObjectId(service.id), businessId: businessId },
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
          const newService: Service = {
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

          await db.collection<Service>("services").insertOne(newService);
        }
      }
    }

    return NextResponse.json({
      message: "Business profile updated successfully",
      businessId: businessId,
    });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { message: "Failed to update business profile" },
      { status: 500 }
    );
  }
}

/**
 * Delete business profile by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(businessId)) {
      return NextResponse.json(
        { message: "Invalid business ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if business exists and user owns it
    const existingBusiness = await db
      .collection<Business>("businesses")
      .findOne({ _id: new ObjectId(businessId) });

    if (!existingBusiness) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 }
      );
    }

    if (existingBusiness.userId !== token.sub) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Soft delete business (mark as inactive)
    await db.collection<Business>("businesses").updateOne(
      { _id: new ObjectId(businessId) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );

    // Deactivate all services
    await db.collection<Service>("services").updateMany(
      { businessId: businessId },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "Business profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      { message: "Failed to delete business profile" },
      { status: 500 }
    );
  }
}
