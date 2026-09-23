import React, { useState, useEffect } from 'react';
import { BusFront, Clock, CheckCircle2, XCircle, Circle, Tablet, Wifi, WifiOff } from 'lucide-react';
import { BoardStats } from '../types';

interface BoardHeaderProps {
  stats: BoardStats;
  isCleanTvMode: boolean;
  schoolName: string;
  isOnline?: boolean;
  onOpenInstallModal?: () => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  stats,
  isCleanTvMode,
  schoolName,
  isOnline = true,
  onOpenInstallModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-800 shadow-md select-none">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: School Title & Bus Icon */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <BusFront className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2 uppercase">
                {schoolName || 'School Bus Board'}
              </h1>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                <span>After-School Dismissal</span>
                <span>•</span>
                <span className="font-mono text-amber-300 font-bold">{timeStr}</span>
              </div>
            </div>
          </div>

          {/* iPad Offline setup quick button on header */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              title="Click for iPad Offline setup instructions"
            >
              <Tablet className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">iPad Offline App</span>
              <span className="sm:hidden">Install</span>
              {isOnline ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online & Cached"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Offline Mode"></span>
              )}
            </button>
          )}

          {/* Mobile quick time */}
          <div className="md:hidden font-mono text-sm font-bold text-amber-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            {timeStr}
          </div>
        </div>

        {/* Center: GIANT COLOR & TAP LEGEND FOR STUDENTS & STAFF */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-950/80 px-3 sm:px-5 py-2 rounded-2xl border border-slate-800 shadow-inner w-full md:w-auto justify-around sm:justify-center">
          {/* Green Legend (1 Tap) */}
          <div className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/50 px-2.5 sm:px-3 py-1 rounded-xl">
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-black text-emerald-300 tracking-wider block leading-none">
                1 TAP • GREEN
              </span>
              <span className="text-xs sm:text-sm font-black text-white leading-tight">
                ARRIVED
              </span>
            </div>
          </div>

          {/* Red Legend (2 Taps) */}
          <div className="flex items-center gap-2 bg-rose-950/70 border border-rose-500/50 px-2.5 sm:px-3 py-1 rounded-xl">
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-rose-500 shrink-0"></span>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-black text-rose-300 tracking-wider block leading-none">
                2 TAPS • RED
              </span>
              <span className="text-xs sm:text-sm font-black text-white leading-tight">
                LEFT
              </span>
            </div>
          </div>

          {/* Gray Legend (3 Taps) */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-2.5 sm:px-3 py-1 rounded-xl">
            <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-500 shrink-0"></span>
            <div>
              <span className="text-[9px] sm:text-[10px] uppercase font-black text-slate-400 tracking-wider block leading-none">
                3 TAPS • GRAY
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-300 leading-tight">
                NOT HERE
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Summary Counters */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold">
            <span className="text-base sm:text-lg font-black text-emerald-400">{stats.arrived}</span>
            <span className="text-[11px] sm:text-xs">Here Now</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold">
            <span className="text-base sm:text-lg font-black text-rose-400">{stats.departed}</span>
            <span className="text-[11px] sm:text-xs">Left</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold">
            <span className="text-base sm:text-lg font-black text-slate-200">{stats.notArrived}</span>
            <span className="text-[11px] sm:text-xs">Waiting</span>
          </div>
        </div>
      </div>
    </div>
  );
};
