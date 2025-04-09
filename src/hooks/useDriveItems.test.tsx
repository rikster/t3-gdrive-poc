import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDriveItems } from "./useDriveItems";
import { DriveContext } from "~/contexts/DriveContext";
import { DriveNavigationContext } from "~/contexts/DriveNavigationContext";
import type { DriveItem } from "~/types/drive";
import type { ServiceAccount } from "~/types/services";

// Mock next/navigation
vi.mock("next/navigation", () => {
  return {
    useSearchParams: () => ({
      get: (param: string) => {
        if (param === "folderId") return "root";
        if (param === "service") return null;
        if (param === "accountId") return null;
        return null;
      },
      toString: () => "",
    }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => "/",
  };
});

// Mock fetch
let mockFetchImplementation: any = null;

global.fetch = vi.fn().mockImplementation((url: string) => {
  if (mockFetchImplementation) {
    return mockFetchImplementation(url);
  }
  return Promise.resolve(new Response());
});

// Mock window.location
const originalHref = window.location.href;
Object.defineProperty(window, "location", {
  writable: true,
  value: { href: "" },
});

// Restore original location after tests
afterEach(() => {
  window.location.href = originalHref;
});

// Mock console methods
console.error = vi.fn();
console.log = vi.fn();

// Mock service accounts
const mockServiceAccounts: ServiceAccount[] = [
  {
    id: "google_account_1",
    service: "google",
    name: "Google Account 1",
    email: "user1@example.com",
  },
  {
    id: "onedrive_account_1",
    service: "onedrive",
    name: "OneDrive Account 1",
    email: "user1@example.com",
  },
];

// Mock drive context
const mockDriveContext = {
  isAuthenticated: true,
  serviceAccounts: mockServiceAccounts,
  searchQuery: "",
  isRecursiveSearch: false,
  searchResults: [],
  // Add other required properties with default values
  isClerkAuthenticated: true,
  authenticateService: vi.fn(),
  addNewAccount: vi.fn(),
  disconnectService: vi.fn(),
  disconnectAccount: vi.fn(),
  logout: vi.fn(),
  currentService: null,
  activeServices: ["google", "onedrive"],
  isAuthenticating: false,
  setSearchQuery: vi.fn(),
  isSearching: false,
  performSearch: vi.fn(),
  clearSearch: vi.fn(),
  openFile: vi.fn(),
};

// Mock drive navigation context
const mockDriveNavigationContext = {
  currentFolder: "root",
  currentFolderService: null,
  currentAccountId: null,
  // Add other required properties
  breadcrumbPath: [],
  navigateToFolder: vi.fn(),
  navigateUp: vi.fn(),
  navigateHome: vi.fn(),
};

// Wrapper component for providing context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DriveContext.Provider value={mockDriveContext}>
    <DriveNavigationContext.Provider value={mockDriveNavigationContext}>
      {children}
    </DriveNavigationContext.Provider>
  </DriveContext.Provider>
);

describe("useDriveItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = "";
  });

  afterEach(() => {
    mockFetchImplementation = null;
  });

  it("should initialize with default values", () => {
    // For this test, we'll use a special wrapper with no service accounts
    // to prevent API calls
    const emptyAccountsContext = {
      ...mockDriveContext,
      serviceAccounts: [],
    };

    const emptyWrapper = ({ children }: { children: React.ReactNode }) => (
      <DriveContext.Provider value={emptyAccountsContext}>
        <DriveNavigationContext.Provider value={mockDriveNavigationContext}>
          {children}
        </DriveNavigationContext.Provider>
      </DriveContext.Provider>
    );

    const { result } = renderHook(() => useDriveItems(), {
      wrapper: emptyWrapper,
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.filteredItems).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.serviceItems).toEqual({});
  });

  it("should use initial values when provided", () => {
    const initialItems: DriveItem[] = [
      {
        id: "1",
        name: "Test File",
        type: "file",
        modifiedAt: "2023-01-01",
        parentId: "root",
      },
    ];
    const initialLoading = true;
    const initialError = "Initial error";

    const { result } = renderHook(
      () => useDriveItems(initialItems, initialLoading, initialError),
      { wrapper },
    );

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.filteredItems).toEqual(initialItems);
    expect(result.current.isLoading).toBe(initialLoading);
    expect(result.current.error).toBe(initialError);
  });

  it("should fetch files successfully from multiple services", async () => {
    // Mock successful responses for both services
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/google")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "g1",
                  name: "Google File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "root",
                },
              ],
            }),
        });
      } else if (url.includes("/api/onedrive")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "o1",
                  name: "OneDrive File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "root",
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const { result } = renderHook(() => useDriveItems(), { wrapper });

    // Wait for the hook to fetch data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the results
    expect(result.current.items.length).toBe(2);
    expect(result.current.error).toBe(null);
    expect(result.current.serviceItems).toHaveProperty("google");
    expect(result.current.serviceItems).toHaveProperty("onedrive");
  });

  it("should handle HTTP error (500) from Google API", async () => {
    // Mock a 500 error from Google API
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/google")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: "Internal Server Error" }),
        });
      } else if (url.includes("/api/onedrive")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "o1",
                  name: "OneDrive File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "root",
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const { result } = renderHook(() => useDriveItems(), { wrapper });

    // Wait for the hook to fetch data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the error is set
    expect(result.current.error).toBe(
      "Error fetching files from google (HTTP 500)",
    );
    expect(console.error).toHaveBeenCalled();

    // Verify we still have OneDrive files
    expect(result.current.items.length).toBe(1);
    expect(result.current.serviceItems).toHaveProperty("onedrive");
  });

  it("should handle authentication error (401) from Google API", async () => {
    // Mock a 401 error from Google API
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/google")) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () =>
            Promise.resolve({
              error: "Authentication error",
              url: "https://accounts.google.com/auth",
            }),
        });
      } else if (url.includes("/api/onedrive")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "o1",
                  name: "OneDrive File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "root",
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    renderHook(() => useDriveItems(), { wrapper });

    // Wait for the hook to fetch data
    await waitFor(() => {
      expect(window.location.href).toBe("https://accounts.google.com/auth");
    });

    // Verify the redirect happened
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Authentication required for google"),
    );
  });

  it("should handle API error response with error message", async () => {
    // Mock an API error response
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/google")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              error: "Failed to fetch files from Google Drive",
            }),
        });
      } else if (url.includes("/api/onedrive")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "o1",
                  name: "OneDrive File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "root",
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const { result } = renderHook(() => useDriveItems(), { wrapper });

    // Wait for the hook to fetch data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the error is set
    expect(result.current.error).toBe(
      "Failed to fetch files from Google Drive",
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error fetching google files:"),
      "Failed to fetch files from Google Drive",
    );

    // Verify we still have OneDrive files
    expect(result.current.items.length).toBe(1);
    expect(result.current.serviceItems).toHaveProperty("onedrive");
  });

  it("should handle network error", async () => {
    // Mock a network error
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/google")) {
        return Promise.reject(new Error("Network error"));
      } else if (url.includes("/api/onedrive")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "o1",
                  name: "OneDrive File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "root",
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const { result } = renderHook(() => useDriveItems(), { wrapper });

    // Wait for the hook to fetch data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the error is logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to fetch files from google:"),
      expect.any(Error),
    );

    // Verify we still have OneDrive files
    expect(result.current.items.length).toBe(1);
    expect(result.current.serviceItems).toHaveProperty("onedrive");
  });

  it("should handle specific folder navigation", async () => {
    // Set up navigation context for a specific folder
    const specificFolderContext = {
      ...mockDriveNavigationContext,
      currentFolder: "folder1",
      currentFolderService: "google",
      currentAccountId: "google_account_1",
      breadcrumbPath: [
        {
          id: "folder1",
          name: "Folder 1",
          service: "google",
          accountId: "google_account_1",
        },
      ],
    };

    const specificWrapper = ({ children }: { children: React.ReactNode }) => (
      <DriveContext.Provider value={mockDriveContext}>
        <DriveNavigationContext.Provider value={specificFolderContext}>
          {children}
        </DriveNavigationContext.Provider>
      </DriveContext.Provider>
    );

    // Mock successful response for the specific folder
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/google")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "g2",
                  name: "Google Subfolder File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "folder1",
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const { result } = renderHook(() => useDriveItems(), {
      wrapper: specificWrapper,
    });

    // Wait for the hook to fetch data
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 2000 },
    );

    // Verify the results
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0]?.name).toBe("Google Subfolder File");
    expect(result.current.items[0]?.parentId).toBe("folder1");
    expect(result.current.serviceItems).toHaveProperty("google");
  });

  it("should handle expired token with refresh", async () => {
    // Mock a 401 error with refresh token URL
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/google")) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () =>
            Promise.resolve({
              error: "Token expired and refresh failed",
              url: "https://accounts.google.com/auth?refresh=true",
            }),
        });
      } else if (url.includes("/api/onedrive")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "o1",
                  name: "OneDrive File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "root",
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    renderHook(() => useDriveItems(), { wrapper });

    // Wait for the hook to fetch data
    await waitFor(() => {
      expect(window.location.href).toBe(
        "https://accounts.google.com/auth?refresh=true",
      );
    });

    // Verify the redirect happened
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Authentication required for google"),
    );
  });

  it("should manually fetch files when calling fetchFiles", async () => {
    // Mock successful responses
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      if (url.includes("/api/google")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "gm1",
                  name: "Manual Google File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "manual",
                },
              ],
            }),
        });
      } else if (url.includes("/api/onedrive")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              files: [
                {
                  id: "om1",
                  name: "Manual OneDrive File",
                  type: "file",
                  modifiedAt: "2023-01-01",
                  parentId: "manual",
                },
              ],
            }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const { result } = renderHook(() => useDriveItems(), { wrapper });

    // Wait for initial loading to complete
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 2000 },
    );

    // Reset the mock to track new calls
    mockFetchImplementation.mockClear();

    // Call fetchFiles manually
    await act(async () => {
      await result.current.fetchFiles("manual");
    });

    // Wait for the hook to fetch data
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 2000 },
    );

    // Verify the results
    expect(result.current.items.length).toBe(2);
    expect(
      result.current.items.some((item) => item.name === "Manual Google File"),
    ).toBe(true);
    expect(
      result.current.items.some((item) => item.name === "Manual OneDrive File"),
    ).toBe(true);
  });
});
