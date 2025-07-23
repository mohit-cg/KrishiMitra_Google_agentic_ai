
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Paperclip, Send, Square, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";

const initialRooms = [
  { id: "general", name: "General Discussion" },
  { id: "tomato", name: "Tomato Farming" },
  { id: "pest", name: "Pest Control" },
  { id: "organic", name: "Organic Methods" },
  { id: "market", name: "Market Prices" },
];

const allMessages = {
  general: [
    { user: "Ramesh", avatar: "https://placehold.co/40x40.png", text: "Has anyone tried the new organic fertilizer? Seeing good results here.", isSelf: false, hint: "farmer portrait" },
    { user: "Suresh", avatar: "https://placehold.co/40x40.png", text: "Yes, I have! My tomato yield has increased by almost 15%.", isSelf: false, hint: "farmer portrait" },
    { user: "You", avatar: "https://placehold.co/40x40.png", text: "That's great to hear! I was thinking of buying it. Is it good for leafy greens?", isSelf: true, hint: "farmer portrait" },
    { user: "Geeta", avatar: "https://placehold.co/40x40.png", text: "Absolutely! My spinach has never been healthier.", isSelf: false, hint: "farmer portrait" },
  ],
  tomato: [
      { user: "Suresh", avatar: "https://placehold.co/40x40.png", text: "My tomato plants are showing some yellow leaves. Any advice?", isSelf: false, hint: "farmer portrait" },
      { user: "You", avatar: "https://placehold.co/40x40.png", text: "Could be a nitrogen deficiency. Have you tested your soil recently?", isSelf: true, hint: "farmer portrait" },
  ],
  pest: [
      { user: "Ravi", avatar: "https://placehold.co/40x40.png", text: "Whiteflies are a major issue in my cotton crop. What's the best way to handle them?", isSelf: false, hint: "farmer portrait" },
  ],
  organic: [
      { user: "Priya", avatar: "https://placehold.co/40x40.png", text: "I'm looking for good organic composting techniques. Any resources?", isSelf: false, hint: "farmer portrait" },
      { user: "You", avatar: "https://placehold.co/40x40.png", text: "The E-Learning Hub has some great articles on vermicomposting!", isSelf: true, hint: "farmer portrait" },
  ],
  market: [
    { user: "Amit", avatar: "https://placehold.co/40x40.png", text: "Onion prices in Pune seem to be dropping. Should I sell now or wait?", isSelf: false, hint: "farmer portrait" },
  ],
};

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));


export default function CommunityPage() {
  const { t } = useTranslation();
  const [rooms] = useState(initialRooms.map(r => ({...r, name: t(`community.rooms.${r.id}`)})));
  const [activeRoom, setActiveRoom] = useState(rooms[0]);
  const [messages, setMessages] = useState(allMessages[activeRoom.id]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);


  const handleRoomChange = (room) => {
    setActiveRoom(room);
    setMessages(allMessages[room.id] || []);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" && !attachmentPreview) return;

    const messageToSend = {
      user: "You",
      avatar: "https://placehold.co/40x40.png",
      text: newMessage,
      attachment: attachmentPreview,
      isSelf: true,
      hint: "farmer portrait"
    };

    const updatedMessages = [...messages, messageToSend];
    setMessages(updatedMessages);
    
    // This part would be a database call in a real app
    allMessages[activeRoom.id] = updatedMessages;
    
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

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

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
      <h1 className="text-3xl font-bold mb-2 font-headline">{t('community.title')}</h1>
      <p className="text-muted-foreground mb-4">
        {t('community.description')}
      </p>

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
                    {!msg.isSelf && <Avatar><AvatarImage src={msg.avatar} data-ai-hint={msg.hint} /><AvatarFallback>{msg.user.substring(0, 2)}</AvatarFallback></Avatar>}
                    <div className={`rounded-lg p-3 max-w-xs ${msg.isSelf ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {!msg.isSelf && <p className="font-semibold text-sm mb-1">{msg.user}</p>}
                      {msg.attachment && (
                        <div className="relative aspect-video mb-2">
                           <Image src={msg.attachment} alt="Attachment" layout="fill" objectFit="cover" className="rounded-md" />
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    {msg.isSelf && <Avatar><AvatarImage src={msg.avatar} data-ai-hint={msg.hint} /><AvatarFallback>{t('community.you')}</AvatarFallback></Avatar>}
                  </div>
                ))}
              </div>
            </ScrollArea>
             {attachmentPreview && (
                <div className="mt-4 p-2 border-t relative">
                    <p className="text-xs font-semibold mb-2 text-muted-foreground">{t('community.attachmentPreview')}</p>
                    <div className="relative w-24 h-24">
                        <Image src={attachmentPreview} alt={t('community.attachmentPreview')} layout="fill" objectFit="cover" className="rounded-md"/>
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
                <Send className="h-4 w-4 mr-2" />
                {attachmentPreview ? t('community.sendPhoto') : t('community.send')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    