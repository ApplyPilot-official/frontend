"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

function getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

interface HelpMsg {
    _id: string;
    senderType: string;
    messageText: string;
    attachmentUrl?: string;
    createdAt: string;
}

interface HelpDeskPanelProps {
    onUnreadChange?: (count: number) => void;
}

export default function HelpDeskPanel({ onUnreadChange }: HelpDeskPanelProps) {
    const [messages, setMessages] = useState<HelpMsg[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch("/api/helpdesk", { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
                onUnreadChange?.(0);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [onUnreadChange]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch("/api/helpdesk", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ messageText: input }),
            });
            if (res.ok) {
                const { message } = await res.json();
                setMessages(prev => [...prev, message]);
                setInput("");
            }
        } catch { /* ignore */ }
        finally { setSending(false); }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
            style={{ height: "calc(100vh - 16rem)" }}
        >
            <h2 className="text-xl font-bold text-surface-950 mb-4">🎫 Help Desk</h2>
            <div className="flex-1 bg-white rounded-2xl border border-surface-300 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-surface-600">No messages yet. Send a message to get started!</p>
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg._id} className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${msg.senderType === "user"
                                ? "bg-primary-500/20 text-primary-800 rounded-br-md"
                                : "bg-surface-100 text-surface-700 rounded-bl-md"
                                }`}>
                                <p className="whitespace-pre-wrap">{msg.messageText}</p>
                                {msg.attachmentUrl && (
                                    <a href={msg.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-500 underline mt-1 block">
                                        📎 Attachment
                                    </a>
                                )}
                                <p className="text-[10px] text-surface-500 mt-1.5">
                                    {new Date(msg.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                {/* Input */}
                <div className="p-3 border-t border-surface-300">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-surface-950 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={sending || !input.trim()}
                            className="px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-primary-500/15 transition-all"
                        >
                            {sending ? "..." : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
