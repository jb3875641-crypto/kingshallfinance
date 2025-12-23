import { Bot, BotType } from '@/types/bot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mic, Cog, Image, Play, Trash2, Settings, Power, PowerOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BotCardProps {
  bot: Bot;
  onTest: (bot: Bot) => void;
  onEdit: (bot: Bot) => void;
  onDelete: (id: string) => void;
  onToggleActive: (bot: Bot) => void;
}

export const BotCard = ({ bot, onTest, onEdit, onDelete, onToggleActive }: BotCardProps) => {
  const getIcon = (type: BotType) => {
    switch (type) {
      case 'chatbot': return <MessageSquare className="h-5 w-5" />;
      case 'voice_agent': return <Mic className="h-5 w-5" />;
      case 'task_automation': return <Cog className="h-5 w-5" />;
      case 'image_generation': return <Image className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: BotType) => {
    switch (type) {
      case 'chatbot': return 'bg-primary/10 text-primary';
      case 'voice_agent': return 'bg-accent/10 text-accent';
      case 'task_automation': return 'bg-warning/10 text-warning';
      case 'image_generation': return 'bg-success/10 text-success';
    }
  };

  const getTypeBadge = (type: BotType) => {
    switch (type) {
      case 'chatbot': return 'default';
      case 'voice_agent': return 'secondary';
      case 'task_automation': return 'outline';
      case 'image_generation': return 'secondary';
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
      <div className={`absolute top-0 left-0 right-0 h-1 ${bot.is_active ? 'bg-success' : 'bg-muted'}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor(bot.type)}`}>
              {getIcon(bot.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{bot.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getTypeBadge(bot.type) as any}>
                  {bot.type.replace('_', ' ')}
                </Badge>
                {bot.is_active ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(bot)}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(bot)}>
                {bot.is_active ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(bot.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="line-clamp-2 mb-4">
          {bot.description || 'No description provided'}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Model: {bot.model.split('/').pop()}
          </span>
          <Button size="sm" onClick={() => onTest(bot)} className="gap-2">
            <Play className="h-3 w-3" />
            Test Bot
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
