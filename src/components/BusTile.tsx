import React, { useRef, useState, useEffect } from 'react';
import { BusItem, BusState } from '../types';
import { BusFront, X, Check, Lock } from 'lucide-react';

interface BusTileProps {
  bus: BusItem;
  onSetState: (busNumber: number, state: BusState) => void;
  isDarkTheme?: boolean;
}

export const BusTile: React.FC<BusTileProps> = ({
  bus,
  onSetState,
  isDarkTheme = true,
}) => {
  const clickCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tapPreview, setTapPreview] = useState<number>(0);
  const [isPressing, setIsPressing] = useState(false);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const isDeparted = bus.state === 'departed';
  const isArrived = bus.state === 'arrived';
  const isNotArrived = bus.state === 'not_arrived';

  const handleClick = (e: React.MouseEvent) => {
    // Increment the tap counter for this specific bus
    clickCountRef.current += 1;
    const currentCount = clickCountRef.current;
    setTapPreview(currentCount);

    // Cancel any previous scheduled timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // SPECIAL RULE: When a bus is RED (Departed/Left), 1 tap must NOT turn it green.
    // ONLY a quick triple tap (3 taps) can reset/turn it back to Gray.
    if (isDeparted) {
      if (currentCount >= 3) {
        clickCountRef.current = 0;
        setTapPreview(0);
        onSetState(bus.busNumber, 'not_arrived');
      } else {
        // Schedule timer to reset the counter if 3rd tap doesn't arrive within 350ms
        timerRef.current = setTimeout(() => {
          clickCountRef.current = 0;
          setTapPreview(0);
        }, 350);
      }
      return;
    }

    // NORMAL RULES (When Gray or Green):
    if (currentCount >= 3) {
      // 3 QUICK TAPS -> Immediately go to Gray (Not Arrived / Reset)
      clickCountRef.current = 0;
      setTapPreview(0);
      onSetState(bus.busNumber, 'not_arrived');
    } else if (currentCount === 2) {
      // 2 QUICK TAPS -> Wait 240ms in case a 3rd tap follows; otherwise go to Red (Departed)
      timerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        setTapPreview(0);
        onSetState(bus.busNumber, 'departed');
      }, 240);
    } else {
      // 1 TAP -> Wait 280ms in case user is doing a double/triple tap; otherwise go to Green (Arrived)
      timerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        setTapPreview(0);
        onSetState(bus.busNumber, 'arrived');
      }, 280);
    }
  };

  let containerClasses = '';
  let badgeClasses = '';
  let numberClasses = '';
  let statusText = 'NOT HERE';
  let statusSubtext = '';

  if (isArrived) {
    // GREEN: Bus arrived
    containerClasses = `
      bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
      text-white border-2 border-emerald-400
      shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400/40
      scale-[1.02] transform transition-all
    `;
    badgeClasses = 'bg-emerald-900/80 text-emerald-200 border border-emerald-400/50';
    numberClasses = 'text-white drop-shadow-md';
    statusText = 'ARRIVED';
    statusSubtext = bus.arrivedAt || '';
  } else if (isDeparted) {
    // RED: Bus left (Locked against 1-tap accidental reactivations)
    containerClasses = `
      bg-rose-700 hover:bg-rose-600 active:bg-rose-800
      text-white border-2 border-rose-400
      shadow-lg shadow-rose-950/40
      transition-colors
    `;
    badgeClasses = 'bg-rose-950/80 text-rose-200 border border-rose-400/50';
    numberClasses = 'text-white drop-shadow-md';
    statusText = 'LEFT';
    statusSubtext = bus.departedAt || '';
  } else {
    // GRAY: Not arrived yet
    containerClasses = isDarkTheme
      ? `bg-slate-800/90 hover:bg-slate-700 active:bg-slate-800/70 text-slate-300 border border-slate-700/80 shadow-sm transition-colors`
      : `bg-slate-200 hover:bg-slate-300 active:bg-slate-200 text-slate-600 border border-slate-300 shadow-sm transition-colors`;
    badgeClasses = isDarkTheme
      ? 'bg-slate-900/60 text-slate-400 border border-slate-700/50'
      : 'bg-slate-300/80 text-slate-600 border border-slate-400/40';
    numberClasses = isDarkTheme ? 'text-slate-200' : 'text-slate-700';
    statusText = 'NOT HERE';
    statusSubtext = '';
  }

  return (
    <button
      id={`bus-tile-${bus.busNumber}`}
      onClick={handleClick}
      onMouseDown={() => setIsPressing(true)}
      onMouseUp={() => setIsPressing(false)}
      onTouchStart={() => setIsPressing(true)}
      onTouchEnd={() => setIsPressing(false)}
      className={`
        relative flex flex-col items-center justify-between
        p-2 sm:p-3 rounded-2xl cursor-pointer
        transition-all duration-150 select-none
        min-h-[85px] sm:min-h-[105px] lg:min-h-[115px]
        touch-manipulation
        ${isPressing ? 'scale-95 brightness-110' : ''}
        ${containerClasses}
      `}
      title={
        isDeparted
          ? `Bus #${bus.busNumber} has left. 1 tap is ignored. Quick triple-tap to reset to Gray.`
          : `Bus #${bus.busNumber}: 1 Tap = Green, 2 Taps = Red, 3 Taps = Gray`
      }
      style={{ touchAction: 'manipulation' }}
    >
      {/* Visual Indicator of Rapid Tap In Progress */}
      {tapPreview > 0 && (
        <div
          className={`absolute -top-1.5 -right-1.5 z-20 flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-black font-mono shadow-md border animate-bounce ${
            isDeparted
              ? 'bg-amber-400 text-slate-950 border-amber-200'
              : tapPreview === 1
              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
              : tapPreview === 2
              ? 'bg-rose-500 text-white border-rose-300'
              : 'bg-slate-400 text-slate-950 border-white'
          }`}
        >
          {isDeparted ? (
            <span>{tapPreview}/3 ⚪</span>
          ) : (
            <>
              {tapPreview === 1 && '1x 🟢'}
              {tapPreview === 2 && '2x 🔴'}
              {tapPreview >= 3 && '3x ⚪'}
            </>
          )}
        </div>
      )}

      {/* Top Row: Mini Bus Icon & Status Indicator */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1">
          <BusFront
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isArrived ? 'text-emerald-200' : isDeparted ? 'text-rose-200' : 'text-slate-400'
            }`}
          />
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider opacity-80">
            BUS
          </span>
        </div>

        {/* Status Dot / Indicator */}
        <div className="flex items-center">
          {isArrived && (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          )}
          {isDeparted && <X className="w-3.5 h-3.5 text-white" />}
          {isNotArrived && <span className="w-2 h-2 rounded-full bg-slate-500 opacity-60"></span>}
        </div>
      </div>

      {/* Center: GIANT BUS NUMBER FOR TV / CLASSROOM READABILITY */}
      <div className="flex-1 flex items-center justify-center py-0.5">
        <span
          className={`font-black tracking-tight leading-none ${numberClasses} text-3xl sm:text-4xl lg:text-5xl font-mono`}
        >
          {bus.busNumber}
        </span>
      </div>

      {/* Bottom: Status Pill Badge */}
      <div className="w-full flex flex-col items-center mt-1">
        <span
          className={`text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-md tracking-wider leading-none ${badgeClasses}`}
        >
          {statusText}
        </span>
        {statusSubtext && (
          <span className="text-[9px] sm:text-[10px] font-mono opacity-80 mt-0.5 leading-none">
            {statusSubtext}
          </span>
        )}
      </div>
    </button>
  );
};
