# Nexsoft Chat Application (Socket.io)

A real-time chat application built with Node.js, Express.js, Socket.io, and Firebase Firestore.

This project was developed as part of a Frontend Development Internship task and demonstrates real-time communication, private messaging, group chat functionality, online user tracking, and persistent chat history.

---

## Live Demo

https://nexsoft-chat-application-socketio.onrender.com/

```text
https://your-render-url.onrender.com
```

---

## GitHub Repository

```text
https://github.com/fazal305/nexsoft-chat-application-socketio
```

---

## Features

### Real-Time Messaging

- Instant message delivery using Socket.io
- No page refresh required
- Real-time communication between connected users

### Private Chat

- One-to-one conversations
- Stable private chat IDs
- Persistent chat history

### Group Chat

- Multiple chat rooms
- Room join and leave functionality
- Active room member tracking

### User Presence

- Online status indicator
- Offline status indicator
- Live updates on connect/disconnect

### Chat History

- Stored in Firebase Firestore
- Loads previous messages automatically
- Messages remain after refresh

### Typing Indicators

- Shows when another user is typing
- Works in private chats and group chats

### Delivery Status

- Sent
- Delivered

### Responsive Design

- Mobile-friendly layout
- Sidebar collapse on smaller screens
- Desktop and mobile support

---

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Backend

- Node.js
- Express.js
- Socket.io

### Database

- Firebase Firestore
- Firebase Admin SDK

---

## Project Structure

```text
chat-app/
│
├── firebase-service-account.json
├── package.json
├── README.md
├── LICENSE
├── .gitignore
│
├── server/
│   ├── index.js
│   ├── socket.js
│   └── db.js
│
└── public/
    ├── index.html
    ├── styles.css
    └── script.js
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/fazal305/nexsoft-chat-application-socketio.git
```

### Open Project

```bash
cd nexsoft-chat-application-socketio
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Open Browser

```text
http://localhost:3000
```

---

## Firebase Setup

### Create Firebase Project

1. Open Firebase Console
2. Create a project
3. Enable Firestore Database
4. Create required Firestore index

### Download Service Account

Project Settings

→ Service Accounts

→ Generate New Private Key

Place downloaded file here:

```text
firebase-service-account.json
```

---

## Firestore Index

Collection:

```text
messages
```

Fields:

```text
chatId      Ascending
timestamp   Descending
```

---

## Future Improvements

- Read receipts
- User authentication
- User profile pictures
- Message search
- File sharing
- Voice messages
- Push notifications

---

## Author

### Fazal Abbas

GitHub

```text
https://github.com/fazal305
```

LinkedIn

```text
https://www.linkedin.com/in/fazal-abbas-4653dg86
```

---

## Internship Project

Developed for internship learning and portfolio purposes.