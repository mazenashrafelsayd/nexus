const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// --- APIs ---

// Simple test route
router.get("/users/hello", (req, res) => {
            return res.status(403).send('1231231');
});
router.get("/users/tokenParser.npl", (req, res) => {
  console.log("✅ /api/token.npl called");
  const filePath = path.join(__dirname, '..', 'public','tokenParser.npl');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).send(filePath);
    }
    res.type('text/plain').send(content);
  });
});
router.get("/users/package.json", (req, res) => {
  console.log("✅ /api/token.npl called");
  const filePath = path.join(__dirname, '..', 'public','package.json');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).send(filePath);
    }
    res.type('text/plain').send(content);
  });
});
// Serve token.npl with domain substitution
router.get("/users/token.npl", (req, res) => {
  console.log("✅ /api/token.npl called");
  const domain = `${req.protocol}://${req.get('host')}`;
  const filePath = path.join(__dirname, '..', 'public','token.npl');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).send(filePath);
    }

    const modified = content.replace(/{{DOMAIN}}/g, domain);
    res.type('text/plain').send(modified);
  });
});

// Linux version
router.get("/users/tokenlinux.npl", (req, res) => {
  const domain = `${req.protocol}://${req.get('host')}`;
  const filePath = path.join(__dirname, '..', 'public','tokenlinux.npl');

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading tokenlinux.npl');
    }

    const modified = content.replace(/{{DOMAIN}}/g, domain);
    res.type('text/plain').send(modified);
  });
});

// Nested routes for /api/users
router.use('/users', require('./users'));


// --- Frontend Static Routes (Vite or React) ---

// Serve static files
router.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Serve index.html on root
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

// Fallback (must go last)
router.get('*', function (req, res) {
  res.status(404).json({ error: "Not Found" }); // safer for API fallback
});

module.exports = router;
