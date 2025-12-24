import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

export async function POST(request: NextRequest) {

  try {
    const { email }: { email: string } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('waitlist_emails')
      .select('email')
      .eq('email', email)
      .single();


    if (existing) {
      return NextResponse.json({ error: 'Already on the list!' }, { status: 409 });
    }

    const { error: insertError } = await supabase
      .from('waitlist_emails')
      .insert([{ email, status: 'pending' }]);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save—try again' }, { status: 500 });
    }

    try {
      await resend.emails.send({
        from: 'notify@thevillagestreetwear.com',
        to: [email],
        subject: "You're In! – The Village Streetwear Launch Updates",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Welcome to The Village!</h1>
            <p>Hey ${email},</p>
            <p>Thanks for joining the waitlist. Get ready for custom streetwear drops built on community style. We'll hit you up ~19 days from now.</p>
            <p>Stay tuned,<br>The Village Crew</p>
            <p>© 2025 The Village StreetWear. All Rights Reserved.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Resend email error:', emailError);
    }

    return NextResponse.json({ success: true, message: 'Signed up!' }, { status: 200 });

  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server hiccup—retry' }, { status: 500 });
  }
}