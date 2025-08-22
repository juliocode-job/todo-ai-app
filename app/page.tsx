'use client';

import React, { useState, useEffect } from 'react';
import { Check, Edit2, Trash2, Plus, Loader2, ChevronDown, ChevronUp, User, Bot, ExternalLink } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Todo {
  id: string;
  user_identifier: string;
  title: string;
  description?: string;
  ai_enhanced_description?: string;
  steps?: Array<{ step: number; description: string }>;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [userIdentifier, setUserIdentifier] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedUser = localStorage.getItem('todoUserIdentifier');
    if (savedUser) {
      console.log(`👤 Found saved user: ${savedUser}`);
      setUserIdentifier(savedUser);
      setIsLoggedIn(true);
      fetchTodos(savedUser);
    }
  }, []);

  const fetchTodos = async (identifier: string) => {
    console.log(`🔄 Fetching todos for: ${identifier}`);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/todos?user_identifier=${encodeURIComponent(identifier)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Fetched ${data.length} todos`);
      setTodos(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!userIdentifier.trim()) {
      toast.error('Please enter your email or name');
      return;
    }
    
    console.log(`🔐 Logging in as: ${userIdentifier}`);
    localStorage.setItem('todoUserIdentifier', userIdentifier);
    setIsLoggedIn(true);
    fetchTodos(userIdentifier);
    toast.success(`Welcome, ${userIdentifier}!`);
  };

  const createTodo = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    console.log(`➕ Creating todo: ${newTitle}`);
    setLoading(true);
    
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_identifier: userIdentifier,
          title: newTitle,
          description: newDescription
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create todo');
      }
      
      const newTodo = await response.json();
      console.log('✅ Todo created:', newTodo);
      
      setTodos([newTodo, ...todos]);
      setNewTitle('');
      setNewDescription('');
      setExpandedTodos(new Set([...expandedTodos, newTodo.id]));
      toast.success('Todo created with AI enhancement!');
    } catch (err) {
      console.error('❌ Create error:', err);
      toast.error('Failed to create todo');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    console.log(`✓ Toggling completion for: ${todo.id}`);
    
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !todo.is_completed })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      
      const updated = await response.json();
      setTodos(todos.map(t => t.id === todo.id ? updated : t));
      toast.success(todo.is_completed ? 'Todo marked as incomplete' : 'Todo completed!');
    } catch (err) {
      console.error('❌ Update error:', err);
      toast.error('Failed to update todo');
    }
  };

  const updateTodo = async (id: string) => {
    if (!editTitle.trim()) return;
    
    console.log(`📝 Updating todo: ${id}`);
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update todo');
      }
      
      const updated = await response.json();
      setTodos(todos.map(t => t.id === id ? updated : t));
      setEditingId(null);
      toast.success('Todo updated!');
    } catch (err) {
      console.error('❌ Update error:', err);
      toast.error('Failed to update todo');
    }
  };

  const deleteTodo = async (id: string) => {
    console.log(`🗑️ Deleting todo: ${id}`);
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
      
      setTodos(todos.filter(t => t.id !== id));
      toast.success('Todo deleted!');
    } catch (err) {
      console.error('❌ Delete error:', err);
      toast.error('Failed to delete todo');
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedTodos);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTodos(newExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem('todoUserIdentifier');
    setIsLoggedIn(false);
    setTodos([]);
    setUserIdentifier('');
    toast.success('Logged out successfully');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📝 AI-Enhanced Todo List
            </h1>
            <p className="text-gray-600">Organize your tasks with AI-powered insights</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your email or name to continue
              </label>
              <input
                type="text"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="john@example.com or John"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>🚀 New Feature:</strong> Test our AI Chatbot!
            </p>
            <a 
              href="/chatbot" 
              target="_blank"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Bot className="w-4 h-4" />
              Try Chatbot Interface
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        {/* Header with enhanced navigation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📝 My Todo List</h1>
              <p className="text-gray-600 text-sm mt-1">AI-enhanced task management</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Chatbot Link */}
              <a 
                href="/chatbot" 
                target="_blank"
                className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm border border-green-200"
                title="Test the AI Chatbot Interface"
              >
                <Bot className="w-4 h-4" />
                🤖 Test Chatbot
                <ExternalLink className="w-3 h-3" />
              </a>
              
              {/* User Info & Logout */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                <User className="w-4 h-4" />
                <span className="font-medium">{userIdentifier}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-red-600 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Todo Creation Form */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && createTodo()}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={createTodo}
                disabled={loading || !newTitle.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Task
              </button>
            </div>
            
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Optional: Add more details for better AI enhancement..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black placeholder-gray-400"
              disabled={loading}
            />
            
            {newTitle && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                💡 <strong>AI Enhancement:</strong> Our AI will automatically improve this task with actionable steps and helpful details!
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>📊 <strong>Total:</strong> {todos.length} tasks</span>
            <span>✅ <strong>Completed:</strong> {todos.filter(t => t.is_completed).length}</span>
            <span>⏳ <strong>Pending:</strong> {todos.filter(t => !t.is_completed).length}</span>
            <span>🤖 <strong>AI Enhanced:</strong> {todos.filter(t => t.ai_enhanced_description).length}</span>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {loading && todos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Loading your tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg font-medium">No tasks yet!</p>
              <p className="text-sm mt-2">Add your first task above to get started with AI-enhanced productivity.</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>💡 Pro Tip:</strong> Try creating a task like 'Schedule dentist appointment' to see our AI enhancement in action!
                </p>
              </div>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-lg ${
                  todo.is_completed ? 'opacity-75 bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleComplete(todo)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      todo.is_completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {todo.is_completed && <Check className="w-4 h-4 text-white" />}
                  </button>

                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => updateTodo(todo.id)}
                      onKeyDown={(e) => e.key === 'Enter' && updateTodo(todo.id)}
                      className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none text-black"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                      )}
                      {todo.ai_enhanced_description && (
                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          🤖 AI Enhanced • Click to expand details
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {todo.ai_enhanced_description && (
                      <button
                        onClick={() => toggleExpanded(todo.id)}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                        title="Toggle AI details"
                      >
                        {expandedTodos.has(todo.id) ? 
                          <ChevronUp className="w-5 h-5" /> : 
                          <ChevronDown className="w-5 h-5" />
                        }
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditTitle(todo.title);
                      }}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {expandedTodos.has(todo.id) && todo.ai_enhanced_description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        🤖 AI Enhancement
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Powered by OpenAI</span>
                      </h4>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{todo.ai_enhanced_description}</p>
                      
                      {todo.steps && todo.steps.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-gray-800 mb-2">📋 Steps to complete:</h5>
                          <ol className="space-y-2">
                            {todo.steps.map((step) => (
                              <li key={step.step} className="text-sm text-gray-600 flex gap-3 items-start">
                                <span className="font-medium bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                  {step.step}
                                </span>
                                <span className="flex-1">{step.description}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🚀 Built with Next.js, Supabase, and OpenAI • Enhanced with AI-powered task management</p>
          <p className="mt-1">
            Try our <a href="/chatbot" target="_blank" className="text-blue-600 hover:text-blue-700 font-medium">🤖 Chatbot Interface</a> for hands-free task management!
          </p>
        </div>
      </div>
    </div>
  );
}