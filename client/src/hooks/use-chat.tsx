import { createContext, ReactNode, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Define types for our chat system
export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  status: 'read' | 'unread';
  createdAt: Date;
  imagePath: string | null;
};

export type Conversation = {
  id: number;
  userId: number;
  businessId: number;
  itemId: number;
  itemType: 'job' | 'product';
  lastMessageAt: Date | null;
  otherUser?: {
    id: number;
    fullName: string;
    userType: 'user' | 'business';
  };
  item?: {
    id: number;
    title: string;
    type: 'job' | 'product';
  };
  unreadCount?: number;
};

// WebSocket message types
type WebSocketAuthMessage = {
  type: 'auth';
  userId: number;
};

type WebSocketChatMessage = {
  type: 'chat_message';
  conversationId: number;
  content: string;
  recipientId?: number;
};

type WebSocketNewMessageNotification = {
  type: 'new_message';
  message: Message;
  conversationId: number;
};

type WebSocketMessageSent = {
  type: 'message_sent';
  message: Message;
  status: 'success' | 'error';
};

type WebSocketErrorMessage = {
  type: 'error';
  message: string;
};

// Define the Chat context type
type ChatContextType = {
  conversations: Conversation[];
  loadingConversations: boolean;
  errorConversations: Error | null;
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation) => void;
  messages: Message[];
  loadingMessages: boolean;
  errorMessages: Error | null;
  sendMessage: (content: string) => void;
  createConversation: (params: {
    businessId: number;
    userId: number;
    itemId: number;
    itemType: 'job' | 'product';
  }) => Promise<Conversation>;
  websocketStatus: 'connecting' | 'connected' | 'disconnected';
  refreshConversations: () => void;
};

// Create the Chat context
const ChatContext = createContext<ChatContextType | null>(null);

// ChatProvider component
export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const websocketRef = useRef<WebSocket | null>(null);
  const [websocketStatus, setWebsocketStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [errorConversations, setErrorConversations] = useState<Error | null>(null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessages, setErrorMessages] = useState<Error | null>(null);

  // Function to refresh conversations list
  const refreshConversations = useCallback(async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data);
      setErrorConversations(null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setErrorConversations(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // Load conversations when user changes
  useEffect(() => {
    if (user) {
      refreshConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
    }
  }, [user, refreshConversations]);

  // Load messages when currentConversation changes
  useEffect(() => {
    if (!currentConversation) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      setLoadingMessages(true);
      try {
        const response = await fetch(`/api/conversations/${currentConversation.id}/messages`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
        setErrorMessages(null);
        
        // Refresh conversations to update unread counts
        refreshConversations();
      } catch (error) {
        console.error('Error fetching messages:', error);
        setErrorMessages(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoadingMessages(false);
      }
    }

    loadMessages();
  }, [currentConversation, refreshConversations]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!user) return;

    function connectWebSocket() {
      setWebsocketStatus('connecting');
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
        setWebsocketStatus('connected');
        
        // Send authentication message
        const authMessage: WebSocketAuthMessage = {
          type: 'auth',
          userId: user.id
        };
        socket.send(JSON.stringify(authMessage));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          if (data.type === 'new_message') {
            const messageData = data as WebSocketNewMessageNotification;
            
            // Add message to current conversation if it matches
            if (currentConversation && currentConversation.id === messageData.conversationId) {
              setMessages((prev) => [...prev, messageData.message]);
            }
            
            // Show toast notification
            toast({
              title: 'New message received',
              description: messageData.message.content.substring(0, 50) + 
                (messageData.message.content.length > 50 ? '...' : ''),
            });
            
            // Refresh conversations to update last message time and unread count
            refreshConversations();
          } else if (data.type === 'error') {
            const errorData = data as WebSocketErrorMessage;
            console.error('WebSocket error:', errorData.message);
            toast({
              title: 'Error',
              description: errorData.message,
              variant: 'destructive',
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWebsocketStatus('disconnected');
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setWebsocketStatus('disconnected');
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };

      websocketRef.current = socket;
    }

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [user, toast, currentConversation, refreshConversations]);

  // Function to send a message
  const sendMessage = useCallback((content: string) => {
    if (!user || !currentConversation || !websocketRef.current) {
      toast({
        title: 'Cannot send message',
        description: 'You are not connected to the chat server',
        variant: 'destructive',
      });
      return;
    }

    if (websocketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: 'Cannot send message',
        description: 'Connection to chat server lost. Reconnecting...',
        variant: 'destructive',
      });
      return;
    }

    // Create message to send via WebSocket
    const chatMessage: WebSocketChatMessage = {
      type: 'chat_message',
      conversationId: currentConversation.id,
      content,
      recipientId: currentConversation.userId === user.id 
        ? currentConversation.businessId 
        : currentConversation.userId,
    };

    // Send the message
    websocketRef.current.send(JSON.stringify(chatMessage));

    // Optimistically add message to the UI
    const optimisticMessage: Partial<Message> = {
      senderId: user.id,
      content,
      conversationId: currentConversation.id,
      status: 'unread',
      createdAt: new Date(),
      // These fields will be filled in by the server
      id: Math.random() * -1000, // Temporary negative ID to identify optimistic message
      imagePath: null,
    };

    setMessages((prev) => [...prev, optimisticMessage as Message]);
  }, [user, currentConversation, toast]);

  // Function to create a new conversation
  const createConversation = useCallback(async (params: {
    businessId: number;
    userId: number;
    itemId: number;
    itemType: 'job' | 'product';
  }): Promise<Conversation> => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const conversation = await response.json();
      
      // Refresh conversations list
      refreshConversations();
      
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
      throw error;
    }
  }, [refreshConversations, toast]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        loadingConversations,
        errorConversations,
        currentConversation,
        setCurrentConversation,
        messages,
        loadingMessages,
        errorMessages,
        sendMessage,
        createConversation,
        websocketStatus,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Hook to use the Chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}