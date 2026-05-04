// Single Vercel serverless function that hands requests to the Express app
// in ../server.js. vercel.json rewrites /api/<anything> to /api/index?_path=<anything>;
// we restore req.url from _path so Express's existing routes match unchanged.

const app = require('../server.js');

module.exports = (req, res) => {
  const path = (req.query && req.query._path) || '';
  if (path) {
    // Rebuild req.url with the original /api/<path> plus any other query params.
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query || {})) {
      if (k === '_path') continue;
      if (Array.isArray(v)) v.forEach((vi) => params.append(k, vi));
      else if (v != null) params.append(k, String(v));
    }
    const qs = params.toString();
    req.url = '/api/' + path + (qs ? '?' + qs : '');
  }
  return app(req, res);
};
