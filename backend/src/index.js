const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const { redisClient, connectRedis } = require('./config/redis');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Initialize Socket.io with Redis for cluster scaling
const io = new Server(server, { cors: { origin: '*' } });
const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
});

// Pass io instance to socket handlers
require('./sockets/chat.socket')(io);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/chat', require('./routes/chat.routes'));

// Database & Server Initialization
const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();
        
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();