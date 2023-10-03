// Uses Makersuit API instead of openai
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"
import { DiscussServiceClient } from "@google-ai/generativelanguage"

import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit"
import { checkSubscription } from "@/lib/subscription"

const MODEL_NAME = "models/chat-bison-001"
const API_KEY = process.env.MAKERSUIT_API_KEY! // assertion(!) shows that it will not be a null value

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
})

export async function POST(req: Request) {
  console.log("reached")
  try {
    const { userId } = auth()
    const body = await req.json()
    const { messages } = body

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    if (!messages[0]) {
      return new NextResponse("messages are required", { status: 400 })
    }
    const freeTrial = await checkApiLimit()
    const isPro = await checkSubscription()
    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial expired.", { status: 403 })
    }
    const response = await client.generateMessage({
      model: MODEL_NAME,
      prompt: {
        context:
          "You are a code generator. You must answer only in markdown snippets.Use code comments for explanation.",
        messages,
      },
    })
    if (!isPro) {
      await increaseApiLimit()
    }
    const resData = response!
    const content = resData[0].candidates!
    const reply = content[0]
    console.log(reply)
    return NextResponse.json(reply)
  } catch (err) {
    console.log("conversation error", err)
    return new NextResponse("internal server error", { status: 500 })
  }
}

// import { auth } from "@clerk/nextjs";
// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const instructionMessage: ChatCompletionMessageParam = {
//   role: "system",
//   content:
//     "You are a code generator. You must answer only in markdown snippets.Use code comments for explanation.",
// };

// export async function POST(req: Request) {
//   try {
//     const { userId } = auth();
//     const body = await req.json();
//     const { messages } = body;

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }
//     if (!messages) {
//       return new NextResponse("messages are required", { status: 400 });
//     }
//     const response = await openai.chat.completions.create({
//       messages: [instructionMessage, ...messages],
//       model: "gpt-3.5-turbo",
//     });
//     return NextResponse.json(response.choices[0].message);
//   } catch (err) {
//     console.log("Code error", err);
//     return new NextResponse("internal server error", { status: 500 });
//   }
// }
