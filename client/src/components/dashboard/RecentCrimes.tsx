import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { StatusBadge } from "../ui/badge-custom";
import { crimeTypeColors, arrestStatusColors } from "@/lib/theme";
import { CrimeDetailModal } from "../reports/CrimeDetailModal";

export function RecentCrimes() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCrime, setSelectedCrime] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: recentCrimesData, isLoading } = useQuery({
    queryKey: ['/api/recent-crimes'],
  });
  
  const openCrimeDetails = (crimeId: string) => {
    setSelectedCrime(crimeId);
    setIsModalOpen(true);
  };
  
  if (isLoading) {
    return (
      <Card className="bg-secondary">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Recent Crime Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-secondary-light rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const crimes = recentCrimesData || [];
  const totalRecords = crimes.length;
  const recordsPerPage = 5;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  const startIdx = (currentPage - 1) * recordsPerPage;
  const endIdx = Math.min(startIdx + recordsPerPage, totalRecords);
  const currentCrimes = crimes.slice(startIdx, endIdx);
  
  return (
    <>
      <Card className="bg-secondary">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Recent Crime Reports</CardTitle>
          <Link href="/crime-reports" className="text-accent hover:text-accent-light text-sm flex items-center transition-colors duration-200">
            View All
            <span className="material-icons text-sm ml-1">arrow_forward</span>
          </Link>
        </CardHeader>
        <CardContent className="p-5">
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
              
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1 
                      ? 'bg-primary-dark text-white' 
                      : 'border-muted text-gray-400 hover:bg-muted transition-colors duration-150 ease-in-out'
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
              
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
