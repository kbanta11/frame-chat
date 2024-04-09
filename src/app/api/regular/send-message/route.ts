import { NextRequest, NextResponse } from "next/server";
import { db } from "../../firebase";

export async function POST(req: NextRequest) {
    const { fid, name, message, channel } = await req.json();
    
    try {
        if(channel === undefined || channel === null) {
            const docRef = db.collection('regular').doc('(null)').collection('messages').doc();
            await docRef.set({
                fid: fid,
                name: name,
                message: message,
                timestamp: Date.now()
            });
        } else {
            const docRef = db.collection('regular').doc(`/${channel}`).collection('messages').doc();
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

    console.log(`Posting... ${fid} (${name}) / ${message} / ${channel}`)
    return NextResponse.json({ success: true }, { status: 200 });
}