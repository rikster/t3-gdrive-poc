import { type NextRequest } from "next/server";
import { clearTokens } from "~/lib/session";
import { type ServiceType } from "~/types/services";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const service = searchParams.get("service") as ServiceType | null;
  const accountId = searchParams.get("accountId");

  try {
    // Clear tokens based on parameters:
    // - If service and accountId are provided, clear that specific account
    // - If only service is provided, clear all accounts for that service
    // - If neither is provided, clear all accounts for all services
    await clearTokens(service ?? undefined, accountId ?? undefined);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting service:", error);
    return Response.json(
      { error: "Failed to disconnect service" },
      { status: 500 },
    );
  }
}
