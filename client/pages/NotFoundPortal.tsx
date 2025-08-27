import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Home, Lock, Shield, UserCheck, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import MitAdtLogo from "@/components/shared/MitAdtLogo";
import Footer from "@/components/shared/Footer";

export default function NotFoundPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MitAdtLogo size="md" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-sm text-gray-600">Page Not Found</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-800 hover:bg-red-100">
            404 - Page Not Found
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        {/* Error Card */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0 mb-12">
          <CardContent className="pt-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                This page is not available
              </h2>
              <p className="text-gray-600 mb-8">
                You may be looking for a restricted portal or a page that has been moved. 
                Check the available options below.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Portals */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Visitor Portal</CardTitle>
              <CardDescription className="text-sm">
                Main portal for campus visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Go to Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Faculty Portal</CardTitle>
              <CardDescription className="text-sm">
                For faculty members only
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/faculty">
                <Button className="w-full" variant="outline">
                  Faculty Access
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Security Portal</CardTitle>
              <CardDescription className="text-sm">
                For security personnel only
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/security">
                <Button className="w-full" variant="outline">
                  Security Access
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">Admin Portal</CardTitle>
              <CardDescription className="text-sm">
                For system administrators only
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/admin">
                <Button className="w-full" variant="outline">
                  Admin Access
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200 text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Need Help?</h3>
            </div>
            <p className="text-blue-700 mb-4">
              If you're looking for a specific portal or having trouble accessing a page, 
              contact the appropriate support team.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-600">
              <div>
                <p><strong>Technical Support:</strong></p>
                <p>it-support@mitadt.edu.in</p>
              </div>
              <div>
                <p><strong>Campus Security:</strong></p>
                <p>security@mitadt.edu.in</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
