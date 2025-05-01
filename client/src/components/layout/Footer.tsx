import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-secondary p-6 border-t border-muted">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-400">© 2025 Crime Data Analysis</p>
        </div>
        <div className="flex space-x-6">
          <Link href="/about" className="text-sm text-gray-400 hover:text-accent transition-colors duration-150">
            About Our Project
          </Link>
          <Link href="/made-by" className="text-sm text-gray-400 hover:text-accent transition-colors duration-150">
            Made By
          </Link>
          <a href="#" className="text-sm text-gray-400 hover:text-accent transition-colors duration-150">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
