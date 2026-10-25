export interface ConversationUser {
  id: number;
  username: string;
  email: string;
}

export interface Conversation {
  id: number;
  created_at: string;
  updated_at: string;
  other_user: ConversationUser;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender?: ConversationUser;
}

export interface MessagingState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  messagesError: string | null;
}
