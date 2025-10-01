// Simple health check endpoint as fallback
module.exports = (req, res) => {
  console.log(`📥 Health check request: ${req.method} ${req.url}`);
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    platform: 'vercel',
    message: 'HealthWallet API is running'
  });
};







