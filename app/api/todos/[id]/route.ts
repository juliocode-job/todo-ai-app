import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// UPDATE todo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`📥 PATCH /api/todos/${params.id}`);
  
  try {
    const body = await request.json();
    console.log('📝 Update data:', body);
    
    const { data, error } = await supabase
      .from('todos')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update error:', error);
      throw error;
    }

    console.log('✅ Todo updated successfully');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Failed to update todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

// DELETE todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`📥 DELETE /api/todos/${params.id}`);
  
  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      throw error;
    }

    console.log('✅ Todo deleted successfully');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Failed to delete todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}