const BASE = (
  import.meta.env.VITE_AGENT_URL || "http://localhost:8000"
).replace(/\/$/, "");

export async function streamChat({ message, history = [], signal, onEvent }) {
  const response = await fetch(`${BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      if (typeof data.detail === "string") detail = data.detail;
    } catch {
      /* body was not JSON */
    }
    throw new Error(detail || "Something went wrong. Please try again.");
  }

  if (!response.body) {
    throw new Error("Streaming is not supported in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const handleLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let event;
    try {
      event = JSON.parse(trimmed);
    } catch {
      return;
    }
    onEvent(event);
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // stream: true keeps multi-byte characters intact across chunks
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();
      lines.forEach(handleLine);
    }

    buffer += decoder.decode();
    if (buffer.trim()) handleLine(buffer);
  } finally {
    reader.cancel().catch(() => {});
  }
}