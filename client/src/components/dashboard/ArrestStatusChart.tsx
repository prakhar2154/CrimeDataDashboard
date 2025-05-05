import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables, ChartData, ChartTypeRegistry } from "chart.js";
import { chartColors, arrestStatusColors } from "@/lib/theme";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/badge-custom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

Chart.register(...registerables);

type ArrestStatusDataType = {
  status: string;
  count: number;
  percentage: number;
};

export function ArrestStatusChart() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<'doughnut' | 'bar'>('doughnut');
  const [selectedTab, setSelectedTab] = useState<string>("chart");
  
  const { data: arrestStatusData, isLoading } = useQuery<ArrestStatusDataType[]>({
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
    
    // Prepare chart data
    const labels = arrestStatusData.map((item: ArrestStatusDataType) => item.status);
    const data = arrestStatusData.map((item: ArrestStatusDataType) => item.percentage);
    const counts = arrestStatusData.map((item: ArrestStatusDataType) => item.count);
    
    // Select colors based on status
    const colors = labels.map((label: string) => {
      if (label === 'Arrested') return '#2563eb'; // blue
      if (label === 'Pending') return '#d97706'; // amber
      if (label === 'No Arrest') return '#dc2626'; // red
      return chartColors[0];
    });
    
    const chartData: ChartData = {
      labels: labels,
      datasets: [{
        data: chartType === 'doughnut' ? data : counts,
        backgroundColor: colors,
        borderColor: 'transparent',
        borderRadius: 4,
        barPercentage: 0.6,
        hoverOffset: 4
      }]
    };
    
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...(chartType === 'doughnut' ? { cutout: '65%' } : {}),
        ...(chartType === 'bar' ? { indexAxis: 'y' } : {}),
        scales: chartType === 'bar' ? {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            },
            title: {
              display: true,
              text: 'Number of Cases',
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        } : undefined,
        plugins: {
          legend: {
            position: chartType === 'doughnut' ? 'right' : 'bottom',
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
                if (data.labels && data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const meta = chart.getDatasetMeta(0);
                    const style = meta.controller.getStyle(i, 0);
                    
                    return {
                      text: chartType === 'doughnut' 
                        ? `${label} (${data.datasets[0].data[i]}%)` 
                        : `${label} (${counts[i]} cases)`,
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
              weight: 'bold'
            },
            bodyFont: {
              family: 'Inter'
            },
            padding: 12,
            cornerRadius: 4,
            callbacks: {
              label: function(context) {
                const dataIndex = context.dataIndex;
                const label = context.label || '';
                
                if (chartType === 'doughnut') {
                  return [
                    ` Status: ${label}`,
                    ` Percentage: ${context.parsed}%`,
                    ` Count: ${counts[dataIndex]} cases`
                  ];
                } else {
                  return [
                    ` Status: ${label}`,
                    ` Count: ${context.parsed} cases`,
                    ` Percentage: ${data[dataIndex]}%`
                  ];
                }
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
  }, [arrestStatusData, chartType]);
  
  const toggleChartType = () => {
    setChartType(prev => prev === 'doughnut' ? 'bar' : 'doughnut');
  };
  
  if (isLoading) {
    return (
      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Arrest Status Distribution</CardTitle>
          <CardDescription>Analysis of case resolutions and outcomes</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-[300px] animate-pulse bg-secondary-light rounded-md"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate some stats for the details view
  const totalCases = arrestStatusData?.reduce((sum: number, item: ArrestStatusDataType) => sum + item.count, 0) || 0;
  const arrestRate = arrestStatusData?.find((item: ArrestStatusDataType) => item.status === 'Arrested')?.percentage || 0;
  const pendingRate = arrestStatusData?.find((item: ArrestStatusDataType) => item.status === 'Pending')?.percentage || 0;
  
  return (
    <Card className="bg-secondary">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-medium">Arrest Status Distribution</CardTitle>
          <CardDescription>Analysis of case resolutions and outcomes</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleChartType} 
            className="h-8 px-2 text-xs"
          >
            <span className="material-icons text-sm mr-1">
              {chartType === 'doughnut' ? 'bar_chart' : 'pie_chart'}
            </span>
            {chartType === 'doughnut' ? 'Show Bar Chart' : 'Show Pie Chart'}
          </Button>
          <div className="flex items-center space-x-2">
            <Button 
              variant={selectedTab === "chart" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("chart")} 
              className="h-8 px-3 text-xs"
            >
              Chart
            </Button>
            <Button 
              variant={selectedTab === "details" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTab("details")} 
              className="h-8 px-3 text-xs"
            >
              Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {selectedTab === "chart" ? (
          <div className="chart-container h-[300px]">
            <canvas ref={chartRef}></canvas>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {arrestStatusData?.map((item: ArrestStatusDataType) => (
                <div 
                  key={item.status} 
                  className="bg-muted p-4 rounded-lg flex flex-col"
                >
                  <div className="flex justify-between items-center mb-2">
                    <StatusBadge
                      bgColor={arrestStatusColors[item.status]?.bg || "bg-gray-700"}
                      textColor={arrestStatusColors[item.status]?.text || "text-white"}
                    >
                      {item.status}
                    </StatusBadge>
                    <span className="text-2xl font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    <div className="flex justify-between mb-1">
                      <span>Total cases:</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Of all crimes:</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Status Analysis Summary</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="material-icons text-accent text-sm mr-2">insights</span>
                  <span>Total of <strong>{totalCases}</strong> cases analyzed across all categories.</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-green-500 text-sm mr-2">check_circle</span>
                  <span>Arrest rate is at <strong>{arrestRate}%</strong>, representing successful case resolution.</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-amber-500 text-sm mr-2">schedule</span>
                  <span><strong>{pendingRate}%</strong> of cases are still pending investigation or prosecution.</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-red-500 text-sm mr-2">priority_high</span>
                  <span>Cases without arrests may require additional resource allocation or follow-up.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
