import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bot, BotType } from '@/types/bot';
import { useToast } from '@/hooks/use-toast';

export const useBots = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bots, isLoading, error } = useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Bot[];
    },
  });

  const createBot = useMutation({
    mutationFn: async (bot: {
      name: string;
      description?: string;
      type: BotType;
      system_prompt?: string;
      model?: string;
      personality?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bots')
        .insert({
          ...bot,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Bot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast({
        title: "Bot Created",
        description: "Your AI bot has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateBot = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Bot> & { id: string }) => {
      const { data, error } = await supabase
        .from('bots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Bot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast({
        title: "Bot Updated",
        description: "Your bot has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteBot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast({
        title: "Bot Deleted",
        description: "Your bot has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return {
    bots,
    isLoading,
    error,
    createBot,
    updateBot,
    deleteBot,
  };
};
