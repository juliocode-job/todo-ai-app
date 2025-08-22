'use client';

import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function SimpleChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '🤖 Hello! I\'m your AI Todo Bot. Try these commands:\n\n• #todo help - Show all commands\n• #todo add [task] - Create new todo\n• #todo list - Show your todos\n\nWhat would you like to do?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://your-n8n-instance.com/webhook/your-webhook-id');

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send to n8n webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: inputMessage,
          from: 'web-test@example.com',
          fromMe: false
        })
      });

      let botResponse = '';
      if (response.ok) {
        const data = await response.json();
        botResponse = data.message || 'Command processed successfully!';
      } else {
        botResponse = 'Sorry, there was an error processing your request. Please check your webhook URL.';
      }

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Error: Could not connect to chatbot. Please check your webhook URL configuration.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white">
          <Bot className="w-6 h-6 text-white" />
          AI Todo Bot - Test Interface
        </h1>
        <p className="text-sm text-blue-100">Test your n8n chatbot workflow</p>
      </div>

      {/* Webhook Configuration */}
      <div className="p-4 bg-yellow-50 border-b border-yellow-200">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          n8n Webhook URL:
        </label>
        <input
          type="text"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
          className="w-full px-3 py-2 border border-gray-400 rounded-md text-sm text-gray-900 bg-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-md ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-700" />
                )}
                <span className={`text-xs font-medium ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className={`whitespace-pre-line text-sm leading-relaxed ${
                message.sender === 'user' ? 'text-white' : 'text-gray-900'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-md max-w-xs px-4 py-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-gray-700" />
                <span className="text-xs font-medium text-gray-600">Bot is typing...</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your command... (e.g., #todo help)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-700 bg-gray-100 p-3 rounded-md">
          <strong className="text-gray-900">Available commands:</strong> 
          <span className="text-gray-800"> #todo help, #todo add [task], #todo list, #todo complete [number], #todo delete [number]</span>
        </div>
      </div>
    </div>
  );
}