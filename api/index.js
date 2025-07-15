// api/index.js
const serverless = require('serverless-http');
const app = require('../app'); // assuming app.js is in root

module.exports = serverless(app);
