"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyD5XEFKcTJCgp1Ta_L4pAKO7xqAIEmaXg4",
  authDomain: "pktkr-74a8e.firebaseapp.com",
  projectId: "pktkr-74a8e",
  storageBucket: "pktkr-74a8e.firebasestorage.app",
  messagingSenderId: "495494234004",
  appId: "1:495494234004:web:be34cafcd2b98d0482d981",
  measurementId: "G-NWX47LHQ5W",
};

export function FirebaseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function trackPageView() {
      const [{ getApps, initializeApp }, { getAnalytics, isSupported, logEvent }] =
        await Promise.all([import("firebase/app"), import("firebase/analytics")]);

      if (cancelled || !(await isSupported())) return;

      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
      const query = searchParams.toString();

      logEvent(analytics, "page_view", {
        page_path: `${pathname}${query ? `?${query}` : ""}`,
      });
    }

    void trackPageView();

    return () => {
      cancelled = true;
    };
  }, [pathname, searchParams]);

  return null;
}
