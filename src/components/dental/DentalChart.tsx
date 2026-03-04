'use client';

import React from 'react';
import { PRIMARY_TEETH, PERMANENT_TEETH, TOOTH_STATUS } from '@/lib/dentalChartData';
import { cn } from '@/lib/utils';

// Custom Minimalist Tooth SVG Icon
function ToothIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15.5 3c-1.2 0-2.2.6-3.5 1.5C10.7 3.6 9.7 3 8.5 3 5.5 3 4 5 4 7.5c0 2 1 4 2 6 .5 1 .5 2 .5 3v1.5C6.5 20 7.5 21 8.5 21c1.2 0 1.5-1 1.5-2v-2.5c0-.8.7-1.5 1.5-1.5.8 0 1.5.7 1.5 1.5v2.5c0 1 .3 2 1.5 2 1 0 2-1 2-3v-1.5c0-1 0-2 .5-3 1-2 2-4 2-6C20 5 18.5 3 15.5 3z" />
        </svg>
    );
}

interface DentalChartProps {
    type: 'PRIMARY' | 'PERMANENT';
    records?: Record<string, string>; // { "11": "HEALTHY", "51": "DECAYED" }
    onToothClick?: (toothId: string) => void;
}

export default function DentalChart({ type, records = {}, onToothClick }: DentalChartProps) {
    const teethData = type === 'PRIMARY' ? PRIMARY_TEETH : PERMANENT_TEETH;

    return (
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-gradient-to-br from-white to-gray-50/50 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100/50 p-6 overflow-hidden backdrop-blur-3xl">
            {/* Background Arch decoration */}
            <div className="absolute inset-x-12 top-16 bottom-16 border-[16px] border-blue-50/50 rounded-full opacity-60 blur-sm pointer-events-none" />
            <div className="absolute inset-x-8 top-12 bottom-12 border-2 border-dashed border-gray-200/50 rounded-full pointer-events-none" />

            {/* Center soft glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-400/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative w-full h-full">
                {teethData.map((tooth) => {
                    const status = records[tooth.id] || 'HEALTHY';
                    const statusConfig = TOOTH_STATUS.find((s) => s.value === status) || TOOTH_STATUS[0];

                    return (
                        <button
                            key={tooth.id}
                            onClick={() => onToothClick?.(tooth.id)}
                            className={cn(
                                "absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
                                "hover:scale-[1.15] hover:z-10 focus:outline-none focus:ring-4 focus:ring-blue-100/50",
                                "w-10 h-10 md:w-12 md:h-12 rounded-2xl shadow-sm backdrop-blur-md",
                                statusConfig.color.replace('border-', 'border-2 border-') // Make border thicker
                            )}
                            style={{
                                left: `${tooth.x}%`,
                                top: `${tooth.y}%`,
                            }}
                            title={`${tooth.name} (${tooth.id}) - ${statusConfig.label}`}
                        >
                            <div className="text-[9px] md:text-[10px] font-black tracking-tighter text-gray-600/80 mb-0.5">{tooth.id}</div>
                            <ToothIcon className={cn("w-4 h-4 md:w-5 md:h-5 opacity-90", status === 'HEALTHY' ? 'text-gray-400' : 'text-current bg-blend-multiply')} />
                        </button>
                    );
                })}
            </div>

            {/* Subtle Guidelines */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gray-200/40 transform -translate-y-1/2 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-gray-200/40 transform -translate-x-1/2 to-transparent pointer-events-none" />
        </div>
    );
}
