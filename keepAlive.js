const https = require('https');

const RENDER_URL = 'https://moderate-textile.onrender.com';

function keepAlive() {
  const options = {
    hostname: 'moderate-textile.onrender.com',
    port: 443,
    path: '/api/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`Keep-alive ping: ${res.statusCode} at ${new Date().toISOString()}`);
  });

  req.on('error', (error) => {
    console.error('Keep-alive error:', error.message);
  });

  req.end();
}

// Ping every 14 minutes (840 seconds)
setInterval(keepAlive, 14 * 60 * 1000);

console.log('Keep-alive service started - pinging every 14 minutes');

module.exports = keepAlive;