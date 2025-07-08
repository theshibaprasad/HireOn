import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Cookies from 'js-cookie';
import UserAvatar from './UserAvatar';
import { Dialog } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

const Chat = ({ applicationId, jobId, currentUser, chatPartner, job, company, jwtToken: propJwtToken, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [messageMenu, setMessageMenu] = useState({ open: false, msgId: null, anchor: null });
  const [deleteMenu, setDeleteMenu] = useState({ open: false, msgId: null, anchor: null });
  const messageRefs = useRef({});

  // Get JWT token from prop or cookie
  const jwtToken = propJwtToken || Cookies.get('token');

  // Determine chat header info
  let headerName = 'User';
  let headerImage = null;
  if (currentUser?.role === 'student') {
    // Show company name and logo
    const companyObj = job?.company || company || chatPartner?.company || null;
    headerName = companyObj?.name || 'Company';
    headerImage = companyObj?.logo ? (
      <img src={companyObj.logo} alt="Company Logo" className="w-10 h-10 rounded-full object-cover border" />
    ) : (
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-600">{headerName[0]}</div>
    );
  } else if (currentUser?.role === 'recruiter') {
    // Show student name and profile photo
    headerName = chatPartner?.fullname || 'Student';
    headerImage = (
      <UserAvatar src={chatPartner?.profile?.profilePhoto} name={headerName} />
    );
  }

  // Debug: log props and token
  console.log('Chat props:', { applicationId, jobId, currentUser, chatPartner, propJwtToken, cookieToken: Cookies.get('token') });

  // Fetch chat history
  useEffect(() => {
    console.log('Chat useEffect fired', { applicationId, jwtToken });
    const fetchHistory = async () => {
      setLoading(true);
      try {
        console.log('fetchHistory called', { applicationId, jwtToken });
        if (!jwtToken) {
          setError('Not authenticated. Please login again.');
          setLoading(false);
          console.log('fetchHistory: missing jwtToken');
          return;
        }
        if (!applicationId) {
          setError('No application selected.');
          setLoading(false);
          console.log('fetchHistory: missing applicationId');
          return;
        }
        const res = await axios.get(`/api/v1/chat/${applicationId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        setMessages(res.data.messages || []);
        setError(null);
        console.log('fetchHistory: success', res.data);
      } catch (err) {
        setError('Failed to load chat history');
        console.error('Chat history error:', err, err?.response);
      } finally {
        setLoading(false);
      }
    };
    if (applicationId && jwtToken) fetchHistory();
    else if (!jwtToken) setError('Not authenticated. Please login again.');
    else if (!applicationId) setError('No application selected.');
  }, [applicationId, jwtToken]);

  // Socket.io connection
  useEffect(() => {
    if (!applicationId || !jwtToken) return;
    
    // Try WebSocket first, fallback to polling for Vercel
    const socket = io(SOCKET_URL, { 
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join_application', { token: jwtToken, applicationId });
    });
    
    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
      // Fallback to polling for Vercel serverless
      if (socket.io.engine.transport.name === 'websocket') {
        socket.io.engine.transport.name = 'polling';
      }
    });
    
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    
    // Listen for message_deleted event
    socket.on('message_deleted', ({ messageId }) => {
      setMessages((prev) => prev.map(m => m._id === messageId ? { ...m, deleted: true } : m));
    });
    
    return () => {
      socket.disconnect();
    };
  }, [applicationId, jwtToken]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [messages]);

  // Clear chat handler (persistent for me only)
  const handleClearChat = async () => {
    try {
      await axios.post(`/api/v1/chat/${applicationId}/clear-for-me`, {}, { withCredentials: true });
      setMessages([]);
      setShowClearConfirm(false);
    } catch (err) {
      alert('Failed to clear chat');
    }
  };

  // Send message with reply info
  const sendMessage = () => {
    if (!input.trim()) return;
    if (!socketRef.current) return;
    socketRef.current.emit('send_message', {
      token: jwtToken,
      applicationId,
      message: input.trim(),
      replyTo: replyTo ? replyTo._id : undefined
    });
    setInput('');
    setReplyTo(null);
  };

  // Delete for me (frontend only)
  const handleDeleteForMe = (msgId) => {
    setMessages((prev) => prev.filter(m => m._id !== msgId));
    setDeleteMenu({ open: false, msgId: null, anchor: null });
  };

  // Delete for everyone (backend)
  const handleDeleteForEveryone = async (msgId) => {
    try {
      await axios.delete(`/api/v1/chat/message/${msgId}`, { withCredentials: true });
      setDeleteMenu({ open: false, msgId: null, anchor: null });
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  // Scroll to replied message
  const scrollToMessage = (msgId) => {
    const el = messageRefs.current[msgId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-gray-300', 'dark:bg-gray-700', 'transition-colors');
      setTimeout(() => {
        el.classList.remove('bg-gray-300', 'dark:bg-gray-700', 'transition-colors');
      }, 1500);
    }
  };

  if (loading) return <div className="p-4">Loading chat...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-[600px] w-full max-w-xl bg-white dark:bg-gray-900 border rounded-xl shadow-lg">
      <div className="flex items-center justify-between p-3 border-b dark:border-gray-800 bg-gray-100 dark:bg-gray-800 rounded-t-xl">
        <div className="flex items-center gap-3">
          {headerImage}
          <div className="font-semibold text-lg">Chat with {headerName}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="destructive" onClick={() => setShowClearConfirm(true)}>Clear Chat</Button>
          {onClose && <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <div className="text-gray-500 text-center">No messages yet.</div>}
        {messages.map((msg) => {
          let senderId = '';
          if (msg.sender && typeof msg.sender === 'object' && msg.sender._id) {
            senderId = msg.sender._id.toString();
          } else if (typeof msg.sender === 'string') {
            senderId = msg.sender;
          }
          const userId = currentUser?._id || currentUser?.id;
          const isCurrentUser = senderId?.toString() === userId?.toString();
          // Debug log
          console.log('DEBUG:', {
            senderId,
            userId,
            isCurrentUser,
            msg
          });
          const repliedMsg = msg.replyTo ? messages.find(m => m._id === msg.replyTo) : null;
          return (
            <div key={msg._id} ref={el => messageRefs.current[msg._id] = el} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              style={{ position: 'relative' }}
            >
              <Popover open={messageMenu.open && messageMenu.msgId === msg._id} onOpenChange={open => setMessageMenu({ open, msgId: open ? msg._id : null, anchor: null })}>
                <PopoverTrigger asChild>
                  <div
                    className={`px-3 py-2 rounded-lg max-w-xs break-words text-sm cursor-pointer ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-100'}`}
                    onClick={e => setMessageMenu({ open: true, msgId: msg._id, anchor: e.currentTarget })}
                  >
                    {/* WhatsApp-style reply context at the top of the bubble */}
                    {msg.replyTo && (
                      <div className="mb-1">
                        <div
                          className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 border-l-4 border-purple-400 whitespace-pre-line cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition outline-none"
                          onClick={() => {
                            const repliedMsg = messages.find(m => m._id === msg.replyTo);
                            if (repliedMsg) scrollToMessage(repliedMsg._id);
                          }}
                          tabIndex={0}
                          aria-label="Jump to original message"
                          title="Click to jump to original message"
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              const repliedMsg = messages.find(m => m._id === msg.replyTo);
                              if (repliedMsg) scrollToMessage(repliedMsg._id);
                            }
                          }}
                        >
                          {(() => {
                            const repliedMsg = messages.find(m => m._id === msg.replyTo);
                            if (!repliedMsg) return <i>Original message not found</i>;
                            return repliedMsg.deleted ? <i>This message was deleted</i> : repliedMsg.message;
                          })()}
                        </div>
                      </div>
                    )}
                    {/* Main message content or deleted notice */}
                    {msg.deleted ? (
                      <div className={`italic text-center ${isCurrentUser ? 'text-white' : 'text-gray-500'}`}>This message was deleted</div>
                    ) : (
                      <>
                        {msg.message}
                        <div className="text-xs text-right mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-32">
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setReplyTo(msg); setMessageMenu({ open: false, msgId: null, anchor: null }); }}>Reply</Button>
                    <Button size="sm" variant="destructive" onClick={() => { setDeleteMenu({ open: true, msgId: msg._id, anchor: null }); setMessageMenu({ open: false, msgId: null, anchor: null }); }}>Delete</Button>
                  </div>
                </PopoverContent>
              </Popover>
              {/* Delete menu */}
              {deleteMenu.open && deleteMenu.msgId === msg._id && (
                <div className={`absolute z-50 top-8 ${isCurrentUser ? 'right-0' : 'left-0'} bg-white dark:bg-gray-800 border rounded shadow p-2 flex flex-col gap-1`}>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteForMe(msg._id)}>Delete for me</Button>
                  {isCurrentUser && <Button size="sm" variant="destructive" onClick={() => handleDeleteForEveryone(msg._id)}>Delete for everyone</Button>}
                  <Button size="sm" variant="ghost" onClick={() => setDeleteMenu({ open: false, msgId: null, anchor: null })}>Cancel</Button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Reply context */}
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-t border-b dark:border-gray-700">
          <div className="text-xs text-gray-700 dark:text-gray-200">Replying to:</div>
          <div className="text-xs italic text-gray-600 dark:text-gray-300 truncate max-w-xs">{replyTo.message}</div>
          <Button size="xs" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button>
        </div>
      )}
      <div className="flex items-center p-3 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
        <Input
          className="flex-1 mr-2"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <Button onClick={sendMessage} disabled={!input.trim()}>Send</Button>
      </div>
      {/* Clear chat confirmation dialog */}
      {showClearConfirm && (
        <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-sm w-full">
              <div className="font-semibold mb-4">Clear Chat</div>
              <div className="mb-4 text-gray-700 dark:text-gray-200">Are you sure you want to clear all messages in this chat?</div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleClearChat}>Clear</Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Chat; 