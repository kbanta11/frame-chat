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
    let messages: any[] = [];

    try {
        let messagesRef;
        let newestDoc;
        if (timestamp) {
            messagesRef = direction === 'Down' ? db.collection('regular').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').endBefore(+timestamp).limit(7) : db.collection('regular').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').startAfter(+timestamp).limit(7);
            
        } else {
            messagesRef = db.collection('regular').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').limit(7) ;
        }
        const messagesSnapshot = await messagesRef.get();
        if (!messagesSnapshot.empty) {
            messages = messagesSnapshot.docs.reverse().map((doc: any) => doc.data().timestamp);
            //get newest doc
            newestDoc = (await db.collection('regular').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').limit(1).get()).docs[0].data();
            return NextResponse.json({ messages: messages, newestTimestamp: newestDoc.timestamp }, { status: 200, headers: { 'Content-Type': 'application/json' }})
        }

        //get newest doc
        newestDoc = (await db.collection('regular').doc('(null)').collection('messages').orderBy('timestamp', 'desc').limit(1).get()).docs[0].data();
        return NextResponse.json({ messages: undefined, newestTimestamp: undefined }, { status: 200, headers: { 'Content-Type': 'application/json' }})
    } catch (e) {
        console.log(`error: ${e}`)
        return NextResponse.json({ message: 'Invalid GET Method' }, { status: 404 });
    }   
}