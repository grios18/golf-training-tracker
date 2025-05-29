'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Drill {
  id: string;
  name: string;
  shots: number;
  date: string;
}

export default function MonthlyView() {
  const router = useRouter();
  const [monthlyDrills, setMonthlyDrills] = useState<Drill[]>([]);
  const [view, setView] = useState<'list' | 'calendar'>('calendar');

  useEffect(() => {
    // Load drills from localStorage
    const loadDrills = () => {
      const savedDrills = localStorage.getItem('drills');
      if (savedDrills) {
        const drills = JSON.parse(savedDrills);
        // Filter drills for the current month only
        const currentMonthDrills = drills.filter((drill: Drill) => {
          const drillDate = new Date(drill.date);
          const today = new Date();
          return drillDate.getMonth() === today.getMonth() && 
                 drillDate.getFullYear() === today.getFullYear();
        });
        setMonthlyDrills(currentMonthDrills);
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

  const handleDateClick = (date: string) => {
    router.push(`/?date=${date}`);
  };

  const MonthCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push(date.toISOString().split('T')[0]);
    }

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">
            {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="min-h-[100px] p-2" />;
            }

            const dayDrills = monthlyDrills.filter(drill => drill.date === date);
            const totalShots = dayDrills.reduce((sum, drill) => sum + drill.shots, 0);
            const isToday = new Date(date).toDateString() === today.toDateString();

            return (
              <div
                key={date}
                onClick={() => handleDateClick(date)}
                className={`min-h-[100px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday ? 'bg-green-50' : ''
                }`}
              >
                <div className="text-right mb-1">
                  <span className={`text-sm font-medium ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
                    {new Date(date).getDate()}
                  </span>
                </div>
                {dayDrills.length > 0 && (
                  <div className="text-xs">
                    <div className="text-green-600 font-medium mb-1">
                      {totalShots} shots
                    </div>
                    {dayDrills.slice(0, 2).map(drill => (
                      <div key={drill.id} className="text-gray-600 truncate">
                        {drill.name}
                      </div>
                    ))}
                    {dayDrills.length > 2 && (
                      <div className="text-gray-500 text-xs">
                        +{dayDrills.length - 2} more
                      </div>
                    )}
                  </div>
                )}
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
        <h1 className="text-3xl font-bold">Monthly Training Summary</h1>
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
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md ${
              view === 'list'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Monthly Progress</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {monthlyDrills.map((drill) => (
              <div 
                key={drill.id} 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleDateClick(drill.date)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {new Date(drill.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <p className="text-gray-600">{drill.name}</p>
                  </div>
                  <span className="text-green-600 font-medium">{drill.shots} shots</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <MonthCalendar />
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Month Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Shots This Month</h3>
                <p className="text-2xl font-bold text-green-600">
                  {monthlyDrills.reduce((sum, drill) => sum + drill.shots, 0)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Most Common Drill</h3>
                <p className="text-lg font-medium">
                  {monthlyDrills.length > 0
                    ? monthlyDrills.reduce((a, b) => 
                        monthlyDrills.filter(d => d.name === a.name).length >
                        monthlyDrills.filter(d => d.name === b.name).length
                          ? a
                          : b
                      ).name
                    : 'No drills logged'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Days Trained</h3>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(monthlyDrills.map(drill => drill.date)).size} / {new Date().getDate()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 