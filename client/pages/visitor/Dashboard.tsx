import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  User, 
  Building, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  LogOut,
  Download,
  Mail,
  Phone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

interface VisitorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  tokens: Token[];
  sessionToken: string;
}

interface Token {
  id: string;
  tokenCode: string;
  qrCodeData: string;
  isUsed: boolean;
  usedAt?: string;
  expiresAt: string;
  generatedBy: 'faculty' | 'approval';
  createdAt: string;
  visitor?: {
    name: string;
    email: string;
    phone: string;
    purpose: string;
  };
  faculty?: {
    name: string;
  };
  request?: {
    departmentName?: string;
    visitDate: string;
    purpose: string;
  };
}

export default function VisitorDashboard() {
  const [visitorProfile, setVisitorProfile] = useState<VisitorProfile | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenStatuses, setTokenStatuses] = useState<{[key: string]: 'valid' | 'used' | 'expired'}>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if visitor is logged in
    const profileInfo = localStorage.getItem("visitor_profile");

    if (!profileInfo) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your profile",
        variant: "destructive"
      });
      navigate("/visitor/login");
      return;
    }

    const profile = JSON.parse(profileInfo);
    setVisitorProfile(profile);

    // Set the latest token as selected by default
    if (profile.tokens && profile.tokens.length > 0) {
      const latestToken = profile.tokens.sort((a: Token, b: Token) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setSelectedToken(latestToken);
    }

    // Check status for all tokens
    checkAllTokenStatuses(profile.tokens || []);
  }, [navigate, toast]);

  const checkAllTokenStatuses = async (tokens: Token[]) => {
    const statuses: {[key: string]: 'valid' | 'used' | 'expired'} = {};

    for (const token of tokens) {
      try {
        const response = await fetch("/api/security/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ tokenCode: token.tokenCode })
        });

        const data = await response.json();

        if (data.success && data.valid) {
          statuses[token.id] = 'valid';
        } else if (data.message?.includes('used')) {
          statuses[token.id] = 'used';
        } else {
          statuses[token.id] = 'expired';
        }
      } catch (error) {
        console.error(`Token status check error for ${token.tokenCode}:`, error);
        statuses[token.id] = 'expired';
      }
    }

    setTokenStatuses(statuses);
  };

  const handleLogout = () => {
    localStorage.removeItem("visitor_profile");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/visitor/login");
  };

  const downloadToken = () => {
    if (!visitorProfile || !selectedToken) return;

    const tokenStatus = tokenStatuses[selectedToken.id] || 'unknown';
    const tokenData = `
MIT ADT University - Visitor Token
===================================

Visitor: ${visitorProfile.name}
Email: ${visitorProfile.email}
Phone: ${visitorProfile.phone}
Token Code: ${selectedToken.tokenCode}

Visit Details:
Faculty: ${selectedToken.faculty?.name || 'N/A'}
Department: ${selectedToken.request?.departmentName || 'N/A'}
Purpose: ${selectedToken.request?.purpose || selectedToken.visitor?.purpose || 'N/A'}
Visit Date: ${selectedToken.request?.visitDate || 'N/A'}
Generated: ${new Date(selectedToken.createdAt).toLocaleDateString()}

Status: ${tokenStatus.toUpperCase()}

Instructions:
- Present this token at the security gate
- Token is for one-time use only
- Keep token code ready for verification
- Contact faculty member if assistance needed

© 2024 MIT ADT University
    `;

    const blob = new Blob([tokenData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MIT_Token_${selectedToken.tokenCode}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Token Downloaded",
      description: "Your token details have been saved as a text file",
    });
  };

  if (!visitorProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header showBackButton={false} title="Visitor Dashboard" subtitle="Token Information" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome, {visitorProfile.name}! 👋
            </h2>
            <p className="text-gray-600 mt-2">
              Your visitor profile and token management
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Overview */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  Profile Overview
                </h3>
                <p className="text-sm text-blue-700">
                  You have {visitorProfile.tokens?.length || 0} token(s) in your account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Token Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Your Access Token
              </CardTitle>
              <CardDescription>
                Present this information at the security gate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Code Display */}
              <div className="text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="font-mono text-2xl font-bold text-blue-600 letter-spacing-wide mb-2">
                  {visitor.tokenCode}
                </div>
                <p className="text-sm text-gray-600">Token Code</p>
              </div>

              {/* QR Code Placeholder */}
              <div className="text-center p-8 bg-white border-2 border-gray-200 rounded-lg">
                <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  QR Code for quick scanning<br/>
                  (Use token code if QR fails)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={downloadToken}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Token
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Visit Information
              </CardTitle>
              <CardDescription>
                Your approved visit details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Personal Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{visitor.name}</p>
                    <p className="text-sm text-gray-600">Visitor</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{visitor.email}</p>
                    <p className="text-sm text-gray-600">Email Address</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{visitor.phone}</p>
                    <p className="text-sm text-gray-600">Phone Number</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{visitor.facultyName}</p>
                    <p className="text-sm text-gray-600">{visitor.departmentName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{visitor.visitDate}</p>
                    <p className="text-sm text-gray-600">Visit Date</p>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Purpose of Visit</h4>
                <p className="text-blue-800 text-sm">{visitor.purpose}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-yellow-900 mb-3">📋 Entry Instructions</h3>
            <ul className="text-yellow-800 space-y-2 text-sm">
              <li>• Present your token code or QR code at the security gate</li>
              <li>• Keep this page accessible on your mobile device</li>
              <li>• Carry a valid photo ID for verification</li>
              <li>• Token is valid for one-time entry only</li>
              <li>• Contact {visitor.facultyName} if you need assistance</li>
              <li>• Arrive during your scheduled visit date</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
