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

interface VisitorInfo {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  facultyName: string;
  departmentName: string;
  visitDate: string;
  tokenCode: string;
}

export default function VisitorDashboard() {
  const [visitor, setVisitor] = useState<VisitorInfo | null>(null);
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'used' | 'expired'>('valid');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if visitor is logged in
    const visitorInfo = localStorage.getItem("visitor_info");
    
    if (!visitorInfo) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your token details",
        variant: "destructive"
      });
      navigate("/visitor/login");
      return;
    }

    const visitor = JSON.parse(visitorInfo);
    setVisitor(visitor);
    
    // Check token status
    checkTokenStatus(visitor.tokenCode);
  }, [navigate, toast]);

  const checkTokenStatus = async (tokenCode: string) => {
    try {
      const response = await fetch("/api/security/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tokenCode })
      });

      const data = await response.json();
      
      if (data.success && data.valid) {
        setTokenStatus('valid');
      } else if (data.message?.includes('used')) {
        setTokenStatus('used');
      } else {
        setTokenStatus('expired');
      }
    } catch (error) {
      console.error("Token status check error:", error);
      setTokenStatus('expired');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("visitor_info");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/visitor/login");
  };

  const downloadToken = () => {
    if (!visitor) return;
    
    const tokenData = `
MIT ADT University - Visitor Token
===================================

Visitor: ${visitor.name}
Email: ${visitor.email}
Phone: ${visitor.phone}
Token Code: ${visitor.tokenCode}

Visit Details:
Faculty: ${visitor.facultyName}
Department: ${visitor.departmentName}
Purpose: ${visitor.purpose}
Visit Date: ${visitor.visitDate}

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
    a.download = `MIT_Token_${visitor.tokenCode}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Token Downloaded",
      description: "Your token details have been saved as a text file",
    });
  };

  if (!visitor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your token details...</p>
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
              Welcome, {visitor.name}! 👋
            </h2>
            <p className="text-gray-600 mt-2">
              Your visitor token and access information
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Token Status Alert */}
        <Card className={`mb-8 ${
          tokenStatus === 'valid' ? 'border-green-200 bg-green-50' :
          tokenStatus === 'used' ? 'border-blue-200 bg-blue-50' :
          'border-red-200 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {tokenStatus === 'valid' && <CheckCircle className="w-6 h-6 text-green-600" />}
              {tokenStatus === 'used' && <Clock className="w-6 h-6 text-blue-600" />}
              {tokenStatus === 'expired' && <AlertCircle className="w-6 h-6 text-red-600" />}
              
              <div>
                <h3 className={`font-semibold ${
                  tokenStatus === 'valid' ? 'text-green-800' :
                  tokenStatus === 'used' ? 'text-blue-800' :
                  'text-red-800'
                }`}>
                  Token Status: {tokenStatus === 'valid' ? 'Active' : tokenStatus === 'used' ? 'Used' : 'Expired/Invalid'}
                </h3>
                <p className={`text-sm ${
                  tokenStatus === 'valid' ? 'text-green-700' :
                  tokenStatus === 'used' ? 'text-blue-700' :
                  'text-red-700'
                }`}>
                  {tokenStatus === 'valid' && 'Your token is ready for campus entry'}
                  {tokenStatus === 'used' && 'This token has been used for campus entry'}
                  {tokenStatus === 'expired' && 'This token is no longer valid'}
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
