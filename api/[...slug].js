// Vercel catch-all serverless function. All /api/* requests land here.
// We hand them to the Express app defined in ../server.js which already
// has every route wired up.
module.exports = require('../server.js');
