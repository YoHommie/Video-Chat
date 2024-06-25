import React, { useState, useEffect } from 'react';
// import { v4 as uuid } from 'uuid';
import axios from 'axios';
import config from '../config.json';
const DSS_URL = config.DSS_URL || 'http://localhost:3000';
const URL = config.URL || 'http://localhost:8000';


const CreateRoom = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [clientId, setClientId] = useState('');
    const [participantCreated, setParticipantCreated] = useState(false);
    const [ParticipantNumber, setParticipantNumber] = useState(0);
    const [participant, setParticipant] = useState([]);
    const [isHostVerified, setIsHostVerified] = useState(false); // State to track participant verification
    const [url, setUrl] = useState('');
    const [offerlist, setOfferlist] = useState([]);

    useEffect(() => {
        if (localStorage.getItem('validHostUser')) {
            setIsHostVerified(true);
            setClientId(localStorage.getItem('clientID'));
            setUsername(localStorage.getItem('username'));
            setParticipant([localStorage.getItem('username')]);
        }
    }, []);



    const handleSubmitHost = async (event) => {
        try {
            event.preventDefault();
            // keep this commented  if you are using local host
            let res = await axios.post(`${DSS_URL}/login`, { client_id: clientId, username, password });
            console.log(res.data);
            // Perform verification logic here (e.g., check username and password) 
            // For demonstration purposes, we'll assume the verification is successful

            handleAddParticipant(username, 0);
            localStorage.setItem('validHostUser', 'true');
            localStorage.setItem('clientID', clientId);
            localStorage.setItem('username', username);
            setIsHostVerified(true);
            alert("Verification successful!");
        } catch (err) {
            alert("Invalid credentials!");
            console.log(err);
        }
    };

    const handleSubmitParticipant = async (event) => {
        try {
            event.preventDefault();
            //passing the clientID and participant details to the backend
            let response = await axios.post(`${URL}/createRoom`, { client_id: localStorage.getItem('clientID'), participant: participant });
            setParticipantCreated(true);
            console.log(response.data);
            let id = response.data.roomID;
            let offerlist = response.data.offerlist;
            setOfferlist(offerlist);
            setUrl(`${id}`);

        } catch (err) {
            console.log(err);
        }
    };

    const handleAddParticipant = (value, index) => {
        let temp = [...participant];
        temp[index] = value;
        setParticipant(temp);
    }

    return (
        <div className="create-room-container">
            <div className="role-section">
                {!isHostVerified ? (
                    <div>
                        <div>You are a host:</div>
                        <form onSubmit={handleSubmitHost} className="host-form">
                            <div className="form-group">
                                <label>
                                    Client Id:
                                    <input
                                        type="text"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div className="form-group">
                                <label>
                                    Username:
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </label>
                            </div>
                            <div className="form-group">
                                <label>
                                    Password:
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </label>
                            </div>
                            <button type="submit">Submit</button>
                        </form></div>
                ) : (
                    // crating participant detail form here
                    !participantCreated ?
                        (<div>
                            <div>Participant Details:</div>
                            <form className="host-form" onSubmit={handleSubmitParticipant}>
                                <div className="form-group">
                                    <label>
                                        Participant Number:
                                        <input
                                            type="text"
                                            value={ParticipantNumber}
                                            onChange={(e) => setParticipantNumber(e.target.value)}
                                        />
                                    </label>
                                </div>
                                {
                                    //displaying the form based on the number of participants
                                   ParticipantNumber>3?(<div><h3>Number of Participant should be less then or equal to 3</h3></div>): Array.from({ length: ParticipantNumber }, (_, i) => i).map((item, index) => {
                                        return (
                                            <div key={index}>
                                                <div className="form-group">
                                                    <label>
                                                        Participant {index + 1} Name:
                                                        <input
                                                            type="text"
                                                            value={participant[index+1]}
                                                            onChange={(e) => { handleAddParticipant(e.target.value, index + 1); }}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                <button type="submit">Submit Details</button>
                            </form>

                        </div>) : (
                            <div>
                                <div>Meeting ID: {url}</div>
                                <div>Participant Details:</div>
                                {participant.map((item, index) => {
                                    return (
                                        <div key={index}>
                                            <div>Participant {index + 1} Name: {item}</div>
                                            <div>Offer: {offerlist[index]}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                )}
            </div>
        </div>
    );
};

export default CreateRoom;

// CSS Styles
const styles = `
.create-room-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.role-section {
    margin-bottom: 20px;
}

.host-form {
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 10px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input[type='text'],
input[type='password'] {
    width: 100%;
    padding: 8px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-sizing: border-box;
}

button {
    padding: 10px 20px;
    font-size: 14px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

`;

// Apply styles using a <style> tag appended to the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
