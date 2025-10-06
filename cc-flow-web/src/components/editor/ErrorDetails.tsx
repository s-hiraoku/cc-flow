import React from 'react';
import { GenerateError } from './types';

interface ErrorDetailsProps {
  error: GenerateError;
}

/**
 * Error details component that displays error information
 * with step, message, and optional details
 */
export default function ErrorDetails({ error }: ErrorDetailsProps) {
  return (
    <div className="mt-3 pt-3 border-t border-blue-200">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 mr-2 text-rose-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <p className="font-medium text-rose-700">Failed to generate workflow</p>
          <div className="mt-2 p-2 bg-rose-50 rounded-md border border-rose-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
              Error at step: {error.step}
            </p>
            <p className="mt-1 text-sm font-medium text-rose-700">{error.message}</p>
          </div>
          {error.details && error.details.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-800 mb-1">
                Details:
              </p>
              <ul className="list-disc list-inside space-y-1 text-rose-700">
                {error.details.map((detail, index) => (
                  <li key={index} className="text-xs">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
