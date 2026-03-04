'use client';

import React, { useState, useEffect } from 'react';
import { User, Bell, Settings, LogOut, ChevronRight, X, Trash2, Moon, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';

export default function SettingsDashboard() {
    const queryClient = useQueryClient();

    // Fetch children
    const { data: children = [], isLoading: isLoadingChildren } = useQuery({
        queryKey: ['children'],
        queryFn: async () => {
            const res = await fetch('/api/children');
            if (!res.ok) throw new Error('Failed to fetch children');
            return res.json();
        },
    });

    // Fetch upcoming appointments
    const { data: upcomingAppointments = [] } = useQuery({
        queryKey: ['appointments'],
        queryFn: async () => {
            const res = await fetch('/api/appointments');
            if (!res.ok) throw new Error('Failed to fetch appointments');
            return res.json();
        },
    });

    const [isAddingChild, setIsAddingChild] = useState(false);
    const [newChildData, setNewChildData] = useState({ name: '', birthDate: '' });

    const [isChangingAppt, setIsChangingAppt] = useState(false);
    const [newApptData, setNewApptData] = useState({
        date: new Date().toISOString().split('T')[0],
        clinic: '',
        childId: ''
    });

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false);
    const [appSettings, setAppSettings] = useState({
        pushNotifications: true,
        marketingConsent: false,
    });

    // Load mock settings from localeStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('chianote_settings');
        if (saved) {
            try { setAppSettings(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    const handleToggleSetting = (key: keyof typeof appSettings) => {
        const newSettings = { ...appSettings, [key]: !appSettings[key] };
        setAppSettings(newSettings);
        localStorage.setItem('chianote_settings', JSON.stringify(newSettings));
    };

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
    });

    // Mutation to delete child
    const deleteChildMutation = useMutation({
        mutationFn: async (childId: string) => {
            const res = await fetch(`/api/children/${childId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete child');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['children'] });
        },
    });

    const handleDeleteChild = (e: React.MouseEvent, childId: string, childName: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`${childName}의 프로필과 모든 기록을 영구적으로 삭제하시겠습니까?`)) {
            deleteChildMutation.mutate(childId);
        }
    };

    // Mutation to add appointment
    const addAppointmentMutation = useMutation({
        mutationFn: async (newAppt: any) => {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAppt),
            });
            if (!res.ok) throw new Error('Failed to add appointment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            setIsChangingAppt(false);
            setNewApptData({ date: new Date().toISOString().split('T')[0], clinic: '', childId: '' });
        },
    });

    // Mutation to delete appointment
    const deleteAppointmentMutation = useMutation({
        mutationFn: async (apptId: string) => {
            const res = await fetch(`/api/appointments/${apptId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete appointment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });

    const handleDeleteAppt = (e: React.MouseEvent, apptId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("이 예약을 삭제하시겠습니까?")) {
            deleteAppointmentMutation.mutate(apptId);
        }
    };

    const handleAddChild = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChildData.name || !newChildData.birthDate) return;

        addChildMutation.mutate({
            name: newChildData.name,
            birthDate: new Date(newChildData.birthDate).toISOString()
        });
    };

    const handleChangeAppt = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newApptData.childId || !newApptData.clinic) return;

        addAppointmentMutation.mutate({
            childId: newApptData.childId,
            clinicName: newApptData.clinic,
            appointmentDate: new Date(newApptData.date).toISOString()
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20 font-[family-name:var(--font-geist-sans)] transition-colors">
            <div className="bg-white dark:bg-zinc-900 p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center transition-colors">
                <h1 className="text-xl font-bold text-gray-800 dark:text-zinc-100">우리가족 관리</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto flex flex-col gap-6">

                {/* Child Profiles Section */}
                <section>
                    <div className="flex justify-between items-end mb-3 px-2">
                        <h2 className="text-sm font-bold text-gray-500 dark:text-zinc-400">아이 프로필 관리</h2>
                        <button onClick={() => setIsAddingChild(true)} className="text-xs font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-colors">
                            + 아이 추가
                        </button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-1 transition-colors">
                        {isLoadingChildren ? (
                            <div className="p-4 text-center text-sm text-gray-400 font-medium">로딩 중...</div>
                        ) : children.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-400 font-medium">등록된 아이가 없습니다.</div>
                        ) : (
                            children.map((child: any) => {
                                const months = Math.round((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                                return (
                                    <div key={child.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-2xl cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-500/30 shadow-sm relative overflow-hidden">
                                                {child.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-zinc-100">{child.name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-zinc-400">{months || 0}개월 • 치아 기록: {child._count?.records || 0}개</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={(e) => handleDeleteChild(e, child.id, child.name)}
                                                disabled={deleteChildMutation.isPending}
                                                className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </section>

                {/* Appointments Section */}
                <section>
                    <div className="flex justify-between items-end mb-3 px-2">
                        <h2 className="text-sm font-bold text-gray-500 dark:text-zinc-400">예약 및 알림 관리</h2>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-4 transition-colors">
                        <div className="flex flex-col gap-3">
                            {upcomingAppointments.length === 0 ? (
                                <div className="text-center p-4 text-sm text-gray-400 font-medium">다가오는 예약이 없습니다.</div>
                            ) : (
                                upcomingAppointments.map((appt: any) => (
                                    <div key={appt.id} className="flex-1 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 outline outline-4 outline-blue-50 dark:outline-zinc-900 flex items-center justify-center shrink-0">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-0.5">다음 치과 검진일</p>
                                            <h4 className="text-gray-800 dark:text-zinc-100 font-extrabold text-sm mb-1">{new Date(appt.date).toLocaleDateString()}</h4>
                                            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">{appt.child?.name} ({appt.clinicName})</p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteAppt(e, appt.id)}
                                            disabled={deleteAppointmentMutation.isPending}
                                            className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors ml-auto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}

                            <button onClick={() => setIsChangingAppt(true)} className="mt-2 w-full text-xs font-bold bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 py-3 rounded-xl shadow-sm border border-blue-100 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-zinc-700 transition-colors">
                                새로운 예약 등록하기
                            </button>
                        </div>
                    </div>
                </section>

                {/* System Settings */}
                <section>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-1 mt-4 transition-colors">
                        <Link href="/dashboard" className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/80 rounded-2xl transition-colors">
                            <User className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-700 dark:text-zinc-300 flex-1">대시보드 처음으로 (아이 선택)</span>
                        </Link>
                        <div onClick={() => setIsAppSettingsOpen(true)} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/80 rounded-2xl transition-colors cursor-pointer">
                            <Settings className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-700 dark:text-zinc-300 flex-1">앱 기본 설정</span>
                        </div>
                        <div onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors cursor-pointer group">
                            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500" />
                            <span className="font-medium text-red-500 flex-1">로그아웃</span>
                        </div>
                    </div>
                </section>

            </div>

            {/* Add Child Modal */}
            {isAddingChild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">아이 정보 추가</h3>
                            <button onClick={() => setIsAddingChild(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddChild} className="p-4 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">아이 이름 (또는 애칭)</label>
                                <input
                                    type="text"
                                    required
                                    value={newChildData.name}
                                    onChange={(e) => setNewChildData({ ...newChildData, name: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">생년월일</label>
                                <input
                                    type="date"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    value={newChildData.birthDate}
                                    onChange={(e) => setNewChildData({ ...newChildData, birthDate: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={addChildMutation.isPending}
                                className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
                            >
                                {addChildMutation.isPending ? '추가 중...' : '추가하기'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Appointment Modal */}
            {isChangingAppt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">새 예약 등록</h3>
                            <button onClick={() => setIsChangingAppt(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleChangeAppt} className="p-4 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">예약 날짜</label>
                                <input
                                    type="date"
                                    required
                                    max="9999-12-31"
                                    value={newApptData.date}
                                    onChange={(e) => setNewApptData({ ...newApptData, date: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">치과 이름</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="예: 튼튼소아치과"
                                    value={newApptData.clinic}
                                    onChange={(e) => setNewApptData({ ...newApptData, clinic: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">대상 아이</label>
                                <select
                                    required
                                    value={newApptData.childId}
                                    onChange={(e) => setNewApptData({ ...newApptData, childId: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-800 appearance-none"
                                >
                                    <option value="">선택해주세요</option>
                                    {children.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={addAppointmentMutation.isPending}
                                className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all active:scale-[0.98]"
                            >
                                {addAppointmentMutation.isPending ? '저장 중...' : '예약 등록하기'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* App Settings Modal */}
            {isAppSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-zinc-100">앱 기본 설정</h3>
                            <button onClick={() => setIsAppSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-2 flex flex-col gap-1">
                            {/* Push Notifications Toggle */}
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <Bell className={`w-5 h-5 ${appSettings.pushNotifications ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="font-bold text-gray-700 dark:text-zinc-300 text-sm">진료일 D-1 푸시 알림</p>
                                        <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">예약일 하루 전 기기로 알림을 보냅니다.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleSetting('pushNotifications')}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${appSettings.pushNotifications ? 'bg-blue-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${appSettings.pushNotifications ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Marketing Consent Toggle */}
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <Smartphone className={`w-5 h-5 ${appSettings.marketingConsent ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="font-bold text-gray-700 dark:text-zinc-300 text-sm">이벤트 및 혜택 알림 (선택)</p>
                                        <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">치과 진료 할인 등 유용한 소식을 받습니다.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleSetting('marketingConsent')}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${appSettings.marketingConsent ? 'bg-blue-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${appSettings.marketingConsent ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Dark Mode Toggle */}
                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <Moon className={`w-5 h-5 ${mounted && theme === 'dark' ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="font-bold text-gray-700 dark:text-zinc-300 text-sm">다크 모드 테마</p>
                                        <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">어두운 환경에서 눈을 편안하게 합니다.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${mounted && theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${mounted && theme === 'dark' ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
