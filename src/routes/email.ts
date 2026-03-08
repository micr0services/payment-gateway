import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS
app.use('*', cors());

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Email sending endpoint
app.post('/email', async (c) => {
  try {
    const { to, subject, html, from }: EmailRequest = await c.req.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return c.json({ error: 'Missing required fields: to, subject, html' }, 400);
    }

    // Send email using MailChannels (Cloudflare's email partner)
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
        }],
        from: {
          email: from || 'noreply@payledger.com',
          name: 'PayLedger'
        },
        subject: subject,
        content: [{
          type: 'text/html',
          value: html
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MailChannels error:', errorText);
      throw new Error(`Failed to send email: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return c.json({
      success: true,
      message: 'Email sent successfully',
      id: result.id || `email_${Date.now()}`
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return c.json({ error: 'Failed to send email' }, 500);
  }
});

// Integration inquiry endpoint that sends email
app.post('/integrations', async (c) => {
  try {
    const { name, email, company, service, message } = await c.req.json();

    // Validate required fields
    if (!name || !email || !service || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c9a84c;">New Integration Inquiry</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || 'Not provided'}</p>
          <p><strong>Service Type:</strong> ${service}</p>
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #c9a84c;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #666; font-size: 12px;">
          This inquiry was submitted on ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    // Send notification email to your team
    const notificationEmail = {
      to: 'integrations@payledger.com', // Replace with your email
      subject: `New Integration Inquiry: ${service} - ${name}`,
      html: emailHtml,
      from: 'noreply@payledger.com'
    };

    // Send confirmation email to the user
    const confirmationEmail = {
      to: email,
      subject: 'Thank you for your integration inquiry',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c9a84c;">Thank You for Your Inquiry</h2>
          <p>Dear ${name},</p>
          <p>We've received your integration inquiry for <strong>${service}</strong> and will get back to you within 24 hours.</p>
          <p>Here's a summary of your request:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>Best regards,<br>The PayLedger Team</p>
        </div>
      `,
      from: 'noreply@payledger.com'
    };

    // In a real implementation, you would send both emails
    console.log('Integration inquiry processed:', {
      inquiry: { name, email, company, service, message },
      notificationEmail,
      confirmationEmail
    });

    // Simulate sending emails
    await Promise.all([
      // Send notification email
      fetch(`${c.req.url.replace('/integrations', '/email')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationEmail)
      }),
      // Send confirmation email
      fetch(`${c.req.url.replace('/integrations', '/email')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmationEmail)
      })
    ]);

    return c.json({
      success: true,
      message: 'Integration inquiry processed successfully'
    });

  } catch (error) {
    console.error('Error processing integration inquiry:', error);
    return c.json({ error: 'Failed to process inquiry' }, 500);
  }
});

export default app;