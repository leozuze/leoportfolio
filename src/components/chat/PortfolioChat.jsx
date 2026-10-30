import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Globe,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { streamChat } from "../../lib/chatApi";
import ChatMarkdown from "./ChatMarkdown";

const SUGGESTIONS = [
  "What projects has Leo built?",
  "Tell me about Leo's skills.",
  "How can I work with Leo?",
];

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent-2 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-bg";

function BotAvatar({ small = false }) {
  return (
    <span
      aria-hidden="true"
      className={`relative block h-[49px] w-[52px] shrink-0 ${
        small ? "scale-[0.58]" : "scale-[0.8]"
      }`}
    >
      <span className="absolute left-[25px] top-0 h-2.5 w-0.5 rounded-full bg-zinc-500">
        <span className="absolute -left-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent-2 shadow-[0_0_10px_#ffc54266]" />
      </span>

      <span className="absolute inset-x-0 bottom-0 top-[9px] grid place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 shadow-[inset_0_2px_1px_#ffffff20,0_5px_9px_#00000066]">
        <span className="absolute -left-1 top-3.5 h-3 w-1 rounded-full bg-accent" />
        <span className="absolute -right-1 top-3.5 h-3 w-1 rounded-full bg-accent" />

        <span className="flex h-7 w-10 flex-col items-center justify-center gap-[5px] rounded-[10px] bg-[#111114]">
          <span className="flex gap-2.5">
            <span className="h-2 w-[5px] rounded-full bg-accent-2 transition-transform group-hover:scale-y-75" />
            <span className="h-2 w-[5px] rounded-full bg-accent-2 transition-transform group-hover:scale-y-75" />
          </span>
          <span className="h-1 w-2.5 rounded-b-full border-b-2 border-accent" />
        </span>
      </span>
    </span>
  );
}

function toolInfo(name = "") {
  const value = name.toLowerCase();

  if (value.includes("github")) {
    return {
      key: "github",
      label: "GitHub",
      active: "Looking through GitHub",
      Icon: FaGithub,
    };
  }

  if (value.includes("portfolio") || value.includes("knowledge")) {
    return {
      key: "portfolio",
      label: "Portfolio",
      active: "Searching Leo’s portfolio",
      Icon: BookOpen,
    };
  }

  return {
    key: name || "source",
    label: "Source",
    active: "Checking a source",
    Icon: Globe,
  };
}

export default function PortfolioChat() {
  const dialogRef = useRef(null);
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);
  const controllerRef = useRef(null);
  const busyRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Thinking about your question");

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!open || !nearBottomRef.current) return;

    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, status, open]);

  function openChat() {
    if (dialogRef.current?.open) return;

    dialogRef.current?.showModal();
    setOpen(true);
    inputRef.current?.focus();
  }

  function updateMessage(id, update) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? { ...message, ...update(message) }
          : message
      )
    );
  }

  async function sendMessage(question, baseMessages = messages) {
    const text = question.trim();
    if (!text || busyRef.current) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    busyRef.current = true;
    nearBottomRef.current = true;

    const assistantId = crypto.randomUUID();

    const history = baseMessages
      .filter(
        (message) =>
          message.role === "user" ||
          (message.role === "assistant" && message.state === "done")
      )
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));

    setMessages([
      ...baseMessages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        state: "loading",
        sources: [],
        question: text,
        error: "",
      },
    ]);

    setDraft("");
    setBusy(true);
    setStatus("Thinking about your question");

    let finished = false;

    try {
      await streamChat({
        message: text,
        history,
        signal: controller.signal,

        onEvent(event) {
          if (event.type === "status") {
            setStatus(event.text);
          }

          if (event.type === "tool") {
            const source = toolInfo(event.name);

            setStatus(
              event.state === "running"
                ? source.active
                : "Putting the answer together"
            );

            updateMessage(assistantId, (message) => ({
              content:
                event.state === "running" ? "" : message.content,
              sources: message.sources.some(
                (item) => item.key === source.key
              )
                ? message.sources
                : [
                    ...message.sources,
                    { key: source.key, name: event.name },
                  ],
            }));
          }

          if (event.type === "answer") {
            setStatus("Writing a reply");

            // The backend sends cumulative text: replace, don't append.
            updateMessage(assistantId, () => ({
              content: event.text,
            }));
          }

          if (event.type === "final") {
            finished = true;

            updateMessage(assistantId, () => ({
              content: event.text,
              state: "done",
            }));
          }

          if (event.type === "error") {
            throw new Error(event.text);
          }
        },
      });

      if (!finished) {
        throw new Error("The connection ended early. Please try again.");
      }
    } catch (error) {
      if (!finished) {
        const stopped = error.name === "AbortError";

        updateMessage(assistantId, () => ({
          state: stopped ? "stopped" : "error",
          error: stopped
            ? "Response stopped."
            : error.message === "Failed to fetch"
              ? "Couldn't reach JayZ. Check your connection and try again."
              : error.message || "Something went wrong. Please try again.",
        }));
      }
    } finally {
      busyRef.current = false;
      controllerRef.current = null;
      setBusy(false);
    }
  }

  function retryMessage(id) {
    const index = messages.findIndex((message) => message.id === id);
    if (index < 1) return;

    const failedMessage = messages[index];

    // Remove the failed assistant reply and its user question.
    sendMessage(failedMessage.question, messages.slice(0, index - 1));
  }

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget) return;

    const rect = event.currentTarget.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      dialogRef.current?.close();
    }
  }

  return createPortal(
    <>
      <div
        className={`fixed bottom-[calc(18px+env(safe-area-inset-bottom))] right-5 z-[60] ${
          open ? "hidden" : "block"
        }`}
      >
        <button
          ref={launcherRef}
          type="button"
          onClick={openChat}
          aria-label="Talk to JayZ"
          aria-haspopup="dialog"
          aria-controls="jayz-chat"
          aria-expanded={open}
          className={`group flex items-center gap-2 rounded-[20px] border border-white/10 bg-gradient-to-br from-[#29292e] to-[#19191c] py-1.5 pl-1.5 pr-4 shadow-xl transition hover:-translate-y-1 hover:border-accent/50 motion-reduce:transform-none motion-reduce:transition-none ${FOCUS}`}
        >
          <span className="grid h-11 w-11 place-items-center">
            <BotAvatar />
          </span>
          <span className="text-xs font-medium text-text">Talk to JayZ</span>
          <MessageCircle size={14} className="ml-1 text-accent" />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        id="jayz-chat"
        aria-labelledby="jayz-chat-title"
        onClick={handleBackdropClick}
        onClose={() => {
          setOpen(false);
          launcherRef.current?.focus();
        }}
        data-lenis-prevent
        className="fixed inset-auto bottom-[calc(10px+env(safe-area-inset-bottom))] left-2.5 right-2.5 m-0 h-[min(680px,calc(100dvh-24px-env(safe-area-inset-bottom)))] max-h-none w-auto max-w-none overflow-hidden rounded-3xl border border-white/10 bg-[#171719] p-0 font-sans text-text shadow-[0_32px_100px_#0008] backdrop:bg-black/55 sm:bottom-6 sm:left-auto sm:right-6 sm:h-[min(700px,calc(100dvh-48px))] sm:w-[min(560px,calc(100vw-48px))]"
      >
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="group grid h-10 w-10 place-items-center rounded-xl bg-white/[0.03]">
                <BotAvatar small />
              </span>
              <div>
                <h2 id="jayz-chat-title" className="text-sm font-semibold">
                  JayZ
                </h2>
                <p className="mt-0.5 text-[10px] text-muted">
                  Leo’s portfolio companion
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                disabled={busy || messages.length === 0}
                onClick={() => setMessages([])}
                aria-label="Clear conversation"
                title="Clear conversation"
                className={`grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-text disabled:opacity-30 ${FOCUS}`}
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close chat"
                className={`grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-text ${FOCUS}`}
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            data-lenis-prevent
            onScroll={(event) => {
              const element = event.currentTarget;
              nearBottomRef.current =
                element.scrollHeight -
                  element.scrollTop -
                  element.clientHeight <
                90;
            }}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6"
          >
            {messages.length === 0 ? (
              <div className="pt-4">
                <span className="rounded-full border border-accent/15 bg-accent/5 px-2.5 py-1 font-mono text-[9px] tracking-widest text-accent">
                  NICE TO MEET YOU
                </span>

                <h3 className="mt-5 text-3xl font-medium tracking-tight">
                  Hey, I’m <span className="text-accent">JayZ.</span>
                </h3>

                <p className="mb-7 mt-3 text-xs leading-6 text-muted">
                  Curious about Leo’s work? Ask about his projects,
                  what he builds, or how to work together.
                </p>

                <div className="grid gap-2">
                  {SUGGESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      className={`flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3.5 py-3.5 text-left text-xs text-text/80 transition-colors hover:border-accent/40 hover:bg-accent/5 ${FOCUS}`}
                    >
                      {question}
                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-accent"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md border border-accent/15 bg-accent/10 px-4 py-3 text-[13px] leading-6">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="min-w-0">
                      <div className="mb-2 text-[10px] font-medium tracking-wide text-muted">
                        JayZ
                      </div>

                      {message.sources.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {message.sources.map((source) => {
                            const { Icon, label } = toolInfo(source.name);

                            return (
                              <span
                                key={source.key}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-2 py-1 text-[10px] text-muted"
                                title="Tool used during this answer"
                              >
                                <Icon size={12} />
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {message.content && (
                        <ChatMarkdown text={message.content} />
                      )}

                      {message.state === "loading" && (
                        <div
                          role="status"
                          className="mt-3 flex items-center gap-2 text-[11px] text-muted"
                        >
                          <LoaderCircle
                            size={13}
                            className="text-accent motion-safe:animate-spin"
                          />
                          {status}
                        </div>
                      )}

                      {(message.state === "error" ||
                        message.state === "stopped") && (
                        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
                          <p role="status" className="text-xs text-muted">
                            {message.error}
                          </p>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => retryMessage(message.id)}
                            className={`mt-2 inline-flex items-center gap-1.5 rounded text-xs text-accent disabled:opacity-40 ${FOCUS}`}
                          >
                            <RotateCcw size={12} />
                            Try again
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-white/5 bg-surface/70 px-4 pb-3 pt-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(draft);
              }}
              className="rounded-2xl border border-white/10 bg-bg p-3 focus-within:border-accent/50"
            >
              <label htmlFor="jayz-input" className="sr-only">
                Message JayZ
              </label>

              <textarea
                ref={inputRef}
                id="jayz-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    sendMessage(draft);
                  }
                }}
                placeholder="Ask me something..."
                rows={2}
                maxLength={2000}
                className="block w-full resize-none bg-transparent text-base leading-6 text-text outline-none placeholder:text-muted/70"
              />

              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[9px] text-muted/70">
                  {draft.length}/2000
                </span>

                {busy ? (
                  <button
                    type="button"
                    onClick={() => controllerRef.current?.abort()}
                    aria-label="Stop response"
                    title="Stop response"
                    className={`grid h-8 w-8 place-items-center rounded-lg border border-accent/40 text-accent ${FOCUS}`}
                  >
                    <Square size={12} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Send message"
                    className={`grid h-8 w-8 place-items-center rounded-lg bg-accent text-bg transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted ${FOCUS}`}
                  >
                    <ArrowUp size={18} />
                  </button>
                )}
              </div>
            </form>

            <p className="mt-2.5 text-center text-[9px] text-muted/80">
              JayZ is a bot and can make mistakes.
            </p>
          </footer>
        </div>
      </dialog>
    </>,
    document.body
  );
}