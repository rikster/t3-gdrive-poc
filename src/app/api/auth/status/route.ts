import { type NextRequest } from "next/server";
import { getActiveServiceAccounts, getActiveServices } from "~/lib/session";

export async function GET(request: NextRequest) {
  // Get all service accounts
  const serviceAccounts = await getActiveServiceAccounts();

  // Extract unique services for backward compatibility
  const activeServices = await getActiveServices();

  // For backward compatibility
  const primaryService = activeServices.length > 0 ? activeServices[0] : null;

  return Response.json({
    isAuthenticated: serviceAccounts.length > 0,
    service: primaryService,
    activeServices: activeServices,
    serviceAccounts: serviceAccounts,
  });
}
