"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

interface DriveErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function DriveErrorState({
  error,
  onRetry,
  className = "",
}: DriveErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Something went wrong</h3>
      <p className="mb-4 max-w-md text-sm text-gray-500 dark:text-gray-400">
        {error}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
