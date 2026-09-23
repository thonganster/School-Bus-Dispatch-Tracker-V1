import React from 'react';
import { BusItem, BusState } from '../types';
import { BusTile } from './BusTile';

interface BusBoardProps {
  buses: BusItem[];
  onSetBusState: (busNumber: number, state: BusState) => void;
  isDarkTheme?: boolean;
}

export const BusBoard: React.FC<BusBoardProps> = ({
  buses,
  onSetBusState,
  isDarkTheme = true,
}) => {
  return (
    <div className="w-full h-full flex-1 p-2 sm:p-4 overflow-y-auto select-none">
      {/* 
        Responsive grid that accommodates 50 buses:
        - 10 columns on desktop / widescreen TV / iPad landscape
        - 8 columns on smaller tablets
        - 5 columns on portrait mobile/tablets
      */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5 lg:gap-3 max-w-[1920px] mx-auto h-full auto-rows-fr">
        {buses.map((bus) => (
          <BusTile
            key={bus.busNumber}
            bus={bus}
            onSetState={onSetBusState}
            isDarkTheme={isDarkTheme}
          />
        ))}
      </div>
    </div>
  );
};

