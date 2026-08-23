import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Shop from '../models/Shop.js';

// @desc    Get all conversations for logged in user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('shopId', 'shopName bannerImage location address')
      .populate('customerId', 'name profileImage')
      .populate('shopkeeperId', 'name profileImage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create a conversation thread (Contextual)
// @route   POST /api/chat/conversations
// @access  Private
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { shopId, requestId, reservationId, productName, price } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    let customerId, shopkeeperId;
    if (req.user.role === 'customer') {
      customerId = req.user._id;
      shopkeeperId = shop.ownerId;
    } else {
      shopkeeperId = req.user._id;
      customerId = req.body.customerId;
    }

    let conversation = await Conversation.findOne({
      customerId,
      shopkeeperId,
      shopId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [customerId, shopkeeperId],
        customerId,
        shopkeeperId,
        shopId,
        requestId: requestId || null,
        reservationId: reservationId || null,
        productContext: {
          productName: productName || 'Product Inquiry',
          price: price || 0,
        },
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('shopId', 'shopName bannerImage location address contactPhone')
      .populate('customerId', 'name profileImage')
      .populate('shopkeeperId', 'name profileImage');

    res.status(200).json({
      success: true,
      conversation: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this chat' });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversationId: conversation._id,
        senderId: { $ne: req.user._id },
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { text, attachments } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      senderRole: req.user.role,
      text,
      attachments: attachments || [],
    });

    conversation.lastMessage = {
      text,
      senderId: req.user._id,
      createdAt: new Date(),
      isRead: false,
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name profileImage');

    // Notify recipient
    const recipientId = conversation.participants.find(p => p.toString() !== req.user._id.toString());
    if (recipientId) {
      const io = req.app.get('io');
      if (io) {
        io.to(`conversation_${conversation._id}`).emit('new_message', populatedMessage);
        io.to(`user_${recipientId}`).emit('chat_notification', {
          conversationId: conversation._id,
          senderName: req.user.name,
          text,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
