
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
          <Link 
            to="/impressum" 
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
          >
            Impressum
          </Link>
          <Link 
            to="/legal-notice" 
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
          >
            Legal Notice
          </Link>
          <Link 
            to="/terms-and-conditions" 
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};
