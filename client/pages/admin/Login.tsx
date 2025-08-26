import { Settings } from "lucide-react";
import PlaceholderPage from "../PlaceholderPage";

export default function AdminLogin() {
  return (
    <PlaceholderPage
      title="Admin Portal"
      description="System administration and comprehensive user management"
      icon={<Settings className="w-8 h-8 text-white" />}
    />
  );
}
