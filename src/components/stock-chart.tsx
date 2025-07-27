"use client";
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

interface StockDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: StockDataPoint[];
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        horzLines: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    chart.timeScale().fitContent();

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: 'rgba(34, 197, 94, 0.3)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Attach to the main price scale
    });
     chart.priceScale('').applyOptions({
        scaleMargins: {
            top: 0.7, // 70% of the chart height for the main series
            bottom: 0,
        },
    });

    // The data from the backend is now clean, so we can use it directly.
    const formattedData = data.map(d => ({
      time: d.timestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData = data.map(d => ({
        time: d.timestamp,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    }));
    candlestickSeries.setData(formattedData);
    volumeSeries.setData(volumeData);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        color: '#94a3b8'
      }}>
        Select a ticker to view the chart.
      </div>
    );
  }

  return <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />;
};

export default StockChart; 