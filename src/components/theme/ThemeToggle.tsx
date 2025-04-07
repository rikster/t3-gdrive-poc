"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

// Simplified ThemeToggle component that doesn't use the dropdown menu
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Simple toggle function that cycles through themes
  const toggleTheme = React.useCallback(() => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  }, [theme, setTheme]);

  // Get the current theme icon
  const ThemeIcon = React.useMemo(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // If system theme, show the Monitor icon
      if (theme === "system") {
        return Monitor;
      }
      // Otherwise show Sun for light and Moon for dark
      return theme === "dark" ? Moon : Sun;
    }
    // Default to Sun icon if not in browser
    return Sun;
  }, [theme]);

  // Get the appropriate title based on the current theme
  const themeTitle = React.useMemo(() => {
    if (theme === "system") {
      return "System theme (follows your device settings)";
    } else {
      return `${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`;
    }
  }, [theme]);

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8"
      onClick={toggleTheme}
      title={`${themeTitle}. Click to toggle.`}
    >
      <ThemeIcon
        className={`h-4 w-4 ${theme === "light" ? "text-amber-500" : theme === "dark" ? "text-indigo-500" : "text-gray-500"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
