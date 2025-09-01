import { RequestHandler } from "express";
import { db } from "../database";
import { 
  generateTokenCode, 
  generateQRCodeData, 
  calculateTokenExpiry, 
  sendEmail, 
  generateApprovalEmail, 
  generateRejectionEmail 
} from "../utils";
import { TokenGenerationRequest, ReportFilter, DashboardStats } from "@shared/types";

// Get Faculty Dashboard Data
export const getFacultyDashboard: RequestHandler = async (req, res) => {
  try {
    const facultyId = (req as any).user.userId;
    const faculty = db.getFacultyById(facultyId);
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found"
      });
    }

    // Get requests for this faculty
    const requests = db.getTokenRequestsByFaculty(facultyId);
    const tokens = db.getTokensByFaculty(facultyId);

    // Calculate stats
    const stats: DashboardStats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedTokens: requests.filter(r => r.status === 'approved').length,
      rejectedRequests: requests.filter(r => r.status === 'rejected').length,
      tokensGenerated: tokens.length,
      tokensUsed: tokens.filter(t => t.isUsed).length,
      todayEntries: tokens.filter(t => {
        const today = new Date();
        const tokenDate = new Date(t.createdAt);
        return (
          tokenDate.getDate() === today.getDate() &&
          tokenDate.getMonth() === today.getMonth() &&
          tokenDate.getFullYear() === today.getFullYear() &&
          t.isUsed
        );
      }).length
    };

    // Get recent pending requests
    const recentRequests = requests
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json({
      success: true,
      faculty: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department
      },
      stats,
      recentRequests
    });

  } catch (error) {
    console.error('Faculty dashboard error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data"
    });
  }
};

// Get Faculty Token Requests
export const getFacultyRequests: RequestHandler = (req, res) => {
  try {
    const facultyId = (req as any).user.userId;
    const requests = db.getTokenRequestsByFaculty(facultyId);

    res.json({
      success: true,
      requests: requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });

  } catch (error) {
    console.error('Get faculty requests error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests"
    });
  }
};

// Approve Token Request
export const approveTokenRequest: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { message } = req.body;
    const facultyId = (req as any).user.userId;

    const request = db.getTokenRequestById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    if (request.facultyId !== facultyId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to approve this request"
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed"
      });
    }

    // Update request status
    const updatedRequest = db.updateTokenRequest(requestId, {
      status: 'approved',
      responseDate: new Date(),
      responseMessage: message || 'Request approved'
    });

    if (!updatedRequest) {
      return res.status(500).json({
        success: false,
        message: "Failed to update request"
      });
    }

    // Generate token
    const tokenCode = generateTokenCode();
    const expiresAt = calculateTokenExpiry(new Date(request.visitDate));

    const tokenData = {
      tokenCode,
      visitor: request.visitor,
      faculty: request.faculty,
      expiresAt
    };

    const qrCodeData = generateQRCodeData(tokenCode, tokenData);

    const token = db.createToken({
      tokenCode,
      qrCodeData,
      visitorId: request.visitorId,
      facultyId,
      requestId,
      isUsed: false,
      expiresAt,
      generatedBy: 'approval'
    });

    // Link token to visitor profile if one exists
    const visitorProfile = db.getVisitorProfileByEmail(request.visitor!.email);
    if (visitorProfile) {
      db.addTokenToVisitorProfile(visitorProfile.id, token.id);
    }

    // Send approval email with token
    const emailContent = generateApprovalEmail(token);
    sendEmail(request.visitor!.email, 'MIT ADT University - Visitor Access Approved', emailContent)
      .catch(error => console.error('Failed to send approval email:', error));

    res.json({
      success: true,
      message: "Request approved and token generated successfully",
      token: {
        id: token.id,
        tokenCode: token.tokenCode,
        expiresAt: token.expiresAt
      }
    });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to approve request"
    });
  }
};

// Reject Token Request
export const rejectTokenRequest: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { message } = req.body;
    const facultyId = (req as any).user.userId;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const request = db.getTokenRequestById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    if (request.facultyId !== facultyId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to reject this request"
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Request has already been processed"
      });
    }

    // Update request status
    const updatedRequest = db.updateTokenRequest(requestId, {
      status: 'rejected',
      responseDate: new Date(),
      responseMessage: message
    });

    if (!updatedRequest) {
      return res.status(500).json({
        success: false,
        message: "Failed to update request"
      });
    }

    // Send rejection email
    const emailContent = generateRejectionEmail(updatedRequest, message);
    sendEmail(request.visitor!.email, 'MIT ADT University - Visitor Request Update', emailContent)
      .catch(error => console.error('Failed to send rejection email:', error));

    res.json({
      success: true,
      message: "Request rejected successfully"
    });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reject request"
    });
  }
};

// Generate Direct Token
export const generateDirectToken: RequestHandler = async (req, res) => {
  try {
    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      purpose,
      visitDate,
      expiryDate
    }: TokenGenerationRequest = req.body;

    const facultyId = (req as any).user.userId;

    // Validation
    if (!visitorName || !visitorEmail || !visitorPhone || !purpose || !visitDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(visitorEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate dates
    const visitDateTime = new Date(visitDate);
    const expiryDateTime = expiryDate ? new Date(expiryDate) : calculateTokenExpiry(visitDateTime);
    const today = new Date();

    if (visitDateTime < today) {
      return res.status(400).json({
        success: false,
        message: "Visit date cannot be in the past"
      });
    }

    if (expiryDateTime <= visitDateTime) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be after visit date"
      });
    }

    // Create or find visitor
    let visitor = db.createVisitor({
      name: visitorName.trim(),
      email: visitorEmail.trim().toLowerCase(),
      phone: visitorPhone.trim(),
      purpose: purpose.trim()
    });

    // Generate token
    const tokenCode = generateTokenCode();

    const tokenData = {
      tokenCode,
      visitor,
      faculty: db.getFacultyById(facultyId),
      expiresAt: expiryDateTime
    };

    const qrCodeData = generateQRCodeData(tokenCode, tokenData);

    const token = db.createToken({
      tokenCode,
      qrCodeData,
      visitorId: visitor.id,
      facultyId,
      isUsed: false,
      expiresAt: expiryDateTime,
      generatedBy: 'faculty'
    });

    // Link token to visitor profile if one exists
    const visitorProfile = db.getVisitorProfileByEmail(visitorEmail.trim().toLowerCase());
    if (visitorProfile) {
      db.addTokenToVisitorProfile(visitorProfile.id, token.id);
    }

    // Send token email
    const emailContent = generateApprovalEmail(token);
    sendEmail(visitorEmail, 'MIT ADT University - Visitor Token Generated', emailContent)
      .catch(error => console.error('Failed to send token email:', error));

    res.json({
      success: true,
      message: "Token generated and sent successfully",
      token: {
        id: token.id,
        tokenCode: token.tokenCode,
        qrCodeData: token.qrCodeData,
        visitorName: visitor.name,
        facultyName: token.faculty?.name || '',
        departmentName: token.faculty?.department?.name || '',
        purpose,
        visitDate: visitDateTime.toISOString(),
        expiresAt: token.expiresAt.toISOString()
      },
      pdfUrl: `/api/faculty/token/${token.id}/pdf`
    });

  } catch (error) {
    console.error('Generate token error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate token"
    });
  }
};

// Get Faculty Reports
export const getFacultyReports: RequestHandler = (req, res) => {
  try {
    const facultyId = (req as any).user.userId;
    const { period, startDate, endDate } = req.query as ReportFilter;

    let requests = db.getTokenRequestsByFaculty(facultyId);
    let tokens = db.getTokensByFaculty(facultyId);

    // Apply date filters
    if (period) {
      const now = new Date();
      let filterDate = new Date();

      switch (period) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          filterDate = new Date(0); // No filter
      }

      requests = requests.filter(r => new Date(r.createdAt) >= filterDate);
      tokens = tokens.filter(t => new Date(t.createdAt) >= filterDate);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      requests = requests.filter(r => {
        const date = new Date(r.createdAt);
        return date >= start && date <= end;
      });

      tokens = tokens.filter(t => {
        const date = new Date(t.createdAt);
        return date >= start && date <= end;
      });
    }

    // Calculate stats
    const stats: DashboardStats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedTokens: requests.filter(r => r.status === 'approved').length,
      rejectedRequests: requests.filter(r => r.status === 'rejected').length,
      tokensGenerated: tokens.length,
      tokensUsed: tokens.filter(t => t.isUsed).length,
      todayEntries: tokens.filter(t => t.isUsed).length
    };

    res.json({
      success: true,
      requests: requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      tokens: tokens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      stats,
      period: period || 'custom'
    });

  } catch (error) {
    console.error('Faculty reports error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate reports"
    });
  }
};

// Generate Token PDF
export const generateTokenPDF: RequestHandler = (req, res) => {
  try {
    const { tokenId } = req.params;
    const facultyId = (req as any).user.userId;

    const token = db.getTokenById(tokenId);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found"
      });
    }

    if (token.facultyId !== facultyId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this token"
      });
    }

    // Generate professional PDF template
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(token.qrCodeData)}`;

    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MIT ADT University - Official Visitor Token</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            line-height: 1.5;
            color: #1f2937;
            background: #f9fafb;
            padding: 20px;
          }

          .token-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid #e5e7eb;
          }

          .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            transform: rotate(45deg);
          }

          .university-logo {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
          }

          .university-name {
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 4px;
            position: relative;
            z-index: 1;
          }

          .token-title {
            font-size: 1rem;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            position: relative;
            z-index: 1;
          }

          .main-content {
            padding: 40px 30px;
          }

          .token-display {
            text-align: center;
            margin-bottom: 35px;
            padding: 25px;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-radius: 16px;
            border: 2px solid #3b82f6;
          }

          .token-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
          }

          .token-code {
            font-family: 'Courier New', monospace;
            font-size: 2.25rem;
            font-weight: 800;
            color: #1e40af;
            letter-spacing: 4px;
            margin-bottom: 20px;
            padding: 15px 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }

          .qr-section {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 20px 0;
          }

          .qr-code {
            width: 180px;
            height: 180px;
            border: 3px solid white;
            border-radius: 12px;
            box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
            background: white;
            padding: 8px;
          }

          .qr-code img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 35px 0;
          }

          .detail-item {
            background: #f8fafc;
            padding: 18px;
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
          }

          .detail-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }

          .detail-value {
            font-size: 0.95rem;
            font-weight: 600;
            color: #1f2937;
            word-wrap: break-word;
          }

          .full-width {
            grid-column: 1 / -1;
          }

          .status-badges {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin: 25px 0;
          }

          .status-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .badge-active {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
          }

          .badge-secure {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
          }

          .instructions {
            background: linear-gradient(135deg, #fef7cd 0%, #fef3c7 100%);
            border: 2px solid #f59e0b;
            border-radius: 16px;
            padding: 25px;
            margin: 30px 0;
          }

          .instructions-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .instructions-list {
            list-style: none;
            color: #92400e;
          }

          .instructions-list li {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
            font-weight: 500;
          }

          .instructions-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            font-weight: 800;
            color: #f59e0b;
          }

          .security-warning {
            background: #fef2f2;
            border: 2px solid #fca5a5;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }

          .security-warning-title {
            font-size: 1rem;
            font-weight: 700;
            color: #991b1b;
            margin-bottom: 8px;
          }

          .security-warning-text {
            font-size: 0.875rem;
            color: #991b1b;
            font-weight: 500;
          }

          .footer {
            background: #f8fafc;
            padding: 25px 30px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
          }

          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
          }

          .footer-logo {
            font-weight: 700;
            color: #1f2937;
          }

          .footer-details {
            font-size: 0.75rem;
            color: #6b7280;
            text-align: right;
          }

          .verification-section {
            background: #f0f9ff;
            border: 2px solid #0ea5e9;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }

          .verification-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 10px;
          }

          .verification-url {
            font-family: 'Courier New', monospace;
            font-size: 0.75rem;
            color: #0c4a6e;
            background: white;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #e0f2fe;
          }

          @media print {
            body {
              padding: 0;
              background: white;
            }
            .token-container {
              box-shadow: none;
              border: 2px solid #1e40af;
            }
            .qr-code {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }

          @page {
            margin: 1cm;
            size: A4;
          }
        </style>
      </head>
      <body>
        <div class="token-container">
          <!-- Header -->
          <div class="header">
            <div class="university-logo">🎓</div>
            <div class="university-name">MIT ADT University</div>
            <div class="token-title">Official Visitor Access Token</div>
          </div>

          <!-- Main Content -->
          <div class="main-content">
            <!-- Token Display -->
            <div class="token-display">
              <div class="token-label">Digital Access Code</div>
              <div class="token-code">${token.tokenCode}</div>

              <div class="qr-section">
                <div class="qr-code">
                  <img src="${qrCodeUrl}" alt="QR Code for ${token.tokenCode}" />
                </div>
              </div>
            </div>

            <!-- Status Badges -->
            <div class="status-badges">
              <div class="status-badge badge-active">✓ Authorized</div>
              <div class="status-badge badge-secure">🔒 Secure Token</div>
            </div>

            <!-- Visitor Details -->
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Visitor Name</div>
                <div class="detail-value">${token.visitor?.name || 'N/A'}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Contact Email</div>
                <div class="detail-value">${token.visitor?.email || 'N/A'}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Faculty Contact</div>
                <div class="detail-value">${token.faculty?.name || 'N/A'}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Department</div>
                <div class="detail-value">${token.faculty?.department?.name || 'N/A'}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Valid Until</div>
                <div class="detail-value">${new Date(token.expiresAt).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">Generated On</div>
                <div class="detail-value">${new Date(token.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>

              <div class="detail-item full-width">
                <div class="detail-label">Purpose of Visit</div>
                <div class="detail-value">${token.request?.purpose || 'Official University Business'}</div>
              </div>
            </div>

            <!-- Instructions -->
            <div class="instructions">
              <div class="instructions-title">
                <span>📋</span>
                Entry Instructions
              </div>
              <ul class="instructions-list">
                <li>Present this token at the main security gate</li>
                <li>Show the QR code to security personnel for scanning</li>
                <li>Carry a valid government-issued photo ID</li>
                <li>Token is valid for <strong>one-time entry only</strong></li>
                <li>Contact ${token.faculty?.name || 'faculty member'} if assistance needed</li>
                <li>Arrive during your scheduled visit time</li>
              </ul>
            </div>

            <!-- Verification Section -->
            <div class="verification-section">
              <div class="verification-title">Online Verification</div>
              <div class="verification-url">https://visitor.mitadt.edu.in/verify/${token.tokenCode}</div>
            </div>

            <!-- Security Warning -->
            <div class="security-warning">
              <div class="security-warning-title">⚠️ Security Notice</div>
              <div class="security-warning-text">
                This token is digitally signed and traceable. Unauthorized duplication or misuse is prohibited.
                Token becomes invalid after use or expiration.
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-content">
              <div class="footer-logo">MIT ADT University</div>
              <div class="footer-details">
                Token ID: ${token.id}<br/>
                Generated by: Visitor Management System<br/>
                © 2024 MIT ADT University. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="token_${token.tokenCode}.html"`);
    res.send(pdfContent);

  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF"
    });
  }
};
