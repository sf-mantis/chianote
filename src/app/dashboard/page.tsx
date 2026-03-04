'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Plus, X, ChevronRight, Activity, Settings } from 'lucide-react';

export default function DashboardGateway() {
    const queryClient = useQueryClient();

    // Fetch children
    const { data: children = [], isLoading } = useQuery({
        queryKey: ['children'],
        queryFn: async () => {
            const res = await fetch('/api/children');
            if (!res.ok) throw new Error('Failed to fetch children');
            return res.json();
        },
    });

    const [isAddingChild, setIsAddingChild] = useState(false);
    const [newChildData, setNewChildData] = useState({ name: '', birthDate: '' });

    // Mutation to add child
    const addChildMutation = useMutation({
        mutationFn: async (newChild: any) => {
            const res = await fetch('/api/children', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newChild),
            });
            if (!res.ok) throw new Error('Failed to add child');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['children'] });
            setIsAddingChild(false);
            setNewChildData({ name: '', birthDate: '' });
        },
        onError: (error: any) => {
            alert(`아이 추가에 실패했습니다: ${error.message}`);
        }
    });

    const handleAddChild = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChildData.name || !newChildData.birthDate) return;

        addChildMutation.mutate({
            name: newChildData.name,
            birthDate: new Date(newChildData.birthDate).toISOString()
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col font-[family-name:var(--font-geist-sans)] transition-colors">
            <div className="bg-white dark:bg-zinc-900 p-4 shadow-sm sticky top-0 z-10 flex justify-center items-center h-16 transition-colors">
                <h1 className="text-xl font-bold text-gray-800 dark:text-zinc-100">우리가족 치아노트</h1>
            </div>

            <div className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col justify-center gap-8">
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-2">누구의 치아를 볼까요?</h2>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm">기록을 확인하거나 관리할 아이를 선택해주세요.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {isLoading ? (
                        <div className="py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 flex justify-center shadow-sm">
                            <Activity className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : children.length === 0 ? (
                        <div className="py-12 px-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 flex flex-col items-center text-center shadow-sm">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <User className="w-8 h-8" />
                            </div>
                            <p className="text-gray-500 dark:text-zinc-400 font-medium whitespace-pre-line">
                                아직 등록된 아이가 없습니다.{"\n"}아래 버튼을 눌러 첫 아이 프로필을 만들어주세요!
                            </p>
                        </div>
                    ) : (
                        children.map((child: any) => {
                            const months = Math.round((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                            return (
                                <Link href={`/dashboard/child/${child.id}`} key={child.id}>
                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/50 transition-all cursor-pointer group flex items-center gap-4">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-2xl border border-blue-200 dark:border-blue-500/30 shadow-inner">
                                            {child.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100 tracking-tight">{child.name}</h3>
                                            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 mt-0.5">{months}개월 • 치아 기록: {child._count?.records || 0}개</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 transition-colors">
                                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}

                    <button
                        onClick={() => setIsAddingChild(true)}
                        className="mt-4 flex items-center justify-center gap-2 p-4 text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-3xl transition-colors border border-blue-100 dark:border-blue-500/30 border-dashed"
                    >
                        <Plus className="w-5 h-5" />
                        새로운 아이 추가하기
                    </button>

                    {/* System Settings link */}
                    <Link href="/dashboard/settings" className="mt-4 flex items-center justify-center gap-2 p-4 text-gray-500 dark:text-zinc-400 font-bold hover:bg-white dark:hover:bg-zinc-800 rounded-3xl transition-colors">
                        <Settings className="w-5 h-5" />
                        전체 환경설정
                    </Link>
                </div>

            </div>

            {/* Add Child Modal */}
            {isAddingChild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-100 dark:border-zinc-800">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-zinc-100">아이 프로필 생성</h3>
                            <button onClick={() => setIsAddingChild(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddChild} className="p-4 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">아이 이름 (또는 애칭)</label>
                                <input
                                    type="text"
                                    required
                                    value={newChildData.name}
                                    onChange={(e) => setNewChildData({ ...newChildData, name: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl p-3 bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800 dark:text-zinc-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">생년월일</label>
                                <input
                                    type="date"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    value={newChildData.birthDate}
                                    onChange={(e) => setNewChildData({ ...newChildData, birthDate: e.target.value })}
                                    className="w-full border border-gray-200 dark:border-zinc-700 rounded-xl p-3 bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800 dark:text-zinc-100"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={addChildMutation.isPending}
                                className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
                            >
                                {addChildMutation.isPending ? '생성 중...' : '프로필 생성하기'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
