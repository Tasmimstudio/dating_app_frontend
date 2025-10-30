// src/pages/Messages.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import MessageSkeleton from '../components/MessageSkeleton';
import './Messages.css';

function Messages() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [otherUserPhoto, setOtherUserPhoto] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Popular emojis
  const emojis = [
    '❤️', '😊', '😂', '🥰', '😍', '😘', '💕', '💖', '💗', '💙',
    '😭', '🥺', '😢', '🤗', '🤔', '👍', '👋', '🙏', '💪', '🎉',
    '🔥', '✨', '⭐', '💫', '🌟', '☀️', '🌙', '💐', '🌹', '🌺',
    '😎', '🤩', '😜', '😇', '🥳', '😴', '🤤', '😋', '🤪', '😏',
    '👀', '💯', '✅', '❌', '💔', '🙈', '🙊', '🙉', '🎂', '🍕'
  ];

  useEffect(() => {
    if (userId) {
      fetchOtherUser();
      fetchMessages();
      connectWebSocket();
      startPolling(); // Start polling as fallback
    }
    fetchCurrentUserProfile();

    return () => {
      disconnectWebSocket();
      stopPolling();
    };
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) return;

    const wsUrl = `ws://localhost:8000/ws/${currentUser.user_id}?token=${token}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        if (data.sender_id === userId || data.receiver_id === userId) {
          setMessages((prev) => [...prev, data]);

          if (data.sender_id === userId) {
            markMessagesAsRead([data.message_id]);
          }
        }
      } else if (data.type === 'typing_status') {
        if (data.user_id === userId) {
          setIsTyping(data.is_typing);
        }
      } else if (data.type === 'user_status') {
        if (data.user_id === userId) {
          setIsOnline(data.status === 'online');
        }
      } else if (data.type === 'read_receipt') {
        setMessages((prev) =>
          prev.map((msg) =>
            data.message_ids.includes(msg.message_id)
              ? { ...msg, is_read: true, read_at: data.read_at }
              : msg
          )
        );
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const startPolling = () => {
    // Poll for new messages every 3 seconds as a fallback
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const markMessagesAsRead = async (messageIds) => {
    try {
      await api.post(`/messages/${currentUser.user_id}/mark-conversation-read/${userId}`);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'read_receipt',
          receiver_id: userId,
          message_ids: messageIds
        }));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCurrentUserProfile = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUserProfile(user);
  };

  const fetchOtherUser = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setOtherUser(response.data);

      // Fetch other user's photo
      try {
        const photoResponse = await api.get(`/photos/user/${userId}`);
        const photos = photoResponse.data.photos || [];
        const primaryPhoto = photos.find(p => p.is_primary);
        if (primaryPhoto) {
          setOtherUserPhoto(primaryPhoto.url);
        }
      } catch (photoError) {
        console.error('Error fetching other user photo:', photoError);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${currentUser.user_id}/${userId}`);
      console.log('Fetched messages:', response.data);
      if (response.data && response.data.length > 0) {
        console.log('Sample timestamp:', response.data[0].sent_at || response.data[0].created_at);
        console.log('Parsed date:', new Date(response.data[0].sent_at || response.data[0].created_at));
      }
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/messages/', {
        sender_id: currentUser.user_id,
        receiver_id: userId,
        content: newMessage,
      });

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'message',
          receiver_id: userId,
          content: newMessage,
          message_id: response.data.message_id
        }));
      }

      setNewMessage('');
      handleTyping(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Make sure you are matched with this user.');
    }
  };

  const handleTyping = (typing) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        receiver_id: userId,
        is_typing: typing
      }));
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    handleTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 2000);
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleReport = () => {
    setShowMenu(false);
    // Implement report functionality
    alert('Report user functionality');
  };

  const handleBlock = () => {
    setShowMenu(false);
    // Implement block functionality
    alert('Block user functionality');
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    // Parse timestamp - handle both ISO strings and timestamps
    let messageDate;
    if (typeof timestamp === 'string') {
      // If timestamp doesn't have timezone info, treat it as UTC
      if (!timestamp.includes('Z') && !timestamp.includes('+')) {
        messageDate = new Date(timestamp + 'Z');
      } else {
        messageDate = new Date(timestamp);
      }
    } else {
      messageDate = new Date(timestamp);
    }

    const now = new Date();

    // Calculate time difference
    const diffInMs = now - messageDate;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    // Get device's locale for consistent formatting
    const userLocale = navigator.language || 'en-US';

    // Format time using device's locale and timezone
    const timeString = messageDate.toLocaleTimeString(userLocale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // If message is from today, just show time
    const isToday = messageDate.toDateString() === now.toDateString();
    if (isToday) {
      return timeString;
    }

    // If message is from yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    if (isYesterday) {
      return `Yesterday ${timeString}`;
    }

    // If message is from this week (within last 7 days)
    if (diffInDays < 7) {
      const dayName = messageDate.toLocaleDateString(userLocale, { weekday: 'short' });
      return `${dayName} ${timeString}`;
    }

    // For older messages, show full date with device locale
    const dateString = messageDate.toLocaleDateString(userLocale, {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    return `${dateString} ${timeString}`;
  };

  if (loading) {
    return (
      <div className="chat-page">
        <header className="chat-header">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="home-btn" title="Home">
              🏠
            </button>
            <div className="profile-avatar" onClick={() => navigate(`/profile/${userId}`)}>
              {otherUserPhoto ? (
                <img
                  src={otherUserPhoto.startsWith('http')
                    ? otherUserPhoto
                    : `http://localhost:8002${otherUserPhoto}`}
                  alt={otherUser?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                otherUser?.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <h1 className="match-name">
              {otherUser?.name || 'Loading...'}
            </h1>
          </div>
          <div className="header-right">
            <button
              className="back-to-matches-btn"
              onClick={() => navigate('/matches')}
            >
              ← Matches
            </button>
          </div>
        </header>

        <div className="chat-area">
          <MessageSkeleton />
        </div>

        <form className="message-input-bar">
          <input
            type="text"
            placeholder="Loading chat..."
            className="message-input"
            disabled
          />
          <button type="submit" className="send-btn" disabled>
            <span>➤</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="home-btn" title="Home">
            🏠
          </button>
          <div className="profile-avatar" onClick={() => navigate(`/profile/${userId}`)}>
            {otherUserPhoto ? (
              <img
                src={otherUserPhoto.startsWith('http')
                  ? otherUserPhoto
                  : `http://localhost:8002${otherUserPhoto}`}
                alt={otherUser?.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              otherUser?.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <div className="user-info-header">
            <h1
              className="match-name"
              onClick={() => navigate(`/profile/${userId}`)}
            >
              {otherUser?.name || 'User'}
            </h1>
            {isOnline && <span className="online-indicator">● Online</span>}
          </div>
        </div>
        <div className="header-right">
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            ⋮
          </button>
          <button
            className="back-to-matches-btn"
            onClick={() => navigate('/matches')}
          >
            ← Matches
          </button>

          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={handleReport}>
                <span>🚨</span> Report
              </button>
              <button onClick={handleBlock} className="menu-block">
                <span>🚫</span> Block
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="chat-area">
        {messages.length > 0 ? (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={msg.message_id || index}
                className={`message ${
                  msg.sender_id === currentUser.user_id ? 'sent' : 'received'
                }`}
              >
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  {msg.sender_id === currentUser.user_id && msg.is_read && (
                    <span className="read-receipt">✓✓</span>
                  )}
                </div>
                <span className="message-timestamp">
                  {formatTimestamp(msg.sent_at || msg.created_at)}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-bubble">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="empty-chat-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      <form className="message-input-bar" onSubmit={handleSendMessage}>
        {showEmojiPicker && (
          <div className="emoji-picker">
            <div className="emoji-grid">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className="emoji-btn"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          className="emoji-toggle-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Add emoji"
        >
          😊
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="message-input"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!newMessage.trim()}
        >
          <span>➤</span>
        </button>
      </form>
    </div>
  );
}

export default Messages;
