/*
This route is not used anymore. Open AI free trial expired
*/

import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { messages } = body

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    if (!messages) {
      return new NextResponse("messages are required", { status: 400 })
    }
    const response = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
    })
    return NextResponse.json(response.choices[0].message)
  } catch (err) {
    console.log("conversation error", err)
    return new NextResponse("internal server error", { status: 500 })
  }
}
