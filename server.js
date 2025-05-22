const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression for all responses
app.use(compression());

// Security headers middleware
app.use((req, res, next) => {
  // Protect against XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Control iframe embedding
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Set referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enable HTTP Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Set permitted sources for content
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://cdn.tailwindcss.com 'unsafe-inline'; " +
    "style-src 'self' https://fonts.googleapis.com https://pro.fontawesome.com 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self' https://fonts.gstatic.com https://pro.fontawesome.com; " +
    "connect-src 'self';"
  );
  
  next();
});

// Set cache headers for static assets
const setCache = function(req, res, next) {
  // Skip caching for HTML files
  if (req.path.endsWith('.html') || !req.path.includes('.')) {
    res.setHeader('Cache-Control', 'no-cache');
    return next();
  }
  
  // Cache durations
  const longPeriod = 60 * 60 * 24 * 30; // 30 days for immutable content
  const mediumPeriod = 60 * 60 * 24 * 7; // 7 days
  const shortPeriod = 60 * 60 * 24; // 1 day
  
  // Use different cache durations based on file type
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    // Images are highly cacheable with strong validation
    res.setHeader('Cache-Control', `public, max-age=${longPeriod}, stale-while-revalidate=${mediumPeriod}`);
  } else if (req.path.match(/\.(css|js)$/i)) {
    // CSS and JS with a medium cache duration
    res.setHeader('Cache-Control', `public, max-age=${mediumPeriod}, stale-while-revalidate=${shortPeriod}`);
  } else if (req.path.match(/\.(woff|woff2|ttf|eot)$/i)) {
    // Fonts with a long cache duration
    res.setHeader('Cache-Control', `public, max-age=${longPeriod}, stale-while-revalidate=${mediumPeriod}`);
  } else {
    // Other assets with a short cache duration
    res.setHeader('Cache-Control', `public, max-age=${shortPeriod}, stale-while-revalidate=3600`);
  }
  next();
};

app.use(setCache);

// Serve static files with improved configuration
app.use(express.static(path.join(__dirname), {
  etag: true, // Enable ETags for caching
  lastModified: true, // Use Last-Modified header
  maxAge: '1d' // Default cache age of 1 day
}));

// Clean URLs middleware
app.use((req, res, next) => {
  if (req.path.endsWith('/')) {
    // Remove trailing slash
    return res.redirect(301, req.path.slice(0, -1));
  }
  
  if (!req.path.includes('.')) {
    // Check if HTML file exists
    const filePath = path.join(__dirname, `${req.path}.html`);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  
  next();
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});