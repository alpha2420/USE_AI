"use client"

import { useState } from "react"
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react"

export default function DemoOne() {
  const [intensity, setIntensity] = useState(1.5)
  const [speed, setSpeed] = useState(1.0)
  const [activeEffect, setActiveEffect] = useState("mesh")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("pnpm i 21st")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Aqua Depth Theme mapped colors
  const themeColors = ["#042F2E", "#0F766E", "#14B8A6", "#22D3EE"]

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {activeEffect === "mesh" && (
        <MeshGradient
          className="w-full h-full absolute inset-0"
          colors={themeColors}
          speed={speed}
          backgroundColor="#020617" // Very dark slate/blue behind the gradient
        />
      )}

      {activeEffect === "dots" && (
        <div className="w-full h-full absolute inset-0 bg-black">
          <DotOrbit
            className="w-full h-full"
            dotColor="#0F766E"
            orbitColor="#22D3EE"
            speed={speed}
            intensity={intensity}
          />
        </div>
      )}

      {activeEffect === "combined" && (
        <>
          <MeshGradient
            className="w-full h-full absolute inset-0"
            colors={themeColors}
            speed={speed * 0.5}
            // Add wireframe logic if supported
            backgroundColor="#020617"
          />
          <div className="w-full h-full absolute inset-0 opacity-60">
            <DotOrbit
              className="w-full h-full"
              dotColor="#0F766E"
              orbitColor="#22D3EE"
              speed={speed * 1.5}
              intensity={intensity * 0.8}
            />
          </div>
        </>
      )}

      {/* UI Overlay */}
      <div className="absolute top-8 left-8 pointer-events-auto z-10 flex gap-4">
        <button className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20" onClick={() => setActiveEffect("mesh")}>Mesh Gradient</button>
        <button className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20" onClick={() => setActiveEffect("dots")}>Dot Orbit</button>
        <button className="px-4 py-2 bg-white/10 text-white rounded hover:bg-white/20" onClick={() => setActiveEffect("combined")}>Combined</button>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {/* Lighting overlay effects using Aqua Depth colors */}
        <div
          className="absolute top-1/4 left-1/3 w-32 h-32 bg-[#0F766E]/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: `${3 / speed}s` }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-[#22D3EE]/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: `${2 / speed}s`, animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-20 h-20 bg-[#14B8A6]/20 rounded-full blur-xl animate-pulse"
          style={{ animationDuration: `${4 / speed}s`, animationDelay: "0.5s" }}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="text-center font-mono text-xs text-white/40">
          <div>...21st-cli...</div>
          <div className="mt-1 flex items-center gap-2">
            <span>pnpm i 21st.dev</span>
            <button
              onClick={copyToClipboard}
              className="pointer-events-auto opacity-30 hover:opacity-60 transition-opacity text-white/60 hover:text-white/80"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
