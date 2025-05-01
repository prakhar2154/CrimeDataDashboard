import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../ui/badge-custom";
import { crimeTypeColors, arrestStatusColors, sentimentColors } from "@/lib/theme";

interface CrimeDetailModalProps {
  crimeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CrimeDetailModal({ crimeId, isOpen, onClose }: CrimeDetailModalProps) {
  const { data: crimeDetails, isLoading } = useQuery({
    queryKey: [`/api/crimes/${crimeId}`],
    enabled: isOpen,
  });
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>
      <div 
        className="relative bg-secondary rounded-lg shadow-lg max-w-3xl w-full max-h-screen overflow-auto z-10 mx-4"
        style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(31, 41, 55, 0.95)" }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-muted p-5">
          <h3 className="text-xl font-montserrat font-semibold text-white">
            {isLoading ? "Loading..." : `Crime Report: ${crimeId}`}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-400 hover:text-destructive focus:outline-none"
          >
            <span className="material-icons">close</span>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="p-5 space-y-4">
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Crime Details */}
              <div>
                <h4 className="text-lg font-medium mb-4 text-white border-b border-muted pb-2">
                  Crime Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Crime ID</p>
                    <p className="text-white">{crimeDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white">{crimeDetails.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-white">{crimeDetails.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <p>
                      <StatusBadge
                        bgColor={crimeTypeColors[crimeDetails.type]?.bg || "bg-gray-900"}
                        textColor={crimeTypeColors[crimeDetails.type]?.text || "text-gray-200"}
                      >
                        {crimeDetails.type}
                      </StatusBadge>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p>
                      <StatusBadge
                        bgColor={arrestStatusColors[crimeDetails.status]?.bg || "bg-gray-900"}
                        textColor={arrestStatusColors[crimeDetails.status]?.text || "text-gray-200"}
                      >
                        {crimeDetails.status}
                      </StatusBadge>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Location & Officer Details */}
              <div>
                <h4 className="text-lg font-medium mb-4 text-white border-b border-muted pb-2">
                  Location & Officer
                </h4>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-white">{crimeDetails.location.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Type of Address</p>
                    <p className="text-white">{crimeDetails.location.typeOfAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Officer Name</p>
                    <p className="text-white">{crimeDetails.officer?.name || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Officer Position</p>
                    <p className="text-white">{crimeDetails.officer?.position || "N/A"}</p>
                  </div>
                </div>
                
                <h4 className="text-lg font-medium mb-4 text-white border-b border-muted pb-2">
                  Report Outcome
                </h4>
                <div>
                  <p className="text-sm text-gray-400">Outcome</p>
                  <p className="text-white">{crimeDetails.policeReport?.outcome || "No outcome recorded"}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weather Data */}
              {crimeDetails.weather && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3 text-white flex items-center">
                    <span className="material-icons mr-2 text-accent">cloud</span>
                    Weather Conditions
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Temperature</p>
                      <p className="text-white">{crimeDetails.weather.temperature}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Precipitation</p>
                      <p className="text-white">{crimeDetails.weather.precipitation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Wind Speed</p>
                      <p className="text-white">{crimeDetails.weather.windSpeed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-white">{crimeDetails.weather.date}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Social Media */}
              {crimeDetails.socialMedia && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="text-md font-medium mb-3 text-white flex items-center">
                    <span className="material-icons mr-2 text-accent">forum</span>
                    Related Social Media
                  </h4>
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-secondary">
                      <p className="text-sm mb-1">{crimeDetails.socialMedia.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{crimeDetails.socialMedia.date}</span>
                        <StatusBadge
                          bgColor={sentimentColors[crimeDetails.socialMedia.sentiment]?.bg || "bg-gray-900"}
                          textColor={sentimentColors[crimeDetails.socialMedia.sentiment]?.text || "text-gray-200"}
                        >
                          {crimeDetails.socialMedia.sentiment}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="secondary"
                className="mr-2 bg-primary hover:bg-primary-light text-white"
              >
                <span className="material-icons text-sm mr-1">print</span>
                Print
              </Button>
              <Button
                variant="destructive"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
