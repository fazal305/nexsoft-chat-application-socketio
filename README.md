# Nexsoft Chat Application Socket.IO

A real-time chat application built with Node.js, Express, Socket.IO, and Firebase Firestore.

This project demonstrates private messaging, group rooms, online presence, typing indicators, message delivery state, and persistent chat history in a clean responsive interface.

## Live Demo

https://nexsoft-chat-application-socketio.onrender.com/

## Repository

https://github.com/fazal305/nexsoft-chat-application-socketio

## Features

- Real-time messaging with Socket.IO
- Private one-to-one conversations
- Group chat rooms with live room member counts
- Online and offline presence indicators
- Typing indicators for private and group chats
- Firestore-backed message history
- Stable chat IDs for private and room conversations
- Sent and delivered message status updates
- Responsive sidebar layout for desktop and mobile
- Test-user login flow for quick internship/demo review

## Tech Stack

Frontend:

- HTML5
- CSS3
- Vanilla JavaScript
- Socket.IO client

Backend:

- Node.js
- Express.js
- Socket.IO
- Firebase Admin SDK
- Firebase Firestore

## Project Structure

```text
chat-app/
|-- package.json
|-- package-lock.json
|-- README.md
|-- LICENSE
|-- .gitignore
|-- firebase-service-account.json
|-- server/
|   |-- index.js
|   |-- socket.js
|   `-- db.js
`-- public/
    |-- index.html
    |-- styles.css
    `-- script.js
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## Firebase Setup

The app supports Firebase credentials in two ways.

For local development, place a service account file at:

```text
firebase-service-account.json
```

For deployment, use environment variables:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

If `FIREBASE_PRIVATE_KEY` contains escaped newlines, the server converts them automatically.

## Firestore Index

Create this composite index for the `messages` collection:

```text
chatId      Ascending
timestamp   Descending
```

## Scripts

```bash
npm start
```

Runs the production server with `node server/index.js`.

```bash
npm run dev
```

Runs the development server with `nodemon server/index.js`.

## What I Practiced

- Managing Socket.IO events for private and room-based chat
- Tracking active users and room membership on the server
- Persisting messages with Firestore
- Loading chat history by stable conversation IDs
- Building responsive chat UI states with plain JavaScript
- Handling typing indicators, unread counts, and delivery status

## Author

Fazal Abbas

- GitHub: https://github.com/fazal305
- LinkedIn: https://www.linkedin.com/in/fazal-abbas-4653dg86

## License

This project is licensed under the MIT License.
