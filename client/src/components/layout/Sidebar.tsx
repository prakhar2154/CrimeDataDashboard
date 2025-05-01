import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();
  
  // Navigation items
  const navItems = [
    { label: "Dashboard", icon: "dashboard", path: "/" },
    { label: "Crime Reports", icon: "description", path: "/crime-reports" },
    { label: "Locations", icon: "place", path: "/locations" },
    { label: "Officers", icon: "person", path: "/officers" },
    { label: "Social Media", icon: "forum", path: "/social-media" },
    { label: "Weather Data", icon: "cloud", path: "/weather" },
  ];
  
  const aboutItems = [
    { label: "About Project", icon: "info", path: "/about" },
    { label: "Made By", icon: "groups", path: "/made-by" },
  ];
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <aside 
      className={`w-64 h-full bg-primary fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      data-state={isOpen}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
        <div className="flex items-center">
          <span className="material-icons text-accent">analytics</span>
          <h1 className="ml-2 text-lg font-montserrat font-semibold text-white">Crime Analytics</h1>
        </div>
        <button 
          className="lg:hidden text-gray-400 hover:text-white" 
          onClick={() => setIsOpen(false)}
        >
          <span className="material-icons">menu_open</span>
        </button>
      </div>
      
      {/* Navigation Menu */}
      <nav className="mt-5 px-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors duration-200 ease-in-out ${
                isActive(item.path) 
                  ? 'bg-sidebar-accent text-white' 
                  : 'text-gray-300 hover:bg-sidebar-accent hover:text-white'
              }`}
            >
              <span className={`material-icons mr-3 ${isActive(item.path) ? 'text-accent' : 'group-hover:text-accent'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="mt-10 space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase">About</p>
          {aboutItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group transition-colors duration-200 ease-in-out ${
                isActive(item.path) 
                  ? 'bg-sidebar-accent text-white' 
                  : 'text-gray-300 hover:bg-sidebar-accent hover:text-white'
              }`}
            >
              <span className={`material-icons mr-3 ${isActive(item.path) ? 'text-accent' : 'group-hover:text-accent'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Search Bar */}
      <div className="absolute bottom-0 w-full p-4 border-t border-sidebar-border">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-icons text-gray-500 text-sm">search</span>
          </span>
          <input 
            type="text" 
            className="block w-full py-2 pl-10 pr-3 bg-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:bg-secondary text-white text-sm" 
            placeholder="Search..."
          />
        </div>
      </div>
    </aside>
  );
}
