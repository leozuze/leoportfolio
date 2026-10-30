import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp,
  ArrowUpRight,
  MessageCircle,
  X,
} from "lucide-react";

const SUGGESTIONS = [
  {
    label: "What have you been building?",
    prompt: "What projects has Leo been building?",
  },
  {
    label: "Tell me about your skills",
    prompt: "Tell me about Leo's skills and experience.",
  },
  {
    label: "Let's work together",
    prompt: "How can I work with Leo on a project?",
  },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent-2 focus-visible:ring-offset-4 " +
  "focus-visible:ring-offset-bg";

function BotAvatar({ small = false }) {
  return (
    <span
      aria-hidden="true"
      className={`relative block h-[49px] w-[52px] shrink-0 ${
        small ? "scale-[0.58]" : "scale-[0.8]"
      }`}
    >
      {/* Antenna */}
      <span className="absolute left-[25px] top-0 h-[10px] w-0.5 rounded-full bg-zinc-500">
        <span className="absolute -left-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent-2 shadow-[0_0_10px_#ffc54266]" />
      </span>

      {/* Head */}
      <span className="absolute inset-x-0 bottom-0 top-[9px] grid place-items-center rounded-2xl border border-white/20 bg-gradient-to-br from-zinc-400 via-zinc-600 to-zinc-800 shadow-[inset_0_2px_1px_#ffffff20,0_5px_9px_#00000066]">
        <span className="absolute -left-1 top-3.5 h-3 w-1 rounded-full bg-accent" />
        <span className="absolute -right-1 top-3.5 h-3 w-1 rounded-full bg-accent" />

        {/* Face */}
        <span className="flex h-7 w-10 flex-col items-center justify-center gap-[5px] rounded-[10px] border border-white/5 bg-[#111114] shadow-[inset_0_2px_7px_#00000099]">
          <span className="flex gap-2.5">
            <span className="h-2 w-[5px] rounded-full bg-accent-2 shadow-[0_0_7px_#f2621b70] transition-transform duration-300 group-hover:scale-y-75 motion-reduce:transition-none" />
            <span className="h-2 w-[5px] rounded-full bg-accent-2 shadow-[0_0_7px_#f2621b70] transition-transform duration-300 group-hover:scale-y-75 motion-reduce:transition-none" />
          </span>

          <span className="h-1 w-2.5 rounded-b-full border-b-2 border-accent" />
        </span>
      </span>
    </span>
  );
}

export default function PortfolioChat() {
  const dialogRef = useRef(null);
  const launcherRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function openChat() {
    const dialog = dialogRef.current;

    if (!dialog || dialog.open) return;

    dialog.showModal();
    setOpen(true);
    inputRef.current?.focus();
  }

  function closeChat() {
    dialogRef.current?.close();
  }

  function handleClose() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  function choosePrompt(prompt) {
    setDraft(prompt);
    inputRef.current?.focus();
  }

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (clickedOutside) closeChat();
  }

  return createPortal(
    <>
      {/* Compact launcher */}
      <div
        hidden={open}
        className={`fixed bottom-[calc(18px+env(safe-area-inset-bottom))] right-[max(18px,env(safe-area-inset-right))] z-[60] ${
          open ? "hidden" : "block"
        } sm:bottom-[calc(24px+env(safe-area-inset-bottom))] sm:right-[max(24px,env(safe-area-inset-right))]`}
      >
        <button
          ref={launcherRef}
          type="button"
          onClick={openChat}
          aria-label="Talk to JayZ"
          aria-haspopup="dialog"
          aria-controls="jayz-chat"
          aria-expanded={open}
          className={`group flex cursor-pointer items-center gap-2 rounded-[20px] border border-white/10 bg-gradient-to-br from-[#29292E] to-[#19191C] py-1.5 pl-1.5 pr-4 shadow-[0_12px_35px_#00000055,inset_0_1px_0_#ffffff0a] transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_15px_40px_#00000066,0_0_24px_#f2621b12] motion-reduce:transform-none motion-reduce:transition-none ${FOCUS_RING}`}
        >
          <span className="relative grid h-11 w-11 shrink-0 place-items-center">
            <BotAvatar />
          </span>

          <span className="text-xs font-medium tracking-tight text-text">
            Talk to JayZ
          </span>

          <MessageCircle
            size={14}
            className="ml-1 text-accent"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Chat panel */}
      <dialog
        ref={dialogRef}
        id="jayz-chat"
        aria-labelledby="jayz-chat-title"
        aria-describedby="jayz-chat-description"
        onClose={handleClose}
        onClick={handleBackdropClick}
        data-lenis-prevent
        className="fixed inset-auto bottom-[calc(10px+env(safe-area-inset-bottom))] left-2.5 right-2.5 m-0 max-h-[calc(100dvh-20px-env(safe-area-inset-bottom))] w-auto max-w-none overflow-hidden rounded-[24px] border border-white/10 bg-[#171719] p-0 font-sans text-text shadow-[0_32px_100px_#00000088] backdrop:bg-[#09090b]/60 sm:bottom-[calc(24px+env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:w-[390px] sm:max-h-[calc(100dvh-48px-env(safe-area-inset-bottom))]"
      >
        <div className="flex max-h-[calc(100dvh-22px-env(safe-area-inset-bottom))] flex-col sm:max-h-[calc(100dvh-50px-env(safe-area-inset-bottom))]">
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-surface/80 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="group grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-white/5 bg-white/[0.025]">
                <BotAvatar small />
              </div>

              <div>
                <h2
                  id="jayz-chat-title"
                  className="text-sm font-semibold tracking-tight"
                >
                  JayZ
                </h2>

                <p className="mt-0.5 text-[10px] text-muted">
                  Leo’s portfolio companion
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeChat}
              aria-label="Close chat"
              className={`grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-xl text-muted transition-colors hover:bg-white/5 hover:text-text motion-reduce:transition-none ${FOCUS_RING}`}
            >
              <X size={18} />
            </button>
          </header>

          {/* Welcome */}
          <div
            data-lenis-prevent
            className="min-h-0 overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top_right,rgba(242,98,27,0.06),transparent_65%)] px-5 pb-6 pt-8 sm:px-6"
          >
            <span className="mb-4 inline-flex rounded-full border border-accent/15 bg-accent/5 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-accent">
              NICE TO MEET YOU
            </span>

            <h3 className="text-[30px] font-medium leading-[1.15] tracking-[-0.05em]">
              Hey, I’m <span className="text-accent">JayZ.</span>
            </h3>

            <p
              id="jayz-chat-description"
              className="mb-7 mt-3 max-w-[32ch] text-xs leading-[1.8] text-muted"
            >
              Curious about Leo’s work? Ask about his projects, what he
              builds, or how to work together.
            </p>

            <div className="grid gap-2">
              {SUGGESTIONS.map(({ label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => choosePrompt(prompt)}
                  className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.015] px-3.5 py-3.5 text-left text-xs text-text/80 transition-all duration-200 hover:translate-x-0.5 hover:border-accent/30 hover:bg-accent/5 hover:text-text motion-reduce:transform-none motion-reduce:transition-none ${FOCUS_RING}`}
                >
                  <span>{label}</span>

                  <ArrowUpRight
                    size={15}
                    className="shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <footer className="shrink-0 border-t border-white/5 bg-[#1B1B1E] px-4 pb-3 pt-3.5">
            <form
              onSubmit={(event) => event.preventDefault()}
              className="rounded-2xl border border-white/10 bg-bg px-3 pb-2.5 pt-3 transition-colors focus-within:border-accent/50 motion-reduce:transition-none"
            >
              <label htmlFor="jayz-chat-input" className="sr-only">
                Message JayZ
              </label>

              <textarea
                ref={inputRef}
                id="jayz-chat-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask me something..."
                rows={2}
                maxLength={2000}
                aria-describedby="jayz-chat-disclaimer"
                className="block max-h-28 min-h-12 w-full resize-none border-0 bg-transparent text-base leading-relaxed text-text outline-none placeholder:text-muted/70"
              />

              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] text-muted/70">
                  {draft.length}/2000
                </span>

                <button
                  type="submit"
                  disabled
                  aria-label="Send message — currently unavailable"
                  className="grid h-8 w-8 place-items-center rounded-[10px] bg-accent text-bg disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted"
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </form>

            <p
              id="jayz-chat-disclaimer"
              className="mt-3 text-center text-[9px] leading-relaxed text-muted/80"
            >
              JayZ is a bot and can make mistakes.
            </p>
          </footer>
        </div>
      </dialog>
    </>,
    document.body
  );
}