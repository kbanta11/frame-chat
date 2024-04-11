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
                <h2>Frames Chat: {channel === 'undefined' || channel === 'null' ? 'General' : `/${channel}`}</h2>
            </div>
            {_messages}
        </div>
    );
    try {
        let messagesRef;
        if (timestamp) {
            messagesRef = direction === 'Down' ? 
                db.collection('regular').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').endBefore(+timestamp).limit(7) 
                : db.collection('regular').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').startAfter(+timestamp).limit(7);
        } else {
            messagesRef = db.collection('regular').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').limit(7) ;
        }
        const messagesSnapshot = await messagesRef.get();
        if (!messagesSnapshot.empty) {
            messages = (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    justifyContent: 'flex-end', 
                    fontSize: "1.5rem",
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
        console.log(`error: ${e}`)
        return NextResponse.json({ message: 'Invalid GET Method' }, { status: 404 });
    }   
}