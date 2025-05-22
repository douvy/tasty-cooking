const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression for all responses
app.use(compression());

// Set cache headers for static assets
const setCache = function(req, res, next) {
  // Skip caching for HTML files
  if (req.path.endsWith('.html') || !req.path.includes('.')) {
    res.setHeader('Cache-Control', 'no-cache');
    return next();
  }
  
  // Cache static assets for 1 week (604800 seconds)
  const period = 60 * 60 * 24 * 7; // 7 days
  
  // Use different cache durations based on file type
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    res.setHeader('Cache-Control', `public, max-age=${period}`);
  } else if (req.path.match(/\.(css|js)$/i)) {
    res.setHeader('Cache-Control', `public, max-age=${period}`);
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for other files
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