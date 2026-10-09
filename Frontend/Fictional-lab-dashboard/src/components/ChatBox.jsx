import { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";
import { formatRevenue } from "../format.js";
import { BarChart } from "./charts/BarChart.jsx";
import { LineChart } from "./charts/LineChart.jsx";
import { PieChart } from "./charts/PieChart.jsx";

const GREETING = {
  from: "assistant",
  text: "Ask a question about the sales data, e.g. “revenue by state” or “top products in apparel”.",
};

// Draws the chart described by a chat reply: { type, title, format, ...data }.
function ReplyChart({ chart }) {
  const formatValue = chart.format === "revenue" ? formatRevenue : undefined;
  return (
    <figure className="chat__chart">
      <figcaption>{chart.title}</figcaption>
      {chart.type === "line" && (
        <LineChart labels={chart.labels} series={chart.series} height={170} formatValue={formatValue} ariaLabel={chart.title} />
      )}
      {chart.type === "bar" && <BarChart data={chart.data} height={170} formatValue={formatValue} ariaLabel={chart.title} />}
      {chart.type === "pie" && <PieChart donut data={chart.data} ariaLabel={chart.title} />}
    </figure>
  );
}

// Floating question box. `context` is what the page is showing (range,
// category, state) so "how many customers?" is answered for the current view.
// It stays mounted while closed so the conversation survives reopening.
export function ChatBox({ open, onClose, context }) {
  const [messages, setMessages] = useState([GREETING]);
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, waiting, open]);

  const submit = async (e) => {
    e.preventDefault();
    const question = draft.trim();
    if (!question || waiting) return;
    setDraft("");
    setMessages((list) => [...list, { from: "user", text: question }]);
    setWaiting(true);
    try {
      const reply = await api.askChat(question, context);
      setMessages((list) => [...list, { from: "assistant", ...reply }]);
    } catch (err) {
      setMessages((list) => [...list, { from: "assistant", error: true, text: err.message || "Something went wrong" }]);
    } finally {
      setWaiting(false);
    }
  };

  return (
    <section
      className="chat"
      aria-label="Ask about the data"
      hidden={!open}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <header className="chat__head">
        <h2>Ask about the data</h2>
        <button type="button" className="chat__close" aria-label="Close chat" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="chat__messages" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`chat__message chat__message--${m.from} ${m.error ? "is-error" : ""}`}>
            <p>{m.text}</p>
            {m.chart && <ReplyChart chart={m.chart} />}
          </div>
        ))}
        {waiting && <p className="chat__waiting">Thinking…</p>}
        <div ref={endRef} />
      </div>
      <form className="chat__form" onSubmit={submit}>
        <input
          ref={inputRef}
          className="input"
          aria-label="Your question"
          placeholder="Type a question"
          maxLength={500}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="button button--outline" disabled={waiting || !draft.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
