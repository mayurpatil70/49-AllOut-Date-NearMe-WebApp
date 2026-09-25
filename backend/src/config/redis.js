const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
  pingInterval: 10000,
  socket: {
    keepAlive: 10000,
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error("Redis max retries reached");
      return Math.min(retries * 50, 2000);
    },
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("ready", () => console.log("Redis connected successfully"));

// Initialize the connection right here
redisClient.connect().catch(console.error);

module.exports = redisClient;
