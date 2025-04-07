"use client";

import { LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useDrive } from "~/contexts/DriveContext";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function LogoutButton({
  variant = "outline",
  size = "sm",
  showText = true
}: LogoutButtonProps) {
  const { logout, isClerkAuthenticated } = useDrive();

  if (!isClerkAuthenticated) {
    return null;
  }

  return (
    <Button variant={variant} onClick={logout} size={size}>
      <LogOut className="mr-2 h-4 w-4" />
      {showText && <span className="hidden sm:inline">Logout</span>}
    </Button>
  );
}
