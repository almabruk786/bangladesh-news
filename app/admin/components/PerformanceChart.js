"use client";
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            align: 'end',
            labels: {
                usePointStyle: true,
                boxWidth: 8,
                font: { family: "'Inter', sans-serif", size: 11 }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            displayColors: false, // Don't show color box
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 } }
        },
        y: {
            grid: { color: '#f1f5f9', borderDash: [4, 4] },
            border: { display: false },
            ticks: { color: '#94a3b8', font: { size: 10 }, maxTicksLimit: 5 }
        }
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
};

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PerformanceChart() {
    const [chartData, setChartData] = React.useState(null);
    const [timeRange, setTimeRange] = React.useState('7days');

    React.useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/analytics/stats?range=${timeRange}`);
                const data = await res.json();

                if (data.success) {
                    setChartData({
                        labels: data.labels,
                        datasets: [
                            {
                                fill: true,
                                label: 'Total Views',
                                data: data.views,
                                borderColor: 'rgb(99, 102, 241)', // Indigo 500
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                tension: 0.4,
                                pointRadius: 0,
                                pointHoverRadius: 6,
                                borderWidth: 2
                            }
                        ]
                    });
                }
            } catch (e) {
                console.error("Chart Data Error", e);
            }
        }
        fetchData();
    }, [timeRange]);

    if (!chartData) return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="text-xs text-slate-400 mt-2">Loading Analytics...</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Performance Analytics</h3>
                    <p className="text-xs text-slate-400">Content views over time</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1 text-slate-500 focus:ring-0 cursor-pointer hover:bg-slate-100 transition"
                >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
                <Line options={options} data={chartData} />
            </div>
        </motion.div>
    );
}
