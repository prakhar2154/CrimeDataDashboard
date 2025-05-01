import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge-custom";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icons in React
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

export default function Locations() {
  const [addressType, setAddressType] = useState("all_types");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mapReady, setMapReady] = useState(false);
  
  // Set up map when component mounts
  useState(() => {
    fixLeafletIcon();
    setMapReady(true);
  });
  
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ['/api/locations', { type: addressType, search: searchQuery }],
  });
  
  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="bg-secondary mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="animate-pulse space-y-4">
              <div className="h-[400px] bg-muted rounded-md mb-6"></div>
              <div className="h-[300px] bg-muted rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const locations = locationsData || [];
  const totalRecords = locations.length;
  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  
  const startIdx = (currentPage - 1) * recordsPerPage;
  const endIdx = Math.min(startIdx + recordsPerPage, totalRecords);
  const currentLocations = locations.slice(startIdx, endIdx);
  
  // Calculate center of the map
  const calculateCenter = () => {
    if (locations.length === 0) return [40.7128, -74.0060]; // Default to NYC
    
    const validLocations = locations.filter((loc: any) => {
      const [lat, lng] = loc.geolocation.split(',').map(Number);
      return !isNaN(lat) && !isNaN(lng);
    });
    
    if (validLocations.length === 0) return [40.7128, -74.0060];
    
    const centerLoc = validLocations[0];
    const [lat, lng] = centerLoc.geolocation.split(',').map(Number);
    return [lat, lng];
  };
  
  return (
    <div className="p-6">
      <Card className="bg-secondary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Location Map</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-[400px] w-full rounded-lg mb-6">
            {mapReady && (
              <MapContainer 
                center={calculateCenter() as [number, number]} 
                zoom={10} 
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles"
                />
                {locations.map((location: any) => {
                  const [lat, lng] = location.geolocation.split(',').map(Number);
                  if (isNaN(lat) || isNaN(lng)) return null;
                  
                  return (
                    <Marker 
                      key={location.id} 
                      position={[lat, lng]}
                    >
                      <Popup>
                        <div className="text-black">
                          <h3 className="font-bold">{location.address}</h3>
                          <p className="text-sm">{location.typeOfAddress}</p>
                          <p className="text-sm mt-1">
                            <strong>Location ID:</strong> {location.id}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Select 
                value={addressType} 
                onValueChange={setAddressType}
              >
                <SelectTrigger className="w-full sm:w-auto py-2 px-3 bg-muted rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-white text-sm border border-secondary">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_types">All Types</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search locations..."
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
              Showing {startIdx + 1} to {endIdx} of {totalRecords} locations
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="min-w-full data-table">
              <TableHeader>
                <TableRow className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <TableHead className="px-4 py-3">ID</TableHead>
                  <TableHead className="px-4 py-3">Address</TableHead>
                  <TableHead className="px-4 py-3">Type</TableHead>
                  <TableHead className="px-4 py-3">Geolocation</TableHead>
                  <TableHead className="px-4 py-3">Crime Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-muted">
                {currentLocations.map((location: any) => (
                  <TableRow 
                    key={location.id} 
                    className="text-sm hover:bg-muted transition-colors duration-150 ease-in-out"
                  >
                    <TableCell className="px-4 py-3 font-medium">{location.id}</TableCell>
                    <TableCell className="px-4 py-3">{location.address}</TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge
                        bgColor={
                          location.typeOfAddress === "Residential" ? "bg-green-900" :
                          location.typeOfAddress === "Commercial" ? "bg-blue-900" :
                          location.typeOfAddress === "Public" ? "bg-purple-900" : 
                          location.typeOfAddress === "Industrial" ? "bg-orange-900" : 
                          "bg-gray-900"
                        }
                        textColor={
                          location.typeOfAddress === "Residential" ? "text-green-200" :
                          location.typeOfAddress === "Commercial" ? "text-blue-200" :
                          location.typeOfAddress === "Public" ? "text-purple-200" : 
                          location.typeOfAddress === "Industrial" ? "text-orange-200" : 
                          "text-gray-200"
                        }
                      >
                        {location.typeOfAddress}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-300">{location.geolocation}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-300">{location.crimeCount || 0}</TableCell>
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
