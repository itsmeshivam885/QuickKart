import { supabase } from '../config/supabase.js';

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
export const getUserConversations = async (req, res, next) => {
  try {
    res.json({
      success: true,
      conversations: [
        {
          _id: 'conv_1',
          id: 'conv_1',
          shop: {
            _id: 'b0000000-0000-0000-0000-000000000001',
            shopName: 'Sharma Hardware & Sanitation Store',
            contactPhone: '+91 9876543210',
          },
          lastMessage: {
            text: 'Yes, 1-inch Finolex pipes are ready at our counter!',
            createdAt: new Date().toISOString(),
          },
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create conversation
// @route   POST /api/chat/conversations
// @access  Private
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { shopId } = req.body;
    res.json({
      success: true,
      conversation: {
        _id: 'conv_1',
        id: 'conv_1',
        shop: {
          _id: shopId || 'b0000000-0000-0000-0000-000000000001',
          shopName: 'Sharma Hardware & Sanitation Store',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req, res, next) => {
  try {
    res.json({
      success: true,
      messages: [
        {
          _id: 'msg_1',
          sender: { name: 'Ramesh Sharma' },
          text: 'Hello! Welcome to Sharma Hardware. How can we help you today?',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const msg = {
      _id: 'msg_' + Date.now(),
      sender: { name: 'Rahul Sharma' },
      text,
      createdAt: new Date().toISOString(),
    };

    const io = req.app.get('io');
    if (io) {
      io.emit('chat_notification', {
        senderName: 'Rahul Sharma',
        text,
      });
    }

    res.status(201).json({
      success: true,
      message: msg,
    });
  } catch (error) {
    next(error);
  }
};
