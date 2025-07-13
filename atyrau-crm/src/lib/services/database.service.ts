import clientPromise from "@/lib/mongodb";
import { Db } from "mongodb";

/**
 * Service for database operations
 */
export class DatabaseService {
  private static dbInstance: Db | null = null;

  /**
   * Get database connection
   */
  static async getDatabase(): Promise<Db> {
    if (!this.dbInstance) {
      const client = await clientPromise;
      this.dbInstance = client.db();
    }
    return this.dbInstance;
  }

  /**
   * Execute database operation with error handling
   */
  static async executeOperation<T>(
    operation: (db: Db) => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const db = await this.getDatabase();
      const data = await operation(db);
      return { success: true, data };
    } catch (error) {
      console.error("Database operation failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Database operation failed",
      };
    }
  }
}
