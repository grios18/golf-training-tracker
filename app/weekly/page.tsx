'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Drill {
  id: string;
  name: string;
  shots: number;
  date: string;
}

export default function WeeklyView() {
  const router = useRouter();
  const [weeklyDrills, setWeeklyDrills] = useState<Drill[]>([]);
  const [view, setView] = useState<'week' | 'calendar'>('calendar');

  useEffect(() => {
    // Load drills from localStorage
    const loadDrills = () => {
      const savedDrills = localStorage.getItem('drills');
      if (savedDrills) {
        const drills = JSON.parse(savedDrills);
        // Filter drills for the current week only
        const currentWeekDrills = drills.filter((drill: Drill) => {
          const drillDate = new Date(drill.date);
          const today = new Date();
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return drillDate >= weekStart && drillDate <= weekEnd;
        });
        setWeeklyDrills(currentWeekDrills);
      }
    };

    // Load drills initially
    loadDrills();

    // Listen for drills updates
    window.addEventListener('drillsUpdated', loadDrills);

    // Clean up the event listener
    return () => {
      window.removeEventListener('drillsUpdated', loadDrills);
    };
  }, []);

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const handleDateClick = (date: string) => {
    router.push(`/?date=${date}`);
  };

  const WeekCalendar = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h2>
        </div>
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {weekDates.map((date) => {
            const dayDrills = weeklyDrills.filter(drill => drill.date === date);
            const totalShots = dayDrills.reduce((sum, drill) => sum + drill.shots, 0);
            const isToday = new Date(date).toDateString() === today.toDateString();

            return (
              <div 
                key={date} 
                className={`min-h-[200px] p-3 ${isToday ? 'bg-green-50' : ''} cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => handleDateClick(date)}
              >
                <div className="text-center mb-2">
                  <div className={`font-medium ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${isToday ? 'text-green-700' : 'text-gray-900'}`}>
                    {new Date(date).getDate()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dayDrills.length > 0 ? (
                    <>
                      <div className="text-sm font-medium text-green-600">
                        {totalShots} total shots
                      </div>
                      <div className="space-y-1">
                        {dayDrills.map(drill => (
                          <div 
                            key={drill.id} 
                            className="text-xs bg-white p-1 rounded shadow-sm"
                          >
                            <div className="font-medium text-gray-700">{drill.name}</div>
                            <div className="text-gray-500">{drill.shots} shots</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400 text-center mt-2">
                      No drills logged
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Weekly Training Summary</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-md ${
              view === 'calendar'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-md ${
              view === 'week'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {view === 'week' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">This Week's Progress</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {weekDates.map((date) => {
              const dayDrills = weeklyDrills.filter(drill => drill.date === date);
              const totalShots = dayDrills.reduce((sum, drill) => sum + drill.shots, 0);
              
              return (
                <div 
                  key={date} 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <span className="text-green-600 font-medium">{totalShots} total shots</span>
                  </div>
                  {dayDrills.length > 0 ? (
                    <ul className="ml-4 space-y-1">
                      {dayDrills.map(drill => (
                        <li key={drill.id} className="text-gray-600">
                          {drill.name}: {drill.shots} shots
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 ml-4">No drills logged</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <WeekCalendar />
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Week Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Shots This Week</h3>
                <p className="text-2xl font-bold text-green-600">
                  {weeklyDrills.reduce((sum, drill) => sum + drill.shots, 0)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Most Common Drill</h3>
                <p className="text-lg font-medium">
                  {weeklyDrills.length > 0
                    ? weeklyDrills.reduce((a, b) => 
                        weeklyDrills.filter(d => d.name === a.name).length >
                        weeklyDrills.filter(d => d.name === b.name).length
                          ? a
                          : b
                      ).name
                    : 'No drills logged'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Days Trained</h3>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(weeklyDrills.map(drill => drill.date)).size} / 7
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 