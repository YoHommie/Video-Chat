import React, { useState,useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

const CreateRoom = (props) => {
    const [role, setRole] = useState(null); // State to store the user's role
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [clientId, setClientId ]= useState('');
    const [isPartiVerified, setIsPartiVerified] = useState(false);
    const [isHostVerified, setIsHostVerified] = useState(false); // State to track participant verification
    const [url, setUrl] = useState('');
    const [offer,setOffer] = useState('');

    useEffect(() => {
        // Initialize localStorage value if not already set
        if (localStorage.getItem('validPartiUser')) {
            localStorage.setItem('validPartiUser', 'false');
        }
        if (localStorage.getItem('validHostUser')) {
            localStorage.setItem('validHostUser', 'false');
        }
    }, []);

    function create() {
        const id = uuid();
        const offer = Math.floor(1000 + Math.random() * 9000);
        setOffer(offer);
        setUrl("http://localhost:3000/room/"+id)
        localStorage.setItem('offer', offer);
    }
    // function navigate(){
    //     props.history.push(url);
    // }

    const handleRoleChange = (event) => {
        setRole(event.target.value);
        setIsPartiVerified(false); // Reset verification state when role changes
    };

    const handleSubmitParti = (event) => {
        event.preventDefault();
        // Perform verification logic here (e.g., check username and password)
        // For demonstration purposes, we'll assume the verification is successful
        setIsPartiVerified(true);
        localStorage.setItem('validPartiUser', 'true');
        alert("Verification successfull! ask meeting link from host")
    };
    const handleSubmitHost = async (event) => {
        try{
            event.preventDefault();
            let res=await axios.post('http://localhost:3001/login', {client_id:clientId, username, password});
            console.log(res.data)
            // Perform verification logic here (e.g., check username and password)
            // For demonstration purposes, we'll assume the verification is successful
            setIsHostVerified(true);
            localStorage.setItem('validHostUser', 'true');
            alert("Verification successfull!")
        }catch(err){
            alert("invalid credentials!")
            console.log(err);
        }
    };

    return (
        <div>
            <div>You are a host:</div>
            <div>
                    {!isHostVerified && (
                        <form onSubmit={handleSubmitHost}>
                            <div>
                                <label>
                                    Client Id:
                                    <input 
                                        type="client Id" 
                                        value={clientId} 
                                        onChange={(e) => setClientId(e.target.value)} 
                                    />
                                </label>
                            </div>
                            <div>
                                <label>
                                    Username:
                                    <input 
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                    />
                                </label>
                            </div>
                            <div>
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
                        </form>
                    )}
                    {isHostVerified && (
                        <div>
                            <button onClick={create}>Create room</button>
                            <div>offer: {offer}</div>
                            <div>Url: {url}</div>
                        </div>
                    )}
                </div>

        </div>
    );
};

export default CreateRoom;
