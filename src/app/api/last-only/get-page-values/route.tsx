import { NextRequest, NextResponse } from "next/server";
import satori from 'satori';
import sharp from 'sharp';
import { db } from "../../firebase";
import path from "path";
import fs from 'fs';
import React from "react";

export async function GET(req: NextRequest) {
    const channel = req.nextUrl.searchParams.get('channel');
    const timestamp = req.nextUrl.searchParams.get('timestamp');
    const direction = req.nextUrl.searchParams.get('direction');
    const revealed = req.nextUrl.searchParams.get('revealed') === 'true' ? true : false;
    let messages: any[] = [];

    try {
        let messagesRef;
        let newestDoc;
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
            messages = messagesSnapshot.docs.reverse().map((doc: any) => doc.data().timestamp);
            //get newest doc
            newestDoc = (await db.collection('last-only').doc(channel === 'undefined' || channel === 'null' || !channel ? '(null)' : channel).collection('messages').orderBy('timestamp', 'desc').limit(1).get()).docs[0].data();
            return NextResponse.json({ messages: messages, newestTimestamp: newestDoc.timestamp }, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=0' }})
        }

        //get newest doc
        newestDoc = (await db.collection('last-only').doc('(null)').collection('messages').orderBy('timestamp', 'desc').limit(1).get()).docs[0].data();
        return NextResponse.json({ messages: undefined, newestTimestamp: undefined }, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=0, no-cache' }})
    } catch (e) {
        console.log(`error: ${e}`)
        return NextResponse.json({ message: 'Invalid GET Method' }, { status: 404 });
    }   
}