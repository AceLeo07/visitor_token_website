import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Clock, CheckCircle, UserCheck, Building } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-sm text-gray-600">Visitor Token System</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link to="/visitor/login">
                <Button variant="ghost" size="sm">Visitor Login</Button>
              </Link>
              <Link to="/faculty/login">
                <Button variant="ghost" size="sm">Faculty Login</Button>
              </Link>
              <Link to="/admin/login">
                <Button variant="outline" size="sm">Admin Portal</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Secure & Efficient
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Digital Visitor
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Token System</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Streamline campus access with our modern, secure visitor management system. 
            Generate digital tokens, track entries, and ensure campus security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/visitor/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <UserCheck className="w-5 h-5 mr-2" />
                Request Visitor Access
              </Button>
            </Link>
            <Link to="/security/scanner">
              <Button size="lg" variant="outline">
                <Shield className="w-5 h-5 mr-2" />
                Security Scanner
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Easy Registration</CardTitle>
              <CardDescription>
                Quick and simple visitor registration process with digital token generation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Secure Access</CardTitle>
              <CardDescription>
                Advanced security features with real-time validation and monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Real-time Tracking</CardTitle>
              <CardDescription>
                Live monitoring of visitor activities and campus access logs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Role-based Access Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">Visitors</CardTitle>
              <CardDescription className="text-sm">
                Register and request campus access tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/visitor/register">
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">Faculty</CardTitle>
              <CardDescription className="text-sm">
                Approve visitor requests and manage invitations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/faculty/login">
                <Button className="w-full" variant="outline">Faculty Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription className="text-sm">
                Scan tokens and monitor campus access
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/security/login">
                <Button className="w-full" variant="outline">Security Portal</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Building className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">Admin</CardTitle>
              <CardDescription className="text-sm">
                System administration and user management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/admin/login">
                <Button className="w-full" variant="outline">Admin Portal</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
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
