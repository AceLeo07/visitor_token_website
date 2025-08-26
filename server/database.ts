import { Department, Faculty, Security, Visitor, TokenRequest, Token, SecurityLog } from '@shared/types';

// In-memory database simulation (In production, use SQLite/PostgreSQL)
class Database {
  private departments: Department[] = [];
  private faculty: Faculty[] = [];
  private security: Security[] = [];
  private visitors: Visitor[] = [];
  private tokenRequests: TokenRequest[] = [];
  private tokens: Token[] = [];
  private securityLogs: SecurityLog[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize Departments
    this.departments = [
      {
        id: 'dept-1',
        name: 'Computer Science & Engineering',
        code: 'CSE',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'dept-2',
        name: 'Information Technology',
        code: 'IT',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'dept-3',
        name: 'Electronics & Communication',
        code: 'ECE',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'dept-4',
        name: 'Mechanical Engineering',
        code: 'MECH',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'dept-5',
        name: 'Civil Engineering',
        code: 'CIVIL',
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'dept-6',
        name: 'Management Studies',
        code: 'MBA',
        createdAt: new Date('2024-01-01')
      }
    ];

    // Initialize Faculty with predefined credentials
    this.faculty = [
      {
        id: 'fac-1',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@mitadt.edu.in',
        username: 'rajesh.kumar',
        password: '$2b$10$hash1', // In production: bcrypt.hashSync('password123', 10)
        departmentId: 'dept-1',
        isAdmin: false,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'fac-2',
        name: 'Prof. Priya Sharma',
        email: 'priya.sharma@mitadt.edu.in',
        username: 'priya.sharma',
        password: '$2b$10$hash2',
        departmentId: 'dept-1',
        isAdmin: false,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'fac-3',
        name: 'Dr. Amit Patel',
        email: 'amit.patel@mitadt.edu.in',
        username: 'amit.patel',
        password: '$2b$10$hash3',
        departmentId: 'dept-2',
        isAdmin: false,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'fac-4',
        name: 'Prof. Sneha Gupta',
        email: 'sneha.gupta@mitadt.edu.in',
        username: 'sneha.gupta',
        password: '$2b$10$hash4',
        departmentId: 'dept-3',
        isAdmin: false,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'fac-5',
        name: 'Dr. Vikram Singh',
        email: 'vikram.singh@mitadt.edu.in',
        username: 'vikram.singh',
        password: '$2b$10$hash5',
        departmentId: 'dept-4',
        isAdmin: false,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'admin-1',
        name: 'Dr. Admin Director',
        email: 'admin@mitadt.edu.in',
        username: 'admin',
        password: '$2b$10$hashadmin',
        departmentId: 'dept-1',
        isAdmin: true,
        adminSecretKey: 'MIT_ADT_ADMIN_2024',
        createdAt: new Date('2024-01-01')
      }
    ];

    // Initialize Security Personnel
    this.security = [
      {
        id: 'sec-1',
        name: 'Security Guard 1',
        username: 'security1',
        password: '$2b$10$hashsec1', // password: security123
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'sec-2',
        name: 'Security Guard 2',
        username: 'security2',
        password: '$2b$10$hashsec2',
        createdAt: new Date('2024-01-01')
      }
    ];
  }

  // Department operations
  getDepartments(): Department[] {
    return this.departments;
  }

  getDepartmentById(id: string): Department | undefined {
    return this.departments.find(dept => dept.id === id);
  }

  // Faculty operations
  getFaculty(): Faculty[] {
    return this.faculty.map(f => ({ ...f, department: this.getDepartmentById(f.departmentId) }));
  }

  getFacultyById(id: string): Faculty | undefined {
    const faculty = this.faculty.find(f => f.id === id);
    if (faculty) {
      return { ...faculty, department: this.getDepartmentById(faculty.departmentId) };
    }
    return undefined;
  }

  getFacultyByUsername(username: string): Faculty | undefined {
    const faculty = this.faculty.find(f => f.username === username);
    if (faculty) {
      return { ...faculty, department: this.getDepartmentById(faculty.departmentId) };
    }
    return undefined;
  }

  getFacultyByDepartment(departmentId: string): Faculty[] {
    return this.faculty
      .filter(f => f.departmentId === departmentId)
      .map(f => ({ ...f, department: this.getDepartmentById(f.departmentId) }));
  }

  // Security operations
  getSecurityByUsername(username: string): Security | undefined {
    return this.security.find(s => s.username === username);
  }

  // Visitor operations
  createVisitor(visitor: Omit<Visitor, 'id' | 'createdAt'>): Visitor {
    const newVisitor: Visitor = {
      ...visitor,
      id: `vis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.visitors.push(newVisitor);
    return newVisitor;
  }

  getVisitorById(id: string): Visitor | undefined {
    return this.visitors.find(v => v.id === id);
  }

  // Token Request operations
  createTokenRequest(request: Omit<TokenRequest, 'id' | 'createdAt'>): TokenRequest {
    const newRequest: TokenRequest = {
      ...request,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.tokenRequests.push(newRequest);
    return newRequest;
  }

  getTokenRequestById(id: string): TokenRequest | undefined {
    const request = this.tokenRequests.find(r => r.id === id);
    if (request) {
      return {
        ...request,
        visitor: this.getVisitorById(request.visitorId),
        faculty: this.getFacultyById(request.facultyId),
        department: this.getDepartmentById(request.departmentId)
      };
    }
    return undefined;
  }

  getTokenRequestsByFaculty(facultyId: string): TokenRequest[] {
    return this.tokenRequests
      .filter(r => r.facultyId === facultyId)
      .map(r => ({
        ...r,
        visitor: this.getVisitorById(r.visitorId),
        faculty: this.getFacultyById(r.facultyId),
        department: this.getDepartmentById(r.departmentId)
      }));
  }

  getAllTokenRequests(): TokenRequest[] {
    return this.tokenRequests.map(r => ({
      ...r,
      visitor: this.getVisitorById(r.visitorId),
      faculty: this.getFacultyById(r.facultyId),
      department: this.getDepartmentById(r.departmentId)
    }));
  }

  updateTokenRequest(id: string, updates: Partial<TokenRequest>): TokenRequest | undefined {
    const index = this.tokenRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.tokenRequests[index] = { ...this.tokenRequests[index], ...updates };
      return this.getTokenRequestById(id);
    }
    return undefined;
  }

  // Token operations
  createToken(token: Omit<Token, 'id' | 'createdAt'>): Token {
    const newToken: Token = {
      ...token,
      id: `tok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.tokens.push(newToken);
    return newToken;
  }

  getTokenById(id: string): Token | undefined {
    const token = this.tokens.find(t => t.id === id);
    if (token) {
      return {
        ...token,
        visitor: this.getVisitorById(token.visitorId),
        faculty: this.getFacultyById(token.facultyId),
        request: token.requestId ? this.getTokenRequestById(token.requestId) : undefined
      };
    }
    return undefined;
  }

  getTokenByCode(tokenCode: string): Token | undefined {
    const token = this.tokens.find(t => t.tokenCode === tokenCode);
    if (token) {
      return {
        ...token,
        visitor: this.getVisitorById(token.visitorId),
        faculty: this.getFacultyById(token.facultyId),
        request: token.requestId ? this.getTokenRequestById(token.requestId) : undefined
      };
    }
    return undefined;
  }

  getTokensByFaculty(facultyId: string): Token[] {
    return this.tokens
      .filter(t => t.facultyId === facultyId)
      .map(t => ({
        ...t,
        visitor: this.getVisitorById(t.visitorId),
        faculty: this.getFacultyById(t.facultyId),
        request: t.requestId ? this.getTokenRequestById(t.requestId) : undefined
      }));
  }

  getAllTokens(): Token[] {
    return this.tokens.map(t => ({
      ...t,
      visitor: this.getVisitorById(t.visitorId),
      faculty: this.getFacultyById(t.facultyId),
      request: t.requestId ? this.getTokenRequestById(t.requestId) : undefined
    }));
  }

  updateToken(id: string, updates: Partial<Token>): Token | undefined {
    const index = this.tokens.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tokens[index] = { ...this.tokens[index], ...updates };
      return this.getTokenById(id);
    }
    return undefined;
  }

  // Security Log operations
  createSecurityLog(log: Omit<SecurityLog, 'id' | 'createdAt'>): SecurityLog {
    const newLog: SecurityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    this.securityLogs.push(newLog);
    return newLog;
  }

  getSecurityLogs(): SecurityLog[] {
    return this.securityLogs.map(log => ({
      ...log,
      token: this.getTokenById(log.tokenId),
      security: this.security.find(s => s.id === log.securityId)
    }));
  }
}

// Export singleton instance
export const db = new Database();
