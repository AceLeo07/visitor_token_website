import { Scan } from "lucide-react";
import PlaceholderPage from "../PlaceholderPage";

export default function SecurityScanner() {
  return (
    <PlaceholderPage
      title="Token Scanner"
      description="Scan and validate visitor tokens for campus access"
      icon={<Scan className="w-8 h-8 text-white" />}
    />
  );
}
