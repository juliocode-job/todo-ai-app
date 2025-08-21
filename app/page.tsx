'use client';

import React, { useState, useEffect } from 'react';
import { Check, Edit2, Trash2, Plus, Loader2, ChevronDown, ChevronUp, User } from 'lucide-react';
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📝 AI-Enhanced Todo List
          </h1>
          
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">📝 My Todo List</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{userIdentifier}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('todoUserIdentifier');
                  setIsLoggedIn(false);
                  setTodos([]);
                  toast.success('Logged out successfully');
                }}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && createTodo()}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
                disabled={loading}
              />
              <button
                onClick={createTodo}
                disabled={loading || !newTitle.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
            </div>
            
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Optional: Add more details..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black placeholder-gray-400"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-3">
          {loading && todos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Loading todos...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p className="text-lg">No todos yet!</p>
              <p className="text-sm mt-2">Add your first task above to get started.</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white rounded-lg shadow-md p-4 transition-all ${
                  todo.is_completed ? 'opacity-75' : ''
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
                      <h3 className={`font-medium ${todo.is_completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
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
                    <button
                      onClick={() => {
                        setEditingId(todo.id);
                        setEditTitle(todo.title);
                      }}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {expandedTodos.has(todo.id) && todo.ai_enhanced_description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Enhancement</h4>
                      <p className="text-sm text-gray-700 mb-3">{todo.ai_enhanced_description}</p>
                      
                      {todo.steps && todo.steps.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium text-gray-800 mb-2">Steps to complete:</h5>
                          <ol className="space-y-1">
                            {todo.steps.map((step) => (
                              <li key={step.step} className="text-sm text-gray-600 flex gap-2">
                                <span className="font-medium">{step.step}.</span>
                                <span>{step.description}</span>
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
      </div>
    </div>
  );
}