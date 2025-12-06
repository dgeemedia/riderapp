// admin/components/AssignModal.js
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function AssignModal({ open, onClose, task, riders = [], onAssign }) {
  const [selected, setSelected] = useState('');

  // reset when task changed
  useEffect(() => {
    setSelected('');
  }, [task]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6 shadow">
              <Dialog.Title className="text-lg font-semibold">Assign Task</Dialog.Title>

              <div className="mt-3">
                <div className="text-sm text-slate-600">Task: {task?.id}</div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700">Select Rider</label>
                  <select
                    value={selected}
                    onChange={e => setSelected(e.target.value)}
                    className="mt-1 w-full rounded border p-2"
                  >
                    <option value="">— choose rider —</option>
                    {riders.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name || r.phone} ({r.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
                <button
                  disabled={!selected}
                  onClick={() => onAssign(selected)}
                  className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
