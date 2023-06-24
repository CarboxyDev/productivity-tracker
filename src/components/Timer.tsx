'use client';

import { useStore } from '@/lib/store/useStore';
import { useTimer } from '@/lib/store/useTimer';
import { secondsToTimeFormat } from '@/utils/util';
import { useEffect } from 'react';
import TimeDisplay from './TimeDisplay';

const Timer = () => {
  const persistentTimer = useStore(useTimer, (state) => state);

  useEffect(() => {
    const clientCalculateTime = setInterval(() => {
      if (persistentTimer?.isActive) {
        persistentTimer?.setDuration(persistentTimer?.duration + 1);
      }
    }, 1000);

    return () => clearInterval(clientCalculateTime);
  }, [persistentTimer]);

  return (
    <div className="flex flex-col justify-center items-center">
      <div>
        <TimeDisplay
          time={secondsToTimeFormat(persistentTimer?.duration || 0)}
        />
      </div>
      <div className="mt-4 gap-x-2 flex flex-row">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={() =>
            persistentTimer?.setIsActive(!persistentTimer?.isActive)
          }
        >
          {persistentTimer?.isActive ? 'Pause' : 'Start'}
        </button>
        <button
          className="px-4 py-2 bg-slate-500 text-white rounded-lg"
          onClick={() => persistentTimer?.reset()}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
