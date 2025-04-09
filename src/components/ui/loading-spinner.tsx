"use client";

import type { LoadingSpinnerProps } from "~/types/ui";

export function LoadingSpinner({
  containerClassName = "",
  spinnerSize = "md",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinnerSizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-2",
  };

  const baseContainerClass = fullScreen
    ? "h-screen flex items-center justify-center bg-white dark:bg-gray-950"
    : "flex items-center justify-center";

  const containerClass = `${baseContainerClass} ${containerClassName}`;

  return (
    <div className={containerClass}>
      <div
        className={`animate-spin rounded-full ${spinnerSizeClasses[spinnerSize]} border-solid border-gray-300 border-t-gray-800 dark:border-gray-600 dark:border-t-gray-200`}
      ></div>
    </div>
  );
}
