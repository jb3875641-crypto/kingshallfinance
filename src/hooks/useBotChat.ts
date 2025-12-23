import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BotType } from '@/types/bot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-chat`;

export const useBotChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const streamChat = useCallback(async ({
    userMessage,
    systemPrompt,
    model,
    botType,
  }: {
    userMessage: string;
    systemPrompt: string;
    model: string;
    botType: BotType;
  }) => {
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          systemPrompt,
          model,
          botType,
        }),
      });

      if (response.status === 429) {
        toast({
          variant: 'destructive',
          title: 'Rate Limited',
          description: 'Too many requests. Please try again in a moment.',
        });
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast({
          variant: 'destructive',
          title: 'Credits Required',
          description: 'Please add credits to continue using AI features.',
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle image generation response
      if (botType === 'image_generation') {
        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const textContent = data.choices?.[0]?.message?.content || 'Here\'s your generated image:';
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: textContent,
          imageUrl,
        }]);
        setIsLoading(false);
        return;
      }

      // Handle streaming response for other bot types
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  return {
    messages,
    isLoading,
    streamChat,
    resetMessages,
    setMessages,
  };
};
