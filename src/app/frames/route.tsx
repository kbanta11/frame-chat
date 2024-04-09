import { Button } from "frames.js/core";
import { frames } from "./frames";
import { UrlObject } from "url";
import { getFrameMessage } from "frames.js";
 
const handleRequest = frames(async (ctx) => {
  const base = new URL(
    "/frames",
    process.env.NEXT_PUBLIC_HOST
      ? `https://${process.env.NEXT_PUBLIC_HOST}`
      : "http://localhost:3000"
  )
  return {
    image: (
      <span>
        This is a placeholder.
      </span>
    ),
    textInput: 'Enter a message',
    buttons: [
    ],
  };
});
 
export const GET = handleRequest;
export const POST = handleRequest;