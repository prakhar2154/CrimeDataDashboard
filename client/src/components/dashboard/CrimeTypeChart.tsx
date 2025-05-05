import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { chartColors } from "@/lib/theme";
import { Button } from "@/components/ui/button";

Chart.register(...registerables);

export function CrimeTypeChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const { data: crimeTypeData, isLoading } = useQuery({
    queryKey: ['/api/crime-types'],
  });
  
  useEffect(() => {
    if (!chartRef.current || !crimeTypeData) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: crimeTypeData.map((item: { type: string }) => item.type),
        datasets: [{
          label: 'Number of Crimes',
          data: crimeTypeData.map((item: { count: number }) => item.count),
          backgroundColor: chartColors,
          borderColor: 'transparent',
          borderRadius: 4,
          barThickness: 20,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Inter',
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Inter',
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(31, 41, 55, 0.95)',
            titleFont: {
              family: 'Inter',
              weight: 'bold'
            },
            bodyFont: {
              family: 'Inter'
            },
            padding: 12,
            cornerRadius: 4
          }
        }
      }
    });
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [crimeTypeData]);
  
  if (isLoading) {
    return (
      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Crime by Type</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="chart-container animate-pulse bg-secondary-light rounded-md"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Find the most common crime type
  const getMostCommonCrime = () => {
    if (!crimeTypeData || !crimeTypeData.length) return null;
    
    return crimeTypeData.reduce((prev: any, current: any) => 
      (prev.count > current.count) ? prev : current
    );
  };
  
  const mostCommonCrime = getMostCommonCrime();
  const totalCrimes = crimeTypeData?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
  
  return (
    <Card className="bg-secondary">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-medium">Crime by Type</CardTitle>
          <CardDescription>Distribution of crimes by category</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDetails(!showDetails)} 
          className="h-8 px-2 text-xs"
        >
          <span className="material-icons text-sm mr-1">
            {showDetails ? 'expand_less' : 'expand_more'}
          </span>
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </CardHeader>
      <CardContent className="p-5">
        <div className="chart-container h-[300px]">
          <canvas ref={chartRef}></canvas>
        </div>
        
        {showDetails && (
          <div className="mt-6 space-y-4">
            <div className="bg-muted/30 border border-muted p-4 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 flex items-center">
                <span className="material-icons text-accent text-sm mr-2">info</span>
                Chart Analysis
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                This chart displays the frequency of different crime types reported in the jurisdiction.
                {mostCommonCrime && (
                  <> The most common crime type is <strong>{mostCommonCrime.type}</strong> with <strong>{mostCommonCrime.count}</strong> reported incidents 
                  ({Math.round((mostCommonCrime.count / totalCrimes) * 100)}% of all crimes).</>
                )}
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted p-3 rounded-md">
                  <h5 className="text-sm font-medium mb-2 flex items-center">
                    <span className="material-icons text-blue-500 text-sm mr-1">tips_and_updates</span>
                    Crime Pattern Insights
                  </h5>
                  <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                    <li>Patterns in crime types help identify areas needing targeted enforcement</li>
                    <li>Seasonal variations may exist for certain crime categories</li>
                    <li>Economic crimes often increase during financial downturns</li>
                    <li>Comparing trends over time helps evaluate prevention programs</li>
                  </ul>
                </div>
                
                <div className="bg-muted p-3 rounded-md">
                  <h5 className="text-sm font-medium mb-2 flex items-center">
                    <span className="material-icons text-green-500 text-sm mr-1">psychology</span>
                    Response Strategies
                  </h5>
                  <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                    <li>High property crime areas benefit from increased visible patrols</li>
                    <li>Violent crime hotspots may require specialized intervention units</li>
                    <li>Community engagement helps address low-level quality of life crimes</li>
                    <li>Educational programs can reduce certain crime types like fraud</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {crimeTypeData?.map((item: any, index: number) => (
                <div key={item.type} className="bg-muted p-3 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    ></div>
                    <h5 className="text-sm font-medium">{item.type}</h5>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Count:</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Percentage:</span>
                    <span className="font-medium">{Math.round((item.count / totalCrimes) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
