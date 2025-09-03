import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, Check, Users } from "lucide-react";
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

interface TokenRequestProps {
  visitorProfileId: string;
  onRequestSubmitted: () => void;
}

export default function TokenRequest({ visitorProfileId, onRequestSubmitted }: TokenRequestProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
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
            title: "Error Loading Departments",
            description: "Failed to load departments and faculty",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        toast({
          title: "Network Error",
          description: "Unable to load departments. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [toast]);

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
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

  // Get faculty for selected department
  const getSelectedDepartmentFaculty = (): Faculty[] => {
    const department = departments.find(d => d.id === selectedDepartment);
    return department?.faculty || [];
  };

  // Form validation
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.purpose.trim()) errors.push("Purpose of visit is required");
    if (!formData.visitDate) errors.push("Visit date is required");
    if (!selectedDepartment) errors.push("Please select a department");
    if (!selectedFaculty) errors.push("Please select a faculty member");

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
      
      const response = await fetch("/api/visitor/request-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          visitorProfileId,
          ...formData,
          departmentId: selectedDepartment,
          facultyId: selectedFaculty
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✅ Token Request Submitted!",
          description: "You will receive an email notification once your request is reviewed.",
          duration: 5000
        });
        
        // Reset form
        setFormData({
          purpose: "",
          visitDate: ""
        });
        setSelectedDepartment("");
        setSelectedFaculty("");
        
        // Notify parent component
        onRequestSubmitted();
      } else {
        toast({
          title: "Request Failed",
          description: data.message || "Please try again later",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting request:", error);
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
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl flex items-center gap-2 justify-center">
          <Building className="w-5 h-5" />
          Request Campus Access Token
        </CardTitle>
        <CardDescription>
          Submit a new visit request to faculty for approval
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="flex justify-center pt-4">
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
                  Submit Token Request
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Request Process</h4>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Your request will be sent to the selected faculty member</li>
            <li>• Faculty review typically takes 1-2 business days</li>
            <li>• You'll receive email notifications about the status</li>
            <li>• If approved, you'll get a digital token with QR code</li>
            <li>• Present the token at security gate for campus entry</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
