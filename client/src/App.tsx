import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useState } from "react";

// Layout components
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

// Page components
import Dashboard from "@/pages/Dashboard";
import CrimeReports from "@/pages/CrimeReports";
import Locations from "@/pages/Locations";
import Officers from "@/pages/Officers";
import SocialMedia from "@/pages/SocialMedia";
import Weather from "@/pages/Weather";
import About from "@/pages/About";
import MadeBy from "@/pages/MadeBy";
import NotFound from "@/pages/not-found";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-primary border-b border-primary sticky top-0 z-10">
            <div className="flex items-center">
              <span className="material-icons text-accent">analytics</span>
              <h1 className="ml-2 text-lg font-montserrat font-semibold text-white">Crime Analytics</h1>
            </div>
            <button 
              className="text-gray-400 hover:text-white" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="material-icons">menu</span>
            </button>
          </div>
          
          {/* Page Content */}
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/crime-reports" component={CrimeReports} />
            <Route path="/locations" component={Locations} />
            <Route path="/officers" component={Officers} />
            <Route path="/social-media" component={SocialMedia} />
            <Route path="/weather" component={Weather} />
            <Route path="/about" component={About} />
            <Route path="/made-by" component={MadeBy} />
            <Route component={NotFound} />
          </Switch>
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
