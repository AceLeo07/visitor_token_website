import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Lock, Users, BarChart3, QrCode, FileText, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MitAdtLogo from "@/components/shared/MitAdtLogo";
import Footer from "@/components/shared/Footer";

export default function FacultyPortal() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if faculty is already logged in
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");
    
    if (token && userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role === 'faculty' || user.role === 'admin') {
        navigate("/faculty/dashboard");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MitAdtLogo size="md" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-sm text-gray-600">Faculty Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">Visitor Portal</Button>
              </Link>
              <Link to="/faculty/login">
                <Button variant="outline" size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
            Faculty Access Portal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Faculty 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"> Management</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Manage visitor requests, generate tokens, and oversee campus access 
            for your department with our comprehensive faculty portal.
          </p>
          <Link to="/faculty/login">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <UserCheck className="w-5 h-5 mr-2" />
              Access Faculty Portal
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Request Management</CardTitle>
              <CardDescription>
                Review and approve visitor requests with detailed visitor information
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Token Generation</CardTitle>
              <CardDescription>
                Generate digital tokens directly for visitors with QR codes and PDFs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Analytics & Reports</CardTitle>
              <CardDescription>
                Track visitor statistics and generate detailed reports with filters
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Key Functions */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <UserCheck className="w-5 h-5" />
                Visitor Request Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-green-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Receive real-time visitor requests via email
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Review visitor details and visit purpose
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Approve or reject with personalized messages
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Automatic token generation upon approval
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <QrCode className="w-5 h-5" />
                Direct Token Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Generate tokens without waiting for requests
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Include visitor photos and custom expiry dates
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Download professional PDF tokens
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Send tokens directly via email
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Access Notice */}
        <Card className="bg-yellow-50 border-yellow-200 text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Secure Faculty Access</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              This portal is exclusively for MIT ADT University faculty members. 
              Login with your assigned faculty credentials to access the system.
            </p>
            <div className="text-sm text-yellow-600">
              <p>Need help? Contact IT Support at it-support@mitadt.edu.in</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
