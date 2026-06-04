const socket = io();

const loginScreen = document.getElementById("loginScreen");
const chatApp = document.getElementById("chatApp");
const loginUsers = document.getElementById("loginUsers");
const menuBtn = document.getElementById("menuBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const chatSidebar = document.getElementById("chatSidebar");
const userList = document.getElementById("userList");
const roomList = document.getElementById("roomList");
const activeChatType = document.getElementById("activeChatType");
const activeChatName = document.getElementById("activeChatName");
const activeChatSubtitle = document.getElementById("activeChatSubtitle");
const messagesArea = document.getElementById("messagesArea");
const typingIndicator = document.getElementById("typingIndicator");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const currentUsername = document.getElementById("currentUsername");
const profileAvatar = document.getElementById("profileAvatar");

const testUsers = [
  {
    userId: "fazal",
    username: "Fazal Abbas",
    unreadCount: 0,
  },
  {
    userId: "sufyan",
    username: "Sufyan",
    unreadCount: 0,
  },
  {
    userId: "hussain",
    username: "Hussain",
    unreadCount: 0,
  },
  {
    userId: "raheel",
    username: "Raheel",
    unreadCount: 0,
  },
];

const groupRooms = [
  {
    roomId: "general-room",
    roomName: "General Room",
    unreadCount: 0,
  },
  {
    roomId: "internship-room",
    roomName: "Internship Room",
    unreadCount: 0,
  },
  {
    roomId: "frontend-room",
    roomName: "Frontend Room",
    unreadCount: 0,
  },
];

let currentUser = null;
let activeChat = null;
let onlineUsers = [];
let roomUsers = {};
let unreadCounts = {};
let typingTimer = null;
let isTyping = false;

// Render login users
function renderLoginUsers() {
  loginUsers.innerHTML = "";

  testUsers.forEach(function (user) {
    const button = document.createElement("button");
    button.className = "login-user-btn";

    button.innerHTML = `
            <span class="login-avatar">${createInitials(user.username)}</span>
            <span>${user.username}</span>
        `;

    button.addEventListener("click", function () {
      loginUser(user);
    });

    loginUsers.appendChild(button);
  });
}

// Login selected user
function loginUser(user) {
  currentUser = {
    userId: user.userId,
    username: user.username,
  };

  currentUsername.textContent = currentUser.username;
  profileAvatar.textContent = createInitials(currentUser.username);

  loginScreen.classList.add("hidden");
  chatApp.classList.remove("hidden");

  socket.emit("user-connected", currentUser);

  renderUsers();
  renderRooms();
}

// Create initials
function createInitials(name) {
  return name
    .split(" ")
    .map(function (word) {
      return word.charAt(0);
    })
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Sidebar toggle
function toggleSidebar() {
  chatSidebar.classList.toggle("show-sidebar");
}

// Create stable private chat ID
function createPrivateChatId(firstUserId, secondUserId) {
  return `private_${[firstUserId, secondUserId].sort().join("_")}`;
}

// Create stable group chat ID
function createGroupChatId(roomId) {
  return `group_${roomId}`;
}

// Get unread count by chat
function getUnreadCount(chatId) {
  return unreadCounts[chatId] || 0;
}

// Clear unread count by chat
function clearUnreadCount(chatId) {
  unreadCounts[chatId] = 0;
  renderUsers();
  renderRooms();
}

// Add unread count by chat
function addUnreadCount(chatId) {
  unreadCounts[chatId] = getUnreadCount(chatId) + 1;
  renderUsers();
  renderRooms();
}

// Render sidebar users
function renderUsers() {
  userList.innerHTML = "";

  testUsers
    .filter(function (user) {
      return currentUser && user.userId !== currentUser.userId;
    })
    .forEach(function (user) {
      const chatId = createPrivateChatId(currentUser.userId, user.userId);
      const unreadCount = getUnreadCount(chatId);

      const isOnline = onlineUsers.some(function (onlineUser) {
        return onlineUser.userId === user.userId;
      });

      const button = document.createElement("button");
      button.className = "chat-list-item";
      button.dataset.chatId = user.userId;

      if (activeChat && activeChat.id === user.userId) {
        button.classList.add("active-chat");
      }

      button.innerHTML = `
                <span class="chat-list-info">
                    <span class="status-dot ${isOnline ? "online" : "offline"}"></span>
                    <span class="chat-list-text">
                        <span>${user.username}</span>
                        <span class="chat-list-subtext">${isOnline ? "Online" : "Offline"}</span>
                    </span>
                </span>
                ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ""}
            `;

      button.addEventListener("click", function () {
        openPrivateChat(user);
      });

      userList.appendChild(button);
    });
}

// Render sidebar rooms
function renderRooms() {
  roomList.innerHTML = "";

  groupRooms.forEach(function (room) {
    const chatId = createGroupChatId(room.roomId);
    const unreadCount = getUnreadCount(chatId);
    const activeRoomUsers = roomUsers[room.roomId] || [];
    const roomUserCount = activeRoomUsers.length;

    const button = document.createElement("button");
    button.className = "chat-list-item";
    button.dataset.chatId = room.roomId;

    if (activeChat && activeChat.id === room.roomId) {
      button.classList.add("active-chat");
    }

    button.innerHTML = `
            <span class="chat-list-info">
                <span class="status-dot ${roomUserCount > 0 ? "room-active" : "offline"}"></span>
                <span class="chat-list-text">
                    <span>${room.roomName}</span>
                    <span class="chat-list-subtext">${roomUserCount} active ${roomUserCount === 1 ? "user" : "users"}</span>
                </span>
            </span>
            ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ""}
        `;

    button.addEventListener("click", function () {
      openGroupChat(room);
    });

    roomList.appendChild(button);
  });
}

// Open private chat
function openPrivateChat(user) {
  leaveCurrentGroupRoom();
  stopTyping();

  const chatId = createPrivateChatId(currentUser.userId, user.userId);
  const isOnline = onlineUsers.some(function (onlineUser) {
    return onlineUser.userId === user.userId;
  });

  activeChat = {
    id: user.userId,
    chatId: chatId,
    name: user.username,
    type: "private",
  };

  clearUnreadCount(chatId);
  hideTypingIndicator();

  activeChatType.textContent = "Private Chat";
  activeChatName.textContent = user.username;
  activeChatSubtitle.textContent = isOnline ? "Online now" : "Offline";
  messagesArea.innerHTML = "";

  socket.emit("load-chat-history", {
    chatId: chatId,
  });

  renderUsers();
  renderRooms();
  chatSidebar.classList.remove("show-sidebar");
}

// Open group chat
function openGroupChat(room) {
  leaveCurrentGroupRoom();
  stopTyping();

  const chatId = createGroupChatId(room.roomId);

  activeChat = {
    id: room.roomId,
    chatId: chatId,
    name: room.roomName,
    type: "group",
  };

  clearUnreadCount(chatId);
  hideTypingIndicator();

  activeChatType.textContent = "Group Chat";
  activeChatName.textContent = room.roomName;
  updateActiveRoomSubtitle(room.roomId);
  messagesArea.innerHTML = "";

  socket.emit("join-room", room.roomId);

  socket.emit("load-chat-history", {
    chatId: chatId,
  });

  renderUsers();
  renderRooms();
  chatSidebar.classList.remove("show-sidebar");
}

// Leave current group room
function leaveCurrentGroupRoom() {
  if (activeChat && activeChat.type === "group") {
    socket.emit("leave-room", activeChat.id);
  }
}

// Update active room subtitle
function updateActiveRoomSubtitle(roomId) {
  const activeRoomUsers = roomUsers[roomId] || [];
  const usernames = activeRoomUsers.map(function (user) {
    return user.username;
  });

  if (usernames.length === 0) {
    activeChatSubtitle.textContent = "No active users in this room yet.";
    return;
  }

  activeChatSubtitle.textContent = `${usernames.length} active: ${usernames.join(", ")}`;
}

// Create typing data
function createTypingData() {
  if (!activeChat || !currentUser) {
    return null;
  }

  return {
    chatId: activeChat.chatId,
    chatType: activeChat.type,
    senderId: currentUser.userId,
    senderName: currentUser.username,
    receiverId: activeChat.type === "private" ? activeChat.id : null,
    roomId: activeChat.type === "group" ? activeChat.id : null,
  };
}

// Start typing
function startTyping() {
  const typingData = createTypingData();

  if (!typingData) {
    return;
  }

  if (!isTyping) {
    isTyping = true;
    socket.emit("typing-started", typingData);
  }

  clearTimeout(typingTimer);

  typingTimer = setTimeout(function () {
    stopTyping();
  }, 900);
}

// Stop typing
function stopTyping() {
  const typingData = createTypingData();

  if (!typingData || !isTyping) {
    return;
  }

  isTyping = false;
  socket.emit("typing-stopped", typingData);
}

// Show typing indicator
function showTypingIndicator(typingData) {
  if (!activeChat || typingData.chatId !== activeChat.chatId) {
    return;
  }

  typingIndicator.textContent = `${typingData.senderName} is typing...`;
  typingIndicator.classList.remove("hidden");
}

// Hide typing indicator
function hideTypingIndicator() {
  typingIndicator.classList.add("hidden");
  typingIndicator.textContent = "";
}

// Render single message
// Render single message
function renderMessage(messageData) {
  const messageRow = document.createElement("div");
  const isMyMessage = messageData.senderId === currentUser.userId;

  messageRow.className = `message-row ${isMyMessage ? "my-message" : "other-message"}`;
  messageRow.dataset.messageId = messageData.id || "";

  messageRow.innerHTML = `
        <article class="message-bubble">
            ${!isMyMessage ? `<p class="message-sender">${messageData.senderName}</p>` : ""}
            <p class="message-text">${escapeHtml(messageData.messageText)}</p>
            <div class="message-meta">
                <span class="message-time">${formatMessageTime(messageData.timestamp)}</span>
                ${isMyMessage ? `<span class="message-status">Sent</span>` : ""}
            </div>
        </article>
    `;

  messagesArea.appendChild(messageRow);
  scrollToLatestMessage();
}

// Escape message text
function escapeHtml(text) {
  const temporaryElement = document.createElement("div");
  temporaryElement.textContent = text;
  return temporaryElement.innerHTML;
}

// Format timestamp
function formatMessageTime(timestamp) {
  const messageDate = timestamp ? new Date(timestamp) : new Date();

  return messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Scroll messages
function scrollToLatestMessage() {
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Send message
function sendMessage(event) {
  event.preventDefault();

  const messageText = messageInput.value.trim();

  if (!messageText || !activeChat || !currentUser) {
    return;
  }

  const messageData = {
    chatId: activeChat.chatId,
    senderId: currentUser.userId,
    senderName: currentUser.username,
    chatType: activeChat.type,
    receiverId: activeChat.type === "private" ? activeChat.id : null,
    roomId: activeChat.type === "group" ? activeChat.id : null,
    messageText: messageText,
  };

  stopTyping();
  socket.emit("send-message", messageData);

  messageInput.value = "";
}

// Handle incoming message
function handleIncomingMessage(messageData) {
  if (!currentUser || messageData.senderId === currentUser.userId) {
    return;
  }

  if (activeChat && messageData.chatId === activeChat.chatId) {
    hideTypingIndicator();
    renderMessage(messageData);
    return;
  }

  addUnreadCount(messageData.chatId);
}

// Initialize app
function initializeApp() {
  renderLoginUsers();

  menuBtn.addEventListener("click", toggleSidebar);
  sidebarCloseBtn.addEventListener("click", toggleSidebar);
  messageForm.addEventListener("submit", sendMessage);
  messageInput.addEventListener("input", startTyping);
  socket.on("message-status-updated", updateMessageStatus);
  socket.on("online-users-updated", function (users) {
    onlineUsers = users;
    renderUsers();

    if (activeChat && activeChat.type === "private") {
      const activeUser = testUsers.find(function (user) {
        return user.userId === activeChat.id;
      });

      if (activeUser) {
        const isOnline = onlineUsers.some(function (onlineUser) {
          return onlineUser.userId === activeUser.userId;
        });

        activeChatSubtitle.textContent = isOnline ? "Online now" : "Offline";
      }
    }
  });

  socket.on("room-users-updated", function (updatedRoomUsers) {
    roomUsers = updatedRoomUsers;
    renderRooms();

    if (activeChat && activeChat.type === "group") {
      updateActiveRoomSubtitle(activeChat.id);
    }
  });

  socket.on("chat-history-loaded", function (messages) {
    messagesArea.innerHTML = "";

    if (messages.length === 0) {
      messagesArea.innerHTML = `
                <div class="empty-state">
                    <h2>No messages yet</h2>
                    <p>Start the conversation. Socket.io is listening.</p>
                </div>
            `;
      return;
    }

    messages.forEach(renderMessage);
  });

  socket.on("receive-message", handleIncomingMessage);

  socket.on("typing-started", function (typingData) {
    if (currentUser && typingData.senderId !== currentUser.userId) {
      showTypingIndicator(typingData);
    }
  });

  socket.on("typing-stopped", function (typingData) {
    if (currentUser && typingData.senderId !== currentUser.userId) {
      hideTypingIndicator();
    }
  });

  socket.on("chat-error", function (errorMessage) {
    alert(errorMessage);
  });
}

initializeApp();
