import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Service for standardized API responses and error handling
 */
export class ApiResponseService {
  /**
   * Create success response
   */
  static success<T>(data: T, message?: string): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      message,
    });
  }

  /**
   * Create error response
   */
  static error(message: string, statusCode: number = 500): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }

  /**
   * Handle validation errors
   */
  static validationError(errors: string | string[]): NextResponse {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: errorArray,
      },
      { status: 400 }
    );
  }

  /**
   * Handle unauthorized errors
   */
  static unauthorized(
    message: string = "Authentication required"
  ): NextResponse {
    return this.error(message, 401);
  }

  /**
   * Handle forbidden errors
   */
  static forbidden(message: string = "Access denied"): NextResponse {
    return this.error(message, 403);
  }

  /**
   * Handle not found errors
   */
  static notFound(message: string = "Resource not found"): NextResponse {
    return this.error(message, 404);
  }

  /**
   * Handle server errors
   */
  static serverError(message: string = "Internal server error"): NextResponse {
    return this.error(message, 500);
  }

  /**
   * Execute API operation with standardized error handling
   */
  static async executeOperation<T>(
    operation: () => Promise<T>
  ): Promise<NextResponse> {
    try {
      const result = await operation();
      return this.success(result);
    } catch (error) {
      console.error("API operation failed:", error);
      return this.serverError(
        error instanceof Error ? error.message : "Operation failed"
      );
    }
  }
}
