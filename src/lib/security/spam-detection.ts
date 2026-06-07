export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

export function checkSpam(
  content: string,
  honeypot?: string,
  formLoadTime?: number
): SpamCheckResult {
  // Honeypot check
  if (honeypot && honeypot.length > 0) {
    return { isSpam: true, reason: 'Honeypot triggered' };
  }

  // Time trap check (forms submitted too quickly - less than 3 seconds)
  if (formLoadTime && Date.now() - formLoadTime < 3000) {
    return { isSpam: true, reason: 'Form submitted too quickly' };
  }

  // Content checks
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner|prize|million dollars)\b/gi,
    /\b(click here|buy now|act now|limited time)\b/gi,
    /(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/gi,
  ];

  const spamScore = spamPatterns.reduce((score, pattern) => {
    const matches = content.match(pattern);
    return score + (matches ? matches.length : 0);
  }, 0);

  if (spamScore > 3) {
    return { isSpam: true, reason: 'Spam patterns detected' };
  }

  return { isSpam: false };
}

export function generateHoneypotField(): string {
  return `hp_${Math.random().toString(36).substring(2, 15)}`;
}
