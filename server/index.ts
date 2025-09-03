import "dotenv/config";
import express from "express";
import cors from "cors";
import { authenticateToken, requireRole, requireAdmin } from "./auth";

// Import route handlers
import { handleDemo } from "./routes/demo";
import { facultyLogin, securityLogin, getDepartmentsAndFaculty } from "./routes/auth";
import { registerVisitor, loginVisitorProfile, createTokenRequest } from "./routes/visitor";
import {
  getFacultyDashboard,
  getFacultyRequests,
  approveTokenRequest,
  rejectTokenRequest,
  generateDirectToken,
  getFacultyReports,
  generateTokenPDF
} from "./routes/faculty";
import {
  getAdminDashboard,
  getAllRequests,
  getAllTokens,
  generateAdminReport,
  getFacultyAndDepartments
} from "./routes/admin";
import {
  verifyToken,
  getSecurityDashboard,
  getSecurityLogs,
  bulkVerifyTokens,
  checkTokenStatus
} from "./routes/security";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Public API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth Routes
  app.post("/api/auth/faculty/login", facultyLogin);
  app.post("/api/auth/security/login", securityLogin);
  app.get("/api/auth/departments-faculty", getDepartmentsAndFaculty);

  // Visitor Routes (Public)
  app.post("/api/visitor/register", registerVisitor);
  app.post("/api/visitor/login", loginVisitorProfile);

  // Visitor Token Request (for logged-in visitors)
  app.post("/api/visitor/request-token", createTokenRequest);

  // Token verification (Public for visitors, also used by security)
  app.post("/api/security/verify", verifyToken);

  // Token status check (Public for visitors - doesn't mark token as used)
  app.post("/api/security/check-status", checkTokenStatus);

  // Faculty Routes (Protected)
  app.get("/api/faculty/dashboard", authenticateToken, requireRole('faculty'), getFacultyDashboard);
  app.get("/api/faculty/requests", authenticateToken, requireRole('faculty'), getFacultyRequests);
  app.post("/api/faculty/requests/:requestId/approve", authenticateToken, requireRole('faculty'), approveTokenRequest);
  app.post("/api/faculty/requests/:requestId/reject", authenticateToken, requireRole('faculty'), rejectTokenRequest);
  app.post("/api/faculty/token/generate", authenticateToken, requireRole('faculty'), generateDirectToken);
  app.get("/api/faculty/token/:tokenId/pdf", authenticateToken, requireRole('faculty'), generateTokenPDF);
  app.get("/api/faculty/reports", authenticateToken, requireRole('faculty'), getFacultyReports);

  // Admin Routes (Protected - requires admin role)
  app.get("/api/admin/dashboard", authenticateToken, requireAdmin, getAdminDashboard);
  app.get("/api/admin/requests", authenticateToken, requireAdmin, getAllRequests);
  app.get("/api/admin/tokens", authenticateToken, requireAdmin, getAllTokens);
  app.get("/api/admin/report", authenticateToken, requireAdmin, generateAdminReport);
  app.get("/api/admin/faculty-departments", authenticateToken, requireAdmin, getFacultyAndDepartments);

  // Security Routes (Protected)
  app.get("/api/security/dashboard", authenticateToken, requireRole('security'), getSecurityDashboard);
  app.get("/api/security/logs", authenticateToken, requireRole('security'), getSecurityLogs);
  app.post("/api/security/bulk-verify", authenticateToken, requireRole('security'), bulkVerifyTokens);

  return app;
}
