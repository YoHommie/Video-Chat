require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const { v4: uuid } = require('uuid');
const axios = require('axios');

const DSS_URL = process.env.DSS_URL || 'http://localhost:3000';

app.use(express.json());
app.use(express.static(__dirname + './../client/build'));

// using cors to allow cross-origin requests
const cors = require('cors');
app.use(cors());


app.post('/createRoom', async (req, res) => {
    const roomID = uuid();
    const clientID = req.body.client_id;
    let ParticipantNumber = req.body.participant.length;
    let offerlist = [];
    for (let i = 0; i < ParticipantNumber; i++) {
        offerlist.push(Math.floor(1000 + Math.random() * 9000));
    }
    console.log("offerlist", offerlist);
    if (clientID === null || clientID === undefined) {
        res.status(400).send("client_id is required");
    }
    try{
        let response = await axios.post(`${DSS_URL}/api/meeting/addMeeting`, { meetingID: roomID, numberOfParticipants: ParticipantNumber, clientID: clientID, typeList: typeList, participants: participants, offerid: offeridList });
        console.log(response.data);
        res.status(200).send({ roomID, offerlist });
    }
    catch(err){
        console.log(err);
    }
});




const users = {};

const socketToRoom = {};

io.on('connection', socket => {
    // Add a socket event listener for creating a room
    // socket.on('createRoom', () => {
    //     const roomID = uuid();
    //     const offer = Math.floor(1000 + Math.random() * 9000);
    //     socket.emit('room created', { roomID, offer });
    // });

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

let port = process.env.PORT || 8000;

server.listen(port, () => console.log(`server is running on port ${port}`));




