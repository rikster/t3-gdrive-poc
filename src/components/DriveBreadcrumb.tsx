"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { ServiceType } from "~/types/services";

interface BreadcrumbItem {
  id: string;
  name: string;
  service?: ServiceType;
  accountId?: string;
}

interface DriveBreadcrumbProps {
  items: BreadcrumbItem[];
  currentFolder: string;
  onNavigate: (item: BreadcrumbItem) => void;
  className?: string;
}

export function DriveBreadcrumb({
  items,
  currentFolder,
  onNavigate,
  className,
}: DriveBreadcrumbProps) {
  const router = useRouter();

  // Handle popstate events (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      // The URL params will be handled by DriveUI's useEffect
      // This ensures breadcrumbs stay in sync
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Handle root folder navigation
  const handleRootClick = () => {
    onNavigate({
      id: "root",
      name: "Home",
    });

    // Ensure the URL is updated with the root folder ID
    router.push("/?folderId=root");
  };

  return (
    <nav
      className={cn(
        "flex w-full items-center space-x-1 overflow-x-auto pb-2",
        className,
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1 text-sm">
        {/* Root/Home item */}
        <li>
          <Button
            variant="ghost"
            size="sm"
            className="flex h-8 items-center px-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleRootClick}
            disabled={currentFolder === "root"}
          >
            <Home className="mr-1 h-4 w-4 text-blue-500" />
            <span className="font-medium">Home</span>
          </Button>
        </li>

        {/* Path items */}
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center">
            <ChevronRight className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <Button
              variant="ghost"
              size="sm"
              className="flex h-8 items-center px-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => onNavigate(item)}
              disabled={currentFolder === item.id}
            >
              <span className="max-w-[150px] truncate font-medium">
                {item.name}
              </span>
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
