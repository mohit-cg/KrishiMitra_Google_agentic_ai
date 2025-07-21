import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Paperclip, Send } from "lucide-react";

const rooms = [
  { name: "General Discussion", active: true },
  { name: "Tomato Farming", active: false },
  { name: "Pest Control", active: false },
  { name: "Organic Methods", active: false },
  { name: "Market Prices", active: false },
];

const messages = [
  { user: "Ramesh", avatar: "https://placehold.co/40x40.png", text: "Has anyone tried the new organic fertilizer? Seeing good results here.", isSelf: false, hint: "farmer portrait" },
  { user: "Suresh", avatar: "https://placehold.co/40x40.png", text: "Yes, I have! My tomato yield has increased by almost 15%.", isSelf: false, hint: "farmer portrait" },
  { user: "You", avatar: "https://placehold.co/40x40.png", text: "That's great to hear! I was thinking of buying it. Is it good for leafy greens?", isSelf: true, hint: "farmer portrait" },
  { user: "Geeta", avatar: "https://placehold.co/40x40.png", text: "Absolutely! My spinach has never been healthier.", isSelf: false, hint: "farmer portrait" },
];

export default function CommunityPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-3xl font-bold mb-2 font-headline">Community Forum</h1>
      <p className="text-muted-foreground mb-4">
        Connect with other farmers, share knowledge, and grow together.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Chat Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li key={room.name}>
                  <Button variant={room.active ? "secondary" : "ghost"} className="w-full justify-start">
                    {room.name}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>#General Discussion</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-grow pr-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.isSelf ? "justify-end" : ""}`}>
                    {!msg.isSelf && <Avatar><AvatarImage src={msg.avatar} data-ai-hint={msg.hint} /><AvatarFallback>{msg.user.substring(0, 2)}</AvatarFallback></Avatar>}
                    <div className={`rounded-lg p-3 max-w-xs ${msg.isSelf ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {!msg.isSelf && <p className="font-semibold text-sm mb-1">{msg.user}</p>}
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    {msg.isSelf && <Avatar><AvatarImage src={msg.avatar} data-ai-hint={msg.hint} /><AvatarFallback>You</AvatarFallback></Avatar>}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 flex items-center gap-2">
              <Input placeholder="Type a message..." />
              <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Mic className="h-4 w-4" /></Button>
              <Button><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
