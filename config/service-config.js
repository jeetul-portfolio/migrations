module.exports = {
  port: process.env.PORT || 3000,
  serviceName: process.env.SERVICE_NAME || 'migrations',
  logging : {
    isPretty: false, // Set to true for pretty JSON output in logs
  },
};