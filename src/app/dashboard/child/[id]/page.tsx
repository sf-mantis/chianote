'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DentalChart from '@/components/dental/DentalChart';
import ToothStatusSelector from '@/components/dental/ToothStatusSelector';
import AgeGrowthReport from '@/components/dashboard/AgeGrowthReport';
import DentalHistoryList from '@/components/history/DentalHistoryList';
import BrushingTimer from '@/components/timer/BrushingTimer';

export default function ChildDentalDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id: childId } = use(params);
    const queryClient = useQueryClient();

    // Fetch this specific child's info
    const { data: children = [] } = useQuery({
        queryKey: ['children'],
        queryFn: async () => {
            const res = await fetch('/api/children');
            if (!res.ok) throw new Error('Failed to fetch children');
            return res.json();
        },
    });

    const currentChild = children.find((c: { id: string, name: string, dateOfBirth: string }) => c.id === childId);

    // Fetch records for summary counts
    const { data: history = [] } = useQuery({
        queryKey: ['dental-records', childId],
        queryFn: async () => {
            if (!childId) return [];
            const res = await fetch(`/api/dental-records?childId=${childId}`);
            if (!res.ok) throw new Error('Failed to fetch records');
            return res.json();
        },
        enabled: !!childId,
    });

    // Fetch brushing records to calculate total points
    const { data: brushingRecords = [] } = useQuery({
        queryKey: ['brushing-records', childId],
        queryFn: async () => {
            if (!childId) return [];
            const res = await fetch(`/api/brushing-records?childId=${childId}`);
            if (!res.ok) throw new Error('Failed to fetch brushing records');
            return res.json();
        },
        enabled: !!childId,
    });

    const totalPoints = brushingRecords.reduce((sum: number, record: { points?: number }) => sum + (record.points || 0), 0);

    const [chartType, setChartType] = useState<'PRIMARY' | 'PERMANENT'>('PRIMARY');
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

    // Build the records map from history for the 2D chart
    // Get the most recent status for each unique toothId
    const records: Record<string, string> = {};
    const sortedHistory = [...history].sort((a: { recordDate: string }, b: { recordDate: string }) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
    sortedHistory.forEach((rec: { toothId: string, status: string }) => {
        if (rec.toothId && rec.toothId !== "99") {
            records[rec.toothId] = rec.status;
        }
    });

    const addRecordMutation = useMutation({
        mutationFn: async (newRec: { childId: string, toothId: string, status: string, notes: string, recordDate: string }) => {
            const res = await fetch('/api/dental-records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRec),
            });
            if (!res.ok) throw new Error('Failed to add record');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dental-records', childId] });
            setSelectedTooth(null);
        },
    });

    const handleToothClick = (toothId: string) => {
        setSelectedTooth(toothId);
    };

    const handleStatusSelect = (status: string) => {
        if (selectedTooth && childId) {
            addRecordMutation.mutate({
                childId,
                toothId: selectedTooth,
                status,
                notes: `${status} 상태 업데이트`,
                recordDate: new Date().toISOString()
            });
        }
    };

    const decayCount = Object.values(records).filter(status => status === 'DECAYED').length;
    const treatedCount = Object.values(records).filter(status => status === 'TREATED').length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20 font-[family-name:var(--font-geist-sans)] transition-colors">
            <div className="bg-white dark:bg-zinc-900 p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center transition-colors">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-zinc-100 tracking-tight">우리가족 치아노트</h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mt-0.5">{currentChild ? currentChild.name : '로딩중...'}의 구강 상태</p>
                </div>
                <Link href="/dashboard/settings" title="가족 및 설정 관리">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors shadow-sm">
                        {currentChild ? currentChild.name.charAt(0) : '?'}
                    </div>
                </Link>
            </div>

            <div className="p-4 max-w-lg mx-auto flex flex-col gap-6">

                <AgeGrowthReport
                    childName={currentChild?.name || '아이'}
                    age={currentChild ? Math.round((new Date().getTime() - new Date(currentChild.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44)) : 0}
                    decayCount={decayCount}
                    treatedCount={treatedCount}
                />

                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm transition-colors border border-transparent dark:border-zinc-800">
                    <div className="flex bg-gray-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-6">
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${chartType === 'PRIMARY' ? 'bg-white dark:bg-zinc-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700/50'}`}
                            onClick={() => setChartType('PRIMARY')}
                        >
                            유치 매핑
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${chartType === 'PERMANENT' ? 'bg-white dark:bg-zinc-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700/50'}`}
                            onClick={() => setChartType('PERMANENT')}
                        >
                            영구치 매핑
                        </button>
                    </div>

                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="font-bold text-gray-800 dark:text-zinc-100">치아 기록 수정</h2>
                        <span className="text-xs text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-full font-medium">편집 모드</span>
                    </div>

                    <div className="flex justify-center mt-8">
                        <DentalChart
                            type={chartType}
                            records={records}
                            onToothClick={handleToothClick}
                        />
                    </div>

                    <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-6">
                        치아를 선택하여 상세 상태를 등록하세요
                    </p>
                </div>

                {/* Record count summary component */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-red-500 dark:text-red-400 mb-1">
                            {decayCount}
                        </div>
                        <div className="text-xs font-medium text-gray-500 dark:text-zinc-400">충치 갯수</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-blue-500 dark:text-blue-400 mb-1">
                            {treatedCount}
                        </div>
                        <div className="text-xs font-medium text-gray-500 dark:text-zinc-400">치료 완료</div>
                    </div>
                </div>

                {/* History Section */}
                <DentalHistoryList childName={currentChild?.name || ''} childId={childId} />

                {/* Brushing Timer Section */}
                <BrushingTimer childId={childId} defaultTimeSeconds={180} totalPoints={totalPoints} />

            </div>

            {selectedTooth && (
                <ToothStatusSelector
                    toothId={selectedTooth}
                    currentStatus={records[selectedTooth] || 'HEALTHY'}
                    onSelect={handleStatusSelect}
                    onClose={() => setSelectedTooth(null)}
                />
            )}
        </div>
    );
}
