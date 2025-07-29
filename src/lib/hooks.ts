"use client";

import { useEffect, useState } from "react";

/**
 * Hook that returns true only after the component has mounted on the client.
 * Useful for preventing hydration mismatches when using browser-specific APIs.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for safely accessing window object without causing hydration mismatches.
 */
export function useWindow() {
  const isClient = useIsClient();
  return isClient ? window : undefined;
}
