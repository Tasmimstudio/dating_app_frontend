// src/context/WebSocketContext.jsx
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map()); // Map of userId -> isTyping
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      console.warn('No user or token found, skipping WebSocket connection');
      return;
    }

    try {
      const ws = new WebSocket(
        `ws://localhost:8002/ws/${user.user_id}?token=${token}`
      );

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          switch (data.type) {
            case 'connection':
              console.log('Connection confirmed:', data);
              break;

            case 'message':
              // New message received
              setMessages((prev) => [...prev, data]);
              break;

            case 'user_status':
              // User online/offline status
              if (data.status === 'online') {
                setOnlineUsers((prev) => new Set([...prev, data.user_id]));
              } else {
                setOnlineUsers((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(data.user_id);
                  return newSet;
                });
              }
              break;

            case 'typing_status':
              // Typing indicator
              setTypingUsers((prev) => {
                const newMap = new Map(prev);
                if (data.is_typing) {
                  newMap.set(data.user_id, true);
                } else {
                  newMap.delete(data.user_id);
                }
                return newMap;
              });
              break;

            case 'read_receipt':
              // Message read receipt
              console.log('Messages read:', data);
              break;

            case 'pong':
              // Keep-alive pong response
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      setSocket(ws);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const sendMessage = useCallback((receiverId, content, messageId) => {
    if (socket && isConnected) {
      const message = {
        type: 'message',
        receiver_id: receiverId,
        content: content,
        message_id: messageId
      };
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket, isConnected]);

  const sendTypingStatus = useCallback((receiverId, isTyping) => {
    if (socket && isConnected) {
      const message = {
        type: 'typing',
        receiver_id: receiverId,
        is_typing: isTyping
      };
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  const sendReadReceipt = useCallback((receiverId, messageIds) => {
    if (socket && isConnected) {
      const message = {
        type: 'read_receipt',
        receiver_id: receiverId,
        message_ids: messageIds
      };
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Ping/pong keep-alive
  useEffect(() => {
    if (!socket || !isConnected) return;

    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(interval);
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    sendTypingStatus,
    sendReadReceipt,
    connect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
