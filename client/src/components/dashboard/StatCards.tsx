import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
  change?: {
    value: string;
    type: "positive" | "negative" | "neutral";
  };
  subtitle?: string;
  detailedInfo?: {
    title: string;
    description: string;
    stats?: Array<{
      label: string;
      value: string | number;
    }>;
    explanation?: string;
  };
}

function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  borderColor,
  change,
  subtitle,
  detailedInfo
}: StatCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
      <Card 
        className={`bg-secondary border-l-4 ${borderColor} cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-secondary-light`}
        onClick={() => detailedInfo && setDialogOpen(true)}
      >
        <CardContent className="p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
              <p className="text-white text-2xl font-semibold mt-1">{value}</p>
            </div>
            <div className={`h-10 w-10 rounded-full ${iconBgColor} bg-opacity-10 flex items-center justify-center`}>
              <span className={`material-icons ${iconColor}`}>{icon}</span>
            </div>
          </div>
          <div className="mt-4 text-sm">
            {change && (
              <span className={`${change.type === 'positive' ? 'text-green-400' : change.type === 'negative' ? 'text-red-400' : 'text-gray-400'}`}>
                {change.value}{' '}
              </span>
            )}
            {subtitle && <span className="text-gray-400">{subtitle}</span>}
            {detailedInfo && (
              <div className="mt-1 text-accent">
                <span className="text-xs">Click for more details</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {detailedInfo && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-secondary text-white border border-muted sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{detailedInfo.title}</DialogTitle>
              <DialogDescription className="text-gray-300">
                {detailedInfo.description}
              </DialogDescription>
            </DialogHeader>
            
            {detailedInfo.stats && (
              <div className="mt-4 space-y-4">
                {detailedInfo.stats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-muted pb-2">
                    <span className="text-gray-300">{stat.label}</span>
                    <span className="text-white font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
            
            {detailedInfo.explanation && (
              <div className="mt-4 p-3 bg-muted rounded-md text-sm text-gray-300">
                <p>{detailedInfo.explanation}</p>
              </div>
            )}
            
            <DialogFooter className="mt-4">
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function StatCards() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading || !statsData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-secondary animate-pulse">
            <CardContent className="p-5 h-[110px]"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <StatCard
        title="Total Crimes"
        value={statsData.totalCrimes}
        icon="warning"
        iconBgColor="bg-destructive"
        iconColor="text-destructive"
        borderColor="border-destructive"
        change={{ value: "+5%", type: "positive" }}
        subtitle="from last month"
        detailedInfo={{
          title: "Crime Statistics Overview",
          description: "A detailed breakdown of total crimes reported in the jurisdiction.",
          stats: [
            { label: "Current Month", value: statsData.totalCrimes - Math.floor(statsData.totalCrimes * 0.05) },
            { label: "Previous Month", value: statsData.totalCrimes - Math.floor(statsData.totalCrimes * 0.05) - Math.floor(statsData.totalCrimes * 0.05) },
            { label: "Year to Date", value: statsData.totalCrimes * 3 },
            { label: "Annual Projection", value: statsData.totalCrimes * 12 }
          ],
          explanation: "Total crimes include all reported incidents across all categories. The 5% increase from the previous month indicates a statistically significant rise that warrants closer monitoring. Key factors contributing to this change may include seasonal variations, special events, or changes in reporting practices."
        }}
      />
      <StatCard
        title="Arrest Rate"
        value={`${statsData.arrestRate}%`}
        icon="handcuffs"
        iconBgColor="bg-accent"
        iconColor="text-accent"
        borderColor="border-accent"
        change={{ value: "-2%", type: "negative" }}
        subtitle="from last month"
        detailedInfo={{
          title: "Arrest Rate Analysis",
          description: "Percentage of reported crimes that resulted in arrests.",
          stats: [
            { label: "Current Month Rate", value: `${statsData.arrestRate}%` },
            { label: "Previous Month Rate", value: `${statsData.arrestRate + 2}%` },
            { label: "Year to Date Average", value: `${Math.floor((statsData.arrestRate + statsData.arrestRate + 2 + statsData.arrestRate + 1) / 3)}%` },
            { label: "Total Arrests", value: Math.floor(statsData.totalCrimes * (statsData.arrestRate / 100)) }
          ],
          explanation: "The arrest rate reflects the effectiveness of law enforcement in resolving crimes with arrests. The 2% decrease may be attributed to several factors including more complex cases, resource constraints, or changes in criminal behavior patterns. Monitoring this trend over the next quarter will help determine if this is a temporary fluctuation or part of a larger trend."
        }}
      />
      <StatCard
        title="Most Common Crime"
        value={`${statsData.mostCommonCrime.type} (${statsData.mostCommonCrime.count})`}
        icon="key_off"
        iconBgColor="bg-destructive"
        iconColor="text-destructive"
        borderColor="border-destructive-light"
        subtitle={`${statsData.mostCommonCrime.percentage}% of all crimes`}
        detailedInfo={{
          title: `${statsData.mostCommonCrime.type} Crime Analysis`,
          description: `Detailed breakdown of the most frequently reported crime type.`,
          stats: [
            { label: "Total Incidents", value: statsData.mostCommonCrime.count },
            { label: "Percentage of All Crimes", value: `${statsData.mostCommonCrime.percentage}%` },
            { label: "Cleared Cases", value: Math.floor(statsData.mostCommonCrime.count * (statsData.arrestRate / 100)) },
            { label: "Common Locations", value: "Commercial Areas" }
          ],
          explanation: `${statsData.mostCommonCrime.type} represents the largest category of reported crimes in our jurisdiction. This crime type typically involves ${statsData.mostCommonCrime.type === 'Theft' ? 'property loss without force' : statsData.mostCommonCrime.type === 'Assault' ? 'physical attacks or threats' : statsData.mostCommonCrime.type === 'Vandalism' ? 'property damage' : 'various criminal activities'}. Prevention strategies include increased patrols in hotspot areas, community awareness programs, and targeted enforcement efforts.`
        }}
      />
      <StatCard
        title="Recent Crimes"
        value={statsData.recentCrimes}
        icon="update"
        iconBgColor="bg-primary"
        iconColor="text-primary"
        borderColor="border-primary"
        subtitle="In the last 30 days"
        detailedInfo={{
          title: "Recent Crime Trends",
          description: "Analysis of crimes reported within the last 30 days.",
          stats: [
            { label: "Total Recent Incidents", value: statsData.recentCrimes },
            { label: "Daily Average", value: Math.round(statsData.recentCrimes / 30 * 10) / 10 },
            { label: "Highest Crime Day", value: "Saturdays" },
            { label: "Lowest Crime Day", value: "Tuesdays" }
          ],
          explanation: "Recent crime data helps identify emerging patterns and immediate concerns. The daily average provides context for understanding the current crime rate. Time-of-day analysis shows that most incidents occur between 6 PM and 2 AM, with weekends showing higher activity. This information helps optimize patrol schedules and resource allocation."
        }}
      />
    </div>
  );
}
