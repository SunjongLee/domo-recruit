'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type Slot = { id: string; datetime: string; label: string };

interface Props {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelect: (slot: Slot) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function getSeoulDateKey(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const h = Number(d.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Seoul' }));
  const m = d.toLocaleString('en-US', { minute: '2-digit', timeZone: 'Asia/Seoul' }).padStart(2, '0');
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${m}`;
}

function getMondayOf(date: Date) {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function SlotPicker({ slots, selectedSlot, onSelect }: Props) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const slotsByDate = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    slots.forEach((s) => {
      const key = getSeoulDateKey(s.datetime);
      (map[key] ??= []).push(s);
    });
    return map;
  }, [slots]);

  const [weekStart, setWeekStart] = useState(() => {
    if (slots.length > 0) return getMondayOf(new Date(slots[0].datetime));
    return getMondayOf(today);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    // Auto-select first available day
    if (slots.length > 0) return getSeoulDateKey(slots[0].datetime);
    return null;
  });

  const weekDays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    }), [weekStart]);

  const weekLabel = (() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 4);
    const startMonth = MONTH_LABELS[weekStart.getMonth()];
    const endMonth = MONTH_LABELS[end.getMonth()];
    if (weekStart.getMonth() === end.getMonth()) {
      return `${weekStart.getFullYear()}년 ${startMonth} ${weekStart.getDate()}–${end.getDate()}일`;
    }
    return `${startMonth} ${weekStart.getDate()}일 – ${endMonth} ${end.getDate()}일`;
  })();

  const timeSlots = selectedDate ? (slotsByDate[selectedDate] ?? []) : [];

  const prevWeek = () => {
    const n = new Date(weekStart);
    n.setDate(n.getDate() - 7);
    setWeekStart(n);
    setSelectedDate(null);
  };
  const nextWeek = () => {
    const n = new Date(weekStart);
    n.setDate(n.getDate() + 7);
    setWeekStart(n);
    setSelectedDate(null);
  };

  return (
    <div className="space-y-5">
      {/* ── Week navigation ── */}
      <div className="flex items-center gap-2">
        <button onClick={prevWeek} className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0">
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
        <span className="flex-1 text-center text-xs font-semibold text-gray-500">{weekLabel}</span>
        <button onClick={nextWeek} className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0">
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* ── Day selector ── */}
      <div className="grid grid-cols-5 gap-2">
        {weekDays.map((d) => {
          const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
          const hasSlots = (slotsByDate[key]?.length ?? 0) > 0;
          const isSelected = selectedDate === key;
          const isToday = d.toDateString() === today.toDateString();

          return (
            <button
              key={key}
              disabled={!hasSlots}
              onClick={() => setSelectedDate(key)}
              className={`flex flex-col items-center py-3 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-[#0f35f2] bg-[#0f35f2] text-white'
                  : hasSlots
                  ? 'border-[#0f35f2] text-[#0f35f2] hover:bg-blue-50'
                  : 'border-gray-100 text-gray-300 cursor-default'
              }`}
            >
              <span className={`text-[10px] font-medium mb-0.5 ${
                isSelected ? 'opacity-80' : isToday ? 'text-[#0f35f2]' : ''
              }`}>
                {DAY_LABELS[d.getDay()]}
              </span>
              <span className="text-sm font-bold">{d.getDate()}</span>
              {hasSlots && (
                <span className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-[#0f35f2]'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Time slots ── */}
      {selectedDate && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            가능한 시간
          </p>
          {timeSlots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">이 날은 가능한 시간이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => onSelect(slot)}
                    className={`py-2.5 text-sm font-semibold rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#0f35f2] bg-[#0f35f2] text-white'
                        : 'border-[#0f35f2] text-[#0f35f2] hover:bg-blue-50'
                    }`}
                  >
                    {formatTime(slot.datetime)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-xs text-gray-400 text-center py-2">날짜를 선택하면 가능한 시간이 표시됩니다.</p>
      )}
    </div>
  );
}
