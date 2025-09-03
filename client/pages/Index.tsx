import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Clock, CheckCircle, UserCheck, Building, LogIn, User } from "lucide-react";
import { Link } from "react-router-dom";
import MitAdtLogo from "@/components/shared/MitAdtLogo";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <MitAdtLogo size="md" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-xs sm:text-sm text-gray-600">Visitor Access Portal</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-base font-bold text-gray-900">MIT ADT</h1>
                <p className="text-xs text-gray-600">Visitor Portal</p>
              </div>
            </div>
            <nav className="flex space-x-2 sm:space-x-4">
              <Link to="/visitor/login">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
              <Link to="/visitor/register">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Register</span>
                  <span className="sm:hidden">Sign Up</span>
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs sm:text-sm">
            Welcome to MIT ADT University
          </Badge>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            Visitor Access
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Portal</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Create your visitor account and manage campus access easily. Submit visit requests,
            track your tokens, and enjoy seamless entry to MIT ADT University.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/visitor/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm sm:text-base">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Create Account & Request Access</span>
                <span className="sm:hidden">Create Account</span>
              </Button>
            </Link>
            <Link to="/visitor/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Login to Your Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 px-4">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Personal Account</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Create your visitor profile once and manage all your campus visits in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Secure Access</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Advanced security features with real-time validation and monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Real-time Tracking</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Live monitoring of visitor activities and campus access logs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Visitor Journey Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">1. Create Your Account</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Create your visitor profile and submit your first visit request
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-4 pt-0 sm:p-6 sm:pt-0">
              <Link to="/visitor/register">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm sm:text-base">
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">2. Await Approval</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Faculty will review your request and approve or provide feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-4 pt-0 sm:p-6 sm:pt-0">
              <Button className="w-full text-sm sm:text-base" variant="outline" disabled>
                Processing...
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg">3. Access Your Tokens</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Login to your account to view all tokens and manage your campus visits
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-4 pt-0 sm:p-6 sm:pt-0">
              <Link to="/visitor/login">
                <Button className="w-full text-sm sm:text-base" variant="outline">
                  Login to Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <MitAdtLogo size="sm" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">MIT ADT University</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              © 2024 MIT ADT University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
