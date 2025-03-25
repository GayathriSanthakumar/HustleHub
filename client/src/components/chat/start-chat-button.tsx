import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ChatProvider, useChat } from "@/hooks/use-chat";

// Button component to start a new conversation
export function StartChatButton({
  businessId,
  userId,
  itemId,
  itemType,
  disabled = false,
}: {
  businessId: number;
  userId: number;
  itemId: number;
  itemType: "job" | "product";
  disabled?: boolean;
}) {
  const [creating, setCreating] = useState(false);
  
  return (
    <ChatProvider>
      <StartChatButtonContent
        businessId={businessId}
        userId={userId}
        itemId={itemId}
        itemType={itemType}
        disabled={disabled}
        creating={creating}
        setCreating={setCreating}
      />
    </ChatProvider>
  );
}

// Actual implementation of the start chat button
function StartChatButtonContent({
  businessId,
  userId,
  itemId,
  itemType,
  disabled = false,
  creating,
  setCreating,
}: {
  businessId: number;
  userId: number;
  itemId: number;
  itemType: "job" | "product";
  disabled?: boolean;
  creating: boolean;
  setCreating: (creating: boolean) => void;
}) {
  const { createConversation, setCurrentConversation } = useChat();
  
  async function handleStartChat() {
    if (creating) return;
    
    setCreating(true);
    try {
      const conversation = await createConversation({
        businessId,
        userId,
        itemId,
        itemType,
      });
      
      // Open chat drawer with this conversation
      setCurrentConversation(conversation);
      
      // Click the chat trigger button to open the drawer
      const chatTrigger = document.querySelector('[class*="fixed bottom-5 right-5"]') as HTMLElement;
      if (chatTrigger) {
        chatTrigger.click();
      }
      
      // Switch to messages tab
      setTimeout(() => {
        const messagesTab = document.querySelector('[data-value="messages"]') as HTMLElement;
        if (messagesTab) {
          messagesTab.click();
        }
      }, 100);
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setCreating(false);
    }
  }
  
  return (
    <Button
      onClick={handleStartChat}
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={disabled || creating}
    >
      <MessageCircle className="h-4 w-4" />
      {creating ? "Starting chat..." : "Chat"}
    </Button>
  );
}