
"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Paperclip, Send, Square, X, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";

const initialRooms = [
  { id: "general", name: "General Discussion" },
  { id: "tomato", name: "Tomato Farming" },
  { id: "pest", name: "Pest Control" },
  { id: "organic", name: "Organic Methods" },
  { id: "market", name: "Market Prices" },
];


// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export default function CommunityPage() {
  const { t, language } = useTranslation();

  const allMessages = useMemo(() => ({
    general: [
      { user: t('community.users.ramesh'), text: t('community.messages.general.0'), isSelf: false, hint: "indian farmer portrait" },
      { user: t('community.users.suresh'), text: t('community.messages.general.1'), isSelf: false, hint: "farmer smiling" },
      { user: t('community.you'), text: t('community.messages.general.2'), isSelf: true, hint: "farmer looking at phone" },
      { user: t('community.users.geeta'), text: t('community.messages.general.3'), isSelf: false, hint: "woman farmer india" },
    ],
    tomato: [
      { user: t('community.users.suresh'), text: t('community.messages.tomato.0'), isSelf: false, hint: "farmer smiling" },
      { user: t('community.you'), text: t('community.messages.tomato.1'), isSelf: true, hint: "farmer looking at phone" },
    ],
    pest: [
      { user: t('community.users.ravi'), text: t('community.messages.pest.0'), isSelf: false, hint: "serious farmer" },
    ],
    organic: [
      { user: t('community.users.priya'), text: t('community.messages.organic.0'), isSelf: false, hint: "woman farmer field" },
      { user: t('community.you'), text: t('community.messages.organic.1'), isSelf: true, hint: "farmer looking at phone" },
    ],
    market: [
      { user: t('community.users.amit'), text: t('community.messages.market.0'), isSelf: false, hint: "farmer on phone" },
    ],
  }), [t]);

  const [rooms] = useState(initialRooms.map(r => ({...r, name: t(`community.rooms.${r.id}`)})));
  const [activeRoom, setActiveRoom] = useState(rooms[0]);
  const [messages, setMessages] = useState(allMessages[activeRoom.id].map(m => ({ ...m, avatar: `https://placehold.co/40x40.png` })));
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);


  const handleRoomChange = (room) => {
    setActiveRoom(room);
    setMessages(allMessages[room.id].map(m => ({ ...m, avatar: `https://placehold.co/40x40.png` })) || []);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" && !attachmentPreview) return;

    const messageToSend = {
      user: t('community.you'),
      avatar: `https://placehold.co/40x40.png`,
      text: newMessage,
      attachment: attachmentPreview,
      isSelf: true,
      hint: "farmer looking at phone"
    };

    const updatedMessages = [...messages, messageToSend];
    setMessages(updatedMessages);
    
    // This part would be a database call in a real app
    // We update a mutable object for demo purposes
    const translatedMessages = allMessages[activeRoom.id].map(m => ({ ...m, avatar: `https://placehold.co/40x40.png` }));
    allMessages[activeRoom.id] = [...translatedMessages.slice(0, translatedMessages.length), { user: t('community.you'), text: newMessage, isSelf: true, hint: 'farmer looking at phone' }];
    
    setNewMessage("");
    setAttachmentPreview(null);
    if (attachmentInputRef.current) {
        attachmentInputRef.current.value = '';
    }
  };

  const handleMicClick = () => {
    if (!SpeechRecognition) {
      toast({ title: t('toast.browserNotSupported'), description: t('toast.noVoiceSupport'), variant: "destructive" });
      return;
    }
    
    const langMap = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN' };
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = langMap[language] || 'en-IN';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => setNewMessage(event.results[0][0].transcript);
    recognition.onerror = (event) => {
       if (event.error === 'no-speech') {
        toast({
            title: t('toast.noSpeechDetected'),
            description: t('toast.tryAgain'),
            variant: "destructive",
        });
      } else {
        toast({
            title: t('toast.voiceError'),
            description: event.error,
            variant: "destructive",
        });
      }
    };
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };
  
  const handleAttachmentClick = () => {
    attachmentInputRef.current?.click();
  };
  
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: t('toast.unsupportedFileType'),
          description: t('toast.selectAnImage'),
          variant: "destructive",
        });
      }
    }
  };
  
  const removeAttachment = () => {
      setAttachmentPreview(null);
      if (attachmentInputRef.current) {
          attachmentInputRef.current.value = '';
      }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">{t('community.title')}</h1>
          <p className="text-muted-foreground">
            {t('community.description')}
          </p>
        </div>
        <Button asChild variant="outline">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
            </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('community.chatRooms')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li key={room.id}>
                  <Button 
                    variant={activeRoom.id === room.id ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => handleRoomChange(room)}
                  >
                    {room.name}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>#{activeRoom.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.isSelf ? "justify-end" : ""}`}>
                    {!msg.isSelf && <Avatar><AvatarImage src={msg.avatar} data-ai-hint={msg.hint}/><AvatarFallback>{msg.user.substring(0, 2)}</AvatarFallback></Avatar>}
                    <div className={`rounded-lg p-3 max-w-xs ${msg.isSelf ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {!msg.isSelf && <p className="font-semibold text-sm mb-1">{msg.user}</p>}
                      {msg.attachment && (
                        <div className="relative aspect-video mb-2">
                           <Image src={msg.attachment} alt="Attachment" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="farmer shared image" />
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    {msg.isSelf && <Avatar><AvatarImage src={msg.avatar} data-ai-hint={msg.hint}/><AvatarFallback>{t('community.you')}</AvatarFallback></Avatar>}
                  </div>
                ))}
              </div>
            </ScrollArea>
             {attachmentPreview && (
                <div className="mt-4 p-2 border-t relative">
                    <p className="text-xs font-semibold mb-2 text-muted-foreground">{t('community.attachmentPreview')}</p>
                    <div className="relative w-24 h-24">
                        <Image src={attachmentPreview} alt={t('community.attachmentPreview')} layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="shared attachment"/>
                    </div>
                    <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8" onClick={removeAttachment}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">{t('community.removeAttachment')}</span>
                    </Button>
                </div>
              )}
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
              <Input 
                placeholder={t('community.typeMessage')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <input type="file" ref={attachmentInputRef} onChange={handleAttachment} className="hidden" accept="image/*" />

              <Button variant="ghost" size="icon" type="button" onClick={handleAttachmentClick}><Paperclip className="h-4 w-4" /></Button>
              <Button variant={isRecording ? "destructive" : "ghost"} size="icon" type="button" onClick={handleMicClick}>
                 {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                 <span className="sr-only">{isRecording ? t('community.stopRecording') : t('community.startRecording')}</span>
              </Button>
              <Button type="submit" disabled={!newMessage.trim() && !attachmentPreview}>
                <Send className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{attachmentPreview ? t('community.sendPhoto') : t('community.send')}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
