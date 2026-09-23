/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BusItem, BusState, BoardStats } from './types';
import { BoardHeader } from './components/BoardHeader';
import { BusBoard } from './components/BusBoard';
import { QuickControls } from './components/QuickControls';
import { PWAInstallModal } from './components/PWAInstallModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { playArrivalChime, playDepartChime } from './utils/audio';

const STORAGE_KEY_BUS_BOARD = 'school_bus_board_50_v2';
const STORAGE_KEY_COUNT = 'school_bus_board_count_v2';
const STORAGE_KEY_SOUND = 'school_bus_board_sound_v2';
const STORAGE_KEY_THEME = 'school_bus_board_theme_v2';

const DEFAULT_BUS_COUNT = 50;

function createInitialBuses(count: number): BusItem[] {
  const list: BusItem[] = [];
  for (let i = 1; i <= count; i++) {
    // Provide a clean initial state (all gray)
    let state: BusState = 'not_arrived';
    let arrivedAt: string | undefined = undefined;
    let departedAt: string | undefined = undefined;

    if (i === 1) {
      state = 'arrived';
      arrivedAt = '3:15 PM';
    } else if (i === 7) {
      state = 'arrived';
      arrivedAt = '3:18 PM';
    } else if (i === 3) {
      state = 'departed';
      departedAt = '3:12 PM';
    }

    list.push({
      id: i,
      busNumber: i,
      state,
      arrivedAt,
      departedAt,
    });
  }
  return list;
}

export default function App() {
  const [totalBuses, setTotalBuses] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUNT);
      return saved ? parseInt(saved, 10) : DEFAULT_BUS_COUNT;
    } catch {
      return DEFAULT_BUS_COUNT;
    }
  });

  const [buses, setBuses] = useState<BusItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUS_BOARD);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading saved buses', e);
    }
    return createInitialBuses(DEFAULT_BUS_COUNT);
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isCleanTvMode, setIsCleanTvMode] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const isOnline = useOnlineStatus();

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUS_BOARD, JSON.stringify(buses));
    } catch (e) {
      console.warn('Error saving buses', e);
    }
  }, [buses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COUNT, totalBuses.toString());
    } catch (e) {
      console.warn('Error saving total buses', e);
    }
  }, [totalBuses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, JSON.stringify(soundEnabled));
    } catch (e) {
      console.warn('Error saving sound preference', e);
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, JSON.stringify(isDarkTheme));
    } catch (e) {
      console.warn('Error saving theme', e);
    }
  }, [isDarkTheme]);

  // Adjust bus count if user switches between 30, 40, 50, 60
  const handleChangeTotalBuses = (newCount: number) => {
    setTotalBuses(newCount);
    setBuses(prev => {
      if (prev.length === newCount) return prev;
      if (prev.length < newCount) {
        const added: BusItem[] = [];
        for (let i = prev.length + 1; i <= newCount; i++) {
          added.push({
            id: i,
            busNumber: i,
            state: 'not_arrived',
          });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, newCount);
      }
    });
  };

  /**
   * Direct state setting triggered by gestures:
   * - 1 tap -> 'arrived' (Green)
   * - 2 quick taps -> 'departed' (Red)
   * - 3 quick taps -> 'not_arrived' (Gray)
   */
  const handleSetBusState = (busNumber: number, targetState: BusState) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setBuses(prev => prev.map(bus => {
      if (bus.busNumber !== busNumber) return bus;

      if (targetState === 'arrived') {
        if (soundEnabled) {
          playArrivalChime();
        }
        return {
          ...bus,
          state: 'arrived',
          arrivedAt: nowTimeStr,
          departedAt: undefined,
        };
      } else if (targetState === 'departed') {
        if (soundEnabled) {
          playDepartChime();
        }
        return {
          ...bus,
          state: 'departed',
          departedAt: nowTimeStr,
        };
      } else {
        // 'not_arrived' (Gray / Reset)
        return {
          ...bus,
          state: 'not_arrived',
          arrivedAt: undefined,
          departedAt: undefined,
        };
      }
    }));
  };

  // Reset all buses to Gray for the next day
  const handleResetAll = () => {
    setBuses(prev => prev.map(b => ({
      ...b,
      state: 'not_arrived',
      arrivedAt: undefined,
      departedAt: undefined,
    })));
  };

  // Stats calculation
  const stats: BoardStats = {
    total: buses.length,
    notArrived: buses.filter(b => b.state === 'not_arrived').length,
    arrived: buses.filter(b => b.state === 'arrived').length,
    departed: buses.filter(b => b.state === 'departed').length,
  };

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden select-none font-sans ${
      isDarkTheme ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* High-visibility TV Header & Color Legend for the Kids */}
      <BoardHeader
        stats={stats}
        isCleanTvMode={isCleanTvMode}
        schoolName="School Bus Dismissal Board"
        isOnline={isOnline}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Bus Tiles Grid (High contrast, giant numbers for viewing on TV) */}
      <BusBoard
        buses={buses}
        onSetBusState={handleSetBusState}
        isDarkTheme={isDarkTheme}
      />

      {/* iPad Operator Controls (Bus number quick-jump, bus count, sound, reset, TV fullscreen) */}
      <QuickControls
        totalBuses={totalBuses}
        onChangeTotalBuses={handleChangeTotalBuses}
        onResetAll={handleResetAll}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isCleanTvMode={isCleanTvMode}
        onToggleCleanTvMode={() => setIsCleanTvMode(!isCleanTvMode)}
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
        onSetBusState={handleSetBusState}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* iPad Installation & Offline Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isOnline={isOnline}
      />

      {/* Non-intrusive offline indicator if iPad disconnects from Wi-Fi */}
      {!isOnline && (
        <div 
          onClick={() => setIsInstallModalOpen(true)}
          className="fixed bottom-14 left-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg cursor-pointer hover:bg-amber-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping"></span>
          <span>Offline Mode — All bus changes saved locally on iPad</span>
        </div>
      )}
    </div>
  );
}
