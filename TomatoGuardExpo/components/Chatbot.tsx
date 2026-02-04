// src/components/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendMessageToWitAI } from '../services/api/witaiServices';
import { useAuth } from '../contexts/AuthContext';

interface ChatbotProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

const Chatbot: React.FC<ChatbotProps> = ({ visible, onClose }) => {
  const { authState } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: "Hello! I'm TomaBot, your TomatoGuard AI assistant. How can I help you with your tomato farming today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => 
    authState.user?.id?.toString() || `session_${Date.now()}`
  );
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Reset messages when modal opens
  useEffect(() => {
    if (visible && messages.length === 1) {
      // Keep only the welcome message
      setMessages([{
        id: '1',
        type: 'bot',
        text: "Hello! I'm TomaBot, your TomatoGuard AI assistant. How can I help you with your tomato farming today?",
        timestamp: new Date(),
      }]);
    }
  }, [visible]);

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        text: message.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const currentMessage = message.trim();
      setMessage('');
      setIsLoading(true);

      try {
        // Check if user is authenticated
        if (!authState.accessToken) {
          throw new Error('Please log in to chat with TomaBot.');
        }

        // Send to Wit.ai via backend
        const result = await sendMessageToWitAI(
          currentMessage,
          sessionId,
          authState.accessToken
        );

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: result.response,
          timestamp: new Date(),
          intent: result.intent,
          confidence: result.confidence,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (error: any) {
        console.error('Chat error:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: error.message || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, errorMessage]);

        // Show alert for authentication errors
        if (error.message.includes('log in')) {
          Alert.alert('Authentication Required', error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer, 
      item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer
    ]}>
      <View style={[
        styles.messageBubble, 
        item.type === 'user' ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText, 
          item.type === 'user' ? styles.userMessageText : styles.botMessageText
        ]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp, 
            item.type === 'user' ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item.type === 'bot' && item.intent && item.confidence && (
            <Text style={styles.intentBadge}>
              {item.intent} • {Math.round(item.confidence * 100)}%
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>TomaBot</Text>
              <Text style={styles.headerSubtitle}>Your Tomato Expert 🍅</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#e9523a" />
            <Text style={styles.loadingText}>TomaBot is typing...</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask about tomato farming..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSendMessage}
              onKeyPress={handleKeyPress}
              multiline
              maxLength={500}
              editable={!isLoading}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[
                styles.sendButton, 
                (!message.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              disabled={!message.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#e9523a',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#e9523a',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#1f2937',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  botTimestamp: {
    color: '#9ca3af',
  },
  intentBadge: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  inputArea: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#1f2937',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e9523a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
});

export default Chatbot;