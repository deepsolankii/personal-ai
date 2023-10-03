"use client"

import { useEffect } from "react"
import { Crisp } from "crisp-sdk-web"

export const Crispchat = () => {
  useEffect(() => {
    Crisp.configure("8712c823-539f-45f5-b758-d30f80c54c54")
  })
  return null
}
