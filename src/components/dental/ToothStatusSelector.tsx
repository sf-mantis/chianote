import { TOOTH_STATUS } from '@/lib/dentalChartData';
import { cn } from '@/lib/utils';

// Custom Minimalist Tooth SVG Icon
function ToothIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M15.5 3c-1.2 0-2.2.6-3.5 1.5C10.7 3.6 9.7 3 8.5 3 5.5 3 4 5 4 7.5c0 2 1 4 2 6 .5 1 .5 2 .5 3v1.5C6.5 20 7.5 21 8.5 21c1.2 0 1.5-1 1.5-2v-2.5c0-.8.7-1.5 1.5-1.5.8 0 1.5.7 1.5 1.5v2.5c0 1 .3 2 1.5 2 1 0 2-1 2-3v-1.5c0-1 0-2 .5-3 1-2 2-4 2-6C20 5 18.5 3 15.5 3z" />
        </svg>
    );
}

interface ToothStatusSelectorProps {
    toothId: string;
    currentStatus: string;
    onSelect: (status: string) => void;
    onClose: () => void;
}

export default function ToothStatusSelector({ toothId, currentStatus, onSelect, onClose }: ToothStatusSelectorProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 ease-out flex flex-col">
                {/* Header Decoration */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-blue-50 to-indigo-50/30 -z-10" />

                <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100/60">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-[16px] flex items-center justify-center font-black text-xl text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-blue-100/50 transform -rotate-3">
                            {toothId}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-800 text-lg tracking-tight">치아 상태 기록</h3>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">정확한 상태를 선택해주세요</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100/80 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="닫기"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-2.5">
                    {TOOTH_STATUS.map((status) => {
                        const isSelected = currentStatus === status.value;
                        return (
                            <button
                                key={status.value}
                                onClick={() => {
                                    onSelect(status.value);
                                    onClose();
                                }}
                                className={cn(
                                    "group relative flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-300 overflow-hidden",
                                    isSelected
                                        ? "border-blue-400 bg-blue-50/50 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] ring-2 ring-blue-100"
                                        : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 hover:shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-transform duration-300 group-hover:scale-110",
                                    status.color,
                                    isSelected ? "shadow-inner border-opacity-100" : "border-opacity-50"
                                )}>
                                    <ToothIcon className={cn("w-5 h-5", isSelected ? "text-current" : "text-gray-500")} />
                                </div>
                                <span className={cn(
                                    "font-bold flex-1 text-left transition-colors",
                                    isSelected ? "text-blue-700" : "text-gray-700"
                                )}>
                                    {status.label}
                                </span>

                                {/* Selection Indicator */}
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                    isSelected ? "border-blue-500 bg-blue-500" : "border-gray-200 bg-white"
                                )}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 pt-1 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        취소하기
                    </button>
                </div>
            </div>
        </div>
    );
}
