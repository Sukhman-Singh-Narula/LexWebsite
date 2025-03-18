import React, { useState } from 'react';
import { MoreVertical, Grid, List } from 'lucide-react';

const cases = [
  {
    id: 1,
    name: 'Johnson vs. Smith Corp',
    client: 'Robert Johnson',
    lastUpdated: '2024-03-10',
    status: 'Open',
    priority: 'High'
  },
  {
    id: 2,
    name: 'Estate Planning - Williams',
    client: 'Sarah Williams',
    lastUpdated: '2024-03-09',
    status: 'Open',
    priority: 'Medium'
  },
  {
    id: 3,
    name: 'Corporate Merger - TechCo',
    client: 'TechCo Inc.',
    lastUpdated: '2024-03-08',
    status: 'Closed',
    priority: 'Low'
  }
];

const priorityColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-green-100 text-green-800'
};

const statusColors = {
  Open: 'bg-blue-100 text-blue-800',
  Closed: 'bg-gray-100 text-gray-800'
};

interface CaseGridProps {
  darkMode: boolean;
}

export default function CaseGrid({ darkMode }: CaseGridProps) {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  return (
    <div className={`p-6 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Welcome to Lawgorithm
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Your AI-powered legal assistant
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Cases</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('grid')}
            className={`p-2 rounded ${
              viewType === 'grid' 
                ? darkMode ? 'bg-gray-700' : 'bg-gray-200' 
                : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Grid size={20} className={darkMode ? 'text-white' : 'text-gray-700'} />
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`p-2 rounded ${
              viewType === 'list' 
                ? darkMode ? 'bg-gray-700' : 'bg-gray-200' 
                : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <List size={20} className={darkMode ? 'text-white' : 'text-gray-700'} />
          </button>
        </div>
      </div>

      <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
        {cases.map((case_) => (
          <div 
            key={case_.id} 
            className={`rounded-lg border p-4 hover:shadow-lg transition-shadow ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {case_.name}
              </h3>
              <button className={`p-1 rounded ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
                <MoreVertical size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
            <div className="space-y-2">
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Client: {case_.client}</p>
              <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
                Last updated: {case_.lastUpdated}
              </p>
              <div className="flex gap-2 mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[case_.status as keyof typeof statusColors]}`}>
                  {case_.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[case_.priority as keyof typeof priorityColors]}`}>
                  {case_.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}