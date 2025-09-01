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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MitAdtLogo size="md" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-sm text-gray-600">Visitor Access Portal</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link to="/visitor/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/visitor/register">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Register
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Welcome to MIT ADT University
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Visitor Access
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Portal</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create your visitor account and manage campus access easily. Submit visit requests,
            track your tokens, and enjoy seamless entry to MIT ADT University.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/visitor/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <UserCheck className="w-5 h-5 mr-2" />
                Create Account & Request Access
              </Button>
            </Link>
            <Link to="/visitor/login">
              <Button size="lg" variant="outline">
                <LogIn className="w-5 h-5 mr-2" />
                Login to Your Account
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

        {/* Visitor Journey Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">1. Register Your Visit</CardTitle>
              <CardDescription className="text-sm">
                Complete the visitor registration form with your details and visit purpose
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/visitor/register">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Start Registration
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">2. Await Approval</CardTitle>
              <CardDescription className="text-sm">
                Faculty will review your request and approve or provide feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full" variant="outline" disabled>
                Processing...
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg">3. Receive Token</CardTitle>
              <CardDescription className="text-sm">
                Get your digital access token via email and present at campus entrance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/visitor/login">
                <Button className="w-full" variant="outline">
                  Check Status
                </Button>
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
