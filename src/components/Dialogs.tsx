import { getTasks, useRefreshTasks } from '@/lib/store/useTasks';
import { SessionSnapshot } from '@/lib/types';
import { notifyPromise } from '@/utils/notify';
import { Icon } from '@iconify/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';

const SaveSessionConfirmationDialog = (props: {
  setActionMenuOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const refreshTasks = useRefreshTasks();

  const sessionMutation = useMutation({
    mutationFn: async (sessionSnapshot: SessionSnapshot) => {
      const save = axios.post('/api/session', sessionSnapshot, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      notifyPromise(save, {
        loading: 'Saving session...',
        success: 'Saved your session',
        error: 'Unable to save your session',
      });

      // Close the Action buttons menu
      props.setActionMenuOpen(false);

      return save;
    },
    onSuccess: () => {
      refreshTasks();
    },
    onError: () => {},
  });

  const saveSession = async () => {
    const sessionSnapshot = getTasks();
    sessionMutation.mutate({
      session: sessionSnapshot,
    });
  };

  return (
    <>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:insert-animate-here fixed inset-0 bg-zinc-900/40" />
        <Dialog.Content className="fixed left-[50%] top-[50%] w-100 translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-zinc-950 px-6 py-8 shadow-xl">
          <div className="flex flex-row">
            <Dialog.Title className="mr-auto text-lg font-semibold text-zinc-300">
              Save Session
            </Dialog.Title>
            <Dialog.Close asChild className="ml-auto">
              <button>
                <Icon
                  icon="maki:cross"
                  className="h-5 w-5 text-zinc-500"
                ></Icon>
              </button>
            </Dialog.Close>
          </div>
          <div className="mx-auto mt-12 flex flex-col">
            <h3 className="text-center text-[22px] font-medium text-zinc-300">
              Are you sure you want to save the current session?
            </h3>
            <div className="mx-6 mt-12 text-zinc-500">
              <ul className="list-outside list-disc">
                <li className="mb-4">
                  The current session will be saved in our database.
                </li>
                <li className="mb-4">
                  You may access all your saved sessions by going to the{' '}
                  <Link href="/history" className="text-violet-400">
                    History
                  </Link>{' '}
                  page.
                </li>
                <li>This will reset all the task timers.</li>
              </ul>
            </div>

            <button
              className="mt-12 flex h-11 items-center justify-center rounded-lg bg-violet-500 text-lg font-medium text-zinc-200 transition delay-200 duration-200 ease-in-out hover:scale-105 hover:bg-violet-600"
              type="submit"
              onClick={() => {
                saveSession();
              }}
            >
              Confirm
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </>
  );
};

export default SaveSessionConfirmationDialog;
