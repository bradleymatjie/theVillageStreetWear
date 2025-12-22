import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Careful: this has full DB access
);

async function main() {
  // Fetch pending emails
  const { data: waitlist, error: fetchError } = await supabase
    .from('waitlist_emails')
    .select('id, email')
    .eq('status', 'pending');

  if (fetchError || !waitlist) {
    console.error('Error fetching waitlist:', fetchError);
    return;
  }

  if (waitlist.length === 0) {
    console.log('No pending emails found.');
    return;
  }

  console.log(`Found ${waitlist.length} pending emails. Preparing to send...`);

  // Prepare batch emails (customize from/subject/html as needed)
  const emailsToSend = waitlist.map(({ email }) => ({
    from: 'The Village Beta beta@thevillagestreetwear.com',
    to: "bradleysaint45@gmail.com",
    subject: 'The Village is Live – Public Beta Now Open!',
    text: 'Hi! The Village custom streetwear designer is now in public beta. Start creating: https://your-domain.com\n\nThanks,\nThe Village Team',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #333;">Welcome to The Village!</h1>
        <p>We're excited to announce that our custom streetwear designer is now open for <strong>public beta testing</strong>!</p>
        <p><a href="https://your-domain.com" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Start Designing Now</a></p>
        <p>Thank you for joining the waitlist early — your support means everything.</p>
        <p>Best,<br><strong>The Village Team</strong></p>
        <hr style="margin-top: 40px;">
        <small>If you no longer wish to receive emails, reply to unsubscribe.</small>
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