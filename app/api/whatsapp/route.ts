import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enhanceTaskWithAI } from '@/lib/ai-service';

// Store user sessions
const sessions = new Map<string, { 
  state: string; 
  identifier?: string; 
  todoTitle?: string;
  todos?: any[];
}>();

// Send message via Ultramsg
async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const response = await fetch('https://api.ultramsg.com/instance140141/messages/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: 'fiu6150vd9eqc5nb',
        to: to,
        body: message
      })
    });
    
    const result = await response.json();
    console.log('Message sent:', result);
    return result;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}

export async function POST(request: NextRequest) {
  console.log('📱 WhatsApp webhook received');
  
  try {
    const body = await request.json();
    console.log('Webhook data:', body);
    
    // Ultramsg sends data in this format
    const from = body.from || body.data?.from;
    const text = body.body || body.data?.body || '';
    const phoneNumber = from?.replace('@c.us', '').replace('+', '');
    
    // Skip if no message
    if (!from || !text) {
      return NextResponse.json({ ok: true });
    }
    
    // Skip your own number to avoid loops
    if (phoneNumber === '5581995378398') {
      return NextResponse.json({ ok: true });
    }
    
    console.log(`Message from ${phoneNumber}: ${text}`);
    
    // Get or create session
    let session = sessions.get(phoneNumber) || { state: 'NEW' };
    
    // Check for #todolist trigger
    if (!text.toLowerCase().includes('#todolist') && session.state === 'NEW') {
      return NextResponse.json({ ok: true });
    }
    
    let responseText = '';
    
    // Handle conversation flow
    if (session.state === 'NEW' && text.toLowerCase().includes('#todolist')) {
      session.state = 'AWAITING_ID';
      responseText = `👋 *Welcome to Todo Bot!*\n\nI'll help you manage your todos.\n\n*Please reply with your email or name to continue:*\n\nExample: john@email.com or John`;
      
    } else if (session.state === 'AWAITING_ID') {
      session.identifier = text.trim();
      session.state = 'IDENTIFIED';
      responseText = `✅ *Welcome ${session.identifier}!*\n\n*Commands:*\n1️⃣ - List todos\n2️⃣ - Add new todo\n3️⃣ - Complete todo\n4️⃣ - Delete todo\n5️⃣ - Logout\n\n*Reply with a number (1-5):*`;
      
    } else if (session.state === 'IDENTIFIED') {
      const command = text.trim();
      
      if (command === '1') {
        // List todos
        const { data } = await supabase
          .from('todos')
          .select('*')
          .eq('user_identifier', session.identifier!)
          .eq('is_completed', false)
          .order('created_at', { ascending: false });
          
        if (!data || data.length === 0) {
          responseText = '📋 *Your Todo List*\n\nNo pending todos! Great job! 🎉\n\nType 2 to add a new todo.';
        } else {
          responseText = '📋 *Your Todo List*\n\n';
          data.forEach((todo, i) => {
            responseText += `${i + 1}. ${todo.title}\n`;
            if (todo.description) {
              responseText += `   _${todo.description}_\n`;
            }
          });
          responseText += '\n*Type a command number (1-5)*';
          session.todos = data; // Store for complete/delete
        }
        
      } else if (command === '2') {
        session.state = 'ADDING_TITLE';
        responseText = '➕ *Create New Todo*\n\nWhat\'s the todo title?';
        
      } else if (command === '3') {
        // Complete todo
        if (!session.todos || session.todos.length === 0) {
          responseText = '❌ No todos to complete. Type 1 to see your list.';
        } else {
          session.state = 'COMPLETING';
          responseText = '✅ *Complete Todo*\n\nWhich number do you want to complete?\n\n';
          session.todos.forEach((todo, i) => {
            responseText += `${i + 1}. ${todo.title}\n`;
          });
        }
        
      } else if (command === '4') {
        // Delete todo
        if (!session.todos || session.todos.length === 0) {
          responseText = '❌ No todos to delete. Type 1 to see your list.';
        } else {
          session.state = 'DELETING';
          responseText = '🗑️ *Delete Todo*\n\nWhich number do you want to delete?\n\n';
          session.todos.forEach((todo, i) => {
            responseText += `${i + 1}. ${todo.title}\n`;
          });
        }
        
      } else if (command === '5') {
        session = { state: 'NEW' };
        sessions.delete(phoneNumber);
        responseText = '👋 *Logged out successfully!*\n\nYour todos are saved.\n\nSend #todolist to start again.';
        
      } else {
        responseText = '❓ *Invalid command*\n\nPlease reply with:\n1️⃣ List\n2️⃣ Add\n3️⃣ Complete\n4️⃣ Delete\n5️⃣ Logout';
      }
      
    } else if (session.state === 'ADDING_TITLE') {
      session.todoTitle = text;
      session.state = 'ADDING_DESC';
      responseText = '📝 *Add a description?*\n\nType your description or reply "skip" to skip:';
      
    } else if (session.state === 'ADDING_DESC') {
      const description = text.toLowerCase() === 'skip' ? '' : text;
      
      // Create todo with AI enhancement
      const enhancement = await enhanceTaskWithAI(session.todoTitle!, description);
      
      const { data, error } = await supabase.from('todos').insert([{
        user_identifier: session.identifier,
        title: session.todoTitle,
        description,
        ai_enhanced_description: enhancement.enhancedDescription,
        steps: enhancement.steps,
        is_completed: false
      }]).select().single();
      
      if (error) {
        responseText = '❌ Failed to create todo. Please try again.';
      } else {
        responseText = `✅ *Todo Created Successfully!*\n\n📌 *${session.todoTitle}*\n\n🤖 *AI Enhancement:*\n${enhancement.enhancedDescription}\n\n📋 *Steps:*\n`;
        enhancement.steps.forEach(step => {
          responseText += `${step.step}. ${step.description}\n`;
        });
        responseText += '\n*Type a command (1-5)*';
      }
      
      session.state = 'IDENTIFIED';
      delete session.todoTitle;
      
    } else if (session.state === 'COMPLETING') {
      const num = parseInt(text) - 1;
      if (session.todos && session.todos[num]) {
        const todo = session.todos[num];
        await supabase
          .from('todos')
          .update({ is_completed: true })
          .eq('id', todo.id);
        
        responseText = `✅ *Completed!*\n\n"${todo.title}" marked as done!\n\n*Type a command (1-5)*`;
      } else {
        responseText = '❌ Invalid number. Type 1 to see your list.';
      }
      session.state = 'IDENTIFIED';
      
    } else if (session.state === 'DELETING') {
      const num = parseInt(text) - 1;
      if (session.todos && session.todos[num]) {
        const todo = session.todos[num];
        await supabase
          .from('todos')
          .delete()
          .eq('id', todo.id);
        
        responseText = `🗑️ *Deleted!*\n\n"${todo.title}" has been removed.\n\n*Type a command (1-5)*`;
      } else {
        responseText = '❌ Invalid number. Type 1 to see your list.';
      }
      session.state = 'IDENTIFIED';
    }
    
    // Save session
    sessions.set(phoneNumber, session);
    
    // Send response
    if (responseText) {
      await sendWhatsAppMessage(from, responseText);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}