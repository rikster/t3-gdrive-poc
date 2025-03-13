'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't redirect if we're already on the sign-in or sign-up pages
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  useEffect(() => {
    // Only redirect after Clerk has loaded and if not on an auth page
    if (isLoaded && !isSignedIn && !isAuthPage) {
      // Not signed in, redirect to sign-in page
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router, isAuthPage]);

  // Show a minimal loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we prepare your experience.</p>
        </div>
      </div>
    );
  }

  // If we're on auth pages or the user is already signed in, render children
  if (isAuthPage || isSignedIn) {
    return <>{children}</>;
  }

  // Show redirecting state if not signed in and not on auth pages
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">You need to sign in</h2>
        <p className="text-gray-500">Redirecting to the sign-in page...</p>
      </div>
    </div>
  );
}
