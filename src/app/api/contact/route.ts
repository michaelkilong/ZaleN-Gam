import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { checkSpam } from '@/lib/security/spam-detection';
import { isValidEmail } from '@/lib/security/email-validator';
import { sanitizeText } from '@/lib/security/sanitizer';
import { verifyRecaptcha } from '@/lib/security/recaptcha';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 contact submissions per minute per IP
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit(`contact:${ip}`, 5, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const { name, email, subject, message, recaptchaToken, honeypot, formLoadTime } = await request.json();

    // reCAPTCHA verification
    if (recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
      }
    }

    // Spam detection
    const spamCheck = checkSpam(message || '', honeypot, formLoadTime);
    if (spamCheck.isSpam) {
      return NextResponse.json(
        { error: 'Spam detected. Please try again.' },
        { status: 400 }
      );
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // In production, send email or store in database
    // For now, just sanitize and return success
    const sanitizedMessage = sanitizeText(message);
    const sanitizedName = sanitizeText(name);
    const sanitizedSubject = sanitizeText(subject);

    console.log('Contact form submission:', {
      name: sanitizedName,
      email,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      ip,
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
