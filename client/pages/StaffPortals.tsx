import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Building } from "lucide-react";
import { Link } from "react-router-dom";
import MitAdtLogo from "@/components/shared/MitAdtLogo";

export default function StaffPortals() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MitAdtLogo size="md" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-sm text-gray-600">Staff Portal Access</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost" size="sm">
                Visitor Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Staff Portal Access
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select your role to access the appropriate portal and dashboard
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Faculty Portal */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Faculty Portal</CardTitle>
              <CardDescription className="text-base">
                Manage visitor requests, approve tokens, and generate direct access for visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Review visitor requests</p>
                <p>• Approve/reject applications</p>
                <p>• Generate direct tokens</p>
                <p>• View department reports</p>
              </div>
              <Link to="/faculty">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Access Faculty Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Portal */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Admin Portal</CardTitle>
              <CardDescription className="text-base">
                System administration, user management, and comprehensive analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p>• System administration</p>
                <p>• User management</p>
                <p>• Analytics & reports</p>
                <p>• Configuration settings</p>
              </div>
              <Link to="/admin">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                  Access Admin Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Security Portal */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Security Portal</CardTitle>
              <CardDescription className="text-base">
                Token verification, QR scanning, and campus access monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-sm text-gray-600 space-y-1">
                <p>• QR code scanning</p>
                <p>• Token verification</p>
                <p>• Access monitoring</p>
                <p>• Security logs</p>
              </div>
              <Link to="/security">
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                  Access Security Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <div className="mt-16 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">🔐 Access Requirements</h3>
          <ul className="text-yellow-800 space-y-2 text-sm">
            <li>• Valid staff credentials are required for portal access</li>
            <li>• Faculty members use their assigned username and password</li>
            <li>• Admin access requires additional security clearance</li>
            <li>• Security personnel use their designated login credentials</li>
            <li>• All portal activities are monitored and logged</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <MitAdtLogo size="sm" />
              <span className="font-semibold text-gray-900">MIT ADT University</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2024 MIT ADT University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
