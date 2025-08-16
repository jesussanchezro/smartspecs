"use client";
import Link from "next/link";
import React from "react";
import { Meeting } from "@/smartspecs/app-lib/interfaces/meeting";
interface Props {
  meetings: Meeting[];
}

const MeetingList: React.FC<Props> = ({ meetings }) => {
  // Ordenar las reuniones por fecha de creación (más reciente primero)
  const sortedMeetings = [...meetings].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (!sortedMeetings.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No meetings registered for this project.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedMeetings.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {m.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {m.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link
                  href={`/meetings/${m.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors duration-150"
                >
                  View details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeetingList;