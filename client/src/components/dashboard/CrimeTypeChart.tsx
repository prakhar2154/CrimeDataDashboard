import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { chartColors } from "@/lib/theme";

Chart.register(...registerables);

export function CrimeTypeChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
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
              weight: '500'
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
  
  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Crime by Type</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
