'use client'
import { useState } from "react";

export default function Page() {
    const [name, setName] = useState<string | undefined>(undefined);

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: 'lightblue' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', width: '100%', backgroundColor: 'salmon', padding: '1rem' }}>Frame Chat!</div>
            <div style={{ fontSize: '2rem', padding: '1rem' }}>Create Your Own Chat</div>
            <div style={{ display: 'flex', fontSize: '1.25rem', padding: '1rem' }}>
                <div style={{ paddingRight: '1rem'}}>Enter channel/chat name:</div>
                <input value={name} onChange={(event) => {
                    setName(event.target.value);
                }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '1.25rem', padding: '1rem' }}>
                <div>Copy This Link Into Your Cast:</div>
                <div style={{ fontSize: '2rem' }}>{`https://frame-chat.vercel.app/frames/regular/${name ?? ''}`}</div>
            </div>
        </div>
    )
}