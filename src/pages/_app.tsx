import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { getSearchService } from '@/lib/search-service';
import MDXProvider from '@/components/MDXProvider';


export default function App({ Component, pageProps }: AppProps) {
  // Initialize search service on client side
  useEffect(() => {
    // Get search service instance and preload recipes
    const searchService = getSearchService();
    if (!searchService.isLoaded()) {
      searchService.loadRecipes();
    }
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <MDXProvider>
      <Component {...pageProps} />
    </MDXProvider>
  );
}