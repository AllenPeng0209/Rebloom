import { Message } from '@/types'
import { ChatConversation, ChatMessage, supabase } from '../lib/supabase'

export class ChatService {
  // Create a new conversation
  static async createConversation(userId: string, title?: string): Promise<{ data: ChatConversation | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title: title || 'New Conversation',
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get user's conversations
  static async getUserConversations(userId: string): Promise<{ data: ChatConversation[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Save a message to the database
  static async saveMessage(
    conversationId: string,
    userId: string,
    content: string,
    role: 'user' | 'assistant'
  ): Promise<{ data: ChatMessage | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          content,
          role,
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId: string): Promise<{ data: ChatMessage[] | null, error: any }> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Convert database message to app message format
  static convertToAppMessage(dbMessage: ChatMessage): Message {
    return {
      id: dbMessage.id,
      sessionId: dbMessage.conversation_id,
      userId: dbMessage.user_id,
      senderType: dbMessage.role === 'user' ? 'user' : 'ai',
      content: dbMessage.content,
      messageType: 'text',
      sentimentScore: 0.5,
      emotionalTags: [],
      riskLevel: 'low',
      createdAt: new Date(dbMessage.created_at),
    }
  }

  // Convert app message to database format
  static convertToDbMessage(
    appMessage: Message,
    conversationId: string,
    userId: string
  ): Omit<ChatMessage, 'id' | 'created_at'> {
    return {
      conversation_id: conversationId,
      user_id: userId,
      content: appMessage.content,
      role: appMessage.senderType === 'user' ? 'user' : 'assistant',
    }
  }

  // Update conversation title based on first message
  static async updateConversationTitle(conversationId: string, title: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ title })
        .eq('id', conversationId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Delete a conversation and all its messages
  static async deleteConversation(conversationId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)

      return { error }
    } catch (error) {
      return { error }
    }
  }
}
