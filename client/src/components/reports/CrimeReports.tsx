import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../ui/badge-custom";
import { crimeTypeColors, arrestStatusColors } from "@/lib/theme";
import { CrimeDetailModal } from "./CrimeDetailModal";
import { useState } from "react";

export function CrimeReportsTable() {
  const [crimeType, setCrimeType] = useState("all_types");
  const [arrestStatus, setArrestStatus] = useState("all_statuses");
  const [dateRangeInput, setDateRangeInput] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCrime, setSelectedCrime] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use debounce for search and date range
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };
  
  const handleDateRange = () => {
    setDateRange(dateRangeInput);
  };
  
  const { data: crimesData, isLoading } = useQuery({
    queryKey: ['/api/crimes', { 
      type: crimeType !== 'all_types' ? crimeType : undefined, 
      status: arrestStatus !== 'all_statuses' ? arrestStatus : undefined, 
      dateRange, 
      search: searchQuery 
    }],
    retry: true,
    retryDelay: 1000,
  });
  
  const openCrimeDetails = (crimeId: string) => {
    setSelectedCrime(crimeId);
    setIsModalOpen(true);
  };
  
  const handleExport = async () => {
    try {
      const response = await fetch('/api/export-crimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: crimeType !== "all_types" ? crimeType : undefined,
          status: arrestStatus !== "all_statuses" ? arrestStatus : undefined,
          dateRange: dateRange || undefined,
          search: searchQuery || undefined,
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'crime_reports.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Crime Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[72px] bg-muted rounded-md"></div>
              ))}
            </div>
            <div className="h-[400px] bg-muted rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Ensure we have an array of crimes, not undefined or object
  const crimes = Array.isArray(crimesData) ? crimesData : [];
  const totalRecords = crimes.length;
  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1; // Ensure at least 1 page
  
  const startIdx = (currentPage - 1) * recordsPerPage;
  const endIdx = Math.min(startIdx + recordsPerPage, totalRecords);
  const currentCrimes = crimes.slice(startIdx, endIdx);
  
  return (
    <>
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Crime Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="col-span-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">Crime Type</label>
              <Select 
                value={crimeType} 
                onValueChange={(value) => {
                  setCrimeType(value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <SelectTrigger className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_types">All Types</SelectItem>
                  <SelectItem value="Theft">Theft</SelectItem>
                  <SelectItem value="Assault">Assault</SelectItem>
                  <SelectItem value="Vandalism">Vandalism</SelectItem>
                  <SelectItem value="Fraud">Fraud</SelectItem>
                  <SelectItem value="Cyber Crime">Cyber Crime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">Arrest Status</label>
              <Select 
                value={arrestStatus} 
                onValueChange={(value) => {
                  setArrestStatus(value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <SelectTrigger className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="Arrested">Arrested</SelectItem>
                  <SelectItem value="No Arrest">No Arrest</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">Date Range</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="01/01/2023 - 07/31/2024"
                    value={dateRangeInput}
                    onChange={(e) => setDateRangeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDateRange()}
                    className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary"
                  />
                  <button 
                    onClick={handleDateRange}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent"
                  >
                    <span className="material-icons text-sm">date_range</span>
                  </button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDateRange}
                  className="h-10"
                >
                  Apply
                </Button>
              </div>
            </div>
            
            <div className="col-span-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">Search</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Search reports..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary"
                  />
                  <button 
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent"
                  >
                    <span className="material-icons text-sm">search</span>
                  </button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSearch}
                  className="h-10"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400">
              Showing {startIdx + 1} to {endIdx} of {totalRecords} records
            </p>
            <div className="flex space-x-2">
              <Button 
                variant="secondary"
                className="bg-primary hover:bg-primary-light text-white"
                onClick={() => {
                  setCrimeType("all_types");
                  setArrestStatus("all_statuses");
                  setDateRangeInput("");
                  setDateRange("");
                  setSearchInput("");
                  setSearchQuery("");
                }}
              >
                <span className="material-icons text-sm mr-1">filter_list</span>
                Reset Filters
              </Button>
              <Button 
                variant="destructive"
                onClick={handleExport}
              >
                <span className="material-icons text-sm mr-1">file_download</span>
                Export
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="min-w-full data-table">
              <TableHeader>
                <TableRow className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <TableHead className="px-4 py-3">ID</TableHead>
                  <TableHead className="px-4 py-3">Date</TableHead>
                  <TableHead className="px-4 py-3">Description</TableHead>
                  <TableHead className="px-4 py-3">Type</TableHead>
                  <TableHead className="px-4 py-3">Location</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3">Officer</TableHead>
                  <TableHead className="px-4 py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-muted">
                {currentCrimes.map((crime: any) => (
                  <TableRow 
                    key={crime.id} 
                    className="text-sm hover:bg-muted transition-colors duration-150 ease-in-out"
                  >
                    <TableCell className="px-4 py-3 font-medium">{crime.id}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-300">{crime.date}</TableCell>
                    <TableCell className="px-4 py-3">{crime.description}</TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge
                        bgColor={crimeTypeColors[crime.type]?.bg || "bg-gray-900"}
                        textColor={crimeTypeColors[crime.type]?.text || "text-gray-200"}
                      >
                        {crime.type}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-300">{crime.address}</TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge
                        bgColor={arrestStatusColors[crime.status]?.bg || "bg-gray-900"}
                        textColor={arrestStatusColors[crime.status]?.text || "text-gray-200"}
                      >
                        {crime.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-300">{crime.officerName}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-accent hover:text-accent-light transition-colors duration-150 ease-in-out"
                        onClick={() => openCrimeDetails(crime.id)}
                      >
                        <span className="material-icons text-sm">visibility</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {startIdx + 1} to {endIdx} of {totalRecords} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-muted text-gray-400 hover:bg-muted transition-colors duration-150 ease-in-out"
              >
                <span className="material-icons text-sm">arrow_back</span>
              </Button>
              
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                let pageNumber = currentPage;
                if (i === 0) pageNumber = Math.max(currentPage - 1, 1);
                if (i === 1) pageNumber = currentPage;
                if (i === 2) pageNumber = Math.min(currentPage + 1, totalPages);
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-1 rounded border ${
                      currentPage === pageNumber 
                        ? 'bg-primary-dark text-white' 
                        : 'border-muted text-gray-400 hover:bg-muted transition-colors duration-150 ease-in-out'
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-muted text-gray-400 hover:bg-muted transition-colors duration-150 ease-in-out"
              >
                <span className="material-icons text-sm">arrow_forward</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Crime Detail Modal */}
      {isModalOpen && selectedCrime && (
        <CrimeDetailModal 
          crimeId={selectedCrime} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
