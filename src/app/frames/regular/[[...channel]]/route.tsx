import { Button } from "frames.js/core";
import { frames } from "../../frames";
import { UrlObject } from "url";
import { getFrameMessage } from "frames.js";
import { NextRequest } from "next/server";
import { Features, onchainDataFramesjsMiddleware, init, OnchainDataInput } from "@airstack/frames";
import { FramesMiddleware } from "frames.js/types";
require('dotenv').config();

init(process.env.NEXT_PUBLIC_AIRSTACK_API_KEY as string);
let channel: string | null = null;
 
const handleRequest = frames(async (ctx) => {
  const base = new URL(
    "/frames/regular",
    process.env.NEXT_PUBLIC_HOST
      ? `https://${process.env.NEXT_PUBLIC_HOST}`
      : "http://localhost:3000"
  )

  if (ctx.pressedButton && ctx.message?.buttonIndex === 1 && ctx.message?.inputText) {
    // console.log(`Message: ${JSON.stringify(ctx.message)}`);
    // console.log(`User Details: ${JSON.stringify(ctx.userDetails)}`);
    const response = await fetch(`${base.toString().replace('/frames/regular', `/api/regular/send-message`)}`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            fid: ctx.message.requesterFid,
            name: ctx.userDetails?.profileName,
            message: ctx.message.inputText,
            channel: channel
        })
    });

    const { success } = await response.json();
  }

  const res = await fetch(`${base.toString().replace('/frames/regular', `/api/regular/get-page-values?channel=${channel}&direction=${ctx.searchParams.direction}&timestamp=${ctx.searchParams.timestamp ?? Date.now()}`)}&refresh=${Date.now()}`);
  const data = await res.json();

  const imgUrl = base.toString().replace('/frames/regular', `/api/regular/get-messages?channel=${channel}&direction=${ctx.searchParams.direction}&timestamp=${ctx.searchParams.timestamp ?? Date.now()}&refresh=${Date.now()}`);
  
  return {
    image: imgUrl,
    imageOptions: {
      aspectRatio: '1:1',
    },
    textInput: 'Enter a message',
    buttons: [
      <Button key='send' action="post" target={`${base}/`}>
        Send Message
      </Button>,
      data.messages?.length === 7 ? <Button key='up' action="post" target={`${base}/?timestamp=${data.messages?.[0] ?? Date.now()}&direction=Up`}>
        ⬆️
      </Button> : undefined,
      data.messages?.[data.messages?.length - 1] === data.newestTimestamp ? undefined : <Button key='down' action="post" target={`${base}/?timestamp=${data.messages?.[data.messages?.length - 1] ?? Date.now()}&direction=Down`}>
        ⬇️
      </Button>,
      <Button key="create" action="link" target={`${base.toString().replace('/frames/', '/page/')}/create-chat`}>
        Create
      </Button>
    ],
  };
}, {
    middleware: [
        onchainDataFramesjsMiddleware({
            apiKey: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY as string,
            features: [Features.USER_DETAILS],
        }) as FramesMiddleware<any, any>
    ]
});
 
export const GET = (req: NextRequest, { params }: any) => {
    channel = params.channel;
    return handleRequest(req)
};
export const POST = handleRequest;