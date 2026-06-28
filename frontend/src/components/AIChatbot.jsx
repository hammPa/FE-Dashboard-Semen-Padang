import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Expand, Shrink } from "lucide-react";

const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export default function AIChatbot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [isMin, setIsMin]         = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages]   = useState([
    { role: "assistant", content: "Halo! Saya asisten AI MAINT. Tanyakan apa saja tentang data dan performa sistem pemeliharaan Anda." }
  ]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [quota, setQuota]         = useState(null);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMin && inputRef.current) inputRef.current.focus();
  }, [isOpen, isMin]);

  useEffect(() => {
    if (!isOpen || IS_MOCK) return;
    fetch("http://localhost:3000/api/ai/quota")
      .then(r => r.json())
      .then(setQuota)
      .catch(() => {});
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    if (IS_MOCK) {
      setMessages((prev) => [...prev,
        { role: "user", content: input.trim() },
        { role: "assistant", content: "⚠️ Fitur AI tidak tersedia dalam mode demo." }
      ]);
      setInput("");
      return;
    }

    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("http://localhost:3000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Maaf, tidak ada respons.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setQuota(q => q ? { ...q, used: q.used + 1, sisa: Math.max(0, q.sisa - 1) } : null);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Terjadi kesalahan koneksi. Silakan coba lagi." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const quickQuestions = [
    "Berapa total temuan prioritas High?",
    "Apa status sinkronisasi saat ini?",
    "WO mana yang tertunda?",
  ];

  const quotaColor = !quota ? "text-blue-200"
    : quota.sisa <= 2 ? "text-red-300"
    : quota.sisa <= 5 ? "text-amber-300"
    : "text-blue-200";

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-16 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl shadow-2xl shadow-blue-900/40 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-200"
          title="Asisten AI"
        >
          <MessageSquare size={22} />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={`fixed z-50 bg-white rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200 flex flex-col transition-all duration-300 ${
          isMin
            ? "bottom-6 right-6 w-72 h-14"
            : isExpanded
            ? "bottom-6 right-6 w-[720px] h-[85vh] max-h-[85vh]"
            : "bottom-6 right-6 w-[340px] sm:w-[380px] h-[520px] max-h-[85vh]"
        }`}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-violet-600 rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Asisten MAINT AI</p>
                {!isMin && (
                  <>
                    <p className="text-xs text-blue-200 mt-0.5">Powered by Gemini</p>
                    {quota && (
                      <p className={`text-[10px] font-semibold mt-0.5 ${quotaColor}`}>
                        {quota.sisa}/{quota.limit} req tersisa menit ini
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!isMin && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  title={isExpanded ? "Perkecil" : "Perbesar"}
                >
                  {isExpanded ? <Shrink size={13} /> : <Expand size={13} />}
                </button>
              )}
              <button
                onClick={() => setIsMin(!isMin)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                title={isMin ? "Buka" : "Minimize"}
              >
                {isMin ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                title="Tutup"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMin && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={13} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gray-800 text-white rounded-tr-sm"
                        : "bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-sm prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-headings:text-sm prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1"
                    }`}
                      dangerouslySetInnerHTML={
                        msg.role === "assistant"
                          ? { __html: msg.content }
                          : undefined
                      }
                    >
                      {msg.role === "user" ? msg.content : null}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <User size={13} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <Loader2 size={16} className="text-blue-500 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick questions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-100 shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={IS_MOCK ? "Mode demo — AI tidak aktif" : "Ketik pertanyaan…"}
                    rows={1}
                    className="flex-1 resize-none px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    style={{ minHeight: "40px", maxHeight: "100px" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-300 text-center mt-1.5">
                  {IS_MOCK ? "Mode demo aktif" : "Enter untuk kirim · Shift+Enter baris baru"}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}