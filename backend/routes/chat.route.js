import express from 'express';
import isAuthenticated, { canChatOnApplication } from '../middlewares/isAuthenticated.js';
import { getChatHistory, getChatEnabledApplications, clearChatHistory, deleteMessage, clearChatForMe } from '../controllers/chat.controller.js';

const router = express.Router();

// Get chat history for an application
router.get('/:applicationId', isAuthenticated, canChatOnApplication, getChatHistory);

// List all chat-enabled applications for the user
router.get('/enabled', isAuthenticated, getChatEnabledApplications);

// Clear all chat messages for an application
router.delete('/:applicationId', isAuthenticated, canChatOnApplication, clearChatHistory);

// Delete a single message by ID
router.delete('/message/:messageId', isAuthenticated, deleteMessage);

// Persistent clear chat for me
router.post('/:applicationId/clear-for-me', isAuthenticated, clearChatForMe);

export default router; 