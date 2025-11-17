import { useState, useEffect, useRef } from 'react';
import { Send, X, MoreVertical, ArrowDown, Circle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useSponsorship } from '../../contexts/SponsorshipContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  sponsorshipId: string;
  childName: string;
  onClose: () => void;
}

export function ChatInterface({ sponsorshipId, childName, onClose }: ChatInterfaceProps) {
  const { getChatMessages, sendMessage, markMessagesAsRead } = useSponsorship();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const messages = getChatMessages(sponsorshipId);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    markMessagesAsRead(sponsorshipId);
  }, [messages, sponsorshipId, markMessagesAsRead]);

  // Handle scroll to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    if (message.length > 2000) {
      toast.error('El mensaje no puede exceder 2000 caracteres');
      return;
    }

    setIsSending(true);
    try {
      await sendMessage(sponsorshipId, message.trim());
      setMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return date.toLocaleDateString('es-CO', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    }
  };

  const getDateSeparator = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = getDateSeparator(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        <DialogTitle className="sr-only">Chat con Coordinadora sobre {childName}</DialogTitle>
        <DialogDescription className="sr-only">
          Conversación de mensajería para comunicarte con la coordinadora sobre el niño apadrinado
        </DialogDescription>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                CF
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-gray-900">Conversación sobre {childName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                <span>Coordinadora María</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Silenciar notificaciones</DropdownMenuItem>
                <DropdownMenuItem>Archivar conversación</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Reportar problema</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-gray-900 mb-2">No hay mensajes aún</h4>
                <p className="text-gray-600">
                  Inicia la conversación preguntando sobre {childName}
                </p>
              </div>
            </div>
          ) : (
            <>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Messages */}
                  {msgs.map((msg) => {
                    const isOwnMessage = user?.role === 'padrino' ? msg.senderRole === 'padrino' : msg.senderRole === 'admin';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src="" />
                          <AvatarFallback className={`text-white text-xs ${
                            msg.senderRole === 'admin' 
                              ? 'bg-gradient-to-br from-blue-400 to-blue-500' 
                              : 'bg-gradient-to-br from-amber-400 to-amber-500'
                          }`}>
                            {msg.senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          {!isOwnMessage && (
                            <span className="text-xs text-gray-500 mb-1">{msg.senderName}</span>
                          )}
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                            {isOwnMessage && (
                              <span className="text-xs">
                                {msg.read ? (
                                  <span className="text-blue-600">✓✓</span>
                                ) : msg.delivered ? (
                                  <span className="text-gray-400">✓✓</span>
                                ) : (
                                  <span className="text-gray-400">✓</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 mb-4">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-500 text-white text-xs">
                      CF
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <ArrowDown className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Escribe un mensaje sobre ${childName}...`}
              className="flex-1 min-h-[60px] max-h-32 resize-none"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white h-[60px] px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
            <span className={message.length > 2000 ? 'text-red-600' : ''}>
              {message.length}/2000
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

