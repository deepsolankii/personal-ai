// Uses Makersuit API instead of openai
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";
import { DiscussServiceClient } from "@google-ai/generativelanguage";

import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";

const MODEL_NAME = "models/chat-bison-001";
const API_KEY = process.env.MAKERSUIT_API_KEY!; // assertion(!) shows that it will not be a null value

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

export async function POST(req: Request) {
  console.log("reached");
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!messages[0]) {
      return new NextResponse("messages are required", { status: 400 });
    }
    const freeTrial = await checkApiLimit();
    if (!freeTrial) {
      return new NextResponse("Free Trial expired.", { status: 403 });
    }
    const response = await client.generateMessage({
      model: MODEL_NAME,
      prompt: { messages },
    });
    await increaseApiLimit();
    const resData = response!;
    const content = resData[0].candidates!;
    const reply = content[0];
    console.log(reply);
    return NextResponse.json(reply);
  } catch (err) {
    console.log("conversation error", err);
    return new NextResponse("internal server error", { status: 500 });
  }
}
