'use client';

import { AssignmentTableData } from '@/app/manager/assignment/page';

interface Props {
    assignments: AssignmentTableData[];
}

const statusBadgeStyle = {
    Active: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const priorityBadgeStyle = {
    High: 'bg-red-100 text-red-700 dark:bg-red-300 dark:text-red-900',
    Medium: 'bg-orange-100 text-orange-700 dark:bg-orange-300 dark:text-orange-900',
    Low: 'bg-green-100 text-green-700 dark:bg-green-300 dark:text-green-900',
};

export default function AssignmentTable({ assignments }: Props) {
    return (
        <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Assignments</h2>
            </div>
            <hr className="w-full mb-4 dark:border-gray-700" />
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {assignments.length > 0 ? (
                    assignments.map((a) => (
                        <li
                            key={a.id}
                            className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition hover:bg-blue-50 dark:hover:bg-gray-800 px-4 rounded-md"
                        >
                            <div className="flex flex-col justify-between gap-1 flex-grow">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-2">
                                    {/* Lead Name and Position */}
                                    <p className="font-bold text-gray-900 text-xl dark:text-white">{a.name}</p>
                                    {a.position && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">({a.position})</p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {/* Category */}
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Category: {a.category}
                                    </span>
                                    {/* Status Badge */}
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadgeStyle[a.status]}`}>
                                        {a.status}
                                    </span>
                                    {/* Priority Badge */}
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityBadgeStyle[a.priority]}`}>
                                        {a.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 text-left sm:text-right dark:text-gray-300 mt-2 sm:mt-0">
                                Assigned to &nbsp;
                                <span className="font-bold text-lg text-gray-800 dark:text-white">{" " + a.assignedTo.toUpperCase()}</span>
                                {/* Due Date */}
                                <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Due Date: {a.dueDate}</p>
                            </div>
                        </li>
                    ))
                ) : (
                    <li className="py-4 text-center text-gray-500 dark:text-gray-400">No assignments found.</li>
                )}
            </ul>
        </div>
    );
}

// Add Worker type export for use in other components
export type Worker = {
    id: string;
    name: string;
};
