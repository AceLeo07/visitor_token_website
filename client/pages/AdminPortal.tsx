import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Lock, BarChart3, Users, Building, FileText, ArrowRight, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MitAdtLogo from "@/components/shared/MitAdtLogo";
import Footer from "@/components/shared/Footer";

export default function AdminPortal() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");
    
    if (token && userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role === 'admin') {
        navigate("/admin/dashboard");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MitAdtLogo size="md" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-sm text-gray-600">System Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">Visitor Portal</Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline" size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
            System Administration
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Admin 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"> Control Center</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive system oversight and management for the MIT ADT University 
            visitor management system with advanced analytics and controls.
          </p>
          <Link to="/admin/login">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <Settings className="w-5 h-5 mr-2" />
              Access Admin Panel
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Admin Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">System Analytics</CardTitle>
              <CardDescription className="text-sm">
                Real-time dashboards and comprehensive system metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription className="text-sm">
                Monitor faculty activity and visitor patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Department Oversight</CardTitle>
              <CardDescription className="text-sm">
                Track performance across all departments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Report Generation</CardTitle>
              <CardDescription className="text-sm">
                Advanced filtering and PDF export capabilities
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Admin Capabilities */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <BarChart3 className="w-5 h-5" />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-purple-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Real-time system performance metrics
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Department-wise visitor statistics
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Faculty performance analytics
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Security access logs and alerts
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Token usage and validation patterns
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <FileText className="w-5 h-5" />
                Advanced Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Custom date range filtering
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Multi-department comparisons
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Export data in multiple formats
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Automated report scheduling
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Historical trend analysis
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="bg-red-50 border-red-200 text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Restricted Access</h3>
            </div>
            <p className="text-red-700 mb-4">
              This administrative portal provides full system control and access to sensitive data. 
              Access is restricted to authorized MIT ADT University administrators only.
            </p>
            <div className="bg-red-100 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-800 mb-2">Authentication Requirements:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Valid faculty credentials with administrative privileges</li>
                <li>• Administrative secret key verification</li>
                <li>• IP-based access controls (if configured)</li>
              </ul>
            </div>
            <div className="text-sm text-red-600">
              <p>Unauthorized access attempts are logged and monitored</p>
              <p>Contact: admin-support@mitadt.edu.in for access issues</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
