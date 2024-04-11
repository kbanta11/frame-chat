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

export const revalidate = 0;

const handleRequest = frames(async (ctx) => {
  const base = new URL(
    "/frames/last-only",
    process.env.NEXT_PUBLIC_HOST
      ? `https://${process.env.NEXT_PUBLIC_HOST}`
      : "http://localhost:3000"
  )
  let state = ctx.state;

  if (ctx.searchParams.started !== 'true' && state.started !== true) {
    return {
      image: (
        <div tw='flex flex-col p-4 justify-start' style={{
            width: "100%", 
            height: "100%",
        }}>
            <div tw='flex justify-center' style={{
                backgroundColor: 'salmon'
            }}>
                <h2>Context-Free Chat: {channel === 'undefined' || channel === undefined || channel === 'null' ? 'General' : `/${channel}`}</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '3rem', paddingTop: '1rem', width: '100%', textAlign: 'center' }}>
              <div>Get started to view the last message.</div>
            </div>
        </div>
      ),
      imageOptions: {
        aspectRatio: '1:1',
      },
      buttons: [
        <Button key="start" action="post" target={`${base}/?started=true`}>Let&apos;s Start!</Button>
      ],
    }
  } else {
    state = {...ctx.state, started: true};
  }

  if (ctx.pressedButton && ctx.message?.buttonIndex === 1 && ctx.message?.inputText) {
    const response = await fetch(`${base.toString().replace('/frames/last-only', `/api/last-only/send-message`)}`, {
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

    await response.json();
    state = {...state, revealed: true}
  }

  const res = await fetch(
    `${base.toString().replace('/frames/last-only', `/api/last-only/get-page-values?channel=${channel}&revealed=${state.revealed ?? false}&direction=${ctx.searchParams.direction}&timestamp=${ctx.searchParams.timestamp ?? Date.now()}`)}&refresh=${Date.now()}`,
  );

  let data = {
    messages: [undefined, undefined],
    newestTimestamp: undefined,
  };
  if(res.ok) {
    data = await res.json();
  }
  const imgUrl = base.toString().replace('/frames/last-only', `/api/last-only/get-messages?channel=${channel}&revealed=${state.revealed ?? false}&direction=${ctx.searchParams.direction}&timestamp=${ctx.searchParams.timestamp ?? Date.now()}&refresh=${Date.now()}`);
  const buttons: [any, any, any, any] = [
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
  ];

  const undefinedElementIndex = buttons.findIndex((b) => !b)
  if (undefinedElementIndex) {
    buttons[undefinedElementIndex] = <Button key="refresh" action="post" target={`${base}/`}>Refresh 🔄</Button>
  }

  return {
    image: imgUrl,
    imageOptions: {
      aspectRatio: '1:1',
    },
    textInput: 'Enter a message',
    buttons: buttons,
    state: state,
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