import { UserCheck } from "lucide-react";
import PlaceholderPage from "../PlaceholderPage";

export default function FacultyLogin() {
  return (
    <PlaceholderPage
      title="Faculty Portal"
      description="Login to approve visitor requests and manage faculty invitations"
      icon={<UserCheck className="w-8 h-8 text-white" />}
    />
  );
}
