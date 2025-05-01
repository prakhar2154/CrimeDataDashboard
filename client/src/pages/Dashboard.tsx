import { StatCards } from "@/components/dashboard/StatCards";
import { CrimeTypeChart } from "@/components/dashboard/CrimeTypeChart";
import { ArrestStatusChart } from "@/components/dashboard/ArrestStatusChart";
import { CrimeMap } from "@/components/dashboard/CrimeMap";
import { CrimeTrendChart } from "@/components/dashboard/CrimeTrendChart";
import { RecentCrimes } from "@/components/dashboard/RecentCrimes";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [crimeTypeFilter, setCrimeTypeFilter] = useState("all_crimes");
  const [locationFilter, setLocationFilter] = useState("all_locations");
  
  return (
    <div id="dashboard-content" className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h2 className="text-2xl font-montserrat font-semibold">Crime Data Dashboard</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Select 
            value={crimeTypeFilter} 
            onValueChange={setCrimeTypeFilter}
          >
            <SelectTrigger className="w-full sm:w-auto py-2 px-3 bg-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-muted">
              <SelectValue placeholder="All Crimes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_crimes">All Crimes</SelectItem>
              <SelectItem value="Theft">Theft</SelectItem>
              <SelectItem value="Assault">Assault</SelectItem>
              <SelectItem value="Vandalism">Vandalism</SelectItem>
              <SelectItem value="Fraud">Fraud</SelectItem>
              <SelectItem value="Cyber Crime">Cyber Crime</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={locationFilter} 
            onValueChange={setLocationFilter}
          >
            <SelectTrigger className="w-full sm:w-auto py-2 px-3 bg-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-muted">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_locations">All Locations</SelectItem>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="destructive"
            className="py-2 px-4 rounded-md text-sm flex items-center transition-colors duration-200"
          >
            <span className="material-icons text-sm mr-1">date_range</span>
            Date Range
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <StatCards />
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CrimeTypeChart />
        <ArrestStatusChart />
      </div>
      
      {/* Map and Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CrimeMap />
        <CrimeTrendChart />
      </div>
      
      {/* Recent Crimes */}
      <RecentCrimes />
    </div>
  );
}
