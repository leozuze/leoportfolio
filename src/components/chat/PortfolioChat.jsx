import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Globe,
  LoaderCircle,
  RotateCcw,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { streamChat } from "../../lib/chatApi";
import ChatMarkdown from "./ChatMarkdown";
import Avatar from "./Avatar";


const SUGGESTIONS = [
  "What can Leo build for my business?",
  "Show me projects Leo has built.",
  "How does a project with Leo work?",
];


const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-surface";


const FOCUS_INK =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-on-ink focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-ink";


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
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed bottom-[calc(18px+env(safe-area-inset-bottom))] right-5 z-[60] ${
          open ? "hidden" : "block"
        }`}
      >
        <div className="group relative">
          <button
            ref={launcherRef}
            type="button"
            onClick={openChat}
            aria-label="Talk to JayZ"
            aria-haspopup="dialog"
            aria-controls="jayz-chat"
            aria-expanded={open}
            className={`relative block rounded-full bg-ink shadow-[0_18px_38px_-14px_rgb(22_20_15/0.7)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-14px_rgb(22_20_15/0.75)] motion-reduce:transform-none motion-reduce:transition-none ${FOCUS}`}
          >
            <span className="absolute -inset-1 rounded-full border border-accent/35 transition group-hover:border-accent/65" />
            <Avatar small />
          </button>


          <span
            role="tooltip"
            className="pointer-events-none absolute right-full top-1/2 mr-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-on-ink opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block"
          >
            Talk to JayZ
          </span>
        </div>
      </motion.div>


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
        className="fixed inset-auto bottom-[calc(10px+env(safe-area-inset-bottom))] left-2.5 right-2.5 m-0 h-[min(680px,calc(100dvh-24px-env(safe-area-inset-bottom)))] max-h-none w-auto max-w-none overflow-hidden rounded-xl border border-border bg-surface p-0 font-sans text-text shadow-[0_32px_80px_-20px_rgb(22_20_15/0.45)] backdrop:bg-ink/50 sm:bottom-6 sm:left-auto sm:right-6 sm:h-[min(700px,calc(100dvh-48px))] sm:w-[min(560px,calc(100vw-48px))]"
      >
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex shrink-0 items-center justify-between bg-ink px-4 py-3 text-on-ink">
            <div className="flex items-center gap-3">
              <Avatar />
              <div>
                <h2 id="jayz-chat-title" className="text-sm font-bold">
                  JayZ
                </h2>
                <p className="mt-0.5 text-[11px] text-on-ink/60">
                  Ask about Leo’s work
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
                className={`grid h-8 w-8 place-items-center rounded-md text-on-ink/70 hover:bg-white/10 hover:text-on-ink disabled:opacity-30 ${FOCUS_INK}`}
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close chat"
                className={`grid h-8 w-8 place-items-center rounded-md text-on-ink/70 hover:bg-white/10 hover:text-on-ink ${FOCUS_INK}`}
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
              <div className="pt-2">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="block h-px w-8 bg-accent" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    Ask me anything
                  </span>
                </div>


                <h3 className="mt-5 font-heading text-3xl font-extrabold tracking-tight">
                  Hi, I’m <span className="text-accent">JayZ.</span>
                </h3>


                <p className="mb-7 mt-3 text-sm leading-6 text-muted">
                  I can tell you what Leo builds, show you his work, and explain
                  how a project runs from first call to launch.
                </p>


                <div className="grid gap-2">
                  {SUGGESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      className={`flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3.5 text-left text-sm font-medium text-text transition-colors hover:border-ink hover:bg-bg ${FOCUS}`}
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
                      <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-lg rounded-br-sm bg-ink px-4 py-3 text-[13px] leading-6 text-on-ink">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="min-w-0">
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                        JayZ
                      </div>


                      {message.sources.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {message.sources.map((source) => {
                            const { Icon, label } = toolInfo(source.name);


                            return (
                              <span
                                key={source.key}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg px-2 py-1 text-[11px] text-muted"
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
                          className="mt-3 flex items-center gap-2 text-xs text-muted"
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
                        <div className="mt-3 rounded-lg border border-border bg-bg p-3">
                          <p role="status" className="text-xs text-muted">
                            {message.error}
                          </p>


                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => retryMessage(message.id)}
                            className={`mt-2 inline-flex items-center gap-1.5 rounded text-xs font-semibold text-accent disabled:opacity-40 ${FOCUS}`}
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


          <footer className="shrink-0 border-t border-border bg-bg px-4 pb-3 pt-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(draft);
              }}
              className="rounded-lg border border-border bg-surface p-3 focus-within:border-ink"
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
                <span className="text-[11px] text-muted/70">
                  {draft.length}/2000
                </span>


                {busy ? (
                  <button
                    type="button"
                    onClick={() => controllerRef.current?.abort()}
                    aria-label="Stop response"
                    title="Stop response"
                    className={`grid h-8 w-8 place-items-center rounded-md border border-ink text-ink ${FOCUS}`}
                  >
                    <Square size={12} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Send message"
                    className={`grid h-8 w-8 place-items-center rounded-md bg-accent text-on-accent transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-muted ${FOCUS}`}
                  >
                    <ArrowUp size={18} />
                  </button>
                )}
              </div>
            </form>


            <p className="mt-2.5 text-center text-[11px] text-muted">
              JayZ is an AI and can make mistakes. Please verify details with Leo.
            </p>
          </footer>
        </div>
      </dialog>
    </>,
    document.body
  );
}