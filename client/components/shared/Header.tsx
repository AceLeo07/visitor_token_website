import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import { Link } from "react-router-dom";
import MitAdtLogo from "./MitAdtLogo";

interface HeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
  subtitle?: string;
}

export default function Header({ 
  showBackButton = false, 
  backTo = "/", 
  title = "MIT ADT University",
  subtitle = "Visitor Token System"
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <MitAdtLogo size="md" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
          </Link>
          
          {showBackButton ? (
            <Link to={backTo}>
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}
