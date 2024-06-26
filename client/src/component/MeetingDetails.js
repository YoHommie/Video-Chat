import React, { useRef } from 'react';

const MeetingDetails = ({ url, participant, offerlist, meetlink }) => {
    const detailsRef = useRef();

    const copyToClipboard = () => {
        const detailsDiv = detailsRef.current;
        let detailsText = `Meeting ID: ${url}\nParticipant Details:\n`;
        participant.forEach((item, index) => {
            detailsText += `\nParticipant ${index + 1} Name: ${item}\n`;
            detailsText += `Offer: ${offerlist[index]}\n`;
            detailsText += `Meetlink: ${meetlink[index]}\n`;
        });
        navigator.clipboard.writeText(detailsText)
            .then(() => {
                alert('Details copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy details: ', err);
            });
    };

    return (
        <div>
            <div ref={detailsRef}>
                <div style={{
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                }}>Meeting ID: {url}</div>
                <div>Participant Details:</div>
                {participant.map((item, index) => {
                    return (
                        <div key={index}>
                            <div>Participant {index + 1} Name: {item}</div>
                            <div>Offer: {offerlist[index]}</div>
                            <div>Meetlink: <span style={{
                                cursor: "pointer",
                                textDecoration: "underline",
                                color: "blue",
                            }}>{meetlink[index]}</span></div>
                        </div>
                    );
                })}
            </div>
            <button onClick={copyToClipboard}>Copy Details</button>
        </div>
    );
};

export default MeetingDetails;
