import { UserPlus } from "lucide-react";
import PlaceholderPage from "../PlaceholderPage";

export default function VisitorRegister() {
  return (
    <PlaceholderPage
      title="Visitor Registration"
      description="Register as a new visitor to request campus access tokens"
      icon={<UserPlus className="w-8 h-8 text-white" />}
    />
  );
}
