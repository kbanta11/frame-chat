import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase";

export async function POST(req: NextRequest) {
    const { fid, name, message, channel } = await req.json();
    
    try {
        if(channel === undefined || channel === null) {
            const docRef = db.collection('last-only').doc('(null)').collection('messages').doc();
            await docRef.set({
                fid: fid,
                name: name,
                message: message,
                timestamp: Date.now()
            });
        } else {
            const docRef = db.collection('last-only').doc(`/${channel}`).collection('messages').doc();
            await docRef.set({
                fid: fid,
                name: name,
                message: message,
                timestamp: Date.now()
            });
        }
    } catch (e) {
        NextResponse.json({ success: false }, { status: 200 })
    }

    return NextResponse.json({ success: true }, { status: 200 });
}