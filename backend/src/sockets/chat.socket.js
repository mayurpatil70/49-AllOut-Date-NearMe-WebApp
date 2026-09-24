const ChatAccess = require('../models/ChatAccess');

module.exports = (io) => {
    io.on('connection', (socket) => {
        
        socket.on('join', (userId) => {
            socket.join(userId);
        });

        socket.on('send_message', async ({ senderId, receiverId, message }) => {
            try {
                // 1. Verify Sender has paid for access to Receiver
                const access = await ChatAccess.findOne({ 
                    user: senderId, 
                    targetUser: receiverId 
                });

                if (!access || access.validUntil < new Date()) {
                    return socket.emit('chat_error', { 
                        message: 'Chat access expired or locked. Please spend 1 coin to unlock for 15 days.' 
                    });
                }

                // 2. Deliver message
                const receiverSockets = await io.in(receiverId).fetchSockets();
                
                if (receiverSockets.length > 0) {
                    io.to(receiverId).emit('receive_message', { senderId, message, timestamp: new Date() });
                } else {
                    // Fallback to FCM Push Notification if receiver is offline
                    // require('firebase-admin').messaging().send(...)
                }

            } catch (err) {
                console.error("Socket send error:", err);
            }
        });
    });
};