"use client";

import { ChevronRight, Home } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface BreadcrumbItem {
  id: string;
  name: string;
  service?: string;
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
  // Handle root folder navigation
  const handleRootClick = () => {
    onNavigate({
      id: "root",
      name: "Home",
    });
  };

  return (
    <nav
      className={cn(
        "flex items-center space-x-1 overflow-x-auto pb-2 mx-auto max-w-6xl",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {/* Root/Home item */}
        <li>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center h-8 px-2 text-sm"
            onClick={handleRootClick}
            disabled={currentFolder === "root"}
          >
            <Home className="w-4 h-4 mr-1" />
            <span>Home</span>
          </Button>
        </li>

        {/* Path items */}
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center h-8 px-2 text-sm"
              onClick={() => onNavigate(item)}
              disabled={currentFolder === item.id}
            >
              <span className="truncate max-w-[150px]">{item.name}</span>
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
