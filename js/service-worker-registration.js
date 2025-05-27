/**
 * service-worker-registration.js
 * Handles the registration of the service worker for PWA functionality
 * and implements image lazy loading for better performance
 */
document.addEventListener('DOMContentLoaded', function() {
  // Register Service Worker for offline functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/js/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
  
  // Add support for native lazy loading with fallback
  // All images after the first two should use lazy loading
  const allImages = document.querySelectorAll('#recipe-grid img');
  for (let i = 2; i < allImages.length; i++) {
    allImages[i].setAttribute('loading', 'lazy');
  }
});