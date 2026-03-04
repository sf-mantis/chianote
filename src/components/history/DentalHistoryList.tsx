'use client';

import React, { useState, useRef } from 'react';
import { Calendar, ChevronRight, Image as ImageIcon, Plus, X, Stethoscope, UploadCloud, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DentalHistoryProps {
    childName: string;
    childId: string;
}

export default function DentalHistoryList({ childName, childId }: DentalHistoryProps) {
    const queryClient = useQueryClient();

    const { data: history = [], isLoading } = useQuery({
        queryKey: ['dental-records', childId],
        queryFn: async () => {
            if (!childId) return [];
            const res = await fetch(`/api/dental-records?childId=${childId}`);
            if (!res.ok) throw new Error('Failed to fetch records');
            return res.json();
        },
        enabled: !!childId,
    });

    const [isAdding, setIsAdding] = useState(false);
    const [selectedRecordToView, setSelectedRecordToView] = useState<any | null>(null);
    const [newRecord, setNewRecord] = useState({
        date: new Date().toISOString().split('T')[0],
        clinic: '',
        treatment: '',
        notes: ''
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addRecordMutation = useMutation({
        mutationFn: async (newRec: any) => {
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
            setIsAdding(false);
            setNewRecord({
                date: new Date().toISOString().split('T')[0],
                clinic: '',
                treatment: '',
                notes: ''
            });
            setSelectedImage(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (error: any) => {
            alert(`기록 저장에 실패했습니다: ${error.message}`);
        }
    });

    const deleteRecordMutation = useMutation({
        mutationFn: async (recordId: string) => {
            const res = await fetch(`/api/dental-records/${recordId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete record');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dental-records', childId] });
        },
    });

    const handleDeleteRecord = (e: React.MouseEvent, recordId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('이 진료 기록(및 첨부된 사진)을 완전히 삭제하시겠습니까?')) {
            deleteRecordMutation.mutate(recordId);
        }
    };

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRecord.clinic || !newRecord.treatment || !childId) return;

        let uploadedUrl = undefined;

        if (selectedImage) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', selectedImage);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                uploadedUrl = data.url;
            } catch (err) {
                alert('이미지 업로드에 실패했습니다.');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        addRecordMutation.mutate({
            childId,
            toothId: "99", // General clinic visit
            status: "UNKNOWN",
            notes: `[${newRecord.clinic}] ${newRecord.treatment} - ${newRecord.notes}`,
            recordDate: new Date(newRecord.date).toISOString(),
            imageUrl: uploadedUrl,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 font-[family-name:var(--font-geist-sans)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        진료 이력 관리
                    </h2>
                    <p className="text-sm font-medium text-gray-400 mt-1">{childName}의 병원 방문 기록</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col gap-3 relative">
                {/* Vertical Timeline Guide */}
                {!isLoading && history.length > 0 && (
                    <div className="absolute top-4 bottom-4 left-6 w-px bg-gray-100" />
                )}

                {isLoading ? (
                    <div className="py-8 text-center text-sm text-gray-400 font-medium">기록을 불러오는 중...</div>
                ) : history.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        아직 병원 방문 기록이 없습니다.<br />우측 상단 + 버튼을 눌러 추가해보세요.
                    </div>
                ) : history.map((record: any, index: number) => (
                    <div
                        key={record.id}
                        onClick={() => setSelectedRecordToView(record)}
                        className="group relative pl-16 pr-4 py-4 rounded-[20px] hover:bg-gray-50/80 transition-all cursor-pointer flex justify-between items-center border border-transparent hover:border-gray-100"
                    >
                        {/* Timeline Node */}
                        <div className="absolute left-[1.125rem] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white bg-indigo-200 group-hover:bg-indigo-500 transition-colors shadow-sm z-10" />

                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-3 mb-1.5">
                                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
                                    {new Date(record.recordDate).toLocaleDateString()}
                                </span>
                                {record.imageUrl && (
                                    <span className="flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                                        <ImageIcon className="w-3 h-3 mr-1" />
                                        사진
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">{record.notes}</h3>
                            <div className="flex items-center text-xs font-medium text-gray-400 gap-1 mt-1">
                                <Stethoscope className="w-3.5 h-3.5" />
                                지정 병원
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => handleDeleteRecord(e, record.id)}
                                disabled={deleteRecordMutation.isPending}
                                className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors z-20 relative"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors border border-gray-100 flex-shrink-0">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {history.length > 0 && (
                <button className="w-full mt-5 py-3.5 text-sm font-bold text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    전체 이력 펼쳐보기
                </button>
            )}

            {/* Add Record Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setIsAdding(false)} />
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50 w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100/60 bg-gradient-to-br from-indigo-50/50 to-white">
                            <div>
                                <h3 className="font-extrabold text-gray-800 text-lg">새 진료 기록 추가</h3>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">병원 다녀온 내용을 간단히 적어주세요</p>
                            </div>
                            <button onClick={() => setIsAdding(false)} className="w-8 h-8 flex items-center justify-center bg-white text-gray-400 hover:text-gray-800 rounded-full shadow-sm border border-gray-100 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddRecord} className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">방문 날짜</label>
                                <input
                                    type="date"
                                    required
                                    value={newRecord.date}
                                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                                    className="w-full border-2 border-gray-100 rounded-[16px] p-3.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">치과 이름</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="예: 튼튼소아치과"
                                    value={newRecord.clinic}
                                    onChange={(e) => setNewRecord({ ...newRecord, clinic: e.target.value })}
                                    className="w-full border-2 border-gray-100 rounded-[16px] p-3.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-800 placeholder-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">치료 내용</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="예: 영유아 구강검진"
                                    value={newRecord.treatment}
                                    onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                                    className="w-full border-2 border-gray-100 rounded-[16px] p-3.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-gray-800 placeholder-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">의사 선생님 코멘트 메모</label>
                                <textarea
                                    placeholder="다음 번에는 불소 도포 권장함 등"
                                    value={newRecord.notes}
                                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                                    className="w-full border-2 border-gray-100 rounded-[16px] p-3.5 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all min-h-[100px] text-sm font-medium text-gray-800 resize-none placeholder-gray-300"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="flex items-center justify-between p-4 border-2 border-dashed border-gray-200 rounded-[16px] cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                                            <UploadCloud className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">X-ray 사진 첨부하기</span>
                                            <span className="text-xs font-medium text-gray-400">클릭하여 파일 선택 (선택사항)</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                    />
                                </label>

                                {imagePreview && (
                                    <div className="relative w-full h-32 rounded-[16px] overflow-hidden border border-gray-200 shadow-sm mt-2">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={addRecordMutation.isPending || isUploading}
                                className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 text-white font-extrabold rounded-[16px] shadow-[0_8px_20px_-6px_rgba(99,102,241,0.4)] transition-all active:scale-[0.98]"
                            >
                                {isUploading ? '사진 업로드 중...' : addRecordMutation.isPending ? '저장 중...' : '기록 저장하기'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Record Detail Modal */}
            {selectedRecordToView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0" onClick={() => setSelectedRecordToView(null)} />
                    <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100/60 transition-colors">
                            <div>
                                <h3 className="font-extrabold text-gray-800 text-lg">진료 기록 상세</h3>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">{new Date(selectedRecordToView.recordDate).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelectedRecordToView(null)} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex flex-col gap-5 bg-gray-50/30">
                            {selectedRecordToView.imageUrl && (
                                <div className="w-full rounded-[20px] overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                                    <Image
                                        src={selectedRecordToView.imageUrl}
                                        alt="X-ray or Clinic photo"
                                        width={500}
                                        height={300}
                                        className="w-full h-auto object-contain max-h-[300px]"
                                    />
                                </div>
                            )}

                            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex flex-col gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 mb-1">상세 기록 메모</h4>
                                    <p className="text-sm font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">
                                        {selectedRecordToView.notes}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-bold text-gray-500">지정 방문 치과</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
