"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
}

export function ErrorDialog({
  open,
  onOpenChange,
  title = "Error",
  message,
}: ErrorDialogProps) {
  // Use a callback to handle closing to avoid potential state update loops
  const handleClose = React.useCallback(() => {
    console.log("Error dialog close button clicked");
    onOpenChange(false);
  }, [onOpenChange]);

  // Use a ref to track if the component is mounted
  const isMountedRef = React.useRef(true);

  // Set up effect for cleanup and to prevent body scrolling
  React.useEffect(() => {
    if (open) {
      // Prevent body scrolling when dialog is open
      document.body.style.overflow = "hidden";
      // Add some padding to prevent layout shift when scrollbar disappears
      document.body.style.paddingRight = "15px"; // Approximate scrollbar width
    }

    return () => {
      // Restore body scrolling when component unmounts or dialog closes
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      isMountedRef.current = false;
    };
  }, [open]);

  // Only render the dialog when it's open to avoid animation issues
  if (!open) return null;

  console.log("Rendering error dialog with message:", message);

  // Create a portal to render the dialog at the root level of the DOM
  // This prevents any layout shifts caused by parent components
  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/50"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
      }} // Ensure fixed positioning with explicit values
    >
      <div
        className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-gray-100"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating
        style={{ margin: "0 auto" }} // Center horizontally
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold leading-none tracking-tight dark:text-white">
              {title}
            </h2>
          </div>
          <p className="text-muted-foreground pt-2 text-sm dark:text-gray-300">
            {message}
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </div>
    </div>
  );

  // Use createPortal to render the dialog at the root level
  // Only run on the client side
  if (typeof document !== "undefined") {
    return createPortal(dialogContent, document.body);
  }

  // Fallback for server-side rendering
  return dialogContent;
}
