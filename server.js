require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const { v4: uuid } = require('uuid');

app.use(express.json());
app.use(express.static(__dirname + '/client/build'));

// using cors to allow cross-origin requests
const cors = require('cors');
app.use(cors());


// app.get('/createRoom', (req, res) => {
//     const roomID = uuid();
//     const offer = Math.floor(1000 + Math.random() * 9000);
//     res.send({ roomID, offer });
// });

app.get('/room/:roomID', (req, res) => {
    res.send({ roomID: req.params.roomID });
});


const users = {};

const socketToRoom = {};

io.on('connection', socket => {
    // Add a socket event listener for creating a room
    socket.on('createRoom', () => {
        const roomID = uuid();
        const offer = Math.floor(1000 + Math.random() * 9000);
        socket.emit('room created', { roomID, offer });
    });

    socket.on("join room", roomID => {
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

});

server.listen(process.env.PORT || 3000, () => console.log('server is running on port 3000'));

// check


