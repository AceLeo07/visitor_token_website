import { RequestHandler } from "express";
import { db } from "../database";
import { sendEmail } from "../utils";
import { emailService } from "../emailService";
import { VisitorRegistrationRequest } from "@shared/types";

// Simple password hashing utility (in production, use bcrypt)
const hashPassword = (password: string): string => {
  // Simple hash simulation - in production use bcrypt.hash()
  return `$hash$${Buffer.from(password + 'salt_key_mit_adt').toString('base64')}`;
};

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Visitor Registration and Token Request
export const registerVisitor: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      address,
      purpose,
      departmentId,
      facultyId,
      visitDate,
      password
    }: VisitorRegistrationRequest & { password: string } = req.body;

    // Validation
    if (!name || !email || !phone || !address || !purpose || !departmentId || !facultyId || !visitDate || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits"
      });
    }

    // Check if department and faculty exist
    const department = db.getDepartmentById(departmentId);
    const faculty = db.getFacultyById(facultyId);

    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Invalid department selected"
      });
    }

    if (!faculty) {
      return res.status(400).json({
        success: false,
        message: "Invalid faculty selected"
      });
    }

    if (faculty.departmentId !== departmentId) {
      return res.status(400).json({
        success: false,
        message: "Selected faculty does not belong to the selected department"
      });
    }

    // Check if visitor profile already exists
    const existingProfile = db.getVisitorProfileByEmail(email);
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "A visitor profile already exists with this email address. Please login instead."
      });
    }

    // Validate visit date (must be today or future)
    const visitDateTime = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    visitDateTime.setHours(0, 0, 0, 0);

    if (visitDateTime < today) {
      return res.status(400).json({
        success: false,
        message: "Visit date cannot be in the past"
      });
    }

    // Create visitor
    const visitor = db.createVisitor({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company?.trim(),
      address: address.trim(),
      purpose: purpose.trim()
    });

    // Create token request
    const tokenRequest = db.createTokenRequest({
      visitorId: visitor.id,
      facultyId,
      departmentId,
      purpose: purpose.trim(),
      visitDate: visitDateTime,
      status: 'pending'
    });

    // Send notification email to faculty using enhanced template
    const facultyEmailContent = emailService.generateFacultyNotificationEmail(tokenRequest);
    sendEmail(faculty.email!, `New Visitor Request - ${visitor.name}`, facultyEmailContent, 'faculty_notification')
      .catch(error => console.error('Failed to send faculty notification:', error));

    // Send confirmation email to visitor using enhanced template
    const visitorEmailContent = emailService.generateVisitorConfirmationEmail(tokenRequest);
    sendEmail(visitor.email, 'MIT ADT University - Visitor Request Submitted', visitorEmailContent, 'visitor_confirmation')
      .catch(error => console.error('Failed to send visitor confirmation:', error));

    res.status(201).json({
      success: true,
      message: "Visitor request submitted successfully. You will receive an email notification once reviewed.",
      requestId: tokenRequest.id
    });

  } catch (error) {
    console.error('Visitor registration error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};
