import { NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";
import { ObjectId } from "mongodb";
import { DatabaseService } from "./database.service";

export interface AuthenticatedUser {
  _id: ObjectId;
  email: string;
  name: string;
  businessId?: ObjectId;
  role?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  token?: JWT;
  error?: string;
  statusCode?: number;
}

/**
 * Service for handling authentication and authorization logic
 */
export class AuthService {
  /**
   * Authenticate request and get user info
   */
  static async authenticateRequest(request: NextRequest): Promise<AuthResult> {
    try {
      const token = await getToken({ req: request });

      if (!token || !token.sub) {
        return {
          success: false,
          error: "Authentication required",
          statusCode: 401,
        };
      }

      const db = await DatabaseService.getDatabase();
      const user = (await db.collection("users").findOne({
        _id: new ObjectId(token.sub),
      })) as AuthenticatedUser | null;

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      console.error("Error authenticating request:", error);
      return {
        success: false,
        error: "Authentication failed",
        statusCode: 500,
      };
    }
  }

  /**
   * Get user with business data
   */
  static async getUserWithBusiness(
    userId: string
  ): Promise<AuthenticatedUser | null> {
    try {
      const db = await DatabaseService.getDatabase();
      const user = (await db.collection("users").findOne({
        _id: new ObjectId(userId),
      })) as AuthenticatedUser | null;

      return user;
    } catch (error) {
      console.error("Error fetching user with business:", error);
      return null;
    }
  }

  /**
   * Verify business ownership
   */
  static async verifyBusinessOwnership(
    user: AuthenticatedUser,
    businessId: string
  ): Promise<boolean> {
    console.log(user, businessId); // Debug log
    try {
      // Admin can access any business
      if (user.role === "admin") {
        return true;
      }

      // Get business data and check if user owns it by userId field
      const db = await DatabaseService.getDatabase();
      const business = await db.collection("businesses").findOne({
        _id: new ObjectId(businessId),
        userId: user._id.toString(),
      });

      return !!business;
    } catch (error) {
      console.error("Error verifying business ownership:", error);
      return false;
    }
  }

  /**
   * Get business ID for user
   */
  static async getBusinessIdForUser(userId: ObjectId): Promise<string | null> {
    try {
      const db = await DatabaseService.getDatabase();
      const business = await db.collection("businesses").findOne({
        userId: userId.toString(),
      });

      return business?._id ? business._id.toString() : null;
    } catch (error) {
      console.error("Error getting business ID for user:", error);
      return null;
    }
  }

  /**
   * Get business ID for user with role-based access
   */
  static async getBusinessIdForUserWithRole(
    user: AuthenticatedUser,
    requestedBusinessId?: string
  ): Promise<{ success: boolean; businessId?: string; error?: string }> {
    try {
      const db = await DatabaseService.getDatabase();

      // If no specific business requested, get user's business
      if (!requestedBusinessId) {
        if (user.role === "admin") {
          return {
            success: false,
            error: "Business ID required for admin access",
          };
        }

        // Find business for regular users
        const business = await db
          .collection("businesses")
          .findOne({ userId: user._id.toString() });
        if (business) {
          return { success: true, businessId: business._id.toString() };
        }

        return {
          success: false,
          error: "User is not associated with a business",
        };
      }

      // If specific business requested, check permissions
      if (user.role === "admin") {
        return { success: true, businessId: requestedBusinessId };
      }

      if (user.role === "business") {
        // Check if user owns this business
        const business = await db.collection("businesses").findOne({
          _id: new ObjectId(requestedBusinessId),
          userId: user._id.toString(),
        });

        if (business) {
          return { success: true, businessId: requestedBusinessId };
        }

        return {
          success: false,
          error: "You do not have permission to access this business",
        };
      }

      return { success: false, error: "Insufficient permissions" };
    } catch (error) {
      console.error("Error getting business ID with role check:", error);
      return { success: false, error: "Failed to verify business access" };
    }
  }

  /**
   * Check if user can access specific appointment (for cancellation, etc.)
   */
  static async canAccessAppointment(
    user: AuthenticatedUser,
    businessId: string,
    clientId?: string
  ): Promise<boolean> {
    try {
      // Admin can access any appointment
      if (user.role === "admin") {
        return true;
      }

      // Business owner can access appointments in their business
      if (
        user.role === "business" &&
        (await this.verifyBusinessOwnership(user, businessId))
      ) {
        return true;
      }

      // Client can access their own appointments
      if (user.role === "client" && clientId) {
        const db = await DatabaseService.getDatabase();
        const client = await db.collection("clients").findOne({
          userId: user._id.toString(),
        });

        return !!(client && client._id.toString() === clientId);
      }

      return false;
    } catch (error) {
      console.error("Error checking appointment access:", error);
      return false;
    }
  }

  /**
   * Check if user has admin role
   */
  static isAdmin(user: AuthenticatedUser): boolean {
    return user.role === "admin";
  }

  /**
   * Check if user is business owner
   */
  static isBusinessOwner(user: AuthenticatedUser): boolean {
    return user.role === "business_owner";
  }

  /**
   * Authenticate request and get business ID for the user
   */
  static async authenticateRequestWithBusiness(request: NextRequest): Promise<{
    success: boolean;
    user?: AuthenticatedUser;
    businessId?: string;
    error?: string;
  }> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return {
          success: false,
          error: authResult.error || "Authentication failed",
        };
      }

      const user = authResult.user;

      // Get business ID for the user
      const businessId = await this.getBusinessIdForUser(user._id);
      if (!businessId) {
        return {
          success: false,
          error: "No business associated with this user",
        };
      }

      return {
        success: true,
        user,
        businessId,
      };
    } catch (error) {
      console.error("Error authenticating request with business:", error);
      return {
        success: false,
        error: "Authentication failed",
      };
    }
  }
}
