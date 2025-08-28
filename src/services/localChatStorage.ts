import { Message } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CONVERSATIONS: 'chat_conversations',
  MESSAGES: 'chat_messages_',
  CURRENT_CONVERSATION: 'current_conversation',
  MESSAGE_METADATA: 'message_metadata'
};

interface ConversationMetadata {
  id: string;
  title: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface StorageMetadata {
  totalMessages: number;
  oldestMessageId?: string;
  newestMessageId?: string;
  hasMore: boolean;
}

class LocalChatStorage {
  private static instance: LocalChatStorage;
  private messageCache: Map<string, Message[]> = new Map();
  private readonly PAGE_SIZE = 20;
  private readonly MAX_CACHED_MESSAGES = 100; // 每個會話最多緩存100條消息

  private constructor() {}

  static getInstance(): LocalChatStorage {
    if (!LocalChatStorage.instance) {
      LocalChatStorage.instance = new LocalChatStorage();
    }
    return LocalChatStorage.instance;
  }

  /**
   * 保存單條消息
   */
  async saveMessage(message: Message): Promise<void> {
    try {
      const messagesKey = `${STORAGE_KEYS.MESSAGES}${message.sessionId}`;
      
      // 從緩存或存儲中獲取現有消息
      let messages = this.messageCache.get(message.sessionId) || [];
      if (messages.length === 0) {
        const stored = await AsyncStorage.getItem(messagesKey);
        messages = stored ? JSON.parse(stored) : [];
      }

      // 添加新消息
      messages.push(message);

      // 限制存儲的消息數量
      if (messages.length > this.MAX_CACHED_MESSAGES) {
        // 保留最新的消息
        messages = messages.slice(-this.MAX_CACHED_MESSAGES);
      }

      // 更新緩存
      this.messageCache.set(message.sessionId, messages);

      // 保存到AsyncStorage
      await AsyncStorage.setItem(messagesKey, JSON.stringify(messages));

      // 更新會話元數據
      await this.updateConversationMetadata(message.sessionId, message);
    } catch (error) {
      console.error('Error saving message to local storage:', error);
    }
  }

  /**
   * 批量保存消息
   */
  async saveMessages(messages: Message[]): Promise<void> {
    if (messages.length === 0) return;

    try {
      // 按會話分組
      const messagesBySession = new Map<string, Message[]>();
      messages.forEach(msg => {
        const sessionMessages = messagesBySession.get(msg.sessionId) || [];
        sessionMessages.push(msg);
        messagesBySession.set(msg.sessionId, sessionMessages);
      });

      // 保存每個會話的消息
      for (const [sessionId, sessionMessages] of messagesBySession) {
        const messagesKey = `${STORAGE_KEYS.MESSAGES}${sessionId}`;
        
        // 獲取現有消息
        let existingMessages = this.messageCache.get(sessionId) || [];
        if (existingMessages.length === 0) {
          const stored = await AsyncStorage.getItem(messagesKey);
          existingMessages = stored ? JSON.parse(stored) : [];
        }

        // 合併消息並去重
        const allMessages = [...existingMessages, ...sessionMessages];
        const uniqueMessages = Array.from(
          new Map(allMessages.map(m => [m.id, m])).values()
        );

        // 排序
        uniqueMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // 限制數量
        const finalMessages = uniqueMessages.slice(-this.MAX_CACHED_MESSAGES);

        // 更新緩存和存儲
        this.messageCache.set(sessionId, finalMessages);
        await AsyncStorage.setItem(messagesKey, JSON.stringify(finalMessages));

        // 更新元數據
        const lastMessage = finalMessages[finalMessages.length - 1];
        if (lastMessage) {
          await this.updateConversationMetadata(sessionId, lastMessage);
        }
      }
    } catch (error) {
      console.error('Error saving messages batch:', error);
    }
  }

  /**
   * 加載會話的消息（支持分頁）
   */
  async loadMessages(
    sessionId: string,
    page: number = 0
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    try {
      const messagesKey = `${STORAGE_KEYS.MESSAGES}${sessionId}`;
      
      // 優先從緩存獲取
      let allMessages = this.messageCache.get(sessionId);
      
      if (!allMessages) {
        const stored = await AsyncStorage.getItem(messagesKey);
        allMessages = stored ? JSON.parse(stored) : [];
        this.messageCache.set(sessionId, allMessages);
      }

      // 計算分頁
      const totalMessages = allMessages.length;
      const startIndex = Math.max(0, totalMessages - (page + 1) * this.PAGE_SIZE);
      const endIndex = totalMessages - page * this.PAGE_SIZE;
      
      const messages = allMessages.slice(startIndex, endIndex);
      const hasMore = startIndex > 0;

      return { messages, hasMore };
    } catch (error) {
      console.error('Error loading messages:', error);
      return { messages: [], hasMore: false };
    }
  }

  /**
   * 加載最近的消息（用於初始加載）
   */
  async loadRecentMessages(
    sessionId: string,
    limit: number = this.PAGE_SIZE
  ): Promise<Message[]> {
    try {
      const messagesKey = `${STORAGE_KEYS.MESSAGES}${sessionId}`;
      
      let messages = this.messageCache.get(sessionId);
      
      if (!messages) {
        const stored = await AsyncStorage.getItem(messagesKey);
        messages = stored ? JSON.parse(stored) : [];
        this.messageCache.set(sessionId, messages);
      }

      // 返回最新的消息
      return messages.slice(-limit);
    } catch (error) {
      console.error('Error loading recent messages:', error);
      return [];
    }
  }

  /**
   * 加載更多歷史消息（用於向上滾動加載）
   */
  async loadMoreMessages(
    sessionId: string,
    beforeMessageId: string,
    limit: number = this.PAGE_SIZE
  ): Promise<Message[]> {
    try {
      const messagesKey = `${STORAGE_KEYS.MESSAGES}${sessionId}`;
      
      let messages = this.messageCache.get(sessionId);
      
      if (!messages) {
        const stored = await AsyncStorage.getItem(messagesKey);
        messages = stored ? JSON.parse(stored) : [];
        this.messageCache.set(sessionId, messages);
      }

      // 找到參考消息的位置
      const index = messages.findIndex(m => m.id === beforeMessageId);
      if (index === -1) return [];

      // 返回之前的消息
      const startIndex = Math.max(0, index - limit);
      return messages.slice(startIndex, index);
    } catch (error) {
      console.error('Error loading more messages:', error);
      return [];
    }
  }

  /**
   * 獲取所有會話列表
   */
  async getConversations(): Promise<ConversationMetadata[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const conversations = stored ? JSON.parse(stored) : [];
      
      // 按更新時間排序
      conversations.sort((a: ConversationMetadata, b: ConversationMetadata) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      return conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  /**
   * 創建新會話
   */
  async createConversation(id: string, title: string = 'New Conversation'): Promise<void> {
    try {
      const conversations = await this.getConversations();
      
      const newConversation: ConversationMetadata = {
        id,
        title,
        messageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      conversations.push(newConversation);
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }

  /**
   * 更新會話元數據
   */
  private async updateConversationMetadata(sessionId: string, lastMessage: Message): Promise<void> {
    try {
      const conversations = await this.getConversations();
      const index = conversations.findIndex(c => c.id === sessionId);
      
      if (index !== -1) {
        conversations[index].lastMessage = lastMessage.content.substring(0, 50);
        conversations[index].lastMessageTime = lastMessage.createdAt.toString();
        conversations[index].updatedAt = new Date().toISOString();
        conversations[index].messageCount++;
      } else {
        // 如果會話不存在，創建新的
        const newConversation: ConversationMetadata = {
          id: sessionId,
          title: lastMessage.content.substring(0, 30) || 'New Conversation',
          lastMessage: lastMessage.content.substring(0, 50),
          lastMessageTime: lastMessage.createdAt.toString(),
          messageCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        conversations.push(newConversation);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error updating conversation metadata:', error);
    }
  }

  /**
   * 保存當前會話ID
   */
  async saveCurrentConversation(conversationId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, conversationId);
    } catch (error) {
      console.error('Error saving current conversation:', error);
    }
  }

  /**
   * 獲取當前會話ID
   */
  async getCurrentConversation(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
    } catch (error) {
      console.error('Error getting current conversation:', error);
      return null;
    }
  }

  /**
   * 清除特定會話的消息
   */
  async clearConversationMessages(sessionId: string): Promise<void> {
    try {
      const messagesKey = `${STORAGE_KEYS.MESSAGES}${sessionId}`;
      await AsyncStorage.removeItem(messagesKey);
      this.messageCache.delete(sessionId);
      
      // 更新會話列表
      const conversations = await this.getConversations();
      const filtered = conversations.filter(c => c.id !== sessionId);
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error clearing conversation messages:', error);
    }
  }

  /**
   * 清除所有數據
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chatKeys = keys.filter(key => 
        key.startsWith(STORAGE_KEYS.MESSAGES) || 
        key === STORAGE_KEYS.CONVERSATIONS ||
        key === STORAGE_KEYS.CURRENT_CONVERSATION
      );
      await AsyncStorage.multiRemove(chatKeys);
      this.messageCache.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  /**
   * 獲取用於AI上下文的歷史消息
   */
  async getContextMessages(sessionId: string, limit: number = 10): Promise<Message[]> {
    try {
      const messages = await this.loadRecentMessages(sessionId, limit);
      return messages;
    } catch (error) {
      console.error('Error getting context messages:', error);
      return [];
    }
  }

  /**
   * 調試方法：檢查存儲狀態
   */
  async debugStorageStatus(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const chatKeys = keys.filter(key => 
        key.startsWith(STORAGE_KEYS.MESSAGES) || 
        key === STORAGE_KEYS.CONVERSATIONS ||
        key === STORAGE_KEYS.CURRENT_CONVERSATION
      );
      
      console.log('=== LocalChatStorage Debug Info ===');
      console.log('All AsyncStorage keys:', keys);
      console.log('Chat-related keys:', chatKeys);
      
      for (const key of chatKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            const parsedValue = JSON.parse(value);
            console.log(`Key: ${key}, Value:`, parsedValue);
          } else {
            console.log(`Key: ${key}, Value: null`);
          }
        } catch (parseError) {
          console.log(`Key: ${key}, Parse Error:`, parseError);
          const rawValue = await AsyncStorage.getItem(key);
          console.log(`Key: ${key}, Raw Value:`, rawValue);
        }
      }
      
      console.log('Message cache keys:', Array.from(this.messageCache.keys()));
      console.log('=== End Debug Info ===');
    } catch (error) {
      console.error('Error in debugStorageStatus:', error);
    }
  }
}

export default LocalChatStorage.getInstance();