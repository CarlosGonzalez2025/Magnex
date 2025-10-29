import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg transition-transform transform hover:-translate-y-1">
      <p className="text-sm font-medium text-gray-400 truncate">{title}</p>
      <p className={`text-4xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
};
