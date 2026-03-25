import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getShiftAssignments, ShiftAssignment } from "@/apis/shiftApi";
import React from "react";

// ─── helpers ───────────────────────────────────────────
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function fmt(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const SLOTS = ["sáng", "trưa", "chiều", "tối"] as const;
type Slot = (typeof SLOTS)[number];

function classifyShift(shiftName: string): Slot {
  const n = shiftName.toLowerCase();
  if (n.includes("sáng") || n.includes("sang")) return "sáng";
  if (n.includes("trưa") || n.includes("trua")) return "trưa";
  if (n.includes("chiều") || n.includes("chieu")) return "chiều";
  return "tối";
}

// ─── types ─────────────────────────────────────────────
interface TimeTableProps {
  currentMonday: Date;
  onChange: (date: Date) => void;
}

// ─── WeekSwitcher component ────────────────────────────
export function TimeTable({ currentMonday, onChange }: TimeTableProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sunday = new Date(currentMonday);
  sunday.setDate(sunday.getDate() + 6);

  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const sm = currentMonday.getMonth(),
    em = sunday.getMonth();
  const sy = currentMonday.getFullYear(),
    ey = sunday.getFullYear();
  const monthLabel =
    sm === em && sy === ey
      ? `${pad(sm + 1)}/${sy}`
      : sy === ey
        ? `${pad(sm + 1)}-${pad(em + 1)}/${sy}`
        : `${pad(sm + 1)}/${sy} - ${pad(em + 1)}/${ey}`;

  function shift(dir: 1 | -1): void {
    const next = new Date(currentMonday);
    next.setDate(next.getDate() + dir * 7);
    onChange(next);
  }

  // ─── assignments ───────────────────────────────────────
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);

  useEffect(() => {
    getShiftAssignments().then(setAssignments).catch(console.error);
  }, []);

  // Build lookup: date string → slot → assignments[]
  const lookup: Record<string, Record<Slot, ShiftAssignment[]>> = {};
  for (const a of assignments) {
    if (!lookup[a.date]) {
      lookup[a.date] = { sáng: [], trưa: [], chiều: [], tối: [] };
    }
    const slot = classifyShift(a.shift_name);
    lookup[a.date][slot].push(a);
  }

  return (
    <div className="border border-slate-200 overflow-hidden">
      {/* NAV */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <button
          onClick={() => shift(-1)}
          className="p-1 rounded hover:bg-blue-50 text-blue-600"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-semibold text-blue-700">
          Tuần hiện tại: {fmt(currentMonday)} - {fmt(sunday)}
        </span>

        <button
          onClick={() => shift(1)}
          className="p-1 rounded hover:bg-blue-50 text-blue-600"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* GRID */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
      >
        {/* EMPTY TOP-LEFT CELL */}
        <div className=" border-slate-400 bg-white" />

        {/* DAY HEADERS */}
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="text-center text-[20px] text-slate-400 font-medium py-2 border-l border-slate-400 bg-white"
          >
            {d}
          </div>
        ))}

        {/* DATE ROW */}
        <div className="bg-white" />
        {days.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();

          return (
            <div
              key={i}
              className="flex flex-col items-center py-1 border-b border-l border-slate-400 bg-white"
            >
              <div
                className={[
                  "w-7 h-7 flex items-center justify-center rounded-full text-sm",
                  isToday
                    ? "bg-blue-600 text-white font-semibold"
                    : i >= 5
                      ? "text-slate-400"
                      : "text-blue-600",
                ].join(" ")}
              >
                {d.getDate()}
              </div>

              {!isToday && (
                <div className="w-1 h-1 rounded-full bg-blue-300 mt-0.5" />
              )}
            </div>
          );
        })}

        {/* SLOT ROWS */}
        {SLOTS.map((slot, si) => (
          <React.Fragment key={slot}>
            {/* SLOT LABEL */}
            <div className="flex items-center justify-center border-r border-t  border-slate-400 bg-white py-2">
              <span className="text-[20px] font-semibold text-slate-400 capitalize">
                {slot}
              </span>
            </div>

            {/* DAY CELLS */}
            {days.map((d, di) => {
              const ymd = toYMD(d);
              const people = lookup[ymd]?.[slot] ?? [];
              const isToday = d.toDateString() === today.toDateString();

              return (
                <div
                  key={di}
                  className={[
                    "min-h-12 p-1 flex flex-col gap-1.5",
                    "border-b border-slate-400",
                    di < 6 ? "border-r border-slate-400" : "",
                    isToday ? "bg-blue-50/40" : "",
                  ].join(" ")}
                >
                  {people.map((a) => (
                    <div
                      key={a.id}
                      title={a.username}
                      className="flex items-center gap-1 px-1 py-1.5 rounded bg-indigo-50 border border-slate-400 w-20 overflow-hidden"
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[9px] font-semibold shrink-0">
                        {a.username.charAt(0).toUpperCase()}
                      </div>

                      <p className="text-[15px] font-medium text-slate-700 truncate min-w-0 flex-1">
                        {a.username}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export { getMonday };
