import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, [props.peer]);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const userStream = useRef(); // Store the user's stream
    const [url, setUrl] = useState(window.location.href);
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const [realOffer, setRealOffer] = useState('');
    const [offer, setOffer] = useState('');
    const [validCheck, setValidCheck] = useState(false);
    const [checked, setChecked] = useState(false); // State flag to control useEffect
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hostUsername, setHostUsername] = useState('');
    const [dob, setDob] = useState('');
    const [role, setRole] = useState('host');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);

    useEffect(() => {
        const offer = localStorage.getItem('offer')
        setRealOffer(offer);
        if (checked) {
            socketRef.current = io.connect("/");
            navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
                userStream.current = stream;
                userVideo.current.srcObject = stream;
                socketRef.current.emit("join room", roomID);
                socketRef.current.on("all users", users => {
                    const peers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        })
                        peers.push(peer);
                    })
                    setPeers(peers);
                })

                socketRef.current.on("user joined", payload => {
                    const peer = addPeer(payload.signal, payload.callerID, stream);
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    })

                    setPeers(users => [...users, peer]);
                });

                socketRef.current.on("receiving returned signal", payload => {
                    const item = peersRef.current.find(p => p.peerID === payload.id);
                    item.peer.signal(payload.signal);
                });
            });
        }
    }, [checked, roomID]); // Only run this effect when checked changes

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

    function check() {
        console.log("offer", offer);
        console.log("realOffer", realOffer);
        if(offer === realOffer){
            setValidCheck(true);
            setChecked(true); // Trigger useEffect after check is done
        }
        else{
            alert("Invalid offer");
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

    return (
        <>
            {validCheck ? (
                <Container>
                    <StyledVideo muted ref={userVideo} autoPlay playsInline />
                    {peers.map((peer, index) => (
                        <Video key={index} peer={peer} />
                    ))}
                    <button style={{width:'50px',height:'50px'}} onClick={toggleVideo}>
                        {videoEnabled ? "Turn Off Video" : "Turn On Video"}
                    </button>
                    <button style={{width:'50px',height:'50px'}} onClick={toggleAudio}>
                        {audioEnabled ? "Turn Off Audio" : "Turn On Audio"}
                    </button>
                </Container>
            ) : (
                <div>
      <div>url: {url}</div>
      <div>offer: {realOffer}</div>
      <label>
        Role:
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="host">Host</option>
          <option value="participant">Participant</option>
        </select>
      </label>
      <br />
      {role === 'host' && (
        <>
          <label>
            Username:
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </label>
          <br />
          <label>
            Password:
            <input 
              type="text" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </label>
          <br />
        </>
      )}
      {role === 'participant' && (
        <>
          <label>
            Username:
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </label>
          <br />
          <label>
            Date of Birth:
            <input 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)} 
            />
          </label>
          <br />
        </>
      )}
      <label>
        Offer:
        <input 
          type="text" 
          value={offer} 
          onChange={(e) => setOffer(e.target.value)} 
        />
      </label>
      <br />
      <button type="button" onClick={check}>Check</button>
    </div>
            )}
        </>
    );
};

export default Room;
