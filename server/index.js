const path = require("path");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { initializeSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Home route
app.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, "../public/index.html"));
});

initializeSocket(io);

server.listen(port, function () {
    console.log(`Server running on http://localhost:${port}`);
});