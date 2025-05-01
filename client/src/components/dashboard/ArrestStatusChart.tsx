import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { chartColors } from "@/lib/theme";

Chart.register(...registerables);

export function ArrestStatusChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const { data: arrestStatusData, isLoading } = useQuery({
    queryKey: ['/api/arrest-status'],
  });
  
  useEffect(() => {
    if (!chartRef.current || !arrestStatusData) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: arrestStatusData.map((item: { status: string }) => item.status),
        datasets: [{
          data: arrestStatusData.map((item: { percentage: number }) => item.percentage),
          backgroundColor: chartColors.slice(0, 3),
          borderColor: 'transparent',
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                family: 'Inter',
                size: 12
              },
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const meta = chart.getDatasetMeta(0);
                    const style = meta.controller.getStyle(i);
                    
                    return {
                      text: `${label} (${data.datasets[0].data[i]}%)`,
                      fillStyle: style.backgroundColor,
                      strokeStyle: style.borderColor,
                      lineWidth: style.borderWidth,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
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
            cornerRadius: 4,
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.parsed}%`;
              }
            }
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
  }, [arrestStatusData]);
  
  if (isLoading) {
    return (
      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Arrest Status Distribution</CardTitle>
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
        <CardTitle className="text-lg font-medium">Arrest Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  );
}
