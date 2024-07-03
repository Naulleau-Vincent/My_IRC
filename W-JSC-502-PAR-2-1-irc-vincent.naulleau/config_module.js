const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
const host = 'localhost';
const port = 4242;

module.exports={
    express,
    app,
    http,
    server,
    io,
    port,
    host,
    cors,
}