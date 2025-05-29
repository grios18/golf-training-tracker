'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Drill {
  id: string;
  name: string;
  shots: number;
  date: string;
}

export default function DailyTracking() {
  const searchParams = useSearchParams();
  const [drills, setDrills] = useState<Drill[]>([]);
  const [savedDrills, setSavedDrills] = useState<string[]>([]);
  const [newDrill, setNewDrill] = useState({ name: '', shots: '' });
  const [selectedSavedDrill, setSelectedSavedDrill] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  );

  // Load saved drills and today's drills from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedDrills');
    if (saved) {
      setSavedDrills(JSON.parse(saved));
    }

    // Load today's drills
    const allDrills = localStorage.getItem('drills');
    if (allDrills) {
      const drills = JSON.parse(allDrills);
      const todayDrills = drills.filter((drill: Drill) => drill.date === selectedDate);
      setDrills(todayDrills);
    }
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrill.name || !newDrill.shots) return;

    const drill: Drill = {
      id: Date.now().toString(),
      name: newDrill.name,
      shots: parseInt(newDrill.shots),
      date: selectedDate,
    };

    // Update state
    setDrills([...drills, drill]);
    
    // Save the drill name to saved drills if it's not already there
    if (!savedDrills.includes(newDrill.name)) {
      const updatedSavedDrills = [...savedDrills, newDrill.name];
      setSavedDrills(updatedSavedDrills);
      localStorage.setItem('savedDrills', JSON.stringify(updatedSavedDrills));
    }
    
    setNewDrill({ name: '', shots: '' });
    setSelectedSavedDrill('');
  };

  const handleSave = () => {
    // Get existing drills from localStorage
    const existingDrills = localStorage.getItem('drills');
    const allDrills = existingDrills ? JSON.parse(existingDrills) : [];
    
    // Remove any existing drills for the selected date
    const filteredDrills = allDrills.filter((drill: Drill) => drill.date !== selectedDate);
    
    // Add today's drills
    const updatedDrills = [...filteredDrills, ...drills];
    
    // Save to localStorage
    localStorage.setItem('drills', JSON.stringify(updatedDrills));
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new Event('drillsUpdated'));
  };

  const handleDeleteDrill = (drillId: string) => {
    // Remove drill from state
    const updatedDrills = drills.filter(drill => drill.id !== drillId);
    setDrills(updatedDrills);

    // Update localStorage
    const existingDrills = localStorage.getItem('drills');
    if (existingDrills) {
      const allDrills = JSON.parse(existingDrills);
      const filteredDrills = allDrills.filter((drill: Drill) => drill.id !== drillId);
      localStorage.setItem('drills', JSON.stringify(filteredDrills));
      
      // Notify other components
      window.dispatchEvent(new Event('drillsUpdated'));
    }
  };

  const handleSavedDrillSelect = (drillName: string) => {
    setSelectedSavedDrill(drillName);
    setNewDrill(prev => ({ ...prev, name: drillName }));
  };

  const handleDeleteSavedDrill = (drillName: string) => {
    const updatedSavedDrills = savedDrills.filter(drill => drill !== drillName);
    setSavedDrills(updatedSavedDrills);
    localStorage.setItem('savedDrills', JSON.stringify(updatedSavedDrills));
    if (selectedSavedDrill === drillName) {
      setSelectedSavedDrill('');
      setNewDrill(prev => ({ ...prev, name: '' }));
    }
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Daily Training Log</h1>
        <div className="text-lg text-gray-600">{formattedDate}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-4">
              <div>
                <label htmlFor="savedDrills" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Saved Drill
                </label>
                <div className="flex gap-2">
                  <select
                    id="savedDrills"
                    value={selectedSavedDrill}
                    onChange={(e) => handleSavedDrillSelect(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a saved drill</option>
                    {savedDrills.map((drill) => (
                      <option key={drill} value={drill}>
                        {drill}
                      </option>
                    ))}
                  </select>
                  {selectedSavedDrill && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedDrill(selectedSavedDrill)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="drillName" className="block text-sm font-medium text-gray-700 mb-1">
                  Drill Name
                </label>
                <input
                  type="text"
                  id="drillName"
                  value={newDrill.name}
                  onChange={(e) => setNewDrill({ ...newDrill, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Putting Practice"
                />
              </div>

              <div>
                <label htmlFor="shots" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Shots
                </label>
                <input
                  type="number"
                  id="shots"
                  value={newDrill.shots}
                  onChange={(e) => setNewDrill({ ...newDrill, shots: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Add Drill
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Day's Drills
              </button>
            </div>
          </form>
        </div>

        {/* Today's Drills Section */}
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">Drills for {formattedDate}</h2>
            {drills.length === 0 ? (
              <p className="p-4 text-gray-500">No drills logged for this day</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {drills.map((drill) => (
                  <li key={drill.id} className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium">{drill.name}</span>
                      <span className="text-gray-600 ml-2">{drill.shots} shots</span>
                    </div>
                    <button
                      onClick={() => handleDeleteDrill(drill.id)}
                      className="ml-4 px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
