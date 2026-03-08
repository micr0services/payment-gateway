import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { send as sendSMS } from '../services/sms';

const app = new Hono();

// Enable CORS
app.use('*', cors());

interface SMSRequest {
  to: string;
  templateName: string;
  content: string;
}

// SMS sending endpoint
app.post('/sms', async (c) => {
  try {
    const { to, templateName, content }: SMSRequest = await c.req.json();

    // Validate required fields
    if (!to || !content) {
      return c.json({ error: 'Missing required fields: to, content' }, 400);
    }

    // Send SMS
    await sendSMS(to, templateName || 'general', content);

    return c.json({
      success: true,
      message: 'SMS sent successfully',
      id: `sms_${Date.now()}`
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return c.json({ error: 'Failed to send SMS' }, 500);
  }
});

// Integration inquiry endpoint that sends SMS
app.post('/integrations', async (c) => {
  try {
    const { name, email, phone, company, service, message } = await c.req.json();

    // Validate required fields
    if (!name || !email || !phone || !service || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create SMS content for notification
    const notificationSMS = `New Integration Inquiry
Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || 'Not provided'}
Service: ${service}
Message: ${message.replace(/\n/g, ' ')}`;

    // Create SMS content for confirmation
    const confirmationSMS = `Thank you ${name} for your inquiry about ${service}. We'll get back to you within 24 hours. Your request: ${message.replace(/\n/g, ' ')}`;

    console.log('Integration inquiry processed:', {
      inquiry: { name, email, phone, company, service, message },
      notificationSMS,
      confirmationSMS
    });

    // Send SMS to admin (hardcoded phone number)
    const adminPhone = '+254793056960';
    try {
      await sendSMS(adminPhone, 'integration-notification', notificationSMS);
      console.log('SMS notification sent to admin');
    } catch (smsError) {
      console.error('Failed to send SMS notification to admin:', smsError);
    }

    // Send confirmation SMS to user
    try {
      await sendSMS(phone, 'integration-confirmation', confirmationSMS);
      console.log('SMS confirmation sent to user');
    } catch (smsError) {
      console.error('Failed to send SMS confirmation to user:', smsError);
      // Don't fail the request if user SMS fails, but log it
    }

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