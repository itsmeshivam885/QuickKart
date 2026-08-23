import React, { useState, useEffect } from 'react';
import { chatService } from '../../services/chatService';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { MessageSquare, User, Store, RefreshCw } from 'lucide-react';

export const ShopMessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await chatService.getConversations();
      if (res.success) {
        setConversations(res.conversations);
        if (res.conversations.length > 0 && !activeConversation) {
          setActiveConversation(res.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Customer Direct Chat</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Customer Inquiries & Messages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chat with nearby customers asking about products and pickup schedules.
          </p>
        </div>

        <button
          onClick={fetchConversations}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 space-y-2">
          <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading messages...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active customer chats</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When customers message you from your store page or a quote, conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Conversation list */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Chats ({conversations.length})
            </h3>

            <div className="space-y-2">
              {conversations.map((conv) => {
                const isSelected = activeConversation?._id === conv._id;
                const customer = conv.customerId;

                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {customer?.name || 'Customer'}
                        </h4>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {conv.productContext?.productName && (
                        <p className="text-[11px] text-brand-600 font-semibold truncate mt-0.5">
                          Inquiry: {conv.productContext.productName}
                        </p>
                      )}

                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {conv.lastMessage?.text || 'New inquiry'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat pane */}
          <div className="lg:col-span-8">
            {activeConversation ? (
              <ChatWindow
                conversation={activeConversation}
                onBack={() => setActiveConversation(null)}
              />
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                Select a chat conversation from the left to reply to customers.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
