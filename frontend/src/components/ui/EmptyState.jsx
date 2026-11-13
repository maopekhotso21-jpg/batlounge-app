import { Inbox } from 'lucide-react';

// Shows a consistent empty result message with an optional icon component.
export default function EmptyState({ message = 'No records found', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 text-gray-500">
      <Icon size={34} strokeWidth={1.5} className="mb-2 text-gray-400" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
