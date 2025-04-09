import { cookies } from "next/headers";

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export interface ServiceAccount {
  id: string; // Unique identifier for the account
  service: ServiceType;
  name?: string; // Display name for the account (e.g., "Work Google Drive")
  email?: string; // User's email for this account
}

export type ServiceType = "google" | "onedrive" | "dropbox";

// Get stored tokens for a specific service account
export async function getStoredTokens(
  service: ServiceType = "google",
  accountId = "default",
): Promise<TokenData | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(`${service}_${accountId}_tokens`);
  if (!tokenCookie) return null;

  try {
    return JSON.parse(tokenCookie.value) as TokenData;
  } catch {
    return null;
  }
}

// Store tokens for a specific service account
export async function storeTokens(
  tokens: TokenData,
  service: ServiceType = "google",
  accountId = "default",
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`${service}_${accountId}_tokens`, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

// Get list of all active service accounts
export async function getActiveServiceAccounts(): Promise<ServiceAccount[]> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const accounts: ServiceAccount[] = [];

  // Regular expression to match service account tokens cookies
  // Format: service_accountId_tokens
  const tokenRegex = /^(google|onedrive|dropbox)_(.+)_tokens$/;

  for (const cookie of allCookies) {
    const matches = tokenRegex.exec(cookie.name);
    if (matches && matches.length >= 3) {
      const service = matches[1] as ServiceType;
      const accountId = matches[2];

      // Try to extract account metadata if available
      let accountMetadata: Record<string, unknown> = {};
      try {
        const metadataCookie = cookieStore.get(
          `${service}_${accountId}_metadata`,
        );
        if (metadataCookie) {
          accountMetadata = JSON.parse(metadataCookie.value) as Record<
            string,
            unknown
          >;
        }
      } catch (error) {
        // If metadata parsing fails, continue with basic info
      }

      accounts.push({
        id: accountId,
        service,
        ...(accountMetadata as Partial<ServiceAccount>),
      } as ServiceAccount);
    }
  }

  return accounts;
}

// Store metadata for a service account (like email, display name)
export async function storeAccountMetadata(
  metadata: Partial<ServiceAccount>,
  service: ServiceType,
  accountId = "default",
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    `${service}_${accountId}_metadata`,
    JSON.stringify(metadata),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    },
  );
}

// Get metadata for a specific service account
export async function getAccountMetadata(
  service: ServiceType,
  accountId = "default",
): Promise<Partial<ServiceAccount> | null> {
  const cookieStore = await cookies();
  const metadataCookie = cookieStore.get(`${service}_${accountId}_metadata`);

  if (!metadataCookie) return null;

  try {
    return JSON.parse(metadataCookie.value) as Partial<ServiceAccount>;
  } catch {
    return null;
  }
}

// Get active services (for backward compatibility)
export async function getActiveServices(): Promise<ServiceType[]> {
  const accounts = await getActiveServiceAccounts();
  // Extract unique services
  const services = new Set(accounts.map((account) => account.service));
  return Array.from(services);
}

// Get the first active service account for each service type (for backward compatibility)
export async function getActiveService(): Promise<ServiceType | null> {
  const services = await getActiveServices();
  return services.length > 0 ? services[0] : null;
}

// Clear tokens for a specific account or all accounts of a service
export async function clearTokens(
  service?: ServiceType,
  accountId?: string,
): Promise<void> {
  const cookieStore = await cookies();

  if (!service) {
    // Get all active accounts and clear them
    const accounts = await getActiveServiceAccounts();
    for (const account of accounts) {
      cookieStore.delete(`${account.service}_${account.id}_tokens`);
      cookieStore.delete(`${account.service}_${account.id}_metadata`);
    }
  } else if (service && !accountId) {
    // Clear all accounts of the specified service
    const accounts = await getActiveServiceAccounts();
    const serviceAccounts = accounts.filter(
      (account) => account.service === service,
    );

    for (const account of serviceAccounts) {
      cookieStore.delete(`${service}_${account.id}_tokens`);
      cookieStore.delete(`${service}_${account.id}_metadata`);
    }
  } else if (service && accountId) {
    // Clear only the specified account
    cookieStore.delete(`${service}_${accountId}_tokens`);
    cookieStore.delete(`${service}_${accountId}_metadata`);
  }
}

export async function updateExpiryDate(
  tokens: TokenData,
  service: ServiceType = "google",
  accountId = "default",
): Promise<void> {
  // Set expiry date to current time + token_expires_in
  const updatedTokens = {
    ...tokens,
    expiry_date: Date.now() + 3600 * 1000, // 1 hour from now
  };

  // Store updated tokens
  await storeTokens(updatedTokens, service, accountId);
}

// Generate a unique account ID
export function generateAccountId(
  service: ServiceType,
  email?: string,
): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const emailHash = email ? email.split("@")[0] : "";

  return `${service}_${emailHash || "user"}_${timestamp}_${random}`;
}

// Check if an account with the given email already exists for a service
export async function findExistingAccountByEmail(
  service: ServiceType,
  email: string,
): Promise<ServiceAccount | null> {
  if (!email) return null;

  const accounts = await getActiveServiceAccounts();

  // Find an account with the same service and email
  const existingAccount = accounts.find(
    (account) => account.service === service && account.email === email,
  );

  return existingAccount || null;
}
