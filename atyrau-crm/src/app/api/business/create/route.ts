import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Business, Service, User } from "@/types/models";

/**
 * Creates a new business profile and its associated services
 *
 * @param request - The incoming request containing business data
 * @returns JSON response with the created business ID or error message
 */
export async function POST(request: NextRequest) {
  try {
    // Get the user's token
    const token = await getToken({ req: request });

    if (!token || !token.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    // Check if business already exists for user
    const existingBusiness = await db
      .collection<Business>("businesses")
      .findOne({ userId: token.sub });

    if (existingBusiness) {
      return NextResponse.json(
        { message: "Business already exists for this user" },
        { status: 400 }
      );
    }

    // Check if the user is already a business owner
    const existingUser = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(token.sub) });

    if (existingUser?.role === "business") {
      return NextResponse.json(
        { message: "This user is already a business owner" },
        { status: 400 }
      );
    }

    // Prepare business data for storage
    const businessDoc: Business = {
      userId: token.sub,
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
        city: businessData.address.city || "",
        postalCode: businessData.address.postalCode || "",
        landmark: businessData.address.landmark,
      },
      workingHours: businessData.workingHours || [],
      photos: {
        logo: businessData.photos?.logo || "",
        coverImage: businessData.photos?.coverImage || "",
        gallery: businessData.photos?.galleryImages || [],
      },
      socialMedia: businessData.socialMedia || {},
      features: businessData.features || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert business into database
    const result = await db
      .collection<Business>("businesses")
      .insertOne(businessDoc);
    const businessId = result.insertedId;

    // Create services in the services collection
    if (businessData.services && businessData.services.length > 0) {
      interface ServiceInput {
        name: string;
        duration?: number;
        price?: number;
        description?: string;
        category?: string;
        image?: string;
      }

      const servicesWithBusinessId: Service[] = businessData.services.map(
        (service: ServiceInput) => ({
          businessId: businessId.toString(),
          name: service.name,
          duration: service.duration || 60, // Default duration in minutes
          price: service.price || 0,
          description: service.description || "",
          category: service.category || "default",
          image: service.image || "",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      // Batch insert all services
      await db
        .collection<Service>("services")
        .insertMany(servicesWithBusinessId);
    }

    // Update user to mark as business owner
    await db.collection<User>("users").updateOne(
      { _id: new ObjectId(token.sub) },
      {
        $set: {
          role: "business",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "Business profile created successfully",
      businessId: businessId,
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { message: "Failed to create business profile" },
      { status: 500 }
    );
  }
}
