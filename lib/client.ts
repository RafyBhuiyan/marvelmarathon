"use client";

import { useEffect, useState } from "react";

export async function api<T>(
  path: string,
  method = "GET",
  body?: object,
): Promise<T> {
  const response = await fetch(path, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message ?? "The request failed. Please try again.");
  return data;
}

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function useResource<T>(path: string | null) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data?: T;
    error?: string;
  }>();
  const key = `${path}:${revision}`;
  useEffect(() => {
    if (!path) return;
    let current = true;
    api<T>(path).then(
      (data) => {
        if (current) setResult({ key, data });
      },
      (error) => {
        if (current) setResult({ key, error: errorMessage(error) });
      },
    );
    return () => {
      current = false;
    };
  }, [path, key]);
  const resolved = result?.key === key ? result : undefined;
  return {
    data: resolved?.data,
    error: resolved?.error,
    reload: () => setRevision((value) => value + 1),
  };
}
