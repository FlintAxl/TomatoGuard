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
  Image,
  Dimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { sendMessage, ConversationMessage } from '../services/api/tomabot';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 768;

// ── Replace this with your actual Cloudinary logo URL ──────────────────────
const LOGO_URL = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1771757320/tomabot_ilmtbs.png';

interface ChatbotProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isTomatoRelated?: boolean;
}

const COLORS = {
  bgCream: '#f0ede6',
  bgLight: '#e8e4db',
  darkGreen: '#1a3a2a',
  medGreen: '#2d5a3d',
  accentGreen: '#3d7a52',
  textLight: '#ffffff',
  textDark: '#0d1f14',
  textMuted: '#5a7a65',
  cardBg: 'rgb(30, 61, 42)',
  navBg: '#0d2018',
  limeglow: '#CEF17B',
  errorRed: '#e9523a',
};

const WELCOME_MESSAGE: Message = {
  id: '1',
  type: 'bot',
  text: "Hello! I'm TomaBot, your TomatoGuard AI assistant. 🍅 Ask me anything about tomato farming — diseases, pests, growing tips, harvesting, and more!",
  timestamp: new Date(),
};

const Chatbot: React.FC<ChatbotProps> = ({ visible, onClose }) => {
  const { authState } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () => authState.user?.id?.toString() || `session_${Date.now()}`
  );
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (visible) {
      setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
      setConversationHistory([]);
    }
  }, [visible]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userText = message.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      if (!authState.accessToken) {
        throw new Error('Please log in to chat with TomaBot.');
      }

      const result = await sendMessage(
        userText,
        sessionId,
        authState.accessToken,
        conversationHistory
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: result.response,
        timestamp: new Date(),
        isTomatoRelated: result.is_tomato_related,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (result.is_tomato_related !== false) {
        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: userText },
          { role: 'assistant', content: result.response },
        ]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      if (error.message?.includes('log in')) {
        Alert.alert('Authentication Required', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {/* Bot avatar — small logo */}
      {item.type === 'bot' && (
        <View style={styles.botAvatar}>
          <Image
            source={{ uri: LOGO_URL }}
            style={styles.botAvatarImage}
            resizeMode="contain"
          />
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          item.type === 'user' ? styles.userBubble : styles.botBubble,
        ]}
      >
        {item.type === 'bot' && (
          <Text style={styles.botLabel}>TomaBot</Text>
        )}
        <Text
          style={[
            styles.messageText,
            item.type === 'user' ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.type === 'user' ? styles.userTimestamp : styles.botTimestamp,
          ]}
        >
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {/* User avatar */}
      {item.type === 'user' && (
        <View style={styles.userAvatar}>
          <FontAwesome5
            name="user"
            size={isSmallDevice ? 11 : 14}
            color={COLORS.textLight}
          />
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={styles.messageContainer}>
      <View style={styles.botAvatar}>
        <Image
          source={{ uri: LOGO_URL }}
          style={styles.botAvatarImage}
          resizeMode="contain"
        />
      </View>
      <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
        <Text style={styles.botLabel}>TomaBot</Text>
        <View style={styles.typingDots}>
          <ActivityIndicator size="small" color={COLORS.accentGreen} />
          <Text style={styles.loadingText}>typing...</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Logo from Cloudinary */}
            <View style={styles.headerLogoWrap}>
              <Image
                source={{ uri: LOGO_URL }}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>TomaBot</Text>
              <View style={styles.headerOnlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerSubtitle}>Online · Tomato Expert 🍅</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={isSmallDevice ? 14 : 16} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Accent bar under header */}
        <View style={styles.headerAccentBar} />

        {/* ── Messages ───────────────────────────────────────────────────── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isLoading ? renderTypingIndicator : null}
        />

        {/* ── Input Area ─────────────────────────────────────────────────── */}
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <FontAwesome5
                name="comment-alt"
                size={isSmallDevice ? 12 : 14}
                color={COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ask about tomato farming..."
                placeholderTextColor={COLORS.textMuted}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSendMessage}
                multiline
                maxLength={1000}
                editable={!isLoading}
                returnKeyType="send"
              />
            </View>
            <TouchableOpacity
              onPress={handleSendMessage}
              style={[
                styles.sendButton,
                (!message.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              disabled={!message.trim() || isLoading}
            >
              <FontAwesome5
                name="paper-plane"
                size={isSmallDevice ? 13 : 15}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>Powered by TomatoGuard AI</Text>
        </View>

        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingBottom: isSmallDevice ? 16 : 24,
    paddingRight: isSmallDevice ? 12 : 24,
    backgroundColor: '#00000050',
  },
  container: {
    width: isSmallDevice ? SCREEN_WIDTH : 380,
    height: isSmallDevice ? SCREEN_HEIGHT * 0.92 : 560,
    marginTop: isSmallDevice ? SCREEN_HEIGHT * 0.04 : SCREEN_HEIGHT - 580,
    marginLeft: isSmallDevice ? 0 : SCREEN_WIDTH - 400,
    backgroundColor: COLORS.bgCream,
    borderRadius: isSmallDevice ? 0 : 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.darkGreen,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: isSmallDevice ? 14 : 18,
    paddingHorizontal: isSmallDevice ? 16 : 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 14,
    flex: 1,
  },
  headerLogoWrap: {
    width: isSmallDevice ? 42 : 52,
    height: isSmallDevice ? 42 : 52,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerLogo: {
    width: isSmallDevice ? 36 : 46,
    height: isSmallDevice ? 36 : 46,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 17 : 20,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.4,
  },
  headerOnlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.limeglow,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 11 : 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: isSmallDevice ? 34 : 40,
    height: isSmallDevice ? 34 : 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerAccentBar: {
    height: 3,
    backgroundColor: COLORS.accentGreen,
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  messagesList: {
    padding: isSmallDevice ? 12 : 16,
    paddingBottom: 12,
  },
  messageContainer: {
    marginBottom: isSmallDevice ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: isSmallDevice ? 6 : 9,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },

  // Bot avatar uses the logo image
  botAvatar: {
    width: isSmallDevice ? 30 : 48,
    height: isSmallDevice ? 30 : 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  botAvatarImage: {
    width: isSmallDevice ? 24 : 40,
    height: isSmallDevice ? 24 : 40,
  },

  // User avatar uses FontAwesome icon
  userAvatar: {
    width: isSmallDevice ? 30 : 38,
    height: isSmallDevice ? 30 : 38,
    borderRadius: isSmallDevice ? 9 : 11,
    backgroundColor: COLORS.medGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accentGreen,
  },

  messageBubble: {
    maxWidth: isSmallDevice ? '74%' : '68%',
    padding: isSmallDevice ? 10 : 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  userBubble: {
    backgroundColor: COLORS.darkGreen,
    borderColor: COLORS.accentGreen,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.textLight,
    borderColor: COLORS.bgLight,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  botLabel: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '700',
    color: COLORS.accentGreen,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: isSmallDevice ? 3 : 4,
  },
  messageText: {
    fontSize: isSmallDevice ? 13 : 15,
    lineHeight: isSmallDevice ? 20 : 23,
    marginBottom: 4,
  },
  userMessageText: {
    color: COLORS.textLight,
  },
  botMessageText: {
    color: COLORS.textDark,
  },
  timestamp: {
    fontSize: isSmallDevice ? 9 : 10,
    textAlign: 'right',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.4)',
  },
  botTimestamp: {
    color: COLORS.textMuted,
  },

  // ── Typing Indicator ──────────────────────────────────────────────────────
  typingBubble: {
    paddingVertical: isSmallDevice ? 8 : 10,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },

  // ── Input Area ────────────────────────────────────────────────────────────
  inputArea: {
    backgroundColor: COLORS.textLight,
    borderTopWidth: 2,
    borderTopColor: COLORS.bgLight,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    paddingTop: isSmallDevice ? 12 : 12,
    paddingBottom: Platform.OS === 'ios' ? (isSmallDevice ? 28 : 32) : (isSmallDevice ? 16 : 16),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: isSmallDevice ? 8 : 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.bgCream,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.medGreen,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 10 : 10,
    minHeight: isSmallDevice ? 44 : undefined,
    gap: 8,
  },
  inputIcon: {
    marginBottom: isSmallDevice ? 2 : 3,
  },
  input: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    color: COLORS.textDark,
    maxHeight: isSmallDevice ? 90 : 110,
    minHeight: isSmallDevice ? 24 : undefined,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: isSmallDevice ? 44 : 48,
    height: isSmallDevice ? 44 : 48,
    borderRadius: 12,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.bgLight,
    elevation: 0,
    shadowOpacity: 0,
  },
  inputHint: {
    textAlign: 'center',
    fontSize: isSmallDevice ? 9 : 10,
    color: COLORS.textMuted,
    marginTop: isSmallDevice ? 6 : 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});

export default Chatbot;