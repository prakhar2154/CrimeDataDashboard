import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge-custom";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { chartColors } from "@/lib/theme";

export default function Officers() {
  const [positionFilter, setPositionFilter] = useState("all_positions");
  const [areaFilter, setAreaFilter] = useState("all_areas");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: officersData, isLoading } = useQuery({
    queryKey: ['/api/officers', { position: positionFilter, area: areaFilter, search: searchQuery }],
  });
  
  const { data: officerStatsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/officer-stats'],
  });
  
  if (isLoading || isStatsLoading) {
    return (
      <div className="p-6">
        <Card className="bg-secondary mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Officers</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="animate-pulse space-y-4">
              <div className="h-[300px] bg-muted rounded-md mb-6"></div>
              <div className="h-[400px] bg-muted rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const officers = officersData || [];
  const totalRecords = officers.length;
  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  const startIdx = (currentPage - 1) * recordsPerPage;
  const endIdx = Math.min(startIdx + recordsPerPage, totalRecords);
  const currentOfficers = officers.slice(startIdx, endIdx);
  
  // Prepare chart data
  const officersByPosition = officerStatsData?.byPosition || [];
  const crimesByOfficer = officerStatsData?.topOfficers || [];
  
  return (
    <div className="p-6">
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Officer Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Officers by Position Chart */}
            <div className="bg-muted p-5 rounded-lg">
              <h3 className="text-lg font-montserrat font-medium mb-4">Officers by Position</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={officersByPosition}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="position" 
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px' }}
                      labelStyle={{ color: 'white' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Bar dataKey="count" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Top Officers by Cases Chart */}
            <div className="bg-muted p-5 rounded-lg">
              <h3 className="text-lg font-montserrat font-medium mb-4">Top Officers by Cases</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={crimesByOfficer}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px' }}
                      labelStyle={{ color: 'white' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Bar dataKey="count" fill={chartColors[2]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Officer List</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select 
                value={positionFilter} 
                onValueChange={setPositionFilter}
              >
                <SelectTrigger className="w-full sm:w-auto py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_positions">All Positions</SelectItem>
                  <SelectItem value="Officer">Officer</SelectItem>
                  <SelectItem value="Sergeant">Sergeant</SelectItem>
                  <SelectItem value="Lieutenant">Lieutenant</SelectItem>
                  <SelectItem value="Captain">Captain</SelectItem>
                  <SelectItem value="Chief">Chief</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={areaFilter} 
                onValueChange={setAreaFilter}
              >
                <SelectTrigger className="w-full sm:w-auto py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary">
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_areas">All Areas</SelectItem>
                  <SelectItem value="Downtown Precinct">Downtown Precinct</SelectItem>
                  <SelectItem value="Financial District">Financial District</SelectItem>
                  <SelectItem value="Suburban Division">Suburban Division</SelectItem>
                  <SelectItem value="City Center">City Center</SelectItem>
                  <SelectItem value="Special Investigations">Special Investigations</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search officers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <span className="material-icons text-gray-400 text-sm">search</span>
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400">
              Showing {startIdx + 1} to {endIdx} of {totalRecords} officers
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="min-w-full data-table">
              <TableHeader>
                <TableRow className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <TableHead className="px-4 py-3">ID</TableHead>
                  <TableHead className="px-4 py-3">Name</TableHead>
                  <TableHead className="px-4 py-3">Position</TableHead>
                  <TableHead className="px-4 py-3">Assigned Area</TableHead>
                  <TableHead className="px-4 py-3">Case Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-muted">
                {currentOfficers.map((officer: any) => (
                  <TableRow 
                    key={officer.id} 
                    className="text-sm hover:bg-muted transition-colors duration-150 ease-in-out"
                  >
                    <TableCell className="px-4 py-3 font-medium">{officer.id}</TableCell>
                    <TableCell className="px-4 py-3">{officer.name}</TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge
                        bgColor={
                          officer.position === "Officer" ? "bg-blue-900" :
                          officer.position === "Sergeant" ? "bg-green-900" :
                          officer.position === "Lieutenant" ? "bg-purple-900" : 
                          officer.position === "Captain" ? "bg-orange-900" : 
                          officer.position === "Chief" ? "bg-red-900" : 
                          "bg-gray-900"
                        }
                        textColor={
                          officer.position === "Officer" ? "text-blue-200" :
                          officer.position === "Sergeant" ? "text-green-200" :
                          officer.position === "Lieutenant" ? "text-purple-200" : 
                          officer.position === "Captain" ? "text-orange-200" : 
                          officer.position === "Chief" ? "text-red-200" : 
                          "text-gray-200"
                        }
                      >
                        {officer.position}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="px-4 py-3">{officer.assignedArea}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-300">{officer.caseCount || 0}</TableCell>
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
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-muted text-gray-400 hover:bg-muted transition-colors duration-150 ease-in-out disabled:opacity-50"
              >
                <span className="material-icons text-sm">arrow_back</span>
              </button>
              
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                let pageNumber = currentPage;
                if (i === 0) pageNumber = Math.max(currentPage - 1, 1);
                if (i === 1) pageNumber = currentPage;
                if (i === 2) pageNumber = Math.min(currentPage + 1, totalPages);
                
                if (pageNumber <= totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 rounded border ${
                        currentPage === pageNumber 
                          ? 'bg-primary-dark text-white border-primary-dark' 
                          : 'border-muted text-gray-400 hover:bg-muted transition-colors duration-150 ease-in-out'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-muted text-gray-400 hover:bg-muted transition-colors duration-150 ease-in-out disabled:opacity-50"
              >
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
