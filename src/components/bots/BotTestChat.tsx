import { useState, useRef, useEffect } from 'react';
import { Bot } from '@/types/bot';
import { useBotChat } from '@/hooks/useBotChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Send, Bot as BotIcon, User, Loader2, Image, RefreshCw } from 'lucide-react';

interface BotTestChatProps {
  bot: Bot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BotTestChat = ({ bot, open, onOpenChange }: BotTestChatProps) => {
  const [input, setInput] = useState('');
  const { messages, isLoading, streamChat, resetMessages } = useBotChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!open) {
      resetMessages();
    }
  }, [open, resetMessages]);

  const handleSend = async () => {
    if (!input.trim() || !bot || isLoading) return;

    const userMessage = input;
    setInput('');

    await streamChat({
      userMessage,
      systemPrompt: bot.system_prompt || 'You are a helpful assistant.',
      model: bot.model,
      botType: bot.type,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!bot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BotIcon className="h-5 w-5 text-primary" />
              {bot.name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetMessages}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <BotIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with {bot.name}</p>
                <p className="text-sm mt-1">
                  {bot.type === 'image_generation' 
                    ? 'Describe an image you want to create' 
                    : 'Type a message below to begin'}
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BotIcon className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={message.imageUrl}
                        alt="Generated image"
                        className="rounded-lg max-w-full"
                      />
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BotIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                bot.type === 'image_generation'
                  ? 'Describe the image you want to create...'
                  : 'Type a message...'
              }
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : bot.type === 'image_generation' ? (
                <Image className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
