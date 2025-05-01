import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { chartColors } from "@/lib/theme";

Chart.register(...registerables);

export function CrimeTrendChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const { data: crimeTrendData, isLoading } = useQuery({
    queryKey: ['/api/crime-trends'],
  });
  
  useEffect(() => {
    if (!chartRef.current || !crimeTrendData) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Format dates for x-axis labels
    const labels = crimeTrendData.map((item: { month: string }) => {
      return item.month;
    });
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Crimes',
          data: crimeTrendData.map((item: { count: number }) => item.count),
          borderColor: chartColors[0],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointBackgroundColor: chartColors[0],
          pointRadius: 4,
          pointHoverRadius: 6,
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
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Inter',
              },
              maxRotation: 45,
              minRotation: 45
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
  }, [crimeTrendData]);
  
  if (isLoading) {
    return (
      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Crime Trends Over Time</CardTitle>
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
        <CardTitle className="text-lg font-medium">Crime Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
