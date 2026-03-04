'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Award, Star, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface BrushingTimerProps {
    childId: string;
    onComplete?: () => void;
    defaultTimeSeconds?: number;
    totalPoints?: number;
}

export default function BrushingTimer({ childId, onComplete, defaultTimeSeconds = 180, totalPoints = 0 }: BrushingTimerProps) {
    const queryClient = useQueryClient();
    const [timeLeft, setTimeLeft] = useState(defaultTimeSeconds);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const brushingMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/brushing-records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ childId, duration: defaultTimeSeconds, points: 10 }),
            });
            if (!res.ok) throw new Error('Failed to save record');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brushing-records', childId] });
        }
    });

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            setIsActive(false);
            setIsFinished(true);
            if (onComplete) onComplete();
            brushingMutation.mutate(); // Save to DB
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, timeLeft]);

    const toggleTimer = () => {
        if (isFinished) {
            setTimeLeft(defaultTimeSeconds);
            setIsFinished(false);
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(defaultTimeSeconds);
        setIsFinished(false);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((defaultTimeSeconds - timeLeft) / defaultTimeSeconds);
    const dashArray = 282.7;
    const dashOffset = dashArray * (1 - progress);

    return (
        <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-100/50 flex flex-col items-center relative overflow-hidden backdrop-blur-xl">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center justify-between w-full mb-8 relative z-10 px-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">3분 양치 챌린지</h2>
                </div>
                {totalPoints > 0 && (
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                        <span className="text-sm font-extrabold text-yellow-700">{totalPoints} P</span>
                    </div>
                )}
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center mb-10 group">
                {/* Glow behind timer */}
                <div className={cn(
                    "absolute inset-0 rounded-full blur-2xl transition-all duration-1000 z-0",
                    isActive ? "bg-blue-400/30 scale-110" : isFinished ? "bg-green-400/40 scale-125 select-none" : "bg-transparent scale-100"
                )} />

                <svg className="w-full h-full -rotate-90 relative z-10 drop-shadow-sm" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="7"
                    />
                    {/* Progress */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={isFinished ? "#10b981" : "url(#gradient)"}
                        strokeWidth="7"
                        strokeDasharray={dashArray}
                        strokeDashoffset={isFinished ? 0 : dashOffset}
                        className="transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="absolute flex flex-col items-center justify-center z-20">
                    {isFinished ? (
                        <div className="flex flex-col items-center animate-in zoom-in spin-in-12 duration-500">
                            <Award className="w-14 h-14 text-emerald-500 drop-shadow-md mb-1" />
                            <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">Success</span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className={cn(
                                "text-4xl font-black font-mono tracking-tighter tabular-nums",
                                isActive ? "text-blue-600" : "text-gray-700"
                            )}>
                                {minutes}:{seconds.toString().padStart(2, '0')}
                            </div>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Left</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 relative z-10 w-full px-4 justify-center items-center">
                <button
                    onClick={resetTimer}
                    className="w-14 h-14 bg-white text-gray-500 rounded-[20px] hover:bg-gray-50 hover:text-gray-800 transition-all flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 active:scale-95"
                    title="초기화"
                >
                    <RotateCcw className="w-6 h-6 stroke-[2.5]" />
                </button>

                <button
                    onClick={toggleTimer}
                    className={cn(
                        "flex-1 max-w-[160px] h-14 rounded-[20px] transition-all flex items-center justify-center gap-2 active:scale-95 overflow-hidden relative group",
                        isActive
                            ? "bg-rose-50 text-rose-500 border-2 border-rose-200 hover:bg-rose-100 shadow-sm"
                            : isFinished
                                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] border border-emerald-400"
                                : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] border border-indigo-500/50"
                    )}
                >
                    {isActive ? (
                        <>
                            <Pause className="w-6 h-6 stroke-[2.5]" />
                            <span className="font-extrabold">일시정지</span>
                        </>
                    ) : isFinished ? (
                        <>
                            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                            <span className="font-extrabold">다시하기</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-6 h-6 stroke-[2.5] ml-1" />
                            <span className="font-extrabold text-lg">시작!</span>
                        </>
                    )}
                </button>
            </div>

            {isFinished && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm border border-emerald-100">
                        <Star className="w-3.5 h-3.5 fill-emerald-500" />
                        참 잘했어요! 포인트 10점 획득
                    </p>
                </div>
            )}
        </div>
    );
}
