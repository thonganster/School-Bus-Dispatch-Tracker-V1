import React, { useState } from 'react';
import { 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings2, 
  Tv, 
  Sun, 
  Moon, 
  Search, 
  CheckCircle2, 
  X, 
  Tablet,
  Check
} from 'lucide-react';
import { BusState } from '../types';

interface QuickControlsProps {
  totalBuses: number;
  onChangeTotalBuses: (count: number) => void;
  onResetAll: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCleanTvMode: boolean;
  onToggleCleanTvMode: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onSetBusState: (busNumber: number, state: BusState) => void;
  onOpenInstallModal?: () => void;
}

export const QuickControls: React.FC<QuickControlsProps> = ({
  totalBuses,
  onChangeTotalBuses,
  onResetAll,
  soundEnabled,
  onToggleSound,
  isCleanTvMode,
  onToggleCleanTvMode,
  isDarkTheme,
  onToggleTheme,
  onSetBusState,
  onOpenInstallModal,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleQuickSet = (targetState: BusState) => {
    const num = parseInt(quickInput, 10);
    if (!isNaN(num) && num >= 1 && num <= totalBuses) {
      onSetBusState(num, targetState);
      setQuickInput('');
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickSet('arrived');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="w-full bg-slate-950 text-white px-3 sm:px-6 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Left: Quick bus number input for teacher on iPad */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleQuickSubmit} className="flex items-center gap-1.5">
          <input
            id="quick-bus-input"
            type="number"
            min={1}
            max={totalBuses}
            placeholder="Bus #"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            className="w-18 sm:w-20 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-center"
          />
          <button
            type="button"
            onClick={() => handleQuickSet('arrived')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors shadow-sm flex items-center gap-1"
            title="Mark Arrived (Green)"
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Green</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickSet('departed')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-xs transition-colors shadow-sm flex items-center gap-1"
            title="Mark Left (Red)"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Red</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickSet('not_arrived')}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors shadow-sm"
            title="Reset to Gray"
          >
            Gray
          </button>
        </form>

        {/* Bus Count Selectors */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
          <span className="text-slate-400 px-2">Buses:</span>
          {[30, 40, 50, 60].map((count) => (
            <button
              key={count}
              onClick={() => onChangeTotalBuses(count)}
              className={`px-2 py-1 rounded-md transition-colors ${
                totalBuses === count
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Right: iPad Action controls */}
      <div className="flex items-center gap-2">
        {/* Reset Confirmation */}
        {showConfirmReset ? (
          <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-600/60 p-1 rounded-lg">
            <span className="text-[11px] text-rose-200 px-1 font-semibold">Reset all to Gray?</span>
            <button
              onClick={() => {
                onResetAll();
                setShowConfirmReset(false);
              }}
              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[11px]"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            id="reset-all-buses-btn"
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-200 border border-slate-800 hover:border-rose-800/40 transition-colors"
            title="Reset all buses back to Gray for the next day"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Day</span>
          </button>
        )}

        {/* Audio chime toggle */}
        <button
          id="sound-toggle-btn"
          onClick={onToggleSound}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-amber-400'
              : 'bg-slate-900/50 border-slate-800 text-slate-500'
          }`}
          title={soundEnabled ? 'Arrival chimes are ON' : 'Arrival chimes are MUTED'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
        </button>

        {/* Dark/Light TV theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          title="Toggle High-Contrast Dark / Light Theme"
        >
          {isDarkTheme ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* iPad Offline App / Install Guide */}
        {onOpenInstallModal && (
          <button
            id="open-pwa-modal-btn"
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white border border-emerald-500/50 font-bold transition-colors"
            title="Install as offline app on iPad"
          >
            <Tablet className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Offline iPad App</span>
          </button>
        )}

        {/* Fullscreen TV Mode */}
        <button
          id="fullscreen-tv-btn"
          onClick={toggleFullScreen}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
          title="Toggle Fullscreen for TV display"
        >
          <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden lg:inline">Fullscreen TV</span>
        </button>
      </div>
    </div>
  );
};
