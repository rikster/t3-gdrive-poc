import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DriveItem } from "~/types/drive";
import type { ServiceType } from "~/types/services";

import { DriveTable } from "./DriveTable";

describe("DriveTable", () => {
  const mockItems: DriveItem[] = [
    {
      id: "1",
      name: "Document.pdf",
      modifiedAt: "2025-04-11T02:54:37Z",
      size: "1024",
      service: "google" as ServiceType,
      accountId: "user@gmail.com",
      type: "file",
      parentId: "root",
    },
    {
      id: "2",
      name: "Images",
      modifiedAt: "2025-04-10T02:54:37Z",
      size: "0",
      service: "dropbox" as ServiceType,
      accountId: "user@example.com",
      type: "folder",
      parentId: "root",
    },
  ];

  const mockServiceAccounts = {
    google: [{ id: "user@gmail.com", service: "google" as ServiceType, name: "John Doe", email: "user@gmail.com" }],
    dropbox: [{ id: "user@example.com", service: "dropbox" as ServiceType, name: "John Doe", email: "user@example.com" }],
  };

  // Test empty state
  it("should display empty state message when no items are present", () => {
    render(
      <DriveTable
        items={[]}
        isLoading={false}
        serviceAccounts={{}}
        isRecursiveSearch={false}
        clearSearch={() => {}}
        handleFolderClick={() => {}}
        openFile={() => {}}
        onRetry={() => {}}
      />
    );

    expect(screen.getByText(/No files found in this folder/i)).toBeInTheDocument();
  });

  // Test loading state
  it("should display loading spinner when loading", () => {
    render(
      <DriveTable
        items={[]}
        isLoading={true}
        serviceAccounts={{}}
        isRecursiveSearch={false}
        clearSearch={() => {}}
        handleFolderClick={() => {}}
        openFile={() => {}}
        onRetry={() => {}}
      />
    );

    expect(screen.getByText(/Loading files/i)).toBeInTheDocument();
  });

  // Test error state
  it("should display error message and retry button when error occurs", () => {
    const onRetry = vi.fn();
    render(
      <DriveTable
        items={[]}
        isLoading={false}
        error="Failed to load files"
        serviceAccounts={{}}
        isRecursiveSearch={false}
        clearSearch={() => {}}
        handleFolderClick={() => {}}
        openFile={() => {}}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText(/Failed to load files/i)).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // Test displaying items
  it("should display list of files and folders", () => {
    render(
      <DriveTable
        items={mockItems}
        isLoading={false}
        serviceAccounts={mockServiceAccounts}
        isRecursiveSearch={false}
        clearSearch={() => {}}
        handleFolderClick={() => {}}
        openFile={() => {}}
        onRetry={() => {}}
      />
    );

    expect(screen.getByText("Document.pdf")).toBeInTheDocument();
    expect(screen.getByText("Images")).toBeInTheDocument();
    expect(screen.getByText("Google Drive - user@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("Dropbox - user@example.com")).toBeInTheDocument();
  });

  // Test folder click
  it("should call handleFolderClick when folder is clicked", () => {
    const handleFolderClick = vi.fn();
    render(
      <DriveTable
        items={mockItems}
        isLoading={false}
        serviceAccounts={mockServiceAccounts}
        isRecursiveSearch={false}
        clearSearch={() => {}}
        handleFolderClick={handleFolderClick}
        openFile={() => {}}
        onRetry={() => {}}
      />
    );

    const folderButton = screen.getByRole("button", { name: "Images" });
    expect(folderButton).toBeInTheDocument();
    fireEvent.click(folderButton);
    expect(handleFolderClick).toHaveBeenCalledWith(mockItems[1]);
  });

  // Test file click
  it("should call openFile when file is clicked", () => {
    const openFile = vi.fn();
    render(
      <DriveTable
        items={mockItems}
        isLoading={false}
        serviceAccounts={mockServiceAccounts}
        isRecursiveSearch={false}
        clearSearch={() => {}}
        handleFolderClick={() => {}}
        openFile={openFile}
        onRetry={() => {}}
      />
    );

    const fileButton = screen.getByRole("button", { name: "Document.pdf" });
    expect(fileButton).toBeInTheDocument();
    fireEvent.click(fileButton);
    expect(openFile).toHaveBeenCalledWith(
      mockItems[0]?.id ?? "",
      mockItems[0]?.service ?? "",
      mockItems[0]?.accountId ?? ""
    );
  });

  // Test search results
  it("should display clear search button in recursive search mode", () => {
    const clearSearch = vi.fn();
    render(
      <DriveTable
        items={mockItems}
        isLoading={false}
        serviceAccounts={mockServiceAccounts}
        isRecursiveSearch={true}
        searchQuery="doc"
        clearSearch={clearSearch}
        handleFolderClick={() => {}}
        openFile={() => {}}
        onRetry={() => {}}
      />
    );

    // In recursive search mode, we show the search query in the empty state message
    expect(screen.getByText(/doc/i)).toBeInTheDocument();
    expect(clearSearch).not.toHaveBeenCalled();
  });

  // Test no search results
  it("should display no results message when search has no matches", () => {
    render(
      <DriveTable
        items={[]}
        isLoading={false}
        serviceAccounts={mockServiceAccounts}
        isRecursiveSearch={true}
        searchQuery="nonexistent"
        clearSearch={() => {}}
        handleFolderClick={() => {}}
        openFile={() => {}}
        onRetry={() => {}}
      />
    );

    expect(screen.getByText(/No files match "nonexistent"/i)).toBeInTheDocument();
  });
});
