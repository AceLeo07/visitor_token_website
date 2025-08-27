import MitAdtLogo from "./MitAdtLogo";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <MitAdtLogo size="sm" />
            <span className="font-semibold text-gray-900">MIT ADT University</span>
          </div>
          <p className="text-sm text-gray-600">
            © 2024 MIT ADT University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
