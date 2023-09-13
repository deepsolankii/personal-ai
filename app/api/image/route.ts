import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!prompt || !amount || !resolution) {
      return new NextResponse("prompt,amount,resolution are required", {
        status: 400,
      });
    }
    const response = await openai.images.generate({
      prompt,
      n: parseInt(amount, 10),
      size: resolution,
    });
    return NextResponse.json(response.data);
  } catch (err) {
    console.log("conversation error", err);
    return new NextResponse("internal server error", { status: 500 });
  }
}
