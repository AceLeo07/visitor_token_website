import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building, Calendar, Check, Mail, MapPin, Phone, User, Users, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  code: string;
  faculty: Faculty[];
}

interface Faculty {
  id: string;
  name: string;
  email: string;
}

export default function VisitorRegister() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    purpose: "",
    visitDate: "",
    password: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  // Load departments and faculty on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/departments-faculty");
        const data = await response.json();
        
        if (data.success) {
          setDepartments(data.departments);
        } else {
          toast({
            title: "Error",
            description: "Failed to load departments and faculty",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast({
          title: "Error",
          description: "Failed to load departments. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle department selection
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedFaculty(""); // Reset faculty selection
  };

  // Get selected department's faculty
  const getSelectedDepartmentFaculty = () => {
    const dept = departments.find(d => d.id === selectedDepartment);
    return dept?.faculty || [];
  };

  // Form validation
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push("Name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.phone.trim()) errors.push("Phone number is required");
    if (!formData.address.trim()) errors.push("Address is required");
    if (!formData.purpose.trim()) errors.push("Purpose of visit is required");
    if (!formData.visitDate) errors.push("Visit date is required");
    if (!selectedDepartment) errors.push("Please select a department");
    if (!selectedFaculty) errors.push("Please select a faculty member");
    if (!formData.password) errors.push("Password is required");
    if (!formData.confirmPassword) errors.push("Please confirm your password");
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      errors.push("Phone number must be 10 digits");
    }
    
    // Password validation
    if (formData.password && formData.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match");
    }

    // Date validation
    const visitDate = new Date(formData.visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    visitDate.setHours(0, 0, 0, 0);

    if (visitDate < today) {
      errors.push("Visit date cannot be in the past");
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch("/api/visitor/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          departmentId: selectedDepartment,
          facultyId: selectedFaculty
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Request Submitted Successfully!",
          description: "You will receive an email notification once your request is reviewed.",
          duration: 5000
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          address: "",
          purpose: "",
          visitDate: ""
        });
        setSelectedDepartment("");
        setSelectedFaculty("");
      } else {
        toast({
          title: "Submission Failed",
          description: data.message || "Please try again later",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Network Error",
        description: "Unable to submit request. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIT ADT University</h1>
                <p className="text-sm text-gray-600">Visitor Token System</p>
              </div>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Visitor Registration
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Request Campus Access
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fill out the form below to request access to MIT ADT University campus. 
            Your request will be reviewed by the selected faculty member.
          </p>
        </div>

        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Visitor Information</CardTitle>
            <CardDescription>
              All fields marked with * are required. Please provide accurate information.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">
                    Company/Organization
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Company or organization name"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address *
                </Label>
                <Textarea
                  id="address"
                  placeholder="Complete address with city, state, and PIN"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                  required
                />
              </div>

              {/* Visit Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="visitDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Preferred Visit Date *
                  </Label>
                  <Input
                    id="visitDate"
                    type="date"
                    min={today}
                    value={formData.visitDate}
                    onChange={(e) => handleInputChange("visitDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Department *
                  </Label>
                  <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Loading departments..." : "Select department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="faculty" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Faculty Member *
                  </Label>
                  <Select 
                    value={selectedFaculty} 
                    onValueChange={setSelectedFaculty}
                    disabled={!selectedDepartment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedDepartment 
                          ? "Select department first" 
                          : "Select faculty member to visit"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedDepartmentFaculty().map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name} ({faculty.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">
                  Purpose of Visit *
                </Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose of your visit (meeting, interview, research, etc.)"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 What happens next?</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• Your request will be sent to the selected faculty member</li>
              <li>• You'll receive a confirmation email immediately</li>
              <li>• Faculty review typically takes 1-2 business days</li>
              <li>• If approved, you'll get a digital token with QR code via email</li>
              <li>• Present the token at the security gate for campus entry</li>
            </ul>
          </CardContent>
        </Card>
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
