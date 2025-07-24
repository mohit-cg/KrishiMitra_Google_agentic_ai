
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Mic, Send, Square, User } from "lucide-react";
import { annapurnaChat } from "@/ai/flows/annapurna-chat-flow";
import { useTranslation } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export function AnnapurnaChatbot() {
  const { t, language } = useTranslation();
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length) {
      scrollAreaRef.current?.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ sender: 'bot', text: t('chatbot.welcomeMessage', { name: userProfile?.displayName?.split(' ')[0] || t('dashboard.farmer') }) }]);
    }
  }, [isOpen, messages.length, t, userProfile]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await annapurnaChat({ query: input, language });
      const botMessage: Message = { sender: 'bot', text: result.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { sender: 'bot', text: t('chatbot.errorMessage') };
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
        setInput(transcript);
        // Automatically send the message after successful recognition
        // This makes it feel more like a voice assistant
        const userMessage: Message = { sender: 'user', text: transcript };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        annapurnaChat({ query: transcript, language })
            .then(result => {
                const botMessage: Message = { sender: 'bot', text: result.response };
                setMessages(prev => [...prev, botMessage]);
            })
            .catch(error => {
                console.error("Chatbot error:", error);
                const errorMessage: Message = { sender: 'bot', text: t('chatbot.errorMessage') };
                setMessages(prev => [...prev, errorMessage]);
            })
            .finally(() => setIsLoading(false));
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
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 p-0 overflow-hidden" size="icon">
          <Image src="https://storage.googleapis.com/studiostack-public-dev/annapurna-chatbot.png" alt="Annapurna Chatbot" width={64} height={64} />
          <span className="sr-only">{t('chatbot.open')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0">
        <SheetHeader className="p-4 border-b text-left">
          <SheetTitle>{t('chatbot.title')}</SheetTitle>
          <SheetDescription>{t('chatbot.description')}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'bot' && <Avatar className="bg-primary text-primary-foreground"><AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback></Avatar>}
                <div className={`rounded-lg p-3 max-w-[80%] text-sm ${message.sender === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}`}>
                  {message.text}
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
            <Button type="submit" size="icon" disabled={isLoading || isRecording}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
