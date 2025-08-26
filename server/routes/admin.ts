import { RequestHandler } from "express";
import { db } from "../database";
import { ReportFilter, DashboardStats } from "@shared/types";

// Get Admin Dashboard Data
export const getAdminDashboard: RequestHandler = (req, res) => {
  try {
    const allRequests = db.getAllTokenRequests();
    const allTokens = db.getAllTokens();
    const allFaculty = db.getFaculty();
    const allDepartments = db.getDepartments();

    // Calculate comprehensive stats
    const stats: DashboardStats = {
      totalRequests: allRequests.length,
      pendingRequests: allRequests.filter(r => r.status === 'pending').length,
      approvedTokens: allRequests.filter(r => r.status === 'approved').length,
      rejectedRequests: allRequests.filter(r => r.status === 'rejected').length,
      tokensGenerated: allTokens.length,
      tokensUsed: allTokens.filter(t => t.isUsed).length,
      todayEntries: allTokens.filter(t => {
        const today = new Date();
        const tokenDate = new Date(t.usedAt || t.createdAt);
        return (
          tokenDate.getDate() === today.getDate() &&
          tokenDate.getMonth() === today.getMonth() &&
          tokenDate.getFullYear() === today.getFullYear() &&
          t.isUsed
        );
      }).length
    };

    // Get department-wise stats
    const departmentStats = allDepartments.map(dept => {
      const deptRequests = allRequests.filter(r => r.departmentId === dept.id);
      const deptTokens = allTokens.filter(t => t.faculty?.departmentId === dept.id);
      
      return {
        department: dept,
        totalRequests: deptRequests.length,
        pendingRequests: deptRequests.filter(r => r.status === 'pending').length,
        approvedTokens: deptRequests.filter(r => r.status === 'approved').length,
        rejectedRequests: deptRequests.filter(r => r.status === 'rejected').length,
        tokensGenerated: deptTokens.length,
        tokensUsed: deptTokens.filter(t => t.isUsed).length
      };
    });

    // Get faculty-wise stats
    const facultyStats = allFaculty.filter(f => !f.isAdmin).map(faculty => {
      const facRequests = allRequests.filter(r => r.facultyId === faculty.id);
      const facTokens = allTokens.filter(t => t.facultyId === faculty.id);
      
      return {
        faculty,
        totalRequests: facRequests.length,
        pendingRequests: facRequests.filter(r => r.status === 'pending').length,
        approvedTokens: facRequests.filter(r => r.status === 'approved').length,
        rejectedRequests: facRequests.filter(r => r.status === 'rejected').length,
        tokensGenerated: facTokens.length,
        tokensUsed: facTokens.filter(t => t.isUsed).length
      };
    });

    // Get recent activity
    const recentActivity = [
      ...allRequests.map(r => ({
        type: 'request',
        action: r.status,
        timestamp: r.responseDate || r.createdAt,
        data: r
      })),
      ...allTokens.filter(t => t.isUsed).map(t => ({
        type: 'token_used',
        action: 'used',
        timestamp: t.usedAt || t.createdAt,
        data: t
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

    res.json({
      success: true,
      stats,
      departmentStats,
      facultyStats,
      recentActivity
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard"
    });
  }
};

// Get All Token Requests with Filters
export const getAllRequests: RequestHandler = (req, res) => {
  try {
    const { 
      period, 
      startDate, 
      endDate, 
      facultyId, 
      departmentId, 
      status 
    } = req.query as ReportFilter;

    let requests = db.getAllTokenRequests();

    // Apply filters
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

      requests = requests.filter(r => new Date(r.createdAt) >= filterDate);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      requests = requests.filter(r => {
        const date = new Date(r.createdAt);
        return date >= start && date <= end;
      });
    }

    if (facultyId) {
      requests = requests.filter(r => r.facultyId === facultyId);
    }

    if (departmentId) {
      requests = requests.filter(r => r.departmentId === departmentId);
    }

    if (status) {
      requests = requests.filter(r => r.status === status);
    }

    res.json({
      success: true,
      requests: requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });

  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests"
    });
  }
};

// Get All Tokens with Filters
export const getAllTokens: RequestHandler = (req, res) => {
  try {
    const { 
      period, 
      startDate, 
      endDate, 
      facultyId, 
      departmentId 
    } = req.query as ReportFilter;

    let tokens = db.getAllTokens();

    // Apply filters
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

      tokens = tokens.filter(t => new Date(t.createdAt) >= filterDate);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      tokens = tokens.filter(t => {
        const date = new Date(t.createdAt);
        return date >= start && date <= end;
      });
    }

    if (facultyId) {
      tokens = tokens.filter(t => t.facultyId === facultyId);
    }

    if (departmentId) {
      tokens = tokens.filter(t => t.faculty?.departmentId === departmentId);
    }

    res.json({
      success: true,
      tokens: tokens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });

  } catch (error) {
    console.error('Get all tokens error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tokens"
    });
  }
};

// Generate Admin Reports
export const generateAdminReport: RequestHandler = (req, res) => {
  try {
    const { 
      period, 
      startDate, 
      endDate, 
      facultyId, 
      departmentId,
      format 
    } = req.query as ReportFilter & { format?: string };

    let requests = db.getAllTokenRequests();
    let tokens = db.getAllTokens();

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

    if (facultyId) {
      requests = requests.filter(r => r.facultyId === facultyId);
      tokens = tokens.filter(t => t.facultyId === facultyId);
    }

    if (departmentId) {
      requests = requests.filter(r => r.departmentId === departmentId);
      tokens = tokens.filter(t => t.faculty?.departmentId === departmentId);
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

    if (format === 'pdf') {
      // Generate PDF report
      const reportDate = new Date().toLocaleDateString('en-IN');
      const periodText = period || `${startDate} to ${endDate}`;

      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>MIT ADT University - Admin Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            .stat-card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            }
            .stat-number {
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
            }
            .stat-label {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .table th, .table td {
              border: 1px solid #e2e8f0;
              padding: 12px;
              text-align: left;
              font-size: 12px;
            }
            .table th {
              background: #f8fafc;
              font-weight: bold;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🎓 MIT ADT University</div>
            <h1>Visitor Management System Report</h1>
            <p><strong>Period:</strong> ${periodText}</p>
            <p><strong>Generated on:</strong> ${reportDate}</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${stats.totalRequests}</div>
              <div class="stat-label">Total Requests</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.approvedTokens}</div>
              <div class="stat-label">Approved Tokens</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.tokensUsed}</div>
              <div class="stat-label">Tokens Used</div>
            </div>
          </div>
          
          <h2>Recent Requests Summary</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Visitor</th>
                <th>Faculty</th>
                <th>Department</th>
                <th>Status</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              ${requests.slice(0, 50).map(r => `
                <tr>
                  <td>${new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>${r.visitor?.name}</td>
                  <td>${r.faculty?.name}</td>
                  <td>${r.department?.name}</td>
                  <td>${r.status.toUpperCase()}</td>
                  <td>${r.purpose}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>© 2024 MIT ADT University. All rights reserved.</p>
            <p>This report contains confidential information. Handle with care.</p>
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `inline; filename="admin_report_${Date.now()}.html"`);
      res.send(pdfContent);
    } else {
      // Return JSON data
      res.json({
        success: true,
        requests: requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        tokens: tokens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        stats,
        period: period || 'custom'
      });
    }

  } catch (error) {
    console.error('Generate admin report error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report"
    });
  }
};

// Get All Faculty and Departments for filters
export const getFacultyAndDepartments: RequestHandler = (req, res) => {
  try {
    const departments = db.getDepartments();
    const faculty = db.getFaculty().filter(f => !f.isAdmin);

    res.json({
      success: true,
      departments,
      faculty: faculty.map(f => ({
        id: f.id,
        name: f.name,
        email: f.email,
        department: f.department
      }))
    });

  } catch (error) {
    console.error('Get faculty and departments error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty and departments"
    });
  }
};
