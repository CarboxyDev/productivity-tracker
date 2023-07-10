'use client';

import { Task } from '@/lib/types';
import { useStore } from '@/lib/store/useStore';
import {
  useActiveTaskId,
  useChangeTaskActiveState,
  useGetTasks,
  useSetActiveTask,
} from '@/lib/store/useTasks';
import { cn, secondsToAlphaTimeFormat } from '@/utils/util';

const Task = (props: { task: Task }) => {
  const task = props.task;
  const activeTaskID = useActiveTaskId();
  const changeTaskActiveState = useChangeTaskActiveState();
  const setActiveTask = useSetActiveTask();

  const switchTask = () => {
    if (activeTaskID === undefined) {
      return;
    }
    if (activeTaskID != task.id) {
      if (activeTaskID != undefined) {
        changeTaskActiveState(activeTaskID, false);
      }
      setActiveTask(task.id);
    }
  };

  return (
    <>
      <div
        onClick={() => switchTask()}
        className={cn(
          'hov hover: group group h-28 w-160 rounded-lg border border-transparent border-zinc-800 bg-zinc-900 shadow-sm transition-all delay-75 duration-300 ease-in-out hover:cursor-pointer hover:bg-zinc-925'
        )}
      >
        <div className="ml-7 flex h-full flex-row items-center">
          <div className="mr-auto flex flex-row items-center gap-x-8">
            <div
              className="h-12 w-12 rounded-full group-hover:animate-pulse"
              style={{ backgroundColor: task.color }}
            ></div>
            <div className="text-lg text-zinc-300">{task.name}</div>
          </div>
          <div
            className={cn(
              activeTaskID === task.id && 'hidden',
              'ml-auto mr-7 text-lg text-zinc-500'
            )}
          >
            {secondsToAlphaTimeFormat(task.duration)}
          </div>
          <div
            className={cn(
              activeTaskID != task.id && 'hidden',
              'ml-auto mr-7 h-4 w-4 rounded-full bg-green-500/80 group-hover:animate-none motion-safe:animate-pulse-slow'
            )}
          ></div>
        </div>
      </div>
    </>
  );
};

const TaskList = (): JSX.Element => {
  // This re-renders every time the taskStore is modified (which is every second) which is rather bad for performance
  // Try optimizing this in the future so that it only renders when absolutely needed
  console.log('Render Tasklist');
  const tasks = useStore(useGetTasks, (state) => state) as Task[];
  const activeTask = useStore(useActiveTaskId, (state) => state) as string;

  return (
    <>
      <div className="flex flex-col items-center gap-y-3">
        {tasks?.map((task) => {
          if (task.id == activeTask) {
            return <Task key={task.id} task={task} />;
          }
        })}
        {tasks?.map((task) => {
          if (task.id != activeTask) {
            return <Task key={task.id} task={task} />;
          }
        })}
      </div>
    </>
  );
};

export default TaskList;
