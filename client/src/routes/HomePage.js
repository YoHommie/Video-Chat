import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const CreateRoom = (props) => {
    const [role, setRole] = useState(''); // State to store the user's role
    const [meetingIDCreated, setMeetingIDCreated] = useState(false); // Use boolean for checkbox state
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmitParti = (e) => {
        e.preventDefault();
        if (meetingIDCreated) {
            navigate('/room'); // navigating to room page
        } else {
            navigate('/host'); // navigating to host page
        }
    }

    return (
        <div className="main-container">
            <div className="homepage-role-section">
                <button onClick={() => {
                    setRole("Participant");
                    navigate('/room'); // Use navigate for routing
                }}>Participant</button>
                <button onClick={() => {
                    setRole("Host");
                }}>Host</button>
            </div>
            {role === "Host" && (
                <div>
                    <h2>Host</h2>
                    <form className="homepage-host-form" onSubmit={handleSubmitParti}>
                        <div className="homepage-form-group">
                            <label htmlFor="meetingIDCreated">Meeting ID Created:</label>
                            <input
                                type="checkbox"
                                id="meetingIDCreated"
                                checked={meetingIDCreated}
                                onChange={(e) => setMeetingIDCreated(e.target.checked)}
                            />
                        </div>
                        <button type="submit">Submit</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CreateRoom;

// CSS Styles
const styles = `
.main-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.homepage-role-section {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-around;
}

.homepage-host-form {
    display: flex;
    flex-direction: column;
}

.homepage-form-group {
    margin-bottom: 10px;
}

label {
    display: inline-block;
    margin-bottom: 5px;
    margin-right: 10px;
}

input[type='checkbox'] {
    margin-right: 10px;
}

button {
    padding: 10px 20px;
    margin-top: 20px;
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
