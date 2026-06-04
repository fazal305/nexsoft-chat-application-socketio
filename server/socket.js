const { saveMessage, loadChatHistory } = require("./db");

const activeUsers = new Map();
const roomUsers = new Map();

// Socket events
function initializeSocket(io) {
    io.on("connection", function (socket) {
        console.log("User connected:", socket.id);

        socket.on("user-connected", function (userData) {
            const connectedUser = {
                socketId: socket.id,
                userId: userData.userId,
                username: userData.username
            };

            socket.userId = userData.userId;
            socket.username = userData.username;

            activeUsers.set(userData.userId, connectedUser);

            io.emit("online-users-updated", Array.from(activeUsers.values()));
            io.emit("room-users-updated", getRoomUsersSummary());
        });

        socket.on("join-room", function (roomId) {
            socket.join(roomId);

            if (!roomUsers.has(roomId)) {
                roomUsers.set(roomId, new Map());
            }

            roomUsers.get(roomId).set(socket.userId, {
                userId: socket.userId,
                username: socket.username
            });

            io.emit("room-users-updated", getRoomUsersSummary());
        });

        socket.on("leave-room", function (roomId) {
            socket.leave(roomId);
            removeUserFromRoom(roomId, socket.userId);

            io.emit("room-users-updated", getRoomUsersSummary());
        });

        socket.on("typing-started", function (typingData) {
            if (typingData.chatType === "private") {
                const receiverUser = activeUsers.get(typingData.receiverId);

                if (receiverUser) {
                    io.to(receiverUser.socketId).emit("typing-started", typingData);
                }
            }

            if (typingData.chatType === "group") {
                socket.to(typingData.roomId).emit("typing-started", typingData);
            }
        });

        socket.on("typing-stopped", function (typingData) {
            if (typingData.chatType === "private") {
                const receiverUser = activeUsers.get(typingData.receiverId);

                if (receiverUser) {
                    io.to(receiverUser.socketId).emit("typing-stopped", typingData);
                }
            }

            if (typingData.chatType === "group") {
                socket.to(typingData.roomId).emit("typing-stopped", typingData);
            }
        });

        socket.on("load-chat-history", async function (chatData) {
            try {
                const messages = await loadChatHistory(chatData);
                socket.emit("chat-history-loaded", messages);
            } catch (error) {
                console.error("History loading error:", error.message);
                socket.emit("chat-error", "Could not load chat history.");
            }
        });

        socket.on("send-message", async function (messageData) {
            try {
                const savedMessage = await saveMessage(messageData);

                socket.emit("message-status-updated", {
                    messageId: savedMessage.id,
                    status: "Sent"
                });

                if (savedMessage.chatType === "private") {
                    const receiverUser = activeUsers.get(savedMessage.receiverId);

                    socket.emit("receive-message", savedMessage);

                    if (receiverUser) {
                        io.to(receiverUser.socketId).emit("receive-message", savedMessage);

                        socket.emit("message-status-updated", {
                            messageId: savedMessage.id,
                            status: "Delivered"
                        });
                    }
                }

                if (savedMessage.chatType === "group") {
                    io.to(savedMessage.roomId).emit("receive-message", savedMessage);

                    socket.emit("message-status-updated", {
                        messageId: savedMessage.id,
                        status: "Delivered"
                    });
                }
            } catch (error) {
                console.error("Message saving error:", error.message);
                socket.emit("chat-error", "Message could not be sent.");
            }
        });

        socket.on("disconnect", function () {
            if (socket.userId) {
                activeUsers.delete(socket.userId);
                removeUserFromAllRooms(socket.userId);
            }

            io.emit("online-users-updated", Array.from(activeUsers.values()));
            io.emit("room-users-updated", getRoomUsersSummary());

            console.log("User disconnected:", socket.id);
        });
    });
}

// Remove user from one room
function removeUserFromRoom(roomId, userId) {
    if (!roomUsers.has(roomId)) {
        return;
    }

    roomUsers.get(roomId).delete(userId);

    if (roomUsers.get(roomId).size === 0) {
        roomUsers.delete(roomId);
    }
}

// Remove user from all rooms
function removeUserFromAllRooms(userId) {
    roomUsers.forEach(function (users, roomId) {
        users.delete(userId);

        if (users.size === 0) {
            roomUsers.delete(roomId);
        }
    });
}

// Create room users summary
function getRoomUsersSummary() {
    const summary = {};

    roomUsers.forEach(function (users, roomId) {
        summary[roomId] = Array.from(users.values());
    });

    return summary;
}

module.exports = {
    initializeSocket
};