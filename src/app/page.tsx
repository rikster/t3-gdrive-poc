"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { DriveUI } from "~/components/DriveUI";

export default function HomePage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // After Clerk has loaded, check if the user is signed in
    if (isLoaded && !userId) {
      // If not signed in, redirect to sign-in page
      router.push("/sign-in");
    } else if (isLoaded && userId) {
      // If signed in and no folderId parameter is present, redirect to root folder
      const folderId = searchParams.get("folderId");
      if (!folderId) {
        router.push("/?folderId=root");
      }
    }
  }, [isLoaded, userId, router, searchParams]);

  // Show loading state or the actual UI if authenticated
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!userId) {
    // This may briefly show before redirect happens
    return (
      <div className="flex min-h-screen items-center justify-center">
        Redirecting to login...
      </div>
    );
  }

  // If authenticated, show the DriveUI
  return <DriveUI />;
}
