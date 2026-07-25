import { useParams, useNavigate } from 'react-router-dom';
import { TASK_STATUS } from '../api/enums';
import type { Task } from '@wrike-clone/shared';
import { useTask, useUpdateTask } from '../api/tasks';
import type { UpdateTaskRequest } from '@wrike-clone/shared';
import { TaskForm } from '../components/Task/TaskForm';
import { CommentSection } from '../components/Comments/CommentSection';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useState } from 'react';

const statusOptions: { value: string; label: string }[] = [
  { value: TASK_STATUS.BACKLOG, label: 'Backlog' },
  { value: TASK_STATUS.TODO, label: 'To Do' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: TASK_STATUS.IN_REVIEW, label: 'In Review' },
  { value: TASK_STATUS.DONE, label: 'Done' },
  { value: TASK_STATUS.CANCELLED, label: 'Cancelled' },
];

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, error, refetch } = useTask(taskId!);
  const updateTask = useUpdateTask();
  const [isEditing, setIsEditing] = useState(false);

  const handleStatusChange = async (status: string) => {
    try {
      await updateTask.mutateAsync({ id: taskId!, status: status as Task['status'] });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateTask = async (values: Partial<Task>) => {
    try {
      await updateTask.mutateAsync({ id: taskId!, ...values } as UpdateTaskRequest & { id: string });
      toast.success('Task updated');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update task');
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="mt-20" size="lg" />;
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <ErrorDisplay title="Task not found" message="This task does not exist or you don't have access." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>

      {isEditing ? (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Edit Task</h2>
          <TaskForm
            initialValues={task}
            onSubmit={handleUpdateTask}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          {/* Title and actions */}
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-ghost btn-sm"
              >
                Edit
              </button>
            </div>
            {task.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input text-sm"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <p className={clsx('mt-1 text-sm font-medium capitalize', `priority-${task.priority}`)}>
                {task.priority}
              </p>
            </div>
            <div>
              <label className="label">Assignee</label>
              <p className="mt-1 text-sm text-slate-600">
                {task.assigneeId || 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="mb-6 grid grid-cols-3 gap-4 text-sm">
            {task.startDate && (
              <div>
                <span className="text-slate-400">Start:</span>{' '}
                <span className="text-slate-700">{format(new Date(task.startDate), 'MMM d, yyyy')}</span>
              </div>
            )}
            {task.dueDate && (
              <div>
                <span className="text-slate-400">Due:</span>{' '}
                <span className="text-slate-700">{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
            {task.estimatedHours != null && (
              <div>
                <span className="text-slate-400">Est. hours:</span>{' '}
                <span className="text-slate-700">{task.estimatedHours}</span>
              </div>
            )}
          </div>

          {/* Time tracking */}
          <div className="card mb-6 p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Time Tracking</h3>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-slate-400">Estimated:</span>{' '}
                <span className="font-medium text-slate-700">{task.estimatedHours || 0}h</span>
              </div>
              <div>
                <span className="text-slate-400">Logged:</span>{' '}
                <span className="font-medium text-slate-700">{task.actualHours || 0}h</span>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <CommentSection taskId={task.id} />
        </>
      )}
    </div>
  );
}
