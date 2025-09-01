// Database Models and Types for MIT ADT Visitor Management System

export interface Department {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string; // hashed
  departmentId: string;
  department?: Department;
  isAdmin: boolean;
  adminSecretKey?: string;
  createdAt: Date;
}

export interface Security {
  id: string;
  name: string;
  username: string;
  password: string; // hashed
  createdAt: Date;
}

export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  company?: string;
  address: string;
  createdAt: Date;
}

export interface VisitorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  password: string; // hashed password for login
  tokens: string[]; // array of token IDs for this visitor
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenRequest {
  id: string;
  visitorId: string;
  visitor?: Visitor;
  facultyId: string;
  faculty?: Faculty;
  departmentId: string;
  department?: Department;
  purpose: string;
  visitDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  responseDate?: Date;
  responseMessage?: string;
  createdAt: Date;
}

export interface Token {
  id: string;
  tokenCode: string;
  qrCodeData: string;
  visitorId: string;
  visitor?: Visitor;
  facultyId: string;
  faculty?: Faculty;
  requestId?: string;
  request?: TokenRequest;
  isUsed: boolean;
  usedAt?: Date;
  usedBySecurityId?: string;
  expiresAt: Date;
  generatedBy: 'faculty' | 'approval'; // faculty direct generation or approval flow
  createdAt: Date;
}

export interface SecurityLog {
  id: string;
  tokenId: string;
  token?: Token;
  securityId: string;
  security?: Security;
  action: 'scanned' | 'verified' | 'rejected';
  method: 'qr' | 'manual';
  notes?: string;
  createdAt: Date;
}

// API Request/Response Types
export interface VisitorRegistrationRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  purpose: string;
  departmentId: string;
  facultyId: string;
  visitDate: string;
}

export interface FacultyLoginRequest {
  username: string;
  password: string;
  adminSecretKey?: string;
}

export interface SecurityLoginRequest {
  username: string;
  password: string;
}

export interface VisitorProfileCreateRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  password: string;
}

export interface VisitorProfileLoginRequest {
  email: string;
  password: string;
}

export interface TokenGenerationRequest {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
  visitDate: string;
  expiryDate: string;
}

export interface TokenVerificationRequest {
  tokenCode?: string;
  qrData?: string;
}

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  facultyId?: string;
  departmentId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  period?: 'today' | 'week' | 'month' | 'custom';
}

// API Response Types
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email?: string;
    username: string;
    role: 'faculty' | 'admin' | 'security';
    department?: Department;
  };
  token: string;
  message: string;
}

export interface TokenResponse {
  success: boolean;
  token?: {
    id: string;
    tokenCode: string;
    qrCodeData: string;
    visitorName: string;
    facultyName: string;
    departmentName: string;
    purpose: string;
    visitDate: string;
    expiresAt: string;
  };
  pdfUrl?: string;
  message: string;
}

export interface VerificationResponse {
  success: boolean;
  valid: boolean;
  visitor?: {
    name: string;
    email: string;
    phone: string;
    purpose: string;
    facultyName: string;
    departmentName: string;
    visitDate: string;
  };
  message: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedTokens: number;
  rejectedRequests: number;
  tokensGenerated: number;
  tokensUsed: number;
  todayEntries: number;
}

export interface ReportData {
  requests: TokenRequest[];
  tokens: Token[];
  stats: DashboardStats;
  period: string;
}
