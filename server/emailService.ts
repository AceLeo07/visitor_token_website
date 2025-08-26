import { Token, TokenRequest } from '@shared/types';
import { formatDateForEmail } from './utils';

// Email service for sending notifications
class EmailService {
  private emailQueue: Array<{
    to: string;
    subject: string;
    html: string;
    timestamp: Date;
    type: string;
  }> = [];

  // Send email (in production, use nodemailer or similar service)
  async sendEmail(to: string, subject: string, html: string, type: string = 'general'): Promise<boolean> {
    try {
      // Store email in queue for demo purposes
      this.emailQueue.push({
        to,
        subject,
        html,
        timestamp: new Date(),
        type
      });

      console.log(`📧 EMAIL SENT TO: ${to}`);
      console.log(`📧 SUBJECT: ${subject}`);
      console.log(`📧 TYPE: ${type}`);
      console.log(`📧 HTML LENGTH: ${html.length} characters`);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Get email queue for demo purposes
  getEmailQueue() {
    return this.emailQueue.slice(-50); // Return last 50 emails
  }

  // Clear email queue
  clearEmailQueue() {
    this.emailQueue = [];
  }

  // Generate visitor request confirmation email
  generateVisitorConfirmationEmail(request: TokenRequest): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MIT ADT University - Request Confirmation</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto;
            background-color: #f8fafc;
          }
          .container { 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #2563eb, #4f46e5); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .info-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0; 
            padding: 8px 0; 
            border-bottom: 1px solid #f1f5f9; 
          }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #475569; }
          .value { color: #1e293b; }
          .status-badge { 
            background: #fef3c7; 
            color: #92400e; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px; 
            font-weight: 600; 
          }
          .footer { 
            background: #f8fafc; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #e2e8f0; 
          }
          .footer p { margin: 5px 0; font-size: 14px; color: #64748b; }
          .instructions { 
            background: #dbeafe; 
            border: 1px solid #3b82f6; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
          }
          .instructions h4 { margin: 0 0 10px 0; color: #1e40af; }
          .instructions ul { margin: 10px 0; padding-left: 20px; }
          .instructions li { margin: 5px 0; color: #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 MIT ADT University</h1>
            <p>Visitor Request Confirmation</p>
          </div>
          
          <div class="content">
            <h3>Dear ${request.visitor?.name},</h3>
            
            <p>Thank you for submitting your visitor request to MIT ADT University. Your request has been successfully received and forwarded for review.</p>
            
            <div class="info-card">
              <h4 style="margin-top: 0; color: #1e293b;">📋 Request Details</h4>
              <div class="info-row">
                <span class="label">Request ID:</span>
                <span class="value">${request.id}</span>
              </div>
              <div class="info-row">
                <span class="label">Visitor Name:</span>
                <span class="value">${request.visitor?.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${request.visitor?.email}</span>
              </div>
              <div class="info-row">
                <span class="label">Faculty Contact:</span>
                <span class="value">${request.faculty?.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Department:</span>
                <span class="value">${request.department?.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Visit Date:</span>
                <span class="value">${formatDateForEmail(new Date(request.visitDate))}</span>
              </div>
              <div class="info-row">
                <span class="label">Purpose:</span>
                <span class="value">${request.purpose}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="value"><span class="status-badge">PENDING REVIEW</span></span>
              </div>
            </div>
            
            <div class="instructions">
              <h4>📋 What happens next?</h4>
              <ul>
                <li>Your request will be reviewed by ${request.faculty?.name}</li>
                <li>You'll receive an email notification once reviewed (typically 1-2 business days)</li>
                <li>If approved, you'll get a digital token with QR code for campus entry</li>
                <li>If you have questions, contact ${request.faculty?.email}</li>
              </ul>
            </div>
            
            <p>We appreciate your interest in visiting MIT ADT University. Please keep this email for your records.</p>
            
            <p><strong>Need Help?</strong><br/>
            If you have any questions about your request, please contact ${request.faculty?.name} directly at ${request.faculty?.email}.</p>
          </div>
          
          <div class="footer">
            <p><strong>MIT ADT University</strong></p>
            <p>Visitor Management System</p>
            <p>© 2024 MIT ADT University. All rights reserved.</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate faculty notification email
  generateFacultyNotificationEmail(request: TokenRequest): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MIT ADT University - New Visitor Request</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto;
            background-color: #f8fafc;
          }
          .container { 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #059669, #10b981); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .visitor-card { 
            background: #f0fdf4; 
            border: 2px solid #10b981; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .visitor-card h4 { margin-top: 0; color: #065f46; }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 8px 0; 
            padding: 8px 0; 
            border-bottom: 1px solid #ecfdf5; 
          }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: 600; color: #047857; }
          .value { color: #065f46; }
          .action-buttons { 
            text-align: center; 
            margin: 30px 0; 
            background: #fafafa; 
            padding: 20px; 
            border-radius: 8px; 
          }
          .btn { 
            display: inline-block; 
            padding: 12px 24px; 
            margin: 5px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600; 
            font-size: 14px; 
          }
          .btn-primary { 
            background: #059669; 
            color: white; 
          }
          .footer { 
            background: #f8fafc; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #e2e8f0; 
          }
          .footer p { margin: 5px 0; font-size: 14px; color: #64748b; }
          .urgent { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
          }
          .urgent h4 { margin: 0 0 10px 0; color: #92400e; }
          .urgent p { margin: 0; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 MIT ADT University</h1>
            <p>New Visitor Request Awaiting Review</p>
          </div>
          
          <div class="content">
            <h3>Dear ${request.faculty?.name},</h3>
            
            <p>You have received a new visitor request that requires your approval. Please review the details below and take appropriate action.</p>
            
            <div class="visitor-card">
              <h4>👤 Visitor Information</h4>
              <div class="info-row">
                <span class="label">Name:</span>
                <span class="value">${request.visitor?.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value">${request.visitor?.email}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${request.visitor?.phone}</span>
              </div>
              ${request.visitor?.company ? `
              <div class="info-row">
                <span class="label">Company:</span>
                <span class="value">${request.visitor?.company}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Requested Visit Date:</span>
                <span class="value">${formatDateForEmail(new Date(request.visitDate))}</span>
              </div>
              <div class="info-row">
                <span class="label">Purpose:</span>
                <span class="value">${request.purpose}</span>
              </div>
              <div class="info-row">
                <span class="label">Request Submitted:</span>
                <span class="value">${formatDateForEmail(new Date(request.createdAt))}</span>
              </div>
            </div>
            
            <div class="action-buttons">
              <h4 style="margin-top: 0;">⚡ Action Required</h4>
              <p>Please log in to your faculty dashboard to review and respond to this request.</p>
              <a href="${process.env.BASE_URL || 'https://visitor.mitadt.edu.in'}/faculty/dashboard" class="btn btn-primary">
                Open Faculty Dashboard
              </a>
            </div>
            
            <div class="urgent">
              <h4>⏰ Response Timeline</h4>
              <p>Please review this request within 2 business days. Visitors are waiting for confirmation to plan their visit.</p>
            </div>
            
            <p><strong>Request ID:</strong> ${request.id}</p>
            <p><strong>Department:</strong> ${request.department?.name}</p>
          </div>
          
          <div class="footer">
            <p><strong>MIT ADT University</strong></p>
            <p>Faculty Portal - Visitor Management System</p>
            <p>© 2024 MIT ADT University. All rights reserved.</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate token approval email with enhanced design
  generateTokenApprovalEmail(token: Token): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MIT ADT University - Access Approved</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto;
            background-color: #f8fafc;
          }
          .container { 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #059669, #10b981); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .token-card { 
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe); 
            border: 2px solid #0ea5e9; 
            border-radius: 12px; 
            padding: 25px; 
            margin: 25px 0; 
            text-align: center; 
          }
          .token-code { 
            font-size: 28px; 
            font-weight: 800; 
            color: #0c4a6e; 
            letter-spacing: 3px; 
            margin: 15px 0; 
            padding: 15px; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            font-family: 'Courier New', monospace;
          }
          .qr-placeholder { 
            width: 120px; 
            height: 120px; 
            border: 2px dashed #0ea5e9; 
            margin: 15px auto; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: white; 
            border-radius: 8px; 
            color: #0ea5e9; 
            font-size: 12px; 
            text-align: center; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin: 20px 0; 
          }
          .info-item { 
            background: #f8fafc; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #059669; 
          }
          .info-label { 
            font-size: 12px; 
            font-weight: 600; 
            color: #64748b; 
            text-transform: uppercase; 
            margin-bottom: 5px; 
          }
          .info-value { 
            font-weight: 600; 
            color: #1e293b; 
          }
          .instructions { 
            background: #fef7cd; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 25px 0; 
          }
          .instructions h4 { margin: 0 0 15px 0; color: #92400e; }
          .instructions ul { margin: 10px 0; padding-left: 20px; }
          .instructions li { margin: 8px 0; color: #92400e; }
          .footer { 
            background: #f8fafc; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #e2e8f0; 
          }
          .footer p { margin: 5px 0; font-size: 14px; color: #64748b; }
          .success-badge { 
            background: #10b981; 
            color: white; 
            padding: 6px 16px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: 600; 
            display: inline-block; 
            margin: 10px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 MIT ADT University</h1>
            <p>Visitor Access Approved</p>
          </div>
          
          <div class="content">
            <h3>Dear ${token.visitor?.name},</h3>
            
            <div style="text-align: center;">
              <span class="success-badge">✅ REQUEST APPROVED</span>
            </div>
            
            <p>Great news! Your request to visit MIT ADT University has been <strong>approved</strong> by ${token.faculty?.name} from the ${token.faculty?.department?.name} department.</p>
            
            <div class="token-card">
              <h4 style="margin-top: 0; color: #0c4a6e;">🎫 Your Digital Access Token</h4>
              <div class="token-code">${token.tokenCode}</div>
              <div class="qr-placeholder">
                QR Code<br/>
                (Scan at Gate)
              </div>
              <p style="color: #0c4a6e; font-weight: 600; margin: 0;">Keep this code ready for security verification</p>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Visitor Name</div>
                <div class="info-value">${token.visitor?.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Valid Until</div>
                <div class="info-value">${formatDateForEmail(new Date(token.expiresAt))}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Faculty Contact</div>
                <div class="info-value">${token.faculty?.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Department</div>
                <div class="info-value">${token.faculty?.department?.name}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Purpose of Visit</div>
                <div class="info-value">${token.request?.purpose || 'Official Visit'}</div>
              </div>
            </div>
            
            <div class="instructions">
              <h4>📋 Entry Instructions</h4>
              <ul>
                <li><strong>Present this token at the security gate</strong> - Show the QR code or token code</li>
                <li><strong>Bring a valid photo ID</strong> - Government-issued ID required</li>
                <li><strong>One-time use only</strong> - Token becomes invalid after entry</li>
                <li><strong>Contact faculty if needed</strong> - ${token.faculty?.name} (${token.faculty?.email})</li>
                <li><strong>Arrive on time</strong> - Token expires on ${formatDateForEmail(new Date(token.expiresAt))}</li>
              </ul>
            </div>
            
            <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              <strong>💡 Pro Tip:</strong> Save this email on your mobile device for easy access at the security gate. The QR code can be scanned directly from your phone screen.
            </p>
            
            <p>We look forward to welcoming you to MIT ADT University!</p>
          </div>
          
          <div class="footer">
            <p><strong>MIT ADT University</strong></p>
            <p>Visitor Management System</p>
            <p>© 2024 MIT ADT University. All rights reserved.</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate rejection email
  generateRejectionEmail(request: TokenRequest, reason: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MIT ADT University - Request Update</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto;
            background-color: #f8fafc;
          }
          .container { 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin: 20px;
          }
          .header { 
            background: linear-gradient(135deg, #dc2626, #b91c1c); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .content { padding: 30px 20px; }
          .reason-box { 
            background: #fef2f2; 
            border: 1px solid #fca5a5; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0; 
          }
          .reason-box h4 { margin-top: 0; color: #991b1b; }
          .reason-box p { color: #991b1b; margin: 0; }
          .contact-info { 
            background: #f0f9ff; 
            border: 1px solid #0ea5e9; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
          }
          .footer { 
            background: #f8fafc; 
            padding: 20px; 
            text-align: center; 
            border-top: 1px solid #e2e8f0; 
          }
          .footer p { margin: 5px 0; font-size: 14px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 MIT ADT University</h1>
            <p>Visitor Request Update</p>
          </div>
          
          <div class="content">
            <h3>Dear ${request.visitor?.name},</h3>
            
            <p>Thank you for your interest in visiting MIT ADT University. After reviewing your request, we regret to inform you that your visit request has been declined.</p>
            
            <div class="reason-box">
              <h4>📋 Reason for Decline</h4>
              <p>${reason}</p>
            </div>
            
            <p>We understand this may be disappointing. If you believe this decision was made in error or if you would like to submit a new request with additional information, please feel free to contact the faculty member directly.</p>
            
            <div class="contact-info">
              <h4 style="margin-top: 0; color: #0c4a6e;">📞 Contact Information</h4>
              <p><strong>Faculty:</strong> ${request.faculty?.name}<br/>
              <strong>Email:</strong> ${request.faculty?.email}<br/>
              <strong>Department:</strong> ${request.department?.name}</p>
            </div>
            
            <p>You may also submit a new visitor request through our website if your circumstances have changed.</p>
            
            <p>Thank you for your understanding.</p>
          </div>
          
          <div class="footer">
            <p><strong>MIT ADT University</strong></p>
            <p>Visitor Management System</p>
            <p>© 2024 MIT ADT University. All rights reserved.</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();
