'use client';

import { useStore } from '@/lib/store/useStore';
import {
  getTasks,
  useActiveTaskId,
  useAddTimestamp,
  useChangeIfTimerRunning,
  useSetActiveTask,
  useSetDuration,
  useTasks,
} from '@/lib/store/useTasks';
import { Task } from '@/lib/types';
import {
  cn,
  secondsToAlphaTimeFormat,
  secondsToTimeFormat,
} from '@/utils/util';

import { IconifyIcon } from '@/components/Icon';
import { calculateTimerDuration } from '@/lib/timer/timer';
import * as Dialog from '@radix-ui/react-dialog';
import { IBM_Plex_Mono } from 'next/font/google';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  ResetActiveTaskConfirmationDialog,
  SaveSessionConfirmationDialog,
  SyncTasksConfirmationDialog,
} from './dialogs';

const timerFont = IBM_Plex_Mono({ weight: '400', subsets: ['latin'] });

interface TimeFormat {
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimeDisplayProps {
  time: TimeFormat;
}

const TimeDisplay = (props: TimeDisplayProps) => {
  const { hours, minutes, seconds } = props.time;
  return (
    <>
      <div>
        <div
          className={cn(
            timerFont.className,
            'text-6xl text-dark-300 md:text-7xl'
          )}
        >
          <span className={cn(hours && '')}>
            {hours.toString().padStart(2, '0')}:
          </span>
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </>
  );
};

export const Timer = () => {
  const taskStore = useStore(useTasks, (state) => state);
  const [activeTask, setActiveTask] = useState<Task | undefined>(undefined);
  const addTimestampToActiveTask = useAddTimestamp();
  const setDuration = useSetDuration();

  useEffect(() => {
    const tasks = taskStore?.tasks;

    const getActiveTask = (): Task | undefined => {
      const activeTaskID = taskStore?.activeTask;
      const _activeTask = tasks?.find((t) => {
        return t.id === activeTaskID;
      });

      return _activeTask;
    };

    setActiveTask(getActiveTask());

    const clientCalculateTime = setInterval(() => {
      if (activeTask?.isTimerRunning) {
        const currentDuration = calculateTimerDuration(
          activeTask.timerTimestamps
        );
        setDuration(activeTask.id, currentDuration);
      }
    }, 1000);

    return () => clearInterval(clientCalculateTime);
  }, [taskStore, activeTask, setDuration]);

  const toggleTaskTimer = (): void => {
    if (activeTask == undefined || taskStore == undefined) {
      return;
    }

    const currentTime = new Date();
    if (activeTask.isTimerRunning) {
      addTimestampToActiveTask('pause', currentTime);
    } else if (!activeTask.isTimerRunning) {
      addTimestampToActiveTask('play', currentTime);
    }
    // Finally change the timer to its complementary state
    taskStore.changeIfTimerRunning(activeTask.id, !activeTask.isTimerRunning);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div>
        <TimeDisplay time={secondsToTimeFormat(activeTask?.duration || 0)} />
      </div>
      <div className="mt-12 flex flex-row gap-x-2">
        <button
          className="flex h-16 w-16 items-center justify-center rounded-full border border-transparent bg-dark-900 text-dark-400 transition delay-300 duration-500 ease-in-out hover:border-dark-800 hover:text-dark-600"
          onClick={() => toggleTaskTimer()}
        >
          {activeTask?.isTimerRunning ? (
            <IconifyIcon icon="ph:pause-fill" className="h-6 w-6" />
          ) : (
            <IconifyIcon icon="ph:play-fill" className="h-6 w-6" />
          )}
        </button>
      </div>
    </div>
  );
};

const TaskCard = (props: { task: Task }) => {
  const task = props.task;
  const activeTaskID = useActiveTaskId();
  const changeTaskActiveState = useChangeIfTimerRunning();
  const setActiveTask = useSetActiveTask();
  const addTimestampToActiveTask = useAddTimestamp();

  const switchTask = () => {
    if (activeTaskID === undefined) {
      return;
    }
    if (activeTaskID != task.id) {
      if (activeTaskID != undefined) {
        changeTaskActiveState(activeTaskID, false);
        addTimestampToActiveTask('pause', new Date());
      }
      setActiveTask(task.id);
    }
  };

  return (
    <>
      <div
        onClick={() => switchTask()}
        className={cn(
          'group h-24 w-11/12 rounded-lg border border-dark-800 bg-dark-900 shadow-sm transition-all delay-200 duration-300 ease-in-out hover:cursor-pointer hover:border-dark-700 md:mx-0 md:h-28 md:w-160'
        )}
      >
        <div className="ml-5 flex h-full flex-row items-center md:ml-7">
          <div className="mr-auto flex flex-row items-center gap-x-4 md:gap-x-8">
            <div
              className="h-9 w-9 rounded-full group-hover:animate-pulse md:h-12 md:w-12"
              style={{ backgroundColor: task.color }}
            ></div>
            <div className="text-base text-dark-300 md:text-lg">
              {task.name}
            </div>
          </div>
          <div
            className={cn(
              activeTaskID === task.id && 'hidden',
              'ml-auto mr-5 text-base text-dark-500 md:mr-7 md:text-lg'
            )}
          >
            {secondsToAlphaTimeFormat(task.duration, true)}
          </div>
          <div
            className={cn(
              activeTaskID != task.id && 'hidden',
              'ml-auto mr-5 h-3 w-3 rounded-full bg-green-500/80 group-hover:animate-none motion-safe:animate-pulse-slow md:mr-7 md:h-4 md:w-4'
            )}
          ></div>
        </div>
      </div>
    </>
  );
};

export const TaskList = (): JSX.Element => {
  const tasks = useStore(getTasks, (state) => state) as Task[];
  const activeTaskID = useStore(useActiveTaskId, (state) => state) as string;

  return (
    <>
      <div className="flex flex-col items-center gap-y-3">
        {tasks?.map((task) => {
          if (task.id == activeTaskID) {
            return <TaskCard key={task.id} task={task} />;
          }
        })}
        {tasks?.map((task) => {
          if (task.id != activeTaskID) {
            return <TaskCard key={task.id} task={task} />;
          }
        })}
      </div>
    </>
  );
};

export const ActionButton = () => {
  console.log('Render ActionButton');
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="inline-flex">
        <button
          onClick={() => setOpen(!open)}
          title="View actions"
          className="group flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500 text-dark-200 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-primary-600 active:scale-105"
        >
          <IconifyIcon
            icon="ic:round-timer"
            className={cn(open && '', 'h-7 w-7 text-dark-200')}
          />
        </button>
        {open && (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                title="Save session"
                className="group absolute bottom-14 right-0 flex h-12 w-12 items-center justify-center rounded-lg bg-dark-800 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-emerald-500 active:scale-105"
              >
                <IconifyIcon
                  icon="mdi:success"
                  className="h-7 w-7 text-dark-300"
                />
              </button>
            </Dialog.Trigger>
            <SaveSessionConfirmationDialog setActionMenuOpen={setOpen} />
          </Dialog.Root>
        )}
        {open && (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                title="Reset task"
                className="group absolute right-14 flex h-12 w-12 items-center justify-center rounded-lg bg-dark-800 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-red-600 active:scale-105"
              >
                <IconifyIcon
                  icon="mdi:trash-outline"
                  className="h-7 w-7 text-dark-300"
                />
              </button>
            </Dialog.Trigger>
            <ResetActiveTaskConfirmationDialog setActionMenuOpen={setOpen} />
          </Dialog.Root>
        )}
        {open && <SyncTasksButton setActionMenuOpen={setOpen} />}
      </div>
    </>
  );
};

interface syncTasksButtonProps {
  setActionMenuOpen: Dispatch<SetStateAction<boolean>>;
}

const SyncTasksButton = (props: syncTasksButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      {' '}
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger asChild>
          <button
            title="Sync tasks"
            className="group absolute bottom-14 right-14 flex h-12 w-12 items-center justify-center rounded-lg bg-dark-800 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-sky-500 active:scale-105"
          >
            <IconifyIcon icon="mdi:sync" className="h-7 w-7 text-dark-300" />
          </button>
        </Dialog.Trigger>
        <SyncTasksConfirmationDialog {...props} setDialogOpen={setDialogOpen} />
      </Dialog.Root>
    </>
  );
};
