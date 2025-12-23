export type BotType = 'chatbot' | 'voice_agent' | 'task_automation' | 'image_generation';

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: BotType;
  system_prompt: string | null;
  model: string;
  personality: string;
  avatar_url: string | null;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BotConversation {
  id: string;
  bot_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface BotMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface BotTemplate {
  id: string;
  name: string;
  description: string;
  type: BotType;
  icon: string;
  systemPrompt: string;
  personality: string;
}
