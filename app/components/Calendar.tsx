'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CalendarProps {
  onDateSelect?: (date: string) => void;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    if (onDateSelect) {
      onDateSelect(formattedDate);
    }
    router.push(`/?date=${formattedDate}`);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const isToday = new Date().toDateString() === 
            new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`aspect-square p-2 text-center hover:bg-green-50 rounded-full
                ${isToday ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-700'}
                hover:ring-2 hover:ring-green-500 focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
} 