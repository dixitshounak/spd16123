import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react";
import { useGemini } from "../../hooks/useGemini";

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    <div className="typing-dot" />
    <div className="typing-dot" />
    <div className="typing-dot" />
  </div>
);

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm ${
          isUser ? "bg-accent" : "bg-primary"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-accent text-white rounded-tr-sm"
            : "bg-slate-100 text-primary rounded-tl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

const ChatWindow = ({ tripContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm your AI travel assistant 🌍 Ask me anything about your trip to ${tripContext?.destination || "this destination"}!`,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { sendChatMessage } = useGemini();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Build history (exclude system message)
      const history = messages.filter((m) => m.content !== messages[0].content || messages.indexOf(m) !== 0);
      const response = await sendChatMessage(text, tripContext, history);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-dark text-white shadow-glow flex items-center justify-center"
        aria-label="Open AI Chat"
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <MessageCircle size={22} />
        <span className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white" />
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-primary to-primary-light">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Trip AI Assistant</p>
                  <p className="text-xs text-white/60">Ask about your itinerary</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your trip..."
                  rows={1}
                  className="flex-1 resize-none input py-2.5 text-sm max-h-24"
                  style={{ minHeight: "40px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition-colors disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWindow;
