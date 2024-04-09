import { fetchMetadata } from "frames.js/next";
import { useState } from "react";
 
export async function generateMetadata() {
  return {
    title: "My Page",
    // provide a full URL to your /frames endpoint
    other: await fetchMetadata(
      new URL(
        "/frames",
        process.env.NEXT_PUBLIC_HOST
          ? `https://${process.env.NEXT_PUBLIC_HOST}`
          : "http://localhost:3000"
      )
    ),
  };
}

export default function Page() {

  return (
    <div>
        <h1>Frame Chat!</h1>
        <h2>Create Your Own Chat</h2>
        <div tw='flex'>
          <p>Enter channel/chat name:&nbsp;</p>
          <input />
        </div>
    </div>
  );
}