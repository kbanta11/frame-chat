import { NextRequest, NextResponse } from "next/server";
import satori from 'satori';
import sharp from 'sharp';
import { db } from "../../firebase";
import path from "path";
import fs from 'fs';
import React from "react";

const getNameColor = (number: number) => {
    const hue = parseInt((number * 137.508 % 256).toString());
    return `hsl(${hue},60%,40%)`
}

export async function GET(req: NextRequest) {
    const channel = req.nextUrl.searchParams.get('channel');
    const timestamp = req.nextUrl.searchParams.get('timestamp');
    const direction = req.nextUrl.searchParams.get('direction');
    const revealed = req.nextUrl.searchParams.get('revealed') === 'true' ? true : false;
    let messages = (
        <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%'
        }}>
            <h1>No one has chatted here yet.</h1>
            <h2>You Should Be the First! ;)</h2>
            <div>(You may need to refresh below to see chats)</div>
        </div>
    );

    const body = (_messages: React.JSX.Element) => (
        <div tw='flex flex-col p-4' style={{
            width: "800px", 
            height: "752px",
        }}>
            <div tw='flex justify-center' style={{
                backgroundColor: 'salmon'
            }}>
                <h2>Context-Free Chat: {channel === 'undefined' || channel === 'null' ? 'General' : `/${channel}`}</h2>
            </div>
            {_messages}
        </div>
    );
    try {
        let messagesRef;
        if (timestamp) {
            messagesRef = direction === 'Down' ? 
                db.collection('last-only').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').endBefore(+timestamp).limit(7) 
                : db.collection('last-only').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').startAfter(+timestamp).limit(7);
        } else if (revealed) {
            messagesRef = db.collection('last-only').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').limit(7);
        } else {
            messagesRef = db.collection('last-only').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').limit(1);
        }
        const messagesSnapshot = await messagesRef.get();
        if (!messagesSnapshot.empty) {
            if (revealed) {
                messages = (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        justifyContent: 'flex-end', 
                        fontSize: "1.5rem",
                        flexWrap: 'wrap', textWrap: 'wrap',
                    }}>
                        {messagesSnapshot.docs.reverse().map((doc: any, index: number) => {
                            const nameColor = getNameColor(doc.data().fid);
                            const alternate = index % 2 === 0;
                            return (
                                <div key={`${doc.data().fid}_${doc.data().timestamp}`} style={{ 
                                    width: '100%', 
                                    display: 'flex',
                                    flexDirection: 'column', 
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                    gap: 2, 
                                    padding: 4,
                                    backgroundColor: alternate ? '#D9D9D9' : 'transparent',
                                    flexWrap: 'wrap', textWrap: 'wrap'
                                }}>
                                    <div tw='flex items-center' style={{ 
                                        color: `${nameColor}` }}>@{doc.data().name}:<span style={{ fontSize: '1rem', color: '#6A6B61'}}>&nbsp;({(new Date(doc.data().timestamp)).toLocaleString()})</span></div>
                                    <div tw='flex' style={{ flexWrap: 'wrap', textWrap: 'wrap', paddingLeft: 8,}}>
                                        {`${doc.data().message} `}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            } else {
                const doc = messagesSnapshot.docs[0];
                const data = doc.data();
                messages = (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center', 
                        fontSize: "1.5rem",
                    }}>
                        <div style={{ fontSize: '2rem'}}>Reply to Reveal the Rest</div>
                        <div key={`${data.fid}_${data.timestamp}`} style={{ 
                            width: '100%', 
                            display: 'flex',
                            flexDirection: 'column', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            gap: 2, 
                            padding: '1rem',
                            backgroundColor: 'rgba(250, 128, 114, 0.3)',
                            borderRadius: '15px 15px 15px 15px'
                        }}>
                            <div tw='flex items-center'>@{data.name}:<span style={{ fontSize: '1rem', color: '#6A6B61'}}>&nbsp;({(new Date(data.timestamp)).toLocaleString()})</span></div>
                            <div tw='flex' style={{ flexWrap: 'wrap', textWrap: 'wrap', paddingLeft: 8 }}>
                                {`${data.message} `}
                            </div>
                        </div>
                    </div>
                );
            }
        }
        const svg = await satori(body(messages), {
            width: 800,
            height: 800,
            fonts: [
                {
                    name: "Inter",
                    data: fs.readFileSync(
                        path.resolve(process.cwd(), "src/fonts/Rubik/static", "Rubik-Regular.ttf")
                    ),
                    weight: 400,
                    style: "normal",
                },
            ]
        })
        const png = await sharp(Buffer.from(svg)).png().toBuffer();
        return new NextResponse(png, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=0, no-cache' }})
    } catch (e) {
        return NextResponse.json({ message: 'Invalid GET Method' }, { status: 404 });
    }   
}