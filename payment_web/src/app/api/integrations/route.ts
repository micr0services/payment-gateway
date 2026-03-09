import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PHONE = process.env.ADMIN_PHONE || '+254793056960';
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8787';

// Helper function to send SMS with timeout
async function sendSmsNotification(to: string, templateName: string, content: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${WORKER_URL}/api/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        templateName,
        content
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send SMS to ${to}:`, errorText);
      return false;
    }
    
    console.log(`SMS sent successfully to ${to}`);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`SMS request to ${to} timed out after 5 seconds`);
    } else {
      console.error(`Error sending SMS to ${to}:`, error);
    }
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, company, service, message } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !service || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create SMS content for admin notification
    const adminNotification = `New Integration Inquiry
Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || 'Not provided'}
Service: ${service}
Message: ${message.replace(/\n/g, ' ')}`;

    // Create SMS content for user confirmation
    const userConfirmation = `Thank you ${name} for your inquiry about ${service}. We'll get back to you within 24 hours.`;

    console.log('Integration inquiry received:', {
      name,
      email,
      phone,
      company,
      service,
      timestamp: new Date().toISOString()
    });

    // Send SMS notifications asynchronously (don't await, don't block the response)
    // This allows the form to submit successfully even if SMS fails
    Promise.all([
      sendSmsNotification(ADMIN_PHONE, 'integration-notification', adminNotification),
      sendSmsNotification(phone, 'integration-confirmation', userConfirmation)
    ]).catch(error => {
      console.error('Error in SMS notification batch:', error);
    });

    return NextResponse.json(
      { message: 'Integration inquiry sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing integration inquiry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}