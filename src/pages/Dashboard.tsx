import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBots } from '@/hooks/useBots';
import { Bot, BotType } from '@/types/bot';
import { AuthPage } from '@/components/auth/AuthPage';
import { BotBuilderModal } from '@/components/bots/BotBuilderModal';
import { BotCard } from '@/components/bots/BotCard';
import { BotTestChat } from '@/components/bots/BotTestChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Bot as BotIcon, 
  LogOut, 
  Filter,
  MessageSquare,
  Mic,
  Cog,
  Image,
  Loader2
} from 'lucide-react';
import { User } from '@supabase/supabase-js';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<BotType | 'all'>('all');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [testingBot, setTestingBot] = useState<Bot | null>(null);
  const [deletingBotId, setDeletingBotId] = useState<string | null>(null);

  const { bots, isLoading, createBot, updateBot, deleteBot } = useBots();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const filteredBots = bots?.filter((bot) => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || bot.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateBot = (botData: {
    name: string;
    description?: string;
    type: BotType;
    system_prompt?: string;
    model?: string;
    personality?: string;
  }) => {
    createBot.mutate(botData);
  };

  const handleToggleActive = (bot: Bot) => {
    updateBot.mutate({ id: bot.id, is_active: !bot.is_active });
  };

  const handleDeleteBot = (id: string) => {
    deleteBot.mutate(id);
    setDeletingBotId(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuth={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <BotIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">AI Bot Builder</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {typeFilter === 'all' ? 'All Types' : typeFilter.replace('_', ' ')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('chatbot')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chatbot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('voice_agent')}>
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('task_automation')}>
                  <Cog className="h-4 w-4 mr-2" />
                  Task Automation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('image_generation')}>
                  <Image className="h-4 w-4 mr-2" />
                  Image Generation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setIsBuilderOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Bot
            </Button>
          </div>
        </div>

        {/* Bots Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBots?.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <BotIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bots found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first AI bot to get started'}
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <Button onClick={() => setIsBuilderOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Bot
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBots?.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                onTest={setTestingBot}
                onEdit={() => {}} // TODO: Implement edit modal
                onDelete={(id) => setDeletingBotId(id)}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <BotBuilderModal
        open={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        onCreateBot={handleCreateBot}
      />

      <BotTestChat
        bot={testingBot}
        open={!!testingBot}
        onOpenChange={(open) => !open && setTestingBot(null)}
      />

      <AlertDialog open={!!deletingBotId} onOpenChange={() => setDeletingBotId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bot? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBotId && handleDeleteBot(deletingBotId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
