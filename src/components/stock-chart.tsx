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
        background: { type: ColorType.Solid, color: 'white' },
        textColor: 'black',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    chart.timeScale().fitContent();

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: 'rgba(38, 166, 154, 0.5)',
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
        color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
    }));
    console.log(formattedData[0]);
    console.log(volumeData[0]);
    candlestickSeries.setData(formattedData);
    volumeSeries.setData(volumeData);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[400px] text-gray-500">Select a ticker to view the chart.</div>;
  }

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};

export default StockChart; 