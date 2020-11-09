module.exports = {
  apps: [
    {
      name: "360check",
      script: "server.js",
      watch: true,
      instances: 2,
      env: {
        PORT: 1337,
        NODE_ENV: "production",
      },
    },
  ],
};
