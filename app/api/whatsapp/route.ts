// app/api/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Type definitions
interface WebhookData {
  from: string;
  to: string;
  body: string;
  id: string;
  fromMe?: boolean;
}

interface TodoStep {
  step: number;
  description: string;
}

// UltraMsg credentials (from your screenshot)
const INSTANCE_ID = '140141';
const TOKEN = 'fiu6150vd9eqc5nb';

// Helper function to call OpenAI
async function enhanceWithAI(task: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return createBasicEnhancement(task);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a todo assistant. Given a task, provide 3-5 actionable steps. Be concise.'
          },
          {
            role: 'user',
            content: `Break down this task into steps: "${task}"`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('OpenAI error:', error);
  }

  return createBasicEnhancement(task);
}

// Fallback enhancement
function createBasicEnhancement(task: string): string {
  return `📝 Task: ${task}\n\nSteps:\n1. Plan the task\n2. Gather resources\n3. Execute\n4. Review completion`;
}

// Send message via UltraMsg
async function sendMessage(to: string, message: string): Promise<void> {
  try {
    await fetch(`https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: TOKEN,
        to: to,
        body: message
      })
    });
  } catch (error) {
    console.error('Send error:', error);
  }
}

// Main webhook handler
export async function POST(req: NextRequest) {
  try {
    const data: WebhookData = await req.json();
    
    // Skip if from bot
    if (data.fromMe) {
      return NextResponse.json({ ok: true });
    }
    
    const message = data.body?.trim() || '';
    const from = data.from;
    
    // Check for #todo command
    if (message.toLowerCase().startsWith('#todo ')) {
      const task = message.substring(6).trim();
      
      if (task) {
        // Get AI enhancement
        const enhancement = await enhanceWithAI(task);
        
        // Format response
        const response = `✅ *Todo Created!*\n\n📌 *${task}*\n\n${enhancement}\n\n_Send #todo [task] to create another_`;
        
        // Send response
        await sendMessage(from, response);
      } else {
        await sendMessage(from, '❌ Please include a task after #todo');
      }
    } else if (message.toLowerCase() === 'help') {
      const helpText = `👋 *AI Todo Bot*\n\nHow to use:\n*#todo* [your task]\n\nExample:\n_#todo prepare presentation_`;
      await sendMessage(from, helpText);
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    instance: INSTANCE_ID,
    webhook: 'ready'
  });
}