import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  Users, 
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  Clock,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

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

export default function VisitorRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    purpose: "",
    visitDate: ""
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedFaculty(""); // Reset faculty selection
  };

  const getSelectedDepartmentFaculty = () => {
    const dept = departments.find(d => d.id === selectedDepartment);
    return dept?.faculty || [];
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.email.trim() && formData.phone.trim();
      case 2:
        return formData.address.trim() && formData.company !== undefined;
      case 3:
        return selectedDepartment && selectedFaculty;
      case 4:
        return formData.purpose.trim() && formData.visitDate;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields before proceeding",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast({
        title: "Incomplete Information",
        description: "Please complete all required fields",
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
          title: "✅ Registration Successful!",
          description: "Your request has been submitted and faculty will be notified.",
          duration: 5000
        });
        
        // Move to success step
        setCurrentStep(5);
      } else {
        toast({
          title: "Registration Failed",
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

  const today = new Date().toISOString().split('T')[0];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-600">Let's start with your basic details</p>
            </div>
            
            <div className="space-y-4">
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
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Details</h3>
              <p className="text-gray-600">Where can we reach you?</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">
                  Company/Organization
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Company or organization name (optional)"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>

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
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Department & Faculty</h3>
              <p className="text-gray-600">Choose who you want to visit</p>
            </div>
            
            <div className="space-y-4">
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

              <div className="space-y-2">
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

              {selectedDepartment && selectedFaculty && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Selected Contact</h4>
                  <p className="text-green-700">
                    <strong>Faculty:</strong> {getSelectedDepartmentFaculty().find(f => f.id === selectedFaculty)?.name}<br/>
                    <strong>Department:</strong> {departments.find(d => d.id === selectedDepartment)?.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Details</h3>
              <p className="text-gray-600">Tell us about your visit</p>
            </div>
            
            <div className="space-y-4">
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
                <Label htmlFor="purpose" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Purpose of Visit *
                </Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose of your visit (meeting, interview, research, etc.)"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Request Submitted Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your visitor request has been sent to the faculty member for review.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">📧 What happens next?</h4>
                <ul className="text-blue-800 space-y-2 text-sm text-left">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Faculty will review your request (typically 1-2 business days)
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    You'll receive an email notification with the decision
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    If approved, you'll get a digital token for campus entry
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/visitor/login">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Check Request Status
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header showBackButton />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Visitor Registration
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Request Campus Access
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete the registration process to request access to MIT ADT University campus
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep <= 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <span className="text-sm text-gray-600">
                Step {currentStep} of 4
              </span>
            </div>
          </div>
        )}

        <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
          <CardContent className="p-8">
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            {currentStep <= 4 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? 'invisible' : ''}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
