import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Plus,
  Trash2,
  Sprout,
  AlertTriangle,
  HelpCircle,
  Loader2,
  MessageSquare
} from 'lucide-react';

export const AssistantPage = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Optional Plant Context
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState('');

  const chatBottomRef = useRef(null);

  const suggestedPrompts = [
    "How do I treat powdery mildew organically on squashes and tomatoes?",
    "Why are my plant leaves turning yellow while veins remain green?",
    "What is the best watering and fertilizer schedule for container crops?",
    "How can I eliminate spider mites and aphids without harsh synthetic pesticides?",
    "Which companion plants repel pests naturally in an organic vegetable patch?"
  ];

  // Load chat sessions & plants
  useEffect(() => {
    const initData = async () => {
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

        // If came with plantContext from Analysis page
        if (location.state?.plantContext) {
          setInputMessage(`Can you explain the recommended treatment plan for: ${location.state.plantContext}?`);
        }
      } catch (err) {
        console.error("Assistant init failed:", err);
      }
    };

    initData();
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
        content: "Hello! I am your PlantCare AI Agronomy Assistant, powered by Google Gemini. Ask me anything about plant diseases, organic remedies, soil amendments, watering regimens, or pest prevention!"
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
      console.error("Failed to load session:", err);
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
      alert("Failed to delete conversation: " + err.message);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || sending) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text
    };

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

      // If new session was created on backend
      if (!currentSessionId && response.session_id) {
        setCurrentSessionId(response.session_id);
        const updatedSessions = await api.chat.getSessions();
        setSessions(updatedSessions);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          content: `⚠️ Error contacting Gemini Assistant: ${err.message || 'Please check your internet connection or backend API key.'}`
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-300">
      
      {/* Sessions Sidebar */}
      <div className="w-full md:w-72 shrink-0 glass-panel rounded-3xl border border-emerald-100 dark:border-emerald-900/60 p-4 flex flex-col justify-between shadow-xs hidden md:flex">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Agronomy Chats</span>
            </h2>
            <button
              onClick={startNewSession}
              className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
              title="New Conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Session List */}
          <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`p-2.5 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-between group transition-all ${
                  currentSessionId === s.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                }`}
              >
                <span className="truncate pr-2">{s.title || "Plant Conversation"}</span>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-300 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-[11px] text-gray-400 py-3 text-center">
                No past chat history yet.
              </p>
            )}
          </div>
        </div>

        {/* Plant Context Selector */}
        {plants.length > 0 && (
          <div className="pt-3 border-t border-gray-100 dark:border-emerald-900/60 space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Active Plant Context
            </label>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="w-full text-xs font-semibold p-2 rounded-xl border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-800 dark:text-white"
            >
              <option value="">General Agriculture Q&A</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species || p.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 glass-panel rounded-3xl border border-emerald-100 dark:border-emerald-900/60 flex flex-col shadow-lg overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-emerald-900/60 flex items-center justify-between bg-white/50 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>PlantCare AI Assistant</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Crop Pathology • Soil Amendments • Integrated Pest Management
              </p>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs text-gray-400">Loading conversation history...</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || idx}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in duration-200`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                      isUser ? 'bg-emerald-700' : 'bg-emerald-600 shadow-sm'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white dark:bg-emerald-950/60 text-gray-800 dark:text-gray-100 border border-emerald-100 dark:border-emerald-900/60 rounded-tl-xs shadow-xs whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 rounded-tl-xs flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Consulting Gemini agronomy knowledge base...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Queries Bar if few messages */}
        {messages.length <= 2 && (
          <div className="px-6 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
              Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((p, pi) => (
                <button
                  key={pi}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="p-4 border-t border-gray-100 dark:border-emerald-900/60 bg-white/60 dark:bg-emerald-950/60">
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
              placeholder="Ask about leaf yellowing, organic treatments, watering, or fertilizers..."
              className="flex-1 text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl border border-gray-200 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-2">
            *Agricultural Disclaimer: Guidance provided by AI is educational. Always follow manufacturer chemical labels and regional agricultural extension safety protocols.
          </p>
        </div>

      </div>

    </div>
  );
};
