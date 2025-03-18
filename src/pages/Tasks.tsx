import React, { useState } from 'react';
import { CheckSquare, Square, Trash2, Upload, Plus, X } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TasksProps {
  darkMode: boolean;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (source: string) => void;
  darkMode: boolean;
}

function ImportModal({ isOpen, onClose, onImport, darkMode }: ImportModalProps) {
  const [source, setSource] = useState<'google' | 'microsoft'>('google');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-md transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Tasks</h2>
          <button onClick={onClose} className={`p-1 rounded hover:bg-opacity-10 ${
            darkMode ? 'hover:bg-white' : 'hover:bg-gray-100'
          }`}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className={`block text-sm font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Source
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setSource('google')}
                className={`flex-1 p-3 rounded-md border transition-colors ${
                  source === 'google'
                    ? 'border-[#e8c4b8] bg-[#e8c4b8]/10'
                    : darkMode
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-medium">Google Keep</span>
                </div>
              </button>
              <button
                onClick={() => setSource('microsoft')}
                className={`flex-1 p-3 rounded-md border transition-colors ${
                  source === 'microsoft'
                    ? 'border-[#e8c4b8] bg-[#e8c4b8]/10'
                    : darkMode
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-medium">Microsoft Notes</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onImport(source)}
              className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md text-sm font-medium hover:bg-[#ddb3a7] transition-colors duration-300 flex items-center gap-2"
            >
              <Upload size={16} />
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks({ darkMode }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Review Johnson case documents', completed: false },
    { id: '2', text: 'Prepare for Williams estate hearing', completed: true },
    { id: '3', text: 'Schedule client meeting for TechCo merger', completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleImport = (source: string) => {
    // Simulate importing tasks from external source
    const importedTasks: Task[] = [
      { id: `${source}-1`, text: `Imported task 1 from ${source}`, completed: false },
      { id: `${source}-2`, text: `Imported task 2 from ${source}`, completed: false },
      { id: `${source}-3`, text: `Imported task 3 from ${source}`, completed: true },
    ];
    
    setTasks([...tasks, ...importedTasks]);
    setIsImportModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>Tasks</h1>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md text-sm font-medium hover:bg-[#ddb3a7] transition-colors duration-300 flex items-center gap-2"
        >
          <Upload size={16} />
          Import Tasks
        </button>
      </div>

      <div className={`rounded-lg shadow p-6 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new task..."
              className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8c4b8] transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                  : 'bg-gray-50 text-gray-900 border-gray-200'
              } border`}
            />
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-[#e8c4b8] text-gray-900 rounded-md font-medium hover:bg-[#ddb3a7] transition-colors duration-300"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
                darkMode 
                  ? 'hover:bg-gray-700 border-gray-700' 
                  : 'hover:bg-gray-50 border-gray-200'
              } border`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`flex items-center justify-center w-5 h-5 rounded transition-colors duration-300 ${
                    task.completed 
                      ? 'bg-[#e8c4b8]' 
                      : darkMode 
                        ? 'border-2 border-gray-400 hover:border-gray-300' 
                        : 'border-2 border-gray-400 hover:border-gray-500'
                  }`}
                >
                  {task.completed && (
                    <CheckSquare size={16} className="text-white" />
                  )}
                </button>
                <span className={`${
                  task.completed 
                    ? 'line-through ' + (darkMode ? 'text-gray-500' : 'text-gray-400')
                    : darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {task.text}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className={`p-1 rounded-md transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                }`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No tasks yet. Add a task to get started.
            </div>
          )}
        </div>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        darkMode={darkMode}
      />
    </div>
  );
}