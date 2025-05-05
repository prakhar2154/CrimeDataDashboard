import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { crimeTypeColors } from "@/lib/theme";

// Fix for Leaflet marker icons in React
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

// Custom marker icon based on crime type
const getMarkerIcon = (crimeType: string) => {
  let color = "#991B1B"; // default to mutedred
  
  if (crimeType === "Theft") color = "#991B1B";
  if (crimeType === "Assault") color = "#991B1B";
  if (crimeType === "Vandalism") color = "#22D3EE";
  if (crimeType === "Cyber Crime") color = "#22D3EE";
  if (crimeType === "Fraud") color = "#2563EB";
  
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

interface Location {
  id: string;
  address: string;
  geolocation: string;
  typeOfAddress: string;
  crimeType: string;
  crimeDescription: string;
}

export function CrimeMap() {
  const [mapReady, setMapReady] = useState(false);
  
  const { data: locationsData, isLoading } = useQuery<Location[]>({
    queryKey: ['/api/crime-locations'],
  });
  
  useEffect(() => {
    fixLeafletIcon();
    setMapReady(true);
  }, []);
  
  if (isLoading || !mapReady) {
    return (
      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Crime Locations</CardTitle>
          <CardDescription>Geographic distribution of reported incidents</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="map-container animate-pulse bg-secondary-light rounded-md"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Extract locations with valid coordinates
  const locations = locationsData ? locationsData.filter((loc: Location) => {
    const [lat, lng] = loc.geolocation.split(',').map(Number);
    return !isNaN(lat) && !isNaN(lng);
  }) : [];
  
  // Calculate center of the map
  const calculateCenter = (): [number, number] => {
    if (locations.length === 0) return [40.7128, -74.0060]; // Default to NYC
    
    const validLocations = locations.filter((loc: Location) => {
      const [lat, lng] = loc.geolocation.split(',').map(Number);
      return !isNaN(lat) && !isNaN(lng);
    });
    
    if (validLocations.length === 0) return [40.7128, -74.0060];
    
    const centerLoc = validLocations[0];
    const [lat, lng] = centerLoc.geolocation.split(',').map(Number);
    return [lat, lng];
  };
  
  const mapCenter = calculateCenter();
  
  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Crime Locations</CardTitle>
        <CardDescription>Geographic distribution of reported incidents</CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="map-container">
          <MapContainer 
            center={mapCenter}
            zoom={10} 
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomleft" />
            {locations.map((location: Location) => {
              const [lat, lng] = location.geolocation.split(',').map(Number);
              return (
                <Marker 
                  key={location.id} 
                  position={[lat, lng] as [number, number]} 
                  icon={getMarkerIcon(location.crimeType)}
                >
                  <Tooltip>
                    {location.address} - {location.crimeType}
                  </Tooltip>
                  <Popup>
                    <div className="text-black">
                      <h3 className="font-bold">{location.address}</h3>
                      <p className="text-sm">{location.typeOfAddress}</p>
                      <p className="text-sm mt-1">{location.crimeDescription}</p>
                      <p className="text-sm font-bold mt-1">{location.crimeType}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          
          {/* Map Legend */}
          <div className="absolute bottom-2 right-2 bg-background bg-opacity-80 p-2 rounded text-xs z-[400]">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-destructive mr-1"></div>
              <span>Theft/Assault</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-accent mr-1"></div>
              <span>Vandalism/Cyber</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
              <span>Fraud</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
