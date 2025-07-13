import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is not defined in environment variables");
}

const uri = process.env.MONGODB_URI;
const options = {
  connectTimeoutMS: 10000, // Timeout in ms
  socketTimeoutMS: 45000, // Timeout for operations
  maxPoolSize: 10, // Max connections in the pool
  minPoolSize: 5, // Min connections in the pool
  ssl: true,
  tlsAllowInvalidCertificates: true, // Bypass certificate validation for development
  tlsAllowInvalidHostnames: true, // Bypass hostname validation for development
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("MongoDB connection failed:", err);
      // Return a promise that never resolves but doesn't throw
      // This allows the app to continue running with mock data
      return new Promise(() => {});
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
