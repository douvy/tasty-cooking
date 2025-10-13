import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { getSearchService } from "@/lib/search-service";
import MDXProvider from "@/components/MDXProvider";
import { Analytics } from "@vercel/analytics/next";

export default function App({ Component, pageProps }: AppProps) {
  // Initialize search service on client side
  useEffect(() => {
    // Get search service instance and preload recipes
    const searchService = getSearchService();
    if (!searchService.isLoaded()) {
      searchService.loadRecipes();
    }

    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {})
          .catch((error) => {});
      });
    }
  }, []);

  return (
    <MDXProvider>
      <Component {...pageProps} />
    </MDXProvider>
  );
}
