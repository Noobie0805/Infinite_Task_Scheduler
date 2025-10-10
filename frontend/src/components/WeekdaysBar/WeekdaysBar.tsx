import React, { useState, useRef, useEffect } from "react";
import { getWeek } from "../../utils/getWeek";
import { IoIosArrowDown } from "react-icons/io";
import { motion } from "framer-motion";
import { TimerSlots } from "./TimerSlots/TimerSlots";
import { Api } from "../../utils/api";
import type { CommonTask, ExceptionTask } from "../../types/api";


const WeekDaysBar: React.FC = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [weeks, setWeeks] = useState(() => [getWeek(today)]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekWidthRef = useRef<number>(0);
  const [switchMonthBox, setSwitchMonthBox] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);


  const monthMap = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [commonByWeekday, setCommonByWeekday] = useState<Record<number, { start_time: string; end_time: string; }[]>>({});
  const [editedByDate, setEditedByDate] = useState<Record<string, { start: string; end: string; }[]>>({});
  const [exceptionsByDate, setExceptionsByDate] = useState<Record<string, { start: string; end: string }[]>>({});
  const exceptionsCacheRef = useRef<Record<string, { start: string; end: string }[]>>({});

  const loadNextWeek = () => {
    const lastWeek = weeks[weeks.length - 1];
    const nextWeekStart = new Date(lastWeek[6].date);
    nextWeekStart.setDate(nextWeekStart.getDate() + 1);
    setWeeks([...weeks, getWeek(nextWeekStart)]);
  };

  const handleScroll = () => {
    if (!scrollRef.current || !weekWidthRef.current) return;

    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 10) {
      loadNextWeek();
    }

    clearTimeout((handleScroll as any).timeout);
    (handleScroll as any).timeout = setTimeout(() => {
      if (!scrollRef.current) return;
      const index = Math.round(scrollRef.current.scrollLeft / weekWidthRef.current);
      setCurrentWeekIndex(index);
      scrollRef.current.scrollTo({
        left: index * weekWidthRef.current,
        behavior: "smooth",
      });
    }, 100);
  };

  useEffect(() => {
    if (scrollRef.current?.firstChild) {
      const firstWeekDiv = scrollRef.current.firstChild as HTMLElement;
      weekWidthRef.current = firstWeekDiv.offsetWidth;
    }
  }, [weeks]);

  useEffect(() => {
    let isCancelled = false;
    const fetchCommon = async () => {
      try {
        const res = await Api.getCommonTasks();
        if (isCancelled) return;
        const data = res.data as CommonTask[];
        const mapped: Record<number, { start_time: string; end_time: string; }[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        for (const row of data) {
          if (typeof row.weekday === "number" && row.weekday >= 0 && row.weekday <= 6) {
            mapped[row.weekday] = mapped[row.weekday] || [];
            mapped[row.weekday].push({ start_time: row.start_time, end_time: row.end_time });
          }
        }
        setCommonByWeekday(mapped);
      } catch (err: any) {
        console.error('Failed to load common tasks:', err);
      }
    };
    fetchCommon();
    return () => { isCancelled = true; };
  }, []);

  useEffect(() => {
    const week = getCurrentWeek();
    if (!week || week.length === 0) return;
    let cancelled = false;
    const fetchWeekExceptions = async () => {
      try {
        const dates = week.map(d => d.date.toISOString().split('T')[0]);
        const toFetch = dates.filter(date => exceptionsCacheRef.current[date] === undefined);
        const results = await Promise.allSettled(toFetch.map(date => Api.getExceptionTasksByDate(date)));
        if (cancelled) return;
        toFetch.forEach((date, idx) => {
          const r = results[idx];
          if (r.status === 'fulfilled') {
            const list = (r.value.data as ExceptionTask[]);
            const updated = list.filter(x => x.status === 'updated' && x.start_time && x.end_time) as (ExceptionTask & { start_time: string; end_time: string; })[];
            if (updated.length > 0) {
              exceptionsCacheRef.current[date] = updated.map(u => ({ start: u.start_time.slice(0,5), end: u.end_time.slice(0,5) }));
              return;
            }
            const anyDeleted = list.some(x => x.status === 'deleted');
            if (anyDeleted) {
              exceptionsCacheRef.current[date] = [];
            }
          }
        });
        const currentMap: Record<string, { start: string; end: string }[]> = {};
        dates.forEach(date => {
          if (exceptionsCacheRef.current[date] !== undefined) {
            currentMap[date] = exceptionsCacheRef.current[date];
          }
        });
        setExceptionsByDate(currentMap);
      } catch (err) {
        console.error('Failed to fetch exception tasks:', err);
      }
    };
    fetchWeekExceptions();
    return () => { cancelled = true; };
  }, [currentWeekIndex, weeks]);

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    setCurrentDate(newDate);
    setWeeks([getWeek(newDate)]);
    setCurrentWeekIndex(0);
    setSwitchMonthBox(false);
  };

  useEffect(() => {
    const handler = async () => {
      const entries = Object.entries(editedByDate);
      for (const [date, slots] of entries) {
        const d = new Date(date);
        const weekday = d.getDay();
        const baseForWeekday = commonByWeekday[weekday] || [];

        const s1 = slots[0] || { start: "00:00", end: "00:00" };
        const s2 = slots[1] || { start: "00:00", end: "00:00" };

        const isZero = (s: { start: string; end: string }) => s.start === "00:00" && s.end === "00:00";

        for (let idx = 0; idx < 2; idx++) {
          const edited = idx === 0 ? s1 : s2;
          const slotNumber = idx + 1;
          const base = baseForWeekday[idx]; 

          if (isZero(edited)) {
            if (base) {
              await Api.createExceptionTask({ slot_date: date, status: 'deleted', slot: slotNumber, common_tasks_id: null } as any);
            }
            continue;
          }

          if (!base) {
            await Api.createCommonTask({ weekday, slot: slotNumber, start_time: edited.start, end_time: edited.end });
            continue;
          }

          const baseStart = (base.start_time || "").slice(0, 5);
          const baseEnd = (base.end_time || "").slice(0, 5);
          if (edited.start !== baseStart || edited.end !== baseEnd) {
            await Api.createExceptionTask({ slot_date: date, status: 'updated', slot: slotNumber, start_time: edited.start, end_time: edited.end, common_tasks_id: null } as any);
          }
        }
      }
      const week = getCurrentWeek();
      const dates = week.map(d => d.date.toISOString().split('T')[0]);
      const results = await Promise.allSettled(dates.map(date => Api.getExceptionTasksByDate(date)));
      const map: Record<string, { start: string; end: string }[]> = {};
      dates.forEach((date, idx) => {
        const r = results[idx];
        if (r.status === 'fulfilled') {
          const list = r.value.data as any[];
          const updated = list.filter(x => x.status === 'updated' && x.start_time && x.end_time);
          if (updated.length > 0) {
            map[date] = updated.map((u: any) => ({ start: u.start_time.slice(0,5), end: u.end_time.slice(0,5) }));
            return;
          }
          const anyDeleted = list.some(x => x.status === 'deleted');
          if (anyDeleted) {
            map[date] = [];
          }
        }
      });
      setExceptionsByDate(map);
    };

    const listener = () => { handler(); };
    window.addEventListener('save-schedule', listener);
    return () => window.removeEventListener('save-schedule', listener);
  }, [editedByDate, weeks, currentWeekIndex]);

  const getCurrentWeek = () => {
    return weeks[currentWeekIndex] || weeks[0];
  };

  useEffect(() => {
    let valid = true;
    for (const slots of Object.values(editedByDate)) {
      if (slots.length >= 1 && slots[0].end !== "00:00" && slots[0].end <= slots[0].start) valid = false;
      if (slots.length >= 2) {
        const s1 = slots[0], s2 = slots[1];
        if (s2.end !== "00:00" && s2.end <= s2.start) valid = false;
        if (s1.start < s2.end && s2.start < s1.end) valid = false;
      }
      if (!valid) break;
    }
    const ev = new CustomEvent('schedule-validity', { detail: { valid } });
    window.dispatchEvent(ev);
  }, [editedByDate]);

  return (
    <div className="">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center overflow-x-auto w-full py-2 scrollbar-hide"
      >
        {weeks.map((week, idx) => (
          <motion.div
            key={idx}
            layout
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex space-x-4 px-2 flex-shrink-0"
          >
            {week.map((day) => {
              const isToday = day.date.toDateString() === today.toDateString();
              const isPast = day.date < today;
              const isCurrentMonth = day.date.getMonth() === currentDate.getMonth();

              return (
                <motion.div
                  key={day.date.toDateString()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className={`flex flex-col items-center p-2 min-w-[39px] rounded-lg cursor-pointer select-none
                    ${!isCurrentMonth || isPast ? "text-gray-400" : "text-black"}
                    ${isToday ? "bg-[#5A5AF1] text-white shadow-md" : "hover:bg-gray-100"}
                  `}
                >
                  <span>{day.day[0]}</span>
                  <span>{day.date.getDate()}</span>
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-end px-5 py-2 pb-5 relative border-b-[2.5px]">
        <span className="flex items-center whitespace-nowrap cursor-pointer select-none" onClick={() => setSwitchMonthBox(!switchMonthBox)}>
          {monthMap[currentDate.getMonth()]}, {currentDate.getFullYear()}
          <motion.span animate={{ rotate: switchMonthBox ? 180 : 0 }} transition={{ duration: 0.3 }} >
            {React.createElement(IoIosArrowDown as React.ComponentType<any>, { size: 20, className: "ml-1" })}
          </motion.span>
        </span>

        {switchMonthBox && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48"
          >
            <div className="grid grid-cols-3 gap-1 p-3">
              {monthMap.map((month, index) => (
                <button key={index} onClick={() => selectMonth(index)} className={`px-2 py-1 text-xs rounded transition-all duration-200 ${index === currentDate.getMonth() ? "bg-[#5A5AF1] text-white" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}>
                  {month.substring(0, 3)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <div className="mt-4 h-[535px] overflow-y-auto scrollbar-hide ">
        {getCurrentWeek().map((dayObj, dayIdx) => {
          const dateKey = dayObj.date.toISOString().split('T')[0];
          const weekday = dayObj.date.getDay();
          const dayCommon = commonByWeekday[weekday] || [];
          // Start from common; exceptions override; local edits override both
          let effectiveSlots = dayCommon.map(s => ({ start: s.start_time.slice(0,5), end: s.end_time.slice(0,5) }));
          if (exceptionsByDate[dateKey] !== undefined) {
            effectiveSlots = exceptionsByDate[dateKey];
          }
          if (editedByDate[dateKey]) {
            effectiveSlots = editedByDate[dateKey];
          }
          return (
            <div key={dateKey} className="flex p-3 ">
              <div className={`flex flex-col items-start py-2 w-28 ${dayObj.date.toDateString() === today.toDateString() ? "text-[#5A5AF1]" : "text-gray-400"}`}>
                <span className={"font-semibold"}>{dayObj.day}, {dayObj.date.getDate()}</span>
                <span className={"font-semibold"}>{monthMap[dayObj.date.getMonth()]}</span>
              </div>
              <div className="flex-1">
                <TimerSlots
                  slots={effectiveSlots}
                  onChange={(slots) => {
                    setEditedByDate(prev => ({ ...prev, [dateKey]: slots }));
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekDaysBar;

