import { LogIn } from "lucide-react";
import PlaceholderPage from "../PlaceholderPage";

export default function VisitorLogin() {
  return (
    <PlaceholderPage
      title="Visitor Login"
      description="Login to your visitor account to view and manage your access tokens"
      icon={<LogIn className="w-8 h-8 text-white" />}
    />
  );
}
