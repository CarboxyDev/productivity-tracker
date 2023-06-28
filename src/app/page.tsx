import ActionButton from '@/components/ActionButton';
import TaskList from '@/components/TaskList';
import Timer from '@/components/Timer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mt-36">
        <Timer />
        <div className="mt-24"></div>
        <TaskList />
        <div className="fixed right-4 bottom-4">
          <ActionButton />
        </div>
      </div>
    </main>
  );
}
