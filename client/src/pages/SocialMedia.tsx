import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge-custom";
import { sentimentColors } from "@/lib/theme";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { chartColors } from "@/lib/theme";

export default function SocialMedia() {
  const [sentimentFilter, setSentimentFilter] = useState("all_sentiments");
  const [locationFilter, setLocationFilter] = useState("all_locations");
  const [dateRangeInput, setDateRangeInput] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Handle search and date range to prevent page refresh on each keystroke
  const handleSearch = () => {
    setSearchQuery(searchInput);
  };
  
  const handleDateRange = () => {
    setDateRange(dateRangeInput);
  };
  
  // Fetch social media posts
  const { data: socialMediaData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['/api/social-media', { sentiment: sentimentFilter, location: locationFilter, dateRange, search: searchQuery }],
  });
  
  // Fetch social media statistics
  const { data: socialMediaStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/social-media-stats'],
  });
  
  if (isPostsLoading || isStatsLoading) {
    return (
      <div className="p-6">
        <Card className="bg-secondary mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Social Media Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="h-[300px] bg-muted rounded-md"></div>
                <div className="h-[300px] bg-muted rounded-md"></div>
              </div>
              <div className="h-[300px] bg-muted rounded-md mb-6"></div>
              <div className="h-[400px] bg-muted rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const posts = socialMediaData || [];
  const totalRecords = posts.length;
  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  const startIdx = (currentPage - 1) * recordsPerPage;
  const endIdx = Math.min(startIdx + recordsPerPage, totalRecords);
  const currentPosts = posts.slice(startIdx, endIdx);
  
  // Prepare data for charts
  const sentimentData = socialMediaStats?.bySentiment || [];
  const locationData = socialMediaStats?.byLocation || [];
  const timeSeriesData = socialMediaStats?.postsOverTime || [];
  
  // Group time series data by month for the line chart
  const groupedTimeSeriesData = timeSeriesData.reduce((acc: any[], curr: any) => {
    const existingMonth = acc.find(item => item.month === curr.month);
    if (existingMonth) {
      if (curr.sentiment === 'Positive') {
        existingMonth.positive = curr.count;
      } else if (curr.sentiment === 'Negative') {
        existingMonth.negative = curr.count;
      } else {
        existingMonth.neutral = curr.count;
      }
    } else {
      const newItem: any = { 
        month: curr.month,
        positive: 0,
        negative: 0,
        neutral: 0
      };
      
      if (curr.sentiment === 'Positive') {
        newItem.positive = curr.count;
      } else if (curr.sentiment === 'Negative') {
        newItem.negative = curr.count;
      } else {
        newItem.neutral = curr.count;
      }
      
      acc.push(newItem);
    }
    return acc;
  }, []);
  
  return (
    <div className="p-6">
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Social Media Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sentiment Distribution Chart */}
            <div className="bg-muted p-5 rounded-lg">
              <h3 className="text-lg font-montserrat font-medium mb-4">Sentiment Distribution</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="sentiment"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sentimentData.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.sentiment === 'Positive' ? chartColors[3] :
                            entry.sentiment === 'Negative' ? chartColors[1] :
                            chartColors[0]
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} posts`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                        borderColor: 'rgba(255, 255, 255, 0.2)', 
                        borderRadius: '4px',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Location Distribution Chart */}
            <div className="bg-muted p-5 rounded-lg">
              <h3 className="text-lg font-montserrat font-medium mb-4">Top Locations</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={locationData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    />
                    <YAxis 
                      dataKey="location" 
                      type="category" 
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                      width={70}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                        borderColor: 'rgba(255, 255, 255, 0.2)', 
                        borderRadius: '4px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="count" fill={chartColors[2]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Sentiment Over Time Chart */}
          <div className="bg-muted p-5 rounded-lg mb-6">
            <h3 className="text-lg font-montserrat font-medium mb-4">Sentiment Trends Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={groupedTimeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.2)', 
                      borderRadius: '4px',
                      color: 'white'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                  <Line type="monotone" dataKey="positive" stroke={chartColors[3]} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="negative" stroke={chartColors[1]} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="neutral" stroke={chartColors[0]} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Social Media Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full">
              <div className="col-span-1">
                <label className="block text-gray-400 text-sm font-medium mb-2">Sentiment</label>
                <Select 
                  value={sentimentFilter} 
                  onValueChange={setSentimentFilter}
                >
                  <SelectTrigger className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary">
                    <SelectValue placeholder="All Sentiments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_sentiments">All Sentiments</SelectItem>
                    <SelectItem value="Positive">Positive</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <label className="block text-gray-400 text-sm font-medium mb-2">Location</label>
                <Select 
                  value={locationFilter} 
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_locations">All Locations</SelectItem>
                    <SelectItem value="New York">New York</SelectItem>
                    <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                    <SelectItem value="Chicago">Chicago</SelectItem>
                    <SelectItem value="Houston">Houston</SelectItem>
                    <SelectItem value="Phoenix">Phoenix</SelectItem>
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
                      placeholder="Search posts..."
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
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400">
              Showing {startIdx + 1} to {endIdx} of {totalRecords} posts
            </p>
            <Button 
              variant="secondary"
              className="bg-primary hover:bg-primary-light text-white"
              onClick={() => {
                setSentimentFilter("all_sentiments");
                setLocationFilter("all_locations");
                setDateRangeInput("");
                setDateRange("");
                setSearchInput("");
                setSearchQuery("");
              }}
            >
              <span className="material-icons text-sm mr-1">filter_list</span>
              Reset Filters
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="min-w-full data-table">
              <TableHeader>
                <TableRow className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <TableHead className="px-4 py-3">ID</TableHead>
                  <TableHead className="px-4 py-3">Date</TableHead>
                  <TableHead className="px-4 py-3">Content</TableHead>
                  <TableHead className="px-4 py-3">Sentiment</TableHead>
                  <TableHead className="px-4 py-3">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-muted">
                {currentPosts.map((post: any) => (
                  <TableRow 
                    key={post.id} 
                    className="text-sm hover:bg-muted transition-colors duration-150 ease-in-out"
                  >
                    <TableCell className="px-4 py-3 font-medium">{post.id}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-300">{new Date(post.date).toLocaleDateString()}</TableCell>
                    <TableCell className="px-4 py-3">{post.content}</TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge
                        bgColor={sentimentColors[post.sentiment]?.bg || "bg-gray-900"}
                        textColor={sentimentColors[post.sentiment]?.text || "text-gray-200"}
                      >
                        {post.sentiment}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="px-4 py-3">{post.location}</TableCell>
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
                
                if (pageNumber <= totalPages) {
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
                }
                return null;
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
    </div>
  );
}
