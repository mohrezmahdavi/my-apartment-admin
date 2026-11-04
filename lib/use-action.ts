"use client";

import { useState } from "react";
import { errorText } from "@/lib/http";

export function useAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function run(action: () => Promise<string | void>, fallback: string) {
    setPending(true);
    setError("");
    try {
      const result = await action();
      setMessage(result ?? "");
      return true;
    } catch (caught) {
      setMessage("");
      setError(errorText(caught, fallback));
      return false;
    } finally {
      setPending(false);
    }
  }

  return { pending, error, message, setError, setMessage, run };
}
