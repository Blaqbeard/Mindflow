import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, AlertTriangle, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useUserGuardContext } from 'app/auth';
import brain from 'brain';
import { ChatMessage } from 'types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

const Chat = () => {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await brain.get_chat_history();
      const data = await response.json();
      
      const historyMessages: Message[] = data.messages.map((msg: ChatMessage, index: number) => ({
        id: `${msg.id}-${index}`,
        text: msg.message_text,
        isUser: msg.message_type === 'user',
        timestamp: new Date(msg.created_at)
      }));
      
      setMessages(historyMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Create assistant message placeholder for streaming
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      // Use the streaming iterator from brain client
      let streamedText = '';
      
      for await (const chunk of brain.send_chat_message(
        { message: userMessage.text }
      )) {
        streamedText += chunk;
        
        // Update the assistant message with streamed content
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, text: streamedText, isStreaming: true }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove the placeholder message and show error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I apologize, but I'm having trouble responding right now. I'm still here to support you though. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      await brain.clear_chat_history();
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast.error('Failed to clear chat history');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    AI Companion
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your supportive mental health companion
                  </p>
                </div>
              </div>
            </div>
            
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Clear History
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            <strong>Important:</strong> I'm an AI companion designed to provide emotional support. 
            I'm not a replacement for professional mental health care. If you're experiencing a crisis, 
            please contact emergency services (112) or mental health helplines (234-818-886-0824).
          </AlertDescription>
        </Alert>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                I'm here to listen and support you. Share what's on your mind, 
                and let's talk through it together.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => setInputValue("I'm feeling anxious today")}
                >
                  I'm feeling anxious
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => setInputValue("I'm having trouble sleeping")}
                >
                  Sleep troubles
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => setInputValue("I feel overwhelmed")}
                >
                  Feeling overwhelmed
                </Badge>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${message.isUser ? 'order-2' : 'order-1'}`}>
                  <Card className={`${
                    message.isUser 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {!message.isUser && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Heart className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${
                            message.isUser 
                              ? 'text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {message.text}
                            {message.isStreaming && (
                              <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
                            )}
                          </p>
                          <p className={`text-xs mt-2 ${
                            message.isUser 
                              ? 'text-blue-100' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Share what's on your mind..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Crisis Resources */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Crisis Support:</strong> Emergency Services: 112 | 
              Lagos Emergency: 767 or 08000787746 | 
              Mental Health Helpline: 234-818-886-0824
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;


