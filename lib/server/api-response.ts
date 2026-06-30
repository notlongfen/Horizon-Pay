import { NextResponse } from "next/server";
import { jsonSafe } from "./json-safe";

export class ApiResponse {
  static success<T>(data: T, status: number = 200) {
    return NextResponse.json(
      jsonSafe({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }),
      { status }
    );
  }

  static error(error: Error | string, status: number = 400) {
    const message = error instanceof Error ? error.message : error;
    return NextResponse.json(
      jsonSafe({
        success: false,
        error: {
          message,
          timestamp: new Date().toISOString(),
        },
      }),
      { status }
    );
  }

  static notFound(resource: string) {
    return this.error(`${resource} not found`, 404);
  }

  static unauthorized() {
    return this.error("Unauthorized", 401);
  }

  static forbidden() {
    return this.error("Forbidden", 403);
  }

  static serverError(error: Error | string) {
    return this.error(error, 500);
  }

  static badRequest(message: string) {
    return this.error(message, 400);
  }

  static created<T>(data: T) {
    return this.success(data, 201);
  }

  static noContent() {
    return new NextResponse(null, { status: 204 });
  }
}
