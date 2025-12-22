import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Careful: this has full DB access
);

async function main() {
  // Fetch pending emails
//   const { data: waitlist, error: fetchError } = await supabase
//     .from('waitlist_emails')
//     .select('id, email')
//     // .eq('status', 'pending');

//   if (fetchError || !waitlist) {
//     console.error('Error fetching waitlist:', fetchError);
//     return;
//   }

//   if (waitlist.length === 0) {
//     console.log('No pending emails found.');
//     return;
//   }

//   console.log(`Found ${waitlist.length} pending emails. Preparing to send...`);

// Prepare batch emails
// Prepare batch emails
const emailsToSend = [0].map(() => ({
  from: 'The Village <beta@thevillagestreetwear.com>',
  to: "bradleysaint45@gmail.com",
  subject: 'The Village Designer Is Now Live — Public Beta Open',
  text: `Welcome to The Village

We are pleased to announce that our custom streetwear designer is now available in public beta. This platform allows you to create and personalize your own streetwear designs with ease and precision.

Your early support has been invaluable, and we invite you to explore the designer and bring your creative vision to life:

https://your-domain.com

Thank you for joining our early access program. We are excited to have you be part of this journey as we continue to refine and enhance the platform.

Best regards,
The Village Team

If you no longer wish to receive these emails, simply reply to unsubscribe.`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
      <h1 style="color: #111; margin-bottom: 16px;">Welcome to The Village</h1>

      <p style="color: #333; line-height: 1.6;">
        We are pleased to announce that our custom streetwear designer is now available in public beta. This platform allows you to create and personalize your own streetwear designs with ease and precision.
      </p>

      <p style="color: #333; line-height: 1.6;">
        Your early support has been invaluable, and we invite you to explore the designer and bring your creative vision to life.
      </p>

      <p style="margin: 24px 0;">
        <a
          href="https://your-domain.com"
          style="display: inline-block; background: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;"
        >
          Start Designing
        </a>
      </p>

      <p style="color: #555; line-height: 1.6;">
        Thank you for joining our early access program. We are excited to have you be part of this journey as we continue to refine and enhance the platform.
      </p>

      <p style="margin-top: 32px;">
        Best regards,<br />
        <strong>The Village Team</strong>
      </p>

      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

      <small style="color: #888;">
        If you no longer wish to receive these emails, simply reply to unsubscribe.
      </small>
    </div>
  `,
}));



  // Send in batch
  const { data: batchResults, error: sendError } = await resend.batch.send(emailsToSend);

  if (sendError) {
    console.error('Batch send failed:', sendError);
    return;
  }

  // Update DB based on results
//   for (let i = 0; i < batchResults.length; i++) {
//     const result = batchResults[i];
//     const { id: rowId, email } = waitlist[i];

//     if ('id' in result) {
//       // Success
//       await supabase
//         .from('waitlist_emails')
//         .update({ status: 'sent' })
//         .eq('id', rowId);
//       console.log(`✅ Sent to ${email}`);
//     } else {
//       // Failure
//       await supabase
//         .from('waitlist_emails')
//         .update({ status: 'failed' })
//         .eq('id', rowId);
//     }
//   }

  console.log('All done!');
}

main().catch(console.error);