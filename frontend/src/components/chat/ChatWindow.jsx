import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chatService';
import { Send, Store, MapPin, CheckCheck, Clock, User, Phone } from 'lucide-react';

export const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const shop = conversation?.shopId;
  const otherParticipant =
    user?.role === 'customer'
      ? conversation?.shopkeeperId || { name: shop?.shopName || 'Shopkeeper' }
      : conversation?.customerId || { name: 'Customer' };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  useEffect(() => {
    if (!conversation?._id) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await chatService.getMessages(conversation._id);
        if (res.success) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    loadMessages();

    // Socket Room Join
    if (socket) {
      socket.emit('join_conversation', conversation._id);

      const handleNewMessage = (newMsg) => {
        if (newMsg.conversationId === conversation._id) {
          setMessages((prev) => [...prev, newMsg]);
          setTimeout(scrollToBottom, 50);
        }
      };

      const handleUserTyping = (data) => {
        if (data.conversationId === conversation._id) {
          setIsTyping(true);
          setTypingUser(data.senderName);
        }
      };

      const handleStopTyping = (data) => {
        if (data.conversationId === conversation._id) {
          setIsTyping(false);
          setTypingUser('');
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stopped_typing', handleStopTyping);

      return () => {
        socket.emit('leave_conversation', conversation._id);
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stopped_typing', handleStopTyping);
      };
    }
  }, [conversation?._id, socket]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && conversation?._id) {
      socket.emit('typing_start', {
        conversationId: conversation._id,
        senderName: user?.name || 'Someone',
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId: conversation._id });
      }, 2000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('typing_stop', { conversationId: conversation._id });
    }

    try {
      const res = await chatService.sendMessage(conversation._id, { text: textToSend });
      if (res.success) {
        // Socket listener will add message, or add locally if socket delayed
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.message._id)) return prev;
          return [...prev, res.message];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white lg:hidden text-xs font-bold px-2"
            >
              &larr; Back
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center font-bold text-white shadow-md">
            {shop?.shopName ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>

          <div>
            <h4 className="font-bold text-sm leading-tight text-white">
              {user?.role === 'customer' ? shop?.shopName || 'Shop' : otherParticipant?.name || 'Customer'}
            </h4>
            <p className="text-[11px] text-slate-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Online • QuickKart Verified Direct Chat</span>
            </p>
          </div>
        </div>

        {shop?.contactPhone && (
          <a
            href={`tel:${shop.contactPhone}`}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-400 transition-colors"
            title="Call Shopkeeper"
          >
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Product Context Ribbon if linked */}
      {conversation?.productContext?.productName && (
        <div className="bg-brand-50 px-4 py-2 border-b border-brand-100 flex items-center justify-between text-xs text-brand-900">
          <span className="font-semibold">
            Inquiry for: <strong>{conversation.productContext.productName}</strong>
          </span>
          {conversation.productContext.price > 0 && (
            <span className="font-bold text-brand-700">
              ₹{conversation.productContext.price}
            </span>
          )}
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-1 text-xs">
            <Store className="w-8 h-8 mx-auto text-slate-300 mb-1" />
            <p className="font-bold">No messages yet</p>
            <p>Say hello to inquire about stock or schedule in-person pickup!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
            return (
              <div
                key={msg._id || Math.random()}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="text-xs text-slate-400 italic flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>{typingUser || 'Typing...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type message to shopkeeper..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
