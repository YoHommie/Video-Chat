
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import axios from "axios";
import config from '../config.json';



const DSS_URL = config.DSS_URL || "http://localhost:3000";
const URL = config.URL || "http://localhost:8000";

const Container = styled.div`
    display: grid;
    gap: 10px;
    padding: 20px;
    height: 100vh;
    width: 90%;
    margin: auto;
    align-content: center;
    justify-content: center;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-template-rows: auto;
`;

const StyledVideo = styled.video`
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
`;

const UserDataOverlay = styled.div`
    position: absolute;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 2px 5px;
    border-radius: 5px;
    font-size: 12px;
`;

const Video = ({ peer, username }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, [peer]);

    return (
        <div style={{ position: "relative" }}>
            <StyledVideo playsInline autoPlay ref={ref} />
            <UserDataOverlay>{username}</UserDataOverlay>
        </div>
    );
};

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
`;

const Form = styled.form`
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    width: 300px;
`;

const Label = styled.label`
    margin-bottom: 10px;
    font-weight: bold;
`;

const Input = styled.input`
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
`;

const Select = styled.select`
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
`;

const Button = styled.button`
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

const ButtonDisonnect = styled.button`
    padding: 10px;
    border: none;
    border-radius: 5px;
    background: #red;
    color: white;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

const ButtonContainer = styled.div`
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    gap: 10px;
`;

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const userStream = useRef();
    const peersRef = useRef([]);
    const [meetingID, setMeetingID] = useState("");
    const [offer, setOffer] = useState('');
    const [clientID, setClientID] = useState('');
    const [validCheck, setValidCheck] = useState(false);
    const [checked, setChecked] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState('');
    const [role, setRole] = useState('host');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);

    useEffect(() => {
        const clientID = localStorage.getItem('clientID');
        clientID && setClientID(clientID);
        const username = localStorage.getItem('username');
        username && setUsername(username);
        if (checked) {
            socketRef.current = io.connect(URL);
            navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
                userStream.current = stream;
                userVideo.current.srcObject = stream;
                socketRef.current.emit("join room", meetingID);
                socketRef.current.on("all users", users => {
                    const peers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        });
                        peers.push(peer);
                    });
                    setPeers(peers);
                });

                socketRef.current.on("user joined", payload => {
                    const peer = addPeer(payload.signal, payload.callerID, stream);
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    });

                    setPeers(users => [...users, peer]);
                });

                socketRef.current.on("receiving returned signal", payload => {
                    const item = peersRef.current.find(p => p.peerID === payload.id);
                    item.peer.signal(payload.signal);
                });
            });
        }
    }, [checked, meetingID]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        });

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    const handleSubmitform = async (e) => {
        e.preventDefault();
        try {
            if (role === 'host') {
                let response= await axios.post(`${DSS_URL}/nl/verifyParticipant`, { meetingID: meetingID, clientID: clientID, offerID: offer, participant: username, type: 'host' });
                if (response.data.verified) {
                // if (true) {
                    setValidCheck(true);
                    setChecked(true);
                } else {
                    alert("Invalid offer");
                }
            } else {
                let response= await axios.post(`${DSS_URL}/nl/verifyParticipant`, { meetingID: meetingID, offerID: offer, participant: username, type: 'participant' });
                if (response.data.verified) {
                // if (true) {
                    setValidCheck(true);
                    setChecked(true);
                } else {
                    alert("Invalid offer");
                }
            }
        } catch {
            console.log("error")
        }
    }

    function toggleVideo() {
        setVideoEnabled(!videoEnabled);
        userStream.current.getVideoTracks()[0].enabled = !videoEnabled;
    }

    function toggleAudio() {
        setAudioEnabled(!audioEnabled);
        userStream.current.getAudioTracks()[0].enabled = !audioEnabled;
    }

    function handleLeaveMeeting() {
        //disconneting with the socket
        socketRef.current.emit("disconnect");
        window.location.href = "/";
    }

    return (
        <>
            {validCheck ? (
                <Container
                    style={{
                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(peers.length + 1))}, 1fr)`,
                        gridTemplateRows: `repeat(${Math.ceil((peers.length + 1) / Math.ceil(Math.sqrt(peers.length + 1)))}, 1fr)`
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <StyledVideo muted ref={userVideo} autoPlay playsInline />
                        <UserDataOverlay>{username}</UserDataOverlay>
                    </div>
                    {peers.map((peer, index) => (
                        <Video key={index} peer={peer} username={peer.peerID} />
                    ))}
                    <ButtonContainer>
                        <Button onClick={toggleVideo}>
                            {videoEnabled ? "Turn Off Video" : "Turn On Video"}
                        </Button>
                        <Button onClick={toggleAudio}>
                            {audioEnabled ? "Turn Off Audio" : "Turn On Audio"}
                        </Button>
                        <ButtonDisonnect className="disconnect" onClick={handleLeaveMeeting}>Leave Meeting</ButtonDisonnect>
                    </ButtonContainer>
                </Container>
            ) : (
                <FormContainer>
                    <Form onSubmit={handleSubmitform}>
                        <label>Meeting ID:</label>
                        <input
                            type="text"
                            value={meetingID}
                            onChange={(e) => setMeetingID(e.target.value)}
                        />
                        <Label>Role:</Label>
                        <Select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="host">Host</option>
                            <option value="participant">Participant</option>
                        </Select>

                        {role === 'host' && (
                            <>
                                <Label>Username:</Label>
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />

                                <Label>Password:</Label>
                                <Input
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </>
                        )}

                        {role === 'participant' && (
                            <>
                                <Label>Username:</Label>
                                <Input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />

                                <Label>Date of Birth:</Label>
                                <Input
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </>
                        )}

                        <Label>Offer:</Label>
                        <Input
                            type="text"
                            value={offer}
                            onChange={(e) => setOffer(e.target.value)}
                        />

                        <Button type="submit" >Submit</Button>
                    </Form>
                </FormContainer>
            )}
        </>
    );
};

export default Room;



