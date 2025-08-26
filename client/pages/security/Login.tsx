import { Shield } from "lucide-react";
import PlaceholderPage from "../PlaceholderPage";

export default function SecurityLogin() {
  return (
    <PlaceholderPage
      title="Security Portal"
      description="Access security controls and token scanning functionality"
      icon={<Shield className="w-8 h-8 text-white" />}
    />
  );
}
