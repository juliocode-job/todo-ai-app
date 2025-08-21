import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enhanceTaskWithAI } from '@/lib/ai-service';

// GET all todos for a user
export async function GET(request: NextRequest) {
  console.log('📥 GET /api/todos');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdentifier = searchParams.get('user_identifier');
    
    if (!userIdentifier) {
      console.error('❌ Missing user_identifier');
      return NextResponse.json(
        { error: 'user_identifier is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching todos for user: ${userIdentifier}`);
    
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_identifier', userIdentifier)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} todos`);
    return NextResponse.json(data || []);
    
  } catch (error) {
    console.error('❌ Failed to fetch todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// POST create new todo
export async function POST(request: NextRequest) {
  console.log('📥 POST /api/todos');
  
  try {
    const body = await request.json();
    const { user_identifier, title, description } = body;
    
    if (!user_identifier || !title) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'user_identifier and title are required' },
        { status: 400 }
      );
    }

    console.log(`📝 Creating todo: "${title}" for user: ${user_identifier}`);
    
    // ✅ USE REAL AI ENHANCEMENT HERE
    const enhancement = await enhanceTaskWithAI(title, description);
    
    const todoData = {
      user_identifier,
      title,
      description,
      ai_enhanced_description: enhancement.enhancedDescription,
      steps: enhancement.steps,
      is_completed: false
    };

    const { data, error } = await supabase
      .from('todos')
      .insert([todoData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }

    console.log('✅ Todo created successfully with AI enhancement');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Failed to create todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}