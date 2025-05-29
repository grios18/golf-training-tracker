'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Drill {
  id: string;
  name: string;
  shots: number;
  date: string;
}

interface MonthSummary {
  month: string;
  totalShots: number;
  daysTrained: number;
  mostCommonDrill: string;
}

export default function YearlyView() {
  const router = useRouter();
  const [yearlyDrills, setYearlyDrills] = useState<Drill[]>([]);
  const [view, setView] = useState<'list' | 'calendar'>('calendar');

  useEffect(() => {
    // Load drills from localStorage
    const loadDrills = () => {
      const savedDrills = localStorage.getItem('drills');
      if (savedDrills) {
        const drills = JSON.parse(savedDrills);
        // Filter drills for the current year only
        const currentYearDrills = drills.filter((drill: Drill) => {
          const drillDate = new Date(drill.date);
          const today = new Date();
          return drillDate.getFullYear() === today.getFullYear();
        });
        setYearlyDrills(currentYearDrills);
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

  const handleMonthClick = (month: number) => {
    const date = new Date();
    date.setMonth(month);
    router.push(`/monthly?date=${date.toISOString().split('T')[0]}`);
  };

  const getMonthSummary = (month: number): MonthSummary => {
    const monthDrills = yearlyDrills.filter(drill => {
      const drillDate = new Date(drill.date);
      return drillDate.getMonth() === month;
    });

    const totalShots = monthDrills.reduce((sum, drill) => sum + drill.shots, 0);
    const daysTrained = new Set(monthDrills.map(drill => drill.date)).size;
    const mostCommonDrill = monthDrills.length > 0
      ? monthDrills.reduce((a, b) => 
          monthDrills.filter(d => d.name === a.name).length >
          monthDrills.filter(d => d.name === b.name).length
            ? a
            : b
        ).name
      : 'No drills logged';

    return {
      month: new Date(2024, month, 1).toLocaleString('default', { month: 'long' }),
      totalShots,
      daysTrained,
      mostCommonDrill
    };
  };

  const YearCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">
            {today.getFullYear()} Training Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {months.map((month) => {
            const summary = getMonthSummary(month);
            const isCurrentMonth = month === currentMonth;

            return (
              <div
                key={month}
                onClick={() => handleMonthClick(month)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isCurrentMonth ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${isCurrentMonth ? 'text-green-700' : 'text-gray-900'}`}>
                    {summary.month}
                  </h3>
                  <span className={`text-sm font-medium ${isCurrentMonth ? 'text-green-600' : 'text-gray-600'}`}>
                    {summary.totalShots} shots
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    Days trained: {summary.daysTrained}
                  </p>
                  <p className="text-gray-600 truncate">
                    Top drill: {summary.mostCommonDrill}
                  </p>
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
        <h1 className="text-3xl font-bold">Yearly Training Summary</h1>
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
            <h2 className="text-xl font-semibold">Yearly Progress</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {yearlyDrills.map((drill) => (
              <div 
                key={drill.id} 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => router.push(`/?date=${drill.date}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {new Date(drill.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
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
          <YearCalendar />
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Year Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Shots This Year</h3>
                <p className="text-2xl font-bold text-green-600">
                  {yearlyDrills.reduce((sum, drill) => sum + drill.shots, 0)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Most Common Drill</h3>
                <p className="text-lg font-medium">
                  {yearlyDrills.length > 0
                    ? yearlyDrills.reduce((a, b) => 
                        yearlyDrills.filter(d => d.name === a.name).length >
                        yearlyDrills.filter(d => d.name === b.name).length
                          ? a
                          : b
                      ).name
                    : 'No drills logged'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Days Trained</h3>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(yearlyDrills.map(drill => drill.date)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 