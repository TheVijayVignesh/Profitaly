import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  lineColor?: string;
  fillColor?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

const SparklineChart = ({
  data,
  width = 100,
  height = 30,
  lineColor,
  fillColor,
  className = "",
  trend = "neutral"
}: SparklineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // Determine colors based on trend if not explicitly provided
  const getLineColor = () => {
    if (lineColor) return lineColor;
    
    switch (trend) {
      case "up":
        return "rgba(16, 185, 129, 1)"; // Green
      case "down":
        return "rgba(239, 68, 68, 1)"; // Red
      default:
        return "rgba(147, 147, 147, 1)"; // Gray
    }
  };

  const getFillColor = () => {
    if (fillColor) return fillColor;
    
    switch (trend) {
      case "up":
        return "rgba(16, 185, 129, 0.1)"; // Light green
      case "down":
        return "rgba(239, 68, 68, 0.1)"; // Light red
      default:
        return "rgba(147, 147, 147, 0.1)"; // Light gray
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    // Destroy previous chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array(data.length).fill(""),
        datasets: [
          {
            data,
            borderColor: getLineColor(),
            backgroundColor: getFillColor(),
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
            min: Math.min(...data) * 0.95,
            max: Math.max(...data) * 1.05,
          },
        },
        animation: {
          duration: 0,
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, trend, lineColor, fillColor]);

  return (
    <div className={`sparkline-chart ${className}`} style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </div>
  );
};

export default SparklineChart;
