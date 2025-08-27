import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Scan, Camera, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MitAdtLogo from "@/components/shared/MitAdtLogo";
import Footer from "@/components/shared/Footer";

export default function SecurityPortal() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if security is already logged in
    const token = localStorage.getItem("auth_token");
    const userInfo = localStorage.getItem("user_info");
    
    if (token && userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role === 'security') {
        navigate("/security/scanner");
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MitAdtLogo size="md" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-sm text-gray-600">Security Access Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">Visitor Portal</Button>
              </Link>
              <Link to="/security/login">
                <Button variant="outline" size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Security Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100">
            Security Access Control
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Security 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600"> Scanner Portal</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Secure campus access control with advanced token verification, QR code scanning, 
            and real-time visitor monitoring for MIT ADT University.
          </p>
          <Link to="/security/login">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              <Shield className="w-5 h-5 mr-2" />
              Access Security Panel
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Scan className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">QR Code Scanner</CardTitle>
              <CardDescription>
                High-speed QR code scanning with camera integration for quick verification
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Token Verification</CardTitle>
              <CardDescription>
                Real-time token validation with manual code entry and security logging
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Access Monitoring</CardTitle>
              <CardDescription>
                Comprehensive logging and real-time monitoring of all campus entries
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Scanner Workflow */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Camera className="w-5 h-5" />
                QR Scanning Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-orange-800">Activate Scanner</h4>
                    <p className="text-orange-700 text-sm">Login and start the camera-based QR scanner</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-orange-800">Scan Visitor Token</h4>
                    <p className="text-orange-700 text-sm">Point camera at visitor's QR code for instant scanning</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-orange-800">Verify & Grant Access</h4>
                    <p className="text-orange-700 text-sm">System validates token and logs entry automatically</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Shield className="w-5 h-5" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Real-time token validation against database
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  One-time use token enforcement
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Automatic expiry date verification
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Manual token code entry backup
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Comprehensive access logging
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Visitor information display
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Scan className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Token Scanner</CardTitle>
              <CardDescription>
                Access the main QR code scanner for token verification
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/security/login">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  <Scan className="w-4 h-4 mr-2" />
                  Launch Scanner
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Security Dashboard</CardTitle>
              <CardDescription>
                View access logs and monitoring dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/security/login">
                <Button className="w-full" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="bg-yellow-50 border-yellow-200 text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Security Personnel Only</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              This portal is exclusively for authorized MIT ADT University security personnel. 
              All access attempts are logged and monitored for security purposes.
            </p>
            <div className="bg-yellow-100 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Operating Instructions:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Always verify visitor identity with photo ID</li>
                <li>• Report any suspicious tokens or access attempts</li>
                <li>• Contact faculty if visitor has issues with their token</li>
                <li>• Log any manual overrides or special circumstances</li>
              </ul>
            </div>
            <div className="text-sm text-yellow-600">
              <p>Support Hotline: security@mitadt.edu.in | Ext: 911</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
