import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

interface Customer {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
  updated_at: string;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Customer[]);
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}