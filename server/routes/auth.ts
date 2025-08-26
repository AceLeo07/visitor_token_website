import { RequestHandler } from "express";
import { db } from "../database";
import { verifyPassword, generateToken } from "../auth";
import { AuthResponse, FacultyLoginRequest, SecurityLoginRequest } from "@shared/types";

// Faculty/Admin Login
export const facultyLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password, adminSecretKey }: FacultyLoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
        token: ""
      } as AuthResponse);
    }

    const faculty = db.getFacultyByUsername(username);
    if (!faculty) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        token: ""
      } as AuthResponse);
    }

    // Verify password
    if (!verifyPassword(password, faculty.password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        token: ""
      } as AuthResponse);
    }

    // Check if attempting admin login
    if (adminSecretKey) {
      if (!faculty.isAdmin || faculty.adminSecretKey !== adminSecretKey) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
          token: ""
        } as AuthResponse);
      }
      
      // Admin login successful
      const token = generateToken(faculty.id, 'admin');
      return res.json({
        success: true,
        user: {
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
          username: faculty.username,
          role: 'admin',
          department: faculty.department
        },
        token,
        message: "Admin login successful"
      } as AuthResponse);
    }

    // Regular faculty login
    const token = generateToken(faculty.id, 'faculty');
    res.json({
      success: true,
      user: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        username: faculty.username,
        role: 'faculty',
        department: faculty.department
      },
      token,
      message: "Faculty login successful"
    } as AuthResponse);

  } catch (error) {
    console.error('Faculty login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      token: ""
    } as AuthResponse);
  }
};

// Security Login
export const securityLogin: RequestHandler = async (req, res) => {
  try {
    const { username, password }: SecurityLoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
        token: ""
      } as AuthResponse);
    }

    const security = db.getSecurityByUsername(username);
    if (!security) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        token: ""
      } as AuthResponse);
    }

    // Verify password
    if (!verifyPassword(password, security.password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        token: ""
      } as AuthResponse);
    }

    const token = generateToken(security.id, 'security');
    res.json({
      success: true,
      user: {
        id: security.id,
        name: security.name,
        username: security.username,
        role: 'security'
      },
      token,
      message: "Security login successful"
    } as AuthResponse);

  } catch (error) {
    console.error('Security login error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      token: ""
    } as AuthResponse);
  }
};

// Get Departments and Faculty for forms
export const getDepartmentsAndFaculty: RequestHandler = (req, res) => {
  try {
    const departments = db.getDepartments();
    const faculty = db.getFaculty();
    
    const departmentsWithFaculty = departments.map(dept => ({
      ...dept,
      faculty: faculty.filter(f => f.departmentId === dept.id && !f.isAdmin).map(f => ({
        id: f.id,
        name: f.name,
        email: f.email
      }))
    }));

    res.json({
      success: true,
      departments: departmentsWithFaculty
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments and faculty"
    });
  }
};
