import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  Bot,
  User,
  Send,
  Plus,
  Trash2,
  Loader2,
  MessageSquare
} from 'lucide-react';

export const AssistantPage = () => {
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Plant Context
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState('');

  const chatBottomRef = useRef(null);

  const suggestedQuestions = [
    "How do I treat powdery mildew organically?",
    "Why are my tomato leaves turning yellow?",
    "How often should I water my indoor plants?",
    "How do I eliminate aphids without harsh chemicals?"
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const [sessList, plantList] = await Promise.all([
          api.chat.getSessions().catch(() => []),
          api.plants.getAll().catch(() => [])
        ]);
        setSessions(sessList || []);
        setPlants(plantList || []);

        if (sessList && sessList.length > 0) {
          selectSession(sessList[0].id);
        } else {
          startNewSession();
        }

        if (location.state?.plantContext) {
          setInputMessage(`What treatment do you recommend for: ${location.state.plantContext}?`);
        }
      } catch (err) {
        console.error("Init error:", err);
      }
    };

    init();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I am your PlantCare AI Agronomy Assistant. Ask me anything about plant diseases, organic remedies, soil health, watering regimens, or pest prevention."
      }
    ]);
  };

  const selectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setLoadingHistory(true);
    try {
      const data = await api.chat.getSession(sessionId);
      if (data && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Session load error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await api.chat.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        startNewSession();
      }
    } catch (err) {
      alert("Failed to delete chat: " + err.message);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const text = customText || inputMessage;
    if (!text.trim() || sending) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await api.chat.sendMessage(
        text,
        currentSessionId,
        selectedPlantId ? parseInt(selectedPlantId) : null
      );

      const botMsg = {
        id: response.assistant_message_id || Date.now() + 1,
        role: 'assistant',
        content: response.reply
      };
      setMessages(prev => [...prev, botMsg]);

      if (!currentSessionId && response.session_id) {
        setCurrentSessionId(response.session_id);
        const updated = await api.chat.getSessions();
        setSessions(updated);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 2, role: 'assistant', content: `⚠️ Could not reach Gemini Assistant: ${err.message}` }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-5.5rem)] flex flex-col md:flex-row gap-5 animate-in fade-in duration-150">
      
      {/* Sessions Sidebar */}
      <div className="w-full md:w-64 shrink-0 clean-card p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Conversations
            </span>
            <button
              type="button"
              onClick={startNewSession}
              className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 max-h-[55vh] overflow-y-auto">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`p-2 rounded-lg cursor-pointer text-xs font-medium flex items-center justify-between group transition-colors ${
                  currentSessionId === s.id
                    ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <span className="truncate pr-2">{s.title || "Chat"}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-[11px] text-gray-400 py-2 text-center">No past chats.</p>
            )}
          </div>
        </div>

        {/* Plant Context Dropdown */}
        {plants.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-emerald-900/60 space-y-1">
            <label className="text-[10px] uppercase font-semibold text-gray-400 block">
              Plant Context
            </label>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-gray-200"
            >
              <option value="">General Agriculture</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 clean-card flex flex-col overflow-hidden">
        
        {/* Chat Top Bar */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-gray-900 dark:text-white">
                Agronomy Assistant
              </h2>
              <span className="text-[10px] text-gray-400">Powered by Google Gemini</span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {loadingHistory ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] ${
                      isUser ? 'bg-gray-700' : 'bg-emerald-600'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-xl max-w-xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-50 dark:bg-emerald-950/40 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-emerald-900/60 whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex items-center gap-2 text-xs text-gray-400 pl-8">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Gemini is thinking...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Queries */}
        {messages.length <= 2 && (
          <div className="px-5 pb-2 flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, qi) => (
              <button
                key={qi}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-gray-200 dark:border-emerald-800 hover:border-emerald-500 text-gray-600 dark:text-gray-300 transition-colors text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <div className="p-3 border-t border-gray-100 dark:border-emerald-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about plant diseases, soil care, watering..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900/30 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="btn-primary p-2.5 text-xs disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
