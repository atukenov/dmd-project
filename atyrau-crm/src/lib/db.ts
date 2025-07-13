import clientPromise from "@/lib/mongodb";
import * as mockData from "@/lib/mock/data";
import { MongoClient } from "mongodb";

// Use mock data in development or when explicitly specified or when connection fails
const useMockData =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export async function connectToDatabase() {
  try {
    const client = (await Promise.race([
      clientPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("MongoDB connection timeout")), 5000)
      ),
    ])) as MongoClient;
    const db = client.db();
    return { client, db };
  } catch (error: any) {
    console.warn(
      `🚧 MongoDB connection error: ${error?.message || "Unknown error"}`
    );
    console.warn("🚧 Using mock data instead");
    return { client: null, db: null };
  }
}

export async function findOne(
  collection: string,
  query: any,
  options: any = {}
) {
  try {
    console.log(
      `Finding one in ${collection} with query:`,
      JSON.stringify(query)
    );
    const { db } = await connectToDatabase();
    if (db) {
      console.log("Using MongoDB database");
      return await db.collection(collection).findOne(query, options);
    } else if (useMockData) {
      console.log(`Using mock data for ${collection}`);
      // Use mock data when db is not available
      const mockCollection = (mockData as any)[collection] || [];
      console.log(
        `Mock collection ${collection} has ${mockCollection.length} items`
      );
      const result = mockCollection.find((item: any) =>
        Object.entries(query).every(([key, value]) => {
          // Handle ObjectId comparison for _id
          if (key === "_id" && typeof value === "string") {
            return item._id.toString() === value;
          }

          // For email, do a case-insensitive comparison
          if (
            key === "email" &&
            typeof value === "string" &&
            typeof item[key] === "string"
          ) {
            return item[key].toLowerCase() === value.toLowerCase();
          }

          return item[key] === value;
        })
      );
      console.log(`Found item in ${collection}:`, result ? "Yes" : "No");
      return result;
    }
    return null;
  } catch (error) {
    console.error("Database error in findOne:", error);
    return null;
  }
}

export async function find(collection: string, query: any, options: any = {}) {
  try {
    const { db } = await connectToDatabase();
    if (db) {
      return await db.collection(collection).find(query, options).toArray();
    } else if (useMockData) {
      // Use mock data when db is not available
      const mockCollection = (mockData as any)[collection] || [];
      return mockCollection.filter((item: any) =>
        Object.entries(query).every(([key, value]) => item[key] === value)
      );
    }
    return [];
  } catch (error) {
    console.error("Database error in find:", error);
    return [];
  }
}

export async function insertOne(collection: string, document: any) {
  try {
    const { db } = await connectToDatabase();
    if (db) {
      return await db.collection(collection).insertOne(document);
    } else if (useMockData) {
      // Simulate insert with mock data
      console.log(`[MOCK] Inserted into ${collection}:`, document);
      return {
        acknowledged: true,
        insertedId: document._id || "mock-id-" + Date.now(),
      };
    }
    return null;
  } catch (error) {
    console.error("Database error in insertOne:", error);
    return null;
  }
}

export async function updateOne(
  collection: string,
  filter: any,
  update: any,
  options: any = {}
) {
  try {
    const { db } = await connectToDatabase();
    if (db) {
      return await db.collection(collection).updateOne(filter, update, options);
    } else if (useMockData) {
      // Simulate update with mock data
      console.log(`[MOCK] Updated in ${collection}:`, filter, update);
      return {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      };
    }
    return null;
  } catch (error) {
    console.error("Database error in updateOne:", error);
    return null;
  }
}

export async function deleteOne(collection: string, filter: any) {
  try {
    const { db } = await connectToDatabase();
    if (db) {
      return await db.collection(collection).deleteOne(filter);
    } else if (useMockData) {
      // Simulate delete with mock data
      console.log(`[MOCK] Deleted from ${collection}:`, filter);
      return {
        acknowledged: true,
        deletedCount: 1,
      };
    }
    return null;
  } catch (error) {
    console.error("Database error in deleteOne:", error);
    return null;
  }
}

export async function aggregate(collection: string, pipeline: any[]) {
  try {
    const { db } = await connectToDatabase();
    if (db) {
      return await db.collection(collection).aggregate(pipeline).toArray();
    } else if (useMockData) {
      // Very basic aggregation simulation with mock data
      console.log(`[MOCK] Aggregate on ${collection}:`, pipeline);
      return (mockData as any)[collection] || [];
    }
    return [];
  } catch (error) {
    console.error("Database error in aggregate:", error);
    return [];
  }
}
