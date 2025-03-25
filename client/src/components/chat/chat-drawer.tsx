import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, SendHorizontal, X } from "lucide-react";
import { ChatProvider, useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Main chat drawer component that wraps everything with the ChatProvider
export function ChatDrawer() {
  return (
    <ChatProvider>
      <ChatDrawerContent />
    </ChatProvider>
  );
}

// The content of the chat drawer
function ChatDrawerContent() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { 
    conversations, 
    currentConversation, 
    setCurrentConversation,
    websocketStatus
  } = useChat();
  
  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          size="icon" 
          variant="outline" 
          className="relative rounded-full h-10 w-10 fixed bottom-5 right-5 shadow-md"
        >
          <MessageCircle className="h-5 w-5" />
          {conversations.some(c => c.unreadCount && c.unreadCount > 0) && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
            >
              {conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Chat</span>
            <Badge variant={websocketStatus === 'connected' ? 'outline' : 'destructive'} className="ml-2 text-xs">
              {websocketStatus}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="conversations" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="messages" disabled={!currentConversation}>
              {currentConversation ? "Messages" : "Select a chat"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversations" className="flex-1 flex flex-col mt-0">
            <ConversationsList setOpen={setOpen} />
          </TabsContent>
          
          <TabsContent value="messages" className="flex-1 flex flex-col mt-0 relative">
            {currentConversation ? (
              <>
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {currentConversation.otherUser?.fullName || "User"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentConversation.item?.title || currentConversation.item?.type || "Conversation"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentConversation(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <MessagesList />
                <MessageInput setOpen={setOpen} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Component to display the list of conversations
function ConversationsList({ setOpen }: { setOpen: (open: boolean) => void }) {
  const { 
    conversations, 
    loadingConversations, 
    currentConversation, 
    setCurrentConversation 
  } = useChat();

  function selectConversation(conversation: typeof conversations[0]) {
    setCurrentConversation(conversation);
    // Switch to messages tab when a conversation is selected
    const messagesTab = document.querySelector('[data-value="messages"]') as HTMLElement;
    if (messagesTab) {
      messagesTab.click();
    }
  }

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 p-4">
        <p className="text-muted-foreground mb-2">No conversations yet</p>
        <p className="text-sm text-center mb-4">
          Start a conversation by clicking the chat button on a job or product
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              currentConversation?.id === conversation.id
                ? "bg-primary/10"
                : "hover:bg-muted"
            }`}
            onClick={() => selectConversation(conversation)}
          >
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>
                  {conversation.otherUser?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {conversation.otherUser?.fullName || "User"}
                  </h4>
                  {conversation.lastMessageAt && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {format(new Date(conversation.lastMessageAt), "MMM d, h:mm a")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.item?.title || conversation.item?.type || "Conversation"}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs capitalize">
                    {conversation.itemType === "job" ? "Job Request" : "Product Request"}
                  </span>
                  {conversation.unreadCount ? (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unreadCount} new
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Component to display the messages in a conversation
function MessagesList() {
  const { user } = useAuth();
  const { messages, loadingMessages } = useChat();

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <ScrollArea className="flex-1 p-4">
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      </ScrollArea>
    );
  }

  // Group messages by date
  const groupedMessages: { [date: string]: typeof messages } = {};
  messages.forEach((message) => {
    const date = format(new Date(message.createdAt), "MMMM d, yyyy");
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">{date}</span>
              <Separator className="flex-1" />
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.senderId === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className="mt-1 flex justify-end">
                    <span className="text-xs opacity-70">
                      {format(new Date(message.createdAt), "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Component for the message input
function MessageInput({ setOpen }: { setOpen: (open: boolean) => void }) {
  const [message, setMessage] = useState("");
  const { sendMessage } = useChat();

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage(message.trim());
    setMessage("");
  }

  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t mt-auto">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button size="icon" type="submit" disabled={!message.trim()}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}