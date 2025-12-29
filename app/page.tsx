"use client";

import { useState, useEffect } from "react";
import LedControls from "./components/ledControls";

export default function Home() {
  const [pin16State, setPin16State] = useState<string>("off");
  const [pin17State, setPin17State] = useState<string>("off");
  const [pin18State, setPin18State] = useState<string>("off");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const controlLED = async (pin: number, state: string) => {
    setLoading(true);
    setError("");
    console.log("yes");
    try {
      const response = await fetch(`http://${ESP32_IP}/${pin}/${state}`, {
        mode: "no-cors",
      });

      if (pin === 16) {
        setPin16State(state);
      } else if (pin === 17) {
        setPin17State(state);
      } else if (pin === 18) {
        setPin18State(state);
      }

      console.log(response);
    } catch (err) {
      setError(`Failed to control LED ${pin}. Check connection.`);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addPort = async (address: string) => {
    const response = await fetch("/api/ports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: address }),
    });

    const result = await response.json();
    console.log("Saved device:", result);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-16 px-8 bg-white dark:bg-black sm:items-start">
        {/* Main Content */}
        <div className="flex w-full flex-col items-center gap-8 text-center sm:items-start sm:text-left">
          <h1 className="text-4xl font-bold text-black">
            ESP32 LED Controller
          </h1>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {connected ? "Connected to ESP32" : "Disconnected"}
            </p>
          </div>

          <p className="max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
            ESP32 IP:{" "}
            <span className="font-mono text-zinc-950 dark:text-zinc-50">
              {ESP32_IP}
            </span>
          </p>

          {/* Error Message */}
          {error && (
            <div className="w-full rounded-lg bg-red-50 border border-red-200 p-4 dark:bg-red-950/20 dark:border-red-900">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* LED Controls */}
          <div className="flex w-full flex-col gap-6 sm:flex-row">
            <LedControls
              title="LED Pin 16"
              state={pin16State}
              pin={16}
              loading={loading}
              controlLED={controlLED}
            ></LedControls>
            <LedControls
              title="LED Pin 17"
              state={pin17State}
              pin={17}
              loading={loading}
              controlLED={controlLED}
            ></LedControls>
            <LedControls
              title="Servo Pin 18"
              state={pin18State}
              pin={18}
              loading={loading}
              controlLED={controlLED}
            ></LedControls>
          </div>
        </div>
      </main>
    </div>
  );
}
