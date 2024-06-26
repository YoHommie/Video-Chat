// import React, { useEffect, useRef, useState } from "react";
import React, { useEffect, useRef} from "react";
import styled from "styled-components";


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
    background: rgba(0, 0, 0, 0.0);
    color: white;
    padding: 2px 5px;
    border-radius: 5px;
    font-size: 12px;
`;

const Info = styled.span`
    color: white;
    margin: 0 5px;
    background-color: grey;
    padding: 2px 5px;
    border-radius: 5px;
    `;


const Video = ({ peer, username }) => {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, [peer]);

    // getting the audio and video status
    // const [audioEnabled, setAudioEnabled] = useState(true);
    // const [videoEnabled, setVideoEnabled] = useState(true);

    return (
        <div style={{ position: "relative" }}>
            <StyledVideo playsInline autoPlay ref={ref} />
            <UserDataOverlay>{
                <span>
                    <Info> {username} </Info>
                    {/* <Info> {audioEnabled ? "Audio Enabled" : "Muted"} </Info>
                    <Info> {videoEnabled ? "Video Enabled" : "Video Off"} </Info> */}
                    <Info> {true ? "Audio Enabled" : "Muted"} </Info>
                    <Info> {true ? "Video Enabled" : "Video Off"} </Info>
                </span>

            }</UserDataOverlay>
        </div>
    );
};

export default Video;