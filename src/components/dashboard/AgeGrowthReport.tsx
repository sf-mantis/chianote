'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ScriptableContext,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AgeReportProps {
    childName: string;
    age: number; // in months
    decayCount: number;
    treatedCount: number;
}

export default function AgeGrowthReport({ childName, age, decayCount, treatedCount }: AgeReportProps) {
    const ALL_LABELS = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144];
    const ALL_AVG_DATA = [0.1, 0.5, 1.2, 2.5, 3.8, 5.0, 5.5, 6.0, 6.2, 6.5, 6.8, 7.0];

    // Determine the 6-bucket window based on child's age
    let startIndex = 0;
    if (age > 72) {
        let currentBucketIndex = ALL_LABELS.findIndex(m => m >= age);
        if (currentBucketIndex === -1) currentBucketIndex = ALL_LABELS.length - 1;
        // Keep the current age near the right side of the graph (around 4th or 5th point)
        startIndex = Math.max(0, currentBucketIndex - 4);
        startIndex = Math.min(startIndex, ALL_LABELS.length - 6); // Max 6 points visible
    }

    const ageLabels = ALL_LABELS.slice(startIndex, startIndex + 6);
    const windowAvgData = ALL_AVG_DATA.slice(startIndex, startIndex + 6);
    const totalIssues = decayCount + treatedCount;

    // Generate dynamic progression array based on child's current age
    // For simplicity, we plot a linear progression up to their current age bucket
    const currentAgeBucketIndex = ageLabels.findIndex(m => m >= age);
    const maxIndex = currentAgeBucketIndex === -1 ? ageLabels.length - 1 : currentAgeBucketIndex;

    const childProgressionData = ageLabels.map((_, index) => {
        if (index > maxIndex) return null; // Future ages are null
        if (index === maxIndex) return totalIssues; // Current age bucket shows actual data
        // For past ages, draw a smooth curve from 0 to current issues
        return Math.max(0, Math.round((totalIssues / maxIndex) * index * 10) / 10);
    });

    const chartData = {
        labels: ageLabels.map(m => `${m}m`),
        datasets: [
            {
                label: '평균 충치 경험 치아',
                data: windowAvgData,
                borderColor: 'rgba(209, 213, 219, 1)',
                backgroundColor: 'rgba(209, 213, 219, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                spanGaps: true,
            },
            {
                label: `${childName}의 누적 충치 기록`,
                data: childProgressionData,
                borderColor: '#6366f1',
                backgroundColor: (context: ScriptableContext<'line'>) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                    return gradient;
                },
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 6,
                    font: { family: 'inherit', size: 10, weight: 'bold' as const },
                    color: '#6b7280'
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: { size: 13, family: 'inherit' },
                bodyFont: { size: 12, family: 'inherit' },
                cornerRadius: 12,
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#9ca3af', font: { size: 10, weight: 'bold' as const } }
            },
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6', drawBorder: false },
                ticks: { color: '#e5e7eb', stepSize: 2, font: { size: 10 } }
            },
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
    };

    const getStatusMessage = () => {
        const totalIssues = decayCount + treatedCount;
        if (totalIssues === 0) return { title: '아주 건강해요!', desc: '치아가 깨끗하게 잘 관리되고 있습니다.', color: 'text-emerald-600', bg: 'bg-emerald-50/80 border-emerald-100', iconColor: 'text-emerald-500' };
        if (decayCount > 0) return { title: '주의가 필요해요', desc: '발견된 충치는 초기 치료가 단연 중요합니다.', color: 'text-rose-600', bg: 'bg-rose-50/80 border-rose-100', iconColor: 'text-rose-500' };
        return { title: '꾸준한 관리 중이군요!', desc: '치료받은 치아를 깨끗하게 유지해주세요.', color: 'text-indigo-600', bg: 'bg-indigo-50/80 border-indigo-100', iconColor: 'text-indigo-500' };
    };

    const status = getStatusMessage();

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col gap-6 relative overflow-hidden">
            {/* Soft decorative background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-bl from-blue-100/40 to-indigo-50/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">구강 성장 리포트</h2>
                    <p className="text-xs font-medium text-gray-400 mt-1">생후 {age}개월 평균 데이터 비교</p>
                </div>
            </div>

            <div className={cn("p-4 rounded-2xl flex items-start gap-4 border shadow-sm transition-all relative z-10", status.bg)}>
                <div className={cn("mt-0.5 p-2 rounded-xl bg-white shadow-sm border border-black/5", status.iconColor)}>
                    {decayCount > 0 ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                    <h3 className={cn("font-bold text-sm tracking-tight", status.color)}>{status.title}</h3>
                    <p className="text-xs font-medium text-gray-600/90 mt-1 leading-relaxed">{status.desc}</p>
                </div>
            </div>

            <div className="h-56 mt-2 relative z-10">
                <Line data={chartData} options={options} />
            </div>

        </div>
    );
}
