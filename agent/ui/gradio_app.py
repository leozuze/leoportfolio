"""Local test console: chat on the left, tool calls and retrieved chunks on the right.

Run:  python -m ui.gradio_app
"""
import json
import time

import gradio as gr

from app import llm
from app.agent import ask, build_agent

IDLE = "*Tool activity will appear here.*"


def build_ui(agent) -> gr.Blocks:
    async def respond(message, history):
        message = (message or "").strip()
        if not message:
            yield "", history, IDLE
            return
        prior = list(history or [])
        history = prior + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": "..."},
        ]
        steps: list[str] = []
        started = time.time()
        yield "", history, "*Working...*"
        async for ev in ask(agent, message, prior):
            if ev.kind == "tool_call":
                steps.append(f"**Tool call:** `{ev.name}`\n```json\n{json.dumps(ev.args, indent=2)}\n```")
            elif ev.kind == "tool_result":
                steps.append(f"**Result from `{ev.name}`:**\n```\n{ev.text}\n```")
            elif ev.kind in ("token", "final"):
                history[-1] = {"role": "assistant", "content": ev.text or "..."}
            elif ev.kind == "error":
                history[-1] = {"role": "assistant", "content": ev.text}
                steps.append(f"**Error:** `{ev.detail}`")
            yield "", history, "\n\n".join(steps) or "*Working...*"
        steps.append(f"_Finished in {time.time() - started:.1f}s_")
        yield "", history, "\n\n".join(steps)

    with gr.Blocks(title="Portfolio agent - test console") as demo:
        gr.Markdown(
            "## Portfolio agent - test console\n"
            "Left: the conversation. Right: what the agent did (tool calls and the chunks it retrieved)."
        )
        with gr.Row():
            with gr.Column(scale=3):
                chat = gr.Chatbot(height=560, placeholder="Ask about Leo's work, pricing, projects or GitHub...")
                box = gr.Textbox(placeholder="Type a question and press Enter", show_label=False, autofocus=True)
                clear = gr.Button("Clear conversation")
            with gr.Column(scale=2):
                trace = gr.Markdown(IDLE)
        box.submit(respond, [box, chat], [box, chat, trace])
        clear.click(lambda: ([], IDLE), None, [chat, trace])
    return demo


if __name__ == "__main__":
    llm.configure_embeddings()
    build_ui(build_agent()).launch()
