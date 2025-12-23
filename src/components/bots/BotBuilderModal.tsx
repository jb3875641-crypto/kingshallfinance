import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BotType, BotTemplate } from '@/types/bot';
import { MessageSquare, Mic, Cog, Image, Sparkles } from 'lucide-react';

const BOT_TEMPLATES: BotTemplate[] = [
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'A friendly bot that helps customers with questions',
    type: 'chatbot',
    icon: 'MessageSquare',
    systemPrompt: 'You are a helpful customer support assistant. Be friendly, professional, and help resolve customer issues efficiently.',
    personality: 'friendly',
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'A bot that helps with programming questions',
    type: 'chatbot',
    icon: 'Cog',
    systemPrompt: 'You are an expert programming assistant. Help users with code, debugging, and technical explanations. Use code examples when helpful.',
    personality: 'technical',
  },
  {
    id: 'voice-concierge',
    name: 'Voice Concierge',
    description: 'A voice-enabled assistant for real-time conversations',
    type: 'voice_agent',
    icon: 'Mic',
    systemPrompt: 'You are a voice concierge assistant. Speak naturally and help users with their requests in a conversational manner.',
    personality: 'professional',
  },
  {
    id: 'task-automator',
    name: 'Task Automator',
    description: 'Automates repetitive tasks and workflows',
    type: 'task_automation',
    icon: 'Cog',
    systemPrompt: 'You are a task automation assistant. Help users define and execute automated workflows efficiently.',
    personality: 'efficient',
  },
  {
    id: 'image-creator',
    name: 'Image Creator',
    description: 'Creates and edits images based on descriptions',
    type: 'image_generation',
    icon: 'Image',
    systemPrompt: 'You are a creative image generation assistant. Create vivid, detailed images based on user descriptions.',
    personality: 'creative',
  },
];

const MODELS = [
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast)' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (Powerful)' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'openai/gpt-5', label: 'GPT-5 (Most Capable)' },
];

interface BotBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBot: (bot: {
    name: string;
    description?: string;
    type: BotType;
    system_prompt?: string;
    model?: string;
    personality?: string;
  }) => void;
}

export const BotBuilderModal = ({ open, onOpenChange, onCreateBot }: BotBuilderModalProps) => {
  const [step, setStep] = useState<'template' | 'customize'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [model, setModel] = useState('google/gemini-2.5-flash');

  const handleSelectTemplate = (template: BotTemplate) => {
    setSelectedTemplate(template);
    setName(template.name);
    setDescription(template.description);
    setSystemPrompt(template.systemPrompt);
    setStep('customize');
  };

  const handleCreate = () => {
    if (!selectedTemplate || !name) return;

    onCreateBot({
      name,
      description,
      type: selectedTemplate.type,
      system_prompt: systemPrompt,
      model,
      personality: selectedTemplate.personality,
    });

    // Reset form
    setStep('template');
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    setSystemPrompt('');
    setModel('google/gemini-2.5-flash');
    onOpenChange(false);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="h-6 w-6" />;
      case 'Mic': return <Mic className="h-6 w-6" />;
      case 'Cog': return <Cog className="h-6 w-6" />;
      case 'Image': return <Image className="h-6 w-6" />;
      default: return <Sparkles className="h-6 w-6" />;
    }
  };

  const getTypeColor = (type: BotType) => {
    switch (type) {
      case 'chatbot': return 'bg-primary/10 text-primary border-primary/20';
      case 'voice_agent': return 'bg-accent/10 text-accent border-accent/20';
      case 'task_automation': return 'bg-warning/10 text-warning border-warning/20';
      case 'image_generation': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {step === 'template' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New AI Bot
              </DialogTitle>
              <DialogDescription>
                Choose a template to get started quickly
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {BOT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] hover:shadow-md ${getTypeColor(template.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      {getIcon(template.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm opacity-80 mt-1">{template.description}</p>
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-background/50">
                        {template.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Customize Your Bot
              </DialogTitle>
              <DialogDescription>
                Personalize your {selectedTemplate?.name} bot
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bot Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Bot"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your bot do?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">System Prompt</Label>
                <Textarea
                  id="prompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Instructions for your bot..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This defines your bot's personality and behavior
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('template')}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={!name}>
                Create Bot
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
