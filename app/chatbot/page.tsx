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
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.harmonyservices.com.br/webhook/whatsapp-bot');

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
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('🔗 Sending to webhook:', webhookUrl);
      console.log('📤 Payload:', { body: currentMessage, from: 'web-test@example.com', fromMe: false });

      // Send to n8n webhook with proper payload structure
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          body: currentMessage,
          from: 'web-test@example.com',
          fromMe: false
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);

      let botResponse = '';
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log('📥 Response data:', data);
          
          // Try different possible response structures
          botResponse = data.message || 
                       data.text || 
                       data.response || 
                       data.body ||
                       JSON.stringify(data) ||
                       'Command processed successfully!';
                       
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          const textResponse = await response.text();
          console.log('📥 Raw response:', textResponse);
          botResponse = textResponse || 'Command processed successfully!';
        }
      } else {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        botResponse = `❌ Error ${response.status}: ${errorText || 'Please check your webhook URL and n8n workflow.'}`;
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
      console.error('❌ Network error:', error);
      
      let errorMessage = '❌ Connection Error: ';
      if (error instanceof TypeError) {
        errorMessage += 'Network error - check if n8n is accessible and CORS is configured.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
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

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: '#todo help',
          from: 'connection-test@example.com',
          fromMe: false
        })
      });
      
      if (response.ok) {
        const testMessage: Message = {
          id: Date.now().toString(),
          text: '✅ Connection test successful! Webhook is working.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, testMessage]);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: '❌ Connection test failed. Check webhook URL and n8n status.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
      <div className="p-4 bg-green-50 border-b border-green-200">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900">
            n8n Webhook URL:
          </label>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>
        <input
          type="text"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://n8n.harmonyservices.com.br/webhook/whatsapp-bot"
          className="w-full px-3 py-2 border border-gray-400 rounded-md text-sm text-gray-900 bg-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="mt-1 text-xs text-green-700">
          ✅ Production URL configured - Ready to test!
        </div>
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
                <span className="text-xs font-medium text-gray-600">Bot is thinking...</span>
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
        
        <div className="mt-2 text-xs text-blue-600">
          💡 Tip: Click in Test Connection to verify n8n webhook is working
        </div>
      </div>
    </div>
  );
}