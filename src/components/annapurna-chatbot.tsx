
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Mic, Send, Square, User, Waves, ThumbsUp, ThumbsDown } from "lucide-react";
import { annapurnaChat, AnnapurnaChatOutput } from "@/ai/flows/annapurna-chat-flow";
import { generateSpeech } from "@/ai/flows/text-to-speech";
import { useTranslation } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

interface BaseMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

interface ActionableMessage extends BaseMessage {
    actions?: {
        intent: string;
        route?: string;
        responded: boolean;
    }
}

type Message = BaseMessage | ActionableMessage;

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

const intentToRouteMap: Record<string, string> = {
    navigate_dashboard: '/dashboard',
    navigate_crop_doctor: '/dashboard/crop-doctor',
    navigate_market_analyst: '/dashboard/market-analyst',
    navigate_schemes: '/dashboard/schemes',
    navigate_weather: '/dashboard/weather',
    navigate_community: '/dashboard/community',
    navigate_shop: '/dashboard/shop',
    navigate_learn: '/dashboard/learn',
    navigate_tracker: '/dashboard/tracker',
    navigate_recommender: '/dashboard/crop-recommender',
    navigate_profile: '/dashboard/profile',
    navigate_settings: '/dashboard/settings',
    query_market_prices: '/dashboard/market-analyst',
    query_schemes: '/dashboard/schemes',
    query_crop_recommendation: '/dashboard/crop-recommender'
};

// Store messages and session state outside the component to persist during the session
let chatHistory: Message[] = [];

export function AnnapurnaChatbot() {
  const { t, language } = useTranslation();
  const { userProfile } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(chatHistory);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const playAudio = useCallback(async (text: string, messageId: number) => {
    // Stop any currently playing audio before starting a new one
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    
    setIsSpeaking(messageId);
    try {
      const response = await generateSpeech({ text, language });
      if (response.media) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.onended = () => setIsSpeaking(null);
          audioRef.current.onpause = () => setIsSpeaking(null);
        }
        audioRef.current.src = response.media;
        audioRef.current.play();
      } else {
        setIsSpeaking(null);
      }
    } catch (error) {
      console.error("Speech generation failed", error);
      setIsSpeaking(null);
    }
  }, [language]);

  useEffect(() => {
    chatHistory = messages;
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Effect to reset chat when language changes
  useEffect(() => {
    // When the language changes, clear the chat history.
    // The welcome message will be re-added by the effect below.
    setMessages([]);
  }, [language]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessageText = t('chatbot.welcomeMessage', { name: userProfile?.displayName?.split(' ')[0] || t('dashboard.farmer') });
      const messageId = Date.now();
      const welcomeMessage: Message = { id: messageId, sender: 'bot', text: welcomeMessageText };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, t, userProfile, language]);

  useEffect(() => {
    // Audio cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleAction = (messageId: number, confirm: boolean) => {
    let routeToNavigate: string | undefined;

    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId && 'actions' in msg && msg.actions) {
        if (confirm && msg.actions.route) {
          routeToNavigate = msg.actions.route;
        }
        return { ...msg, actions: { ...msg.actions, responded: true } };
      }
      return msg;
    });

    setMessages(updatedMessages);

    if (routeToNavigate) {
      router.push(routeToNavigate);
      setIsOpen(false);
    }
  }

  const handleBotResponse = (result: AnnapurnaChatOutput) => {
    const messageId = Date.now();
    const route = intentToRouteMap[result.intent];

    const botMessage: ActionableMessage = { 
        id: messageId, 
        sender: 'bot', 
        text: result.response,
        actions: route ? { intent: result.intent, route, responded: false } : undefined
    };
    
    setMessages(prev => [...prev, botMessage]);

    // Play TTS response only if there's text
    if (result.response) {
      playAudio(result.response, messageId);
    }
  }

  const handleSendMessage = async (e?: React.FormEvent, messageText?: string) => {
    e?.preventDefault();
    const currentMessage = messageText || input;
    if (currentMessage.trim() === '') return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: currentMessage };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(null);
    }

    try {
      const result = await annapurnaChat({ query: currentMessage, language });
      handleBotResponse(result);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { id: Date.now(), sender: 'bot', text: t('chatbot.errorMessage') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!SpeechRecognition) {
      toast({ title: t('toast.browserNotSupported'), description: t('toast.noVoiceSupport'), variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    const langMap = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' };
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(undefined, transcript);
    };
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        toast({ title: t('toast.noSpeechDetected'), description: t('toast.tryAgain'), variant: "destructive" });
      } else {
        toast({ title: t('toast.voiceError'), description: event.error, variant: "destructive" });
      }
    };
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50" size="icon">
          <Bot className="h-8 w-8" />
          <span className="sr-only">{t('chatbot.open')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-4 border-b text-left">
          <SheetTitle>{t('chatbot.title')}</SheetTitle>
          <SheetDescription>{t('chatbot.description')}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1" viewportRef={viewportRef}>
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'bot' && <Avatar className="bg-primary text-primary-foreground"><AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback></Avatar>}
                <div className="rounded-lg p-3 max-w-[80%] text-sm bg-muted">
                  <div className="flex items-center gap-2">
                    <span>{message.text}</span>
                    {message.sender === 'bot' && isSpeaking === message.id && (
                       <Waves className="h-4 w-4 text-primary animate-pulse" />
                    )}
                  </div>
                  {'actions' in message && message.actions && !message.actions.responded && (
                    <div className="mt-2 pt-2 border-t border-muted-foreground/20 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleAction(message.id, true)}>
                            <ThumbsUp className="mr-2 h-4 w-4"/> {t('chatbot.yes')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(message.id, false)}>
                            <ThumbsDown className="mr-2 h-4 w-4"/> {t('chatbot.no')}
                        </Button>
                    </div>
                  )}
                </div>
                 {message.sender === 'user' && <Avatar className="border"><AvatarFallback><User className="h-5 w-5"/></AvatarFallback></Avatar>}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="bg-primary text-primary-foreground"><AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback></Avatar>
                    <div className="rounded-lg p-3 max-w-[80%] bg-muted">
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbot.placeholder')}
              disabled={isLoading || isRecording}
            />
             <Button variant={isRecording ? "destructive" : "outline"} size="icon" type="button" onClick={handleMicClick} disabled={isLoading}>
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
             </Button>
            <Button type="submit" size="icon" disabled={isLoading || isRecording || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
