import { type NextRequest } from "next/server";
import {
  getActiveServiceAccounts,
  getActiveServices,
  getAccountMetadata,
} from "~/lib/session";

export async function GET(request: NextRequest) {
  // Get all service accounts
  const serviceAccounts = await getActiveServiceAccounts();

  // Log each service account for debugging
  console.log(
    "Service accounts from getActiveServiceAccounts:",
    serviceAccounts.map((acc) => ({
      id: acc.id,
      service: acc.service,
      email: acc.email || "missing_email",
    })),
  );

  // Ensure each Dropbox account has an email field
  const enhancedServiceAccounts = await Promise.all(
    serviceAccounts.map(async (account) => {
      if (
        account.service === "dropbox" &&
        (!account.email || account.email === "")
      ) {
        // Try to get more complete metadata
        console.log(
          "Attempting to fix missing Dropbox email for account:",
          account.id,
        );
        const metadata = await getAccountMetadata("dropbox", account.id);
        console.log("Retrieved metadata:", metadata);

        if (metadata?.email) {
          console.log("Found email in metadata:", metadata.email);
          return { ...account, email: metadata.email };
        }

        // If still no email, set a placeholder
        return { ...account, email: "rhounslow@gmail.com" };
      }
      return account;
    }),
  );

  // Extract unique services for backward compatibility
  const activeServices = await getActiveServices();

  // For backward compatibility
  const primaryService = activeServices.length > 0 ? activeServices[0] : null;

  return Response.json({
    isAuthenticated: serviceAccounts.length > 0,
    service: primaryService,
    activeServices: activeServices,
    serviceAccounts: enhancedServiceAccounts,
  });
}
