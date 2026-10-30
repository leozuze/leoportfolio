const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export async function streamChat({
  message,
  history,
  signal,
  onEvent,
}) {
  const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
    },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!response.ok) {
    let detail = "";

    try {
      const body = await response.json();
      detail = typeof body.detail === "string" ? body.detail : "";
    } catch {
      // Use the fallback below for non-JSON responses.
    }

    throw new Error(
      detail || `The assistant couldn't respond (${response.status}).`
    );
  }

  if (!response.body) {
    throw new Error("Your browser couldn't open the response stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  function consumeLines(flush = false) {
    const lines = buffer.split("\n");
    buffer = flush ? "" : lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim()) {
        onEvent(JSON.parse(line));
      }
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      consumeLines();
    }

    buffer += decoder.decode();
    consumeLines(true);
  } finally {
    try {
      await reader.cancel();
    } catch {
      // The connection may already be closed.
    }

    reader.releaseLock();
  }
}