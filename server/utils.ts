import { Token } from '@shared/types';

// Generate unique token code
export function generateTokenCode(): string {
  const prefix = 'MIT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Generate QR code data (URL that can be scanned)
export function generateQRCodeData(tokenCode: string): string {
  const baseUrl = process.env.BASE_URL || 'https://visitor.mitadt.edu.in';
  return `${baseUrl}/verify/${tokenCode}`;
}

// Check if token is expired
export function isTokenExpired(token: Token): boolean {
  return new Date() > new Date(token.expiresAt);
}

// Check if token is valid for use
export function isTokenValid(token: Token): { valid: boolean; reason?: string } {
  if (token.isUsed) {
    return { valid: false, reason: 'Token has already been used' };
  }
  
  if (isTokenExpired(token)) {
    return { valid: false, reason: 'Token has expired' };
  }
  
  return { valid: true };
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Format date for email
export function formatDateForEmail(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Calculate token expiry (default: 1 day from visit date)
export function calculateTokenExpiry(visitDate: Date): Date {
  const expiry = new Date(visitDate);
  expiry.setDate(expiry.getDate() + 1); // Token valid for 1 day
  expiry.setHours(23, 59, 59); // Expires at end of day
  return expiry;
}

import { emailService } from './emailService';

// Send email using the email service
export async function sendEmail(to: string, subject: string, htmlContent: string, type: string = 'general'): Promise<boolean> {
  return await emailService.sendEmail(to, subject, htmlContent, type);
}

// Generate approval email content
export function generateApprovalEmail(token: Token): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MIT ADT University - Visitor Token Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .token-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .token-code { font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
        .qr-placeholder { background: #fff; border: 1px solid #ddd; width: 200px; height: 200px; margin: 20px auto; display: flex; align-items: center; justify-content: center; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎓 MIT ADT University</h1>
        <h2>Visitor Access Approved</h2>
      </div>
      
      <div class="content">
        <h3>Dear ${token.visitor?.name},</h3>
        
        <p>Your request to visit MIT ADT University has been <strong>approved</strong> by ${token.faculty?.name} from ${token.faculty?.department?.name} department.</p>
        
        <div class="token-card">
          <h4>🎫 Your Visitor Token</h4>
          <div class="token-code">${token.tokenCode}</div>
          <div class="qr-placeholder">
            <p>QR Code<br/>(Use token code if QR fails)</p>
          </div>
          <p><strong>Valid Until:</strong> ${formatDateForEmail(new Date(token.expiresAt))}</p>
          <p><strong>Purpose:</strong> ${token.request?.purpose || 'Official Visit'}</p>
        </div>
        
        <h4>📋 Instructions:</h4>
        <ul>
          <li>Present this token at the security gate</li>
          <li>Keep the token code ready for manual verification if needed</li>
          <li>This is a <strong>one-time use</strong> token</li>
          <li>Token expires after use or on the expiry date</li>
          <li>Contact the faculty member if you need assistance</li>
        </ul>
        
        <p><strong>Faculty Contact:</strong> ${token.faculty?.name} (${token.faculty?.email})</p>
      </div>
      
      <div class="footer">
        <p>© 2024 MIT ADT University. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}

// Generate rejection email content
export function generateRejectionEmail(request: any, reason: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MIT ADT University - Visitor Request Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎓 MIT ADT University</h1>
        <h2>Visitor Request Update</h2>
      </div>
      
      <div class="content">
        <h3>Dear ${request.visitor?.name},</h3>
        
        <p>We regret to inform you that your request to visit MIT ADT University has been declined by ${request.faculty?.name} from ${request.faculty?.department?.name} department.</p>
        
        <p><strong>Reason:</strong> ${reason}</p>
        
        <p>If you believe this is an error or would like to submit a new request, please contact the faculty member directly or submit a new application through our website.</p>
        
        <p><strong>Faculty Contact:</strong> ${request.faculty?.name} (${request.faculty?.email})</p>
      </div>
      
      <div class="footer">
        <p>© 2024 MIT ADT University. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
}
