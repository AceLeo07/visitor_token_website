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
    const qrCodeData = generateQRCodeData(tokenCode);
    const expiresAt = calculateTokenExpiry(new Date(request.visitDate));

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
    const qrCodeData = generateQRCodeData(tokenCode);

    const token = db.createToken({
      tokenCode,
      qrCodeData,
      visitorId: visitor.id,
      facultyId,
      isUsed: false,
      expiresAt: expiryDateTime,
      generatedBy: 'faculty'
    });

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

    // Generate PDF-like HTML response (In production, use a PDF library)
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MIT ADT University - Visitor Token</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
          }
          .token-card {
            max-width: 400px;
            margin: 0 auto;
            border: 3px solid #2563eb;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            color: white;
            padding: 20px;
            margin: -30px -30px 20px -30px;
            border-radius: 12px 12px 0 0;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 14px;
            opacity: 0.9;
          }
          .token-code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 3px;
            margin: 20px 0;
            padding: 15px;
            border: 2px dashed #2563eb;
            background: #f0f9ff;
          }
          .qr-section {
            margin: 20px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
          }
          .qr-placeholder {
            width: 150px;
            height: 150px;
            border: 2px solid #e2e8f0;
            margin: 10px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            font-size: 12px;
            color: #64748b;
          }
          .details {
            text-align: left;
            margin: 20px 0;
            font-size: 14px;
          }
          .details div {
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          .details strong {
            color: #1e40af;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
          }
          .instructions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .token-card { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="token-card">
          <div class="header">
            <div class="logo">🎓 MIT ADT University</div>
            <div class="subtitle">Official Visitor Token</div>
          </div>
          
          <div class="token-code">${token.tokenCode}</div>
          
          <div class="qr-section">
            <div><strong>QR Code</strong></div>
            <div class="qr-placeholder">
              Scan with Security App<br/>
              QR Code: ${token.qrCodeData}
            </div>
          </div>
          
          <div class="details">
            <div><strong>Visitor:</strong> ${token.visitor?.name}</div>
            <div><strong>Email:</strong> ${token.visitor?.email}</div>
            <div><strong>Phone:</strong> ${token.visitor?.phone}</div>
            <div><strong>Purpose:</strong> ${token.request?.purpose || 'Official Visit'}</div>
            <div><strong>Faculty:</strong> ${token.faculty?.name}</div>
            <div><strong>Department:</strong> ${token.faculty?.department?.name}</div>
            <div><strong>Valid Until:</strong> ${new Date(token.expiresAt).toLocaleDateString('en-IN')}</div>
            <div><strong>Generated:</strong> ${new Date(token.createdAt).toLocaleDateString('en-IN')}</div>
          </div>
          
          <div class="instructions">
            <strong>📋 Instructions:</strong><br/>
            • Present this token at the security gate<br/>
            • One-time use only<br/>
            • Keep token code ready for manual verification<br/>
            • Contact faculty if assistance needed
          </div>
          
          <div class="footer">
            <div>© 2024 MIT ADT University</div>
            <div>Token ID: ${token.id}</div>
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
