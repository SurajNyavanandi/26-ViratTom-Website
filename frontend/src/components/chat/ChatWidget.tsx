import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, MessageSquare, X, Send, Sparkles, RotateCcw, ArrowRight, Bot, User } from 'lucide-react';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/Button';
import { getWhatsAppUrl } from '@/lib/utils';
import type { ChatMessage } from '@/types';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! How can I help you with your project today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      const replyText = data?.reply || "How can I help you with your project today?";

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.warn('Chat request fallback:', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: "We build custom websites and mobile apps with a 20% advance milestone model. Feel free to ask any question or submit your project via the homepage form.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        text: "Hi! How can I help you today? Feel free to ask any question.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {isOpen ? (
        <div 
          className="flex flex-col w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-2xl border border-apple-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-label="VIRATTOM Assistant Chat"
        >
          {/* Minimal Clean Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-apple-gray-100/90 border-b border-apple-gray-200 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-apple-blue flex items-center justify-center text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-[14px] text-apple-black">
                <span className="uppercase tracking-wider">VI<span className="text-apple-blue">R</span><span className="text-apple-blue">A</span>T TO<span className="text-apple-blue">M</span></span> Assistant
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={handleReset} 
                title="Restart conversation"
                className="p-1.5 rounded-lg text-apple-gray-400 hover:text-apple-black hover:bg-apple-gray-200/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                title="Close chat"
                className="p-1.5 rounded-lg text-apple-gray-400 hover:text-apple-black hover:bg-apple-gray-200/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-apple-gray-50/50 text-[14px]">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-apple-blue/10 text-apple-blue flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl p-3 space-y-1 ${
                  m.role === 'user' 
                    ? 'bg-apple-blue text-white rounded-tr-xs shadow-xs' 
                    : 'bg-white text-apple-black border border-apple-gray-200/70 rounded-tl-xs shadow-2xs'
                }`}>
                  <div className={`markdown-body text-[13.5px] leading-relaxed break-words ${
                    m.role === 'user' ? 'text-white' : ''
                  }`}>
                    <Markdown>{m.text}</Markdown>
                  </div>
                  <div className={`text-[10px] text-right font-medium ${
                    m.role === 'user' ? 'text-white/70' : 'text-apple-gray-400'
                  }`}>
                    {m.timestamp}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="h-7 w-7 rounded-lg bg-apple-gray-200 text-apple-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="h-7 w-7 rounded-lg bg-apple-blue/10 text-apple-blue flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white border border-apple-gray-200/70 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-apple-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-apple-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-apple-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-apple-gray-200 bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input 
                ref={inputRef}
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..." 
                disabled={isLoading}
                className="flex-1 rounded-xl border border-apple-gray-300 bg-apple-gray-100/80 px-3.5 py-2.5 text-[13.5px] text-apple-black focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all disabled:opacity-50 placeholder:text-apple-gray-400" 
              />
              <Button 
                type="submit"
                disabled={!input.trim() || isLoading}
                size="sm"
                className="h-10 w-10 p-0 rounded-xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-[10px] text-apple-gray-400">
                Press Enter to send
              </span>
              <a 
                href="#contact" 
                onClick={() => setIsOpen(false)}
                className="text-[10px] text-apple-blue hover:underline font-medium flex items-center gap-0.5"
              >
                Start a project <ArrowRight className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-apple-gray-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="h-10 w-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-xs"
            aria-label="WhatsApp"
            title="WhatsApp Quick Contact"
          >
            <MessageSquare className="h-4.5 w-4.5" />
          </a>
          <button 
            onClick={() => setIsOpen(true)}
            className="h-10 px-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-medium flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
            aria-label="Chat with Assistant"
            title="Chat with AI Assistant"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">Assistant</span>
          </button>
        </div>
      )}
    </div>
  );
};
