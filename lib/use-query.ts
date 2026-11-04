"use client";

import { useEffect, useState } from "react";
import { api, errorText } from "@/lib/http";

export function useQuery<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(path !== null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    let active = true;
    api<T>(path)
      .then((response) => {
        if (!active) return;
        setData(response.items);
        setError("");
      })
      .catch((caught) => {
        if (active) setError(errorText(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [path, version]);

  return {
    data,
    error,
    loading,
    setData,
    reload: () => setVersion((current) => current + 1),
  };
}
