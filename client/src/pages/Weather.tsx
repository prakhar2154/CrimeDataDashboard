import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";
import { chartColors } from "@/lib/theme";

export default function Weather() {
  const [dateRange, setDateRange] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch weather data
  const { data: weatherData, isLoading: isWeatherLoading } = useQuery({
    queryKey: ['/api/weather', { dateRange, search: searchQuery }],
  });
  
  // Fetch correlation data between weather and crimes
  const { data: weatherCrimeStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/weather-crime-stats'],
  });
  
  if (isWeatherLoading || isStatsLoading) {
    return (
      <div className="p-6">
        <Card className="bg-secondary mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Weather Analysis</CardTitle>
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
  
  const weather = weatherData || [];
  const totalRecords = weather.length;
  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  const startIdx = (currentPage - 1) * recordsPerPage;
  const endIdx = Math.min(startIdx + recordsPerPage, totalRecords);
  const currentWeather = weather.slice(startIdx, endIdx);
  
  // Weather-crime correlation data
  const weatherCrimeData = weatherCrimeStats?.weatherCrimeData || [];
  const precipitationAnalysis = weatherCrimeStats?.precipitationAnalysis || [];
  const temperatureAnalysis = weatherCrimeStats?.temperatureAnalysis || [];
  
  // Prepare data for scatter plot
  const scatterData = weatherCrimeData.map((item: any) => ({
    date: item.date,
    temperature: parseFloat(item.temperature.replace('°F', '')),
    precipitation: parseFloat(item.precipitation.replace(' in', '')),
    crimeCount: item.crimeCount,
    windSpeed: parseFloat(item.windSpeed.replace(' mph', '')),
  }));
  
  return (
    <div className="p-6">
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Weather & Crime Correlation Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Temperature & Crime Chart */}
            <div className="bg-muted p-5 rounded-lg">
              <h3 className="text-lg font-montserrat font-medium mb-4">Crime Count by Temperature</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={temperatureAnalysis}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="temperature_category" 
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
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
                    <Bar 
                      dataKey="crime_count" 
                      name="Crime Count" 
                      fill={chartColors[0]} 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Precipitation & Crime Chart */}
            <div className="bg-muted p-5 rounded-lg">
              <h3 className="text-lg font-montserrat font-medium mb-4">Crime Count by Precipitation</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={precipitationAnalysis}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="precipitation_category" 
                      tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
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
                    <Bar 
                      dataKey="crime_count" 
                      name="Crime Count" 
                      fill={chartColors[1]} 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Crime Count & Weather Scatter Plot */}
          <div className="bg-muted p-5 rounded-lg mb-6">
            <h3 className="text-lg font-montserrat font-medium mb-4">Crime & Temperature Correlation</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    type="number" 
                    dataKey="temperature" 
                    name="Temperature" 
                    unit="°F"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    label={{ 
                      value: 'Temperature (°F)', 
                      position: 'insideBottom', 
                      offset: -5,
                      fill: 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="crimeCount" 
                    name="Crime Count"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    label={{ 
                      value: 'Crime Count', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="precipitation" 
                    range={[50, 400]} 
                    name="Precipitation" 
                    unit=" in"
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.2)', 
                      borderRadius: '4px',
                      color: 'white'
                    }}
                    formatter={(value, name, props) => {
                      if (name === 'Temperature') return [`${value}°F`, 'Temperature'];
                      if (name === 'Crime Count') return [value, 'Crime Count'];
                      if (name === 'Precipitation') return [`${value} in`, 'Precipitation'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Scatter 
                    name="Weather-Crime Data" 
                    data={scatterData} 
                    fill={chartColors[2]}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Weather and Crime Line Chart */}
          <div className="bg-muted p-5 rounded-lg mb-6">
            <h3 className="text-lg font-montserrat font-medium mb-4">Crime Count vs Weather Over Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weatherCrimeData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 20)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    label={{ 
                      value: 'Crime Count', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                    label={{ 
                      value: 'Temperature (°F)', 
                      angle: 90, 
                      position: 'insideRight',
                      fill: 'rgba(255, 255, 255, 0.7)'
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(31, 41, 55, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.2)', 
                      borderRadius: '4px',
                      color: 'white'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Temperature') return [`${value}°F`, name];
                      if (name === 'Crime Count') return [value, name];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="crimeCount" 
                    name="Crime Count"
                    stroke={chartColors[2]} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey={(data) => parseFloat(data.temperature.replace('°F', ''))}
                    name="Temperature"
                    stroke={chartColors[0]} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Weather Data</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full">
              <div className="col-span-1">
                <label className="block text-gray-400 text-sm font-medium mb-2">Date Range</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="01/01/2023 - 07/31/2024"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="material-icons text-gray-400 text-sm">date_range</span>
                  </span>
                </div>
              </div>
              
              <div className="col-span-1">
                <label className="block text-gray-400 text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search weather data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <span className="material-icons text-gray-400 text-sm">search</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="min-w-full data-table">
              <TableHeader>
                <TableRow className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <TableHead className="px-4 py-3">ID</TableHead>
                  <TableHead className="px-4 py-3">Date</TableHead>
                  <TableHead className="px-4 py-3">Temperature</TableHead>
                  <TableHead className="px-4 py-3">Precipitation</TableHead>
                  <TableHead className="px-4 py-3">Wind Speed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-muted">
                {currentWeather.map((weather: any) => (
                  <TableRow 
                    key={weather.id} 
                    className="text-sm hover:bg-muted transition-colors duration-150 ease-in-out"
                  >
                    <TableCell className="px-4 py-3 font-medium">{weather.id}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-300">{new Date(weather.date).toLocaleDateString()}</TableCell>
                    <TableCell className="px-4 py-3">{weather.temperature}</TableCell>
                    <TableCell className="px-4 py-3">{weather.precipitation}</TableCell>
                    <TableCell className="px-4 py-3">{weather.windSpeed}</TableCell>
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
