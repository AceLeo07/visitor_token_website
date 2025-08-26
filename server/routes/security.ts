import { RequestHandler } from "express";
import { db } from "../database";
import { isTokenValid } from "../utils";
import { TokenVerificationRequest, VerificationResponse } from "@shared/types";

// Verify Token (QR Code or Manual)
export const verifyToken: RequestHandler = async (req, res) => {
  try {
    const { tokenCode, qrData }: TokenVerificationRequest = req.body;
    const securityId = (req as any).user.userId;

    if (!tokenCode && !qrData) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Token code or QR data is required"
      } as VerificationResponse);
    }

    // Find token by code or QR data
    let token;
    let method: 'qr' | 'manual' = 'manual';

    if (qrData) {
      // Extract token code from QR data URL
      const urlMatch = qrData.match(/\/verify\/(.+)$/);
      if (urlMatch) {
        token = db.getTokenByCode(urlMatch[1]);
        method = 'qr';
      }
    } else if (tokenCode) {
      token = db.getTokenByCode(tokenCode);
      method = 'manual';
    }

    if (!token) {
      // Log failed verification attempt
      if (tokenCode) {
        db.createSecurityLog({
          tokenId: '',
          securityId,
          action: 'rejected',
          method,
          notes: `Invalid token code: ${tokenCode}`
        });
      }

      return res.status(404).json({
        success: false,
        valid: false,
        message: "Token not found"
      } as VerificationResponse);
    }

    // Check if token is valid
    const validationResult = isTokenValid(token);
    
    if (!validationResult.valid) {
      // Log invalid token attempt
      db.createSecurityLog({
        tokenId: token.id,
        securityId,
        action: 'rejected',
        method,
        notes: validationResult.reason
      });

      return res.status(400).json({
        success: false,
        valid: false,
        message: validationResult.reason,
        visitor: {
          name: token.visitor?.name || '',
          email: token.visitor?.email || '',
          phone: token.visitor?.phone || '',
          purpose: token.request?.purpose || '',
          facultyName: token.faculty?.name || '',
          departmentName: token.faculty?.department?.name || '',
          visitDate: token.request?.visitDate ? new Date(token.request.visitDate).toLocaleDateString('en-IN') : ''
        }
      } as VerificationResponse);
    }

    // Mark token as used
    const updatedToken = db.updateToken(token.id, {
      isUsed: true,
      usedAt: new Date(),
      usedBySecurityId: securityId
    });

    if (!updatedToken) {
      return res.status(500).json({
        success: false,
        valid: false,
        message: "Failed to mark token as used"
      } as VerificationResponse);
    }

    // Log successful verification
    db.createSecurityLog({
      tokenId: token.id,
      securityId,
      action: 'verified',
      method,
      notes: 'Token verified successfully, entry granted'
    });

    res.json({
      success: true,
      valid: true,
      message: "Token verified successfully. Entry granted.",
      visitor: {
        name: token.visitor?.name || '',
        email: token.visitor?.email || '',
        phone: token.visitor?.phone || '',
        purpose: token.request?.purpose || '',
        facultyName: token.faculty?.name || '',
        departmentName: token.faculty?.department?.name || '',
        visitDate: token.request?.visitDate ? new Date(token.request.visitDate).toLocaleDateString('en-IN') : ''
      }
    } as VerificationResponse);

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: "Internal server error during verification"
    } as VerificationResponse);
  }
};

// Get Security Dashboard Data
export const getSecurityDashboard: RequestHandler = (req, res) => {
  try {
    const securityId = (req as any).user.userId;
    const security = db.getSecurityByUsername((req as any).user.username);
    
    if (!security) {
      return res.status(404).json({
        success: false,
        message: "Security personnel not found"
      });
    }

    // Get all security logs
    const allLogs = db.getSecurityLogs();
    const myLogs = allLogs.filter(log => log.securityId === securityId);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = myLogs.filter(log => {
      const logDate = new Date(log.createdAt);
      return logDate >= today && logDate < tomorrow;
    });

    const todayVerified = todayLogs.filter(log => log.action === 'verified').length;
    const todayRejected = todayLogs.filter(log => log.action === 'rejected').length;
    const todayScanned = todayLogs.filter(log => log.method === 'qr').length;
    const todayManual = todayLogs.filter(log => log.method === 'manual').length;

    // Get recent activity
    const recentActivity = myLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    res.json({
      success: true,
      security: {
        id: security.id,
        name: security.name,
        username: security.username
      },
      stats: {
        todayVerified,
        todayRejected,
        todayScanned,
        todayManual,
        totalVerifications: myLogs.filter(log => log.action === 'verified').length,
        totalRejections: myLogs.filter(log => log.action === 'rejected').length
      },
      recentActivity
    });

  } catch (error) {
    console.error('Security dashboard error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load security dashboard"
    });
  }
};

// Get Security Logs with Filters
export const getSecurityLogs: RequestHandler = (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const securityId = (req as any).user.userId;

    let logs = db.getSecurityLogs().filter(log => log.securityId === securityId);

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
          filterDate = new Date(0);
      }

      logs = logs.filter(log => new Date(log.createdAt) >= filterDate);
    }

    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      logs = logs.filter(log => {
        const date = new Date(log.createdAt);
        return date >= start && date <= end;
      });
    }

    res.json({
      success: true,
      logs: logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });

  } catch (error) {
    console.error('Get security logs error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch security logs"
    });
  }
};

// Bulk Token Verification (for scanning multiple tokens)
export const bulkVerifyTokens: RequestHandler = async (req, res) => {
  try {
    const { tokens }: { tokens: string[] } = req.body;
    const securityId = (req as any).user.userId;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Token codes array is required"
      });
    }

    const results = [];

    for (const tokenCode of tokens) {
      const token = db.getTokenByCode(tokenCode);
      
      if (!token) {
        results.push({
          tokenCode,
          valid: false,
          message: "Token not found"
        });
        continue;
      }

      const validationResult = isTokenValid(token);
      
      if (!validationResult.valid) {
        db.createSecurityLog({
          tokenId: token.id,
          securityId,
          action: 'rejected',
          method: 'manual',
          notes: `Bulk verification: ${validationResult.reason}`
        });

        results.push({
          tokenCode,
          valid: false,
          message: validationResult.reason,
          visitor: {
            name: token.visitor?.name || '',
            purpose: token.request?.purpose || ''
          }
        });
        continue;
      }

      // Mark token as used
      db.updateToken(token.id, {
        isUsed: true,
        usedAt: new Date(),
        usedBySecurityId: securityId
      });

      // Log successful verification
      db.createSecurityLog({
        tokenId: token.id,
        securityId,
        action: 'verified',
        method: 'manual',
        notes: 'Bulk verification: Entry granted'
      });

      results.push({
        tokenCode,
        valid: true,
        message: "Token verified successfully",
        visitor: {
          name: token.visitor?.name || '',
          purpose: token.request?.purpose || '',
          facultyName: token.faculty?.name || '',
          departmentName: token.faculty?.department?.name || ''
        }
      });
    }

    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        verified: results.filter(r => r.valid).length,
        rejected: results.filter(r => !r.valid).length
      }
    });

  } catch (error) {
    console.error('Bulk verify tokens error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to verify tokens"
    });
  }
};
