import React, { useState } from 'react';
import { SchoolEvent } from '../types';
import { SCHOOL_EVENTS, SCHOOL_INFO } from '../data/mockData';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Filter, 
  Download, 
  ChevronRight, 
  CalendarDays,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const EventCalendar: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [activeModalEvent, setActiveModalEvent] = useState<SchoolEvent | null>(null);

  const categories = [
    'All',
    'Academics',
    'Exams',
    'Sports & Co-Curricular',
    'Parents & PTA',
    'Holidays & Breaks'
  ];

  const filteredEvents = SCHOOL_EVENTS.filter((ev) => {
    if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  // Export event as .ics file for calendar sync
  const downloadIcs = (event: SchoolEvent) => {
    const startDateFormatted = event.date.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Nduluni High School//Event Calendar//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.venue}, Nduluni High School`,
      `DTSTART;VALUE=DATE:${startDateFormatted}`,
      `DTEND;VALUE=DATE:${startDateFormatted}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Exams':
        return 'text-rose-900 bg-rose-50 border-rose-200';
      case 'Parents & PTA':
        return 'text-amber-900 bg-amber-50 border-amber-200';
      case 'Sports & Co-Curricular':
        return 'text-emerald-900 bg-emerald-50 border-emerald-200';
      case 'Holidays & Breaks':
        return 'text-indigo-900 bg-indigo-50 border-indigo-200';
      default:
        return 'text-sky-900 bg-sky-50 border-sky-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Calendar Hero Header */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-800 text-amber-300 text-xs font-medium">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Ministry of Education 2026 Academic Year Master Schedule</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Nduluni High School Event Calendar
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl font-sans">
              Stay synchronized with term dates, KCSE joint mock examinations, inter-house sports competitions, visiting days, and parents-teachers academic clinics.
            </p>
          </div>

          {/* Quick Countdown to Next Big Event */}
          <div className="p-4 bg-stone-800/80 border border-stone-700 rounded-xl space-y-1.5 shrink-0 max-w-xs">
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Upcoming Milestone
            </span>
            <h4 className="text-xs font-bold text-white leading-tight">
              Term 1 Mid-Term Exeat & Parents Clinic
            </h4>
            <p className="text-stone-400 text-[11px] font-mono">
              27th Feb - 2nd March 2026
            </p>
          </div>
        </div>

        {/* Heraldic Kenyan Colors Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-black"></div>
          <div className="w-1/3 bg-rose-700"></div>
          <div className="w-1/3 bg-emerald-700"></div>
        </div>
      </div>

      {/* Filter and Term Ribbon */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Term Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setSelectedTerm(1)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedTerm === 1
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Term 1 (Jan - Apr 2026)
            </button>
            <button
              onClick={() => setSelectedTerm(2)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedTerm === 2
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Term 2 (May - Aug 2026)
            </button>
            <button
              onClick={() => setSelectedTerm(3)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedTerm === 3
                  ? 'bg-white text-stone-900 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Term 3 (Sep - Nov 2026)
            </button>
          </div>

          {/* Sync All Calendar */}
          <button
            onClick={() => {
              SCHOOL_EVENTS.forEach(ev => downloadIcs(ev));
            }}
            className="px-3.5 py-2 text-xs font-semibold text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Events (.ics)</span>
          </button>
        </div>

        {/* Category Filter Buttons */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white font-medium'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const dateObj = new Date(event.date);
          const day = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
          const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div
              key={event.id}
              className={`bg-white rounded-xl border transition-all p-6 shadow-sm flex flex-col justify-between hover:shadow-md ${
                event.highlighted
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="space-y-4">
                {/* Date Badge and Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-stone-900 text-white flex flex-col items-center justify-center font-display leading-tight shadow-sm shrink-0">
                      <span className="text-[10px] uppercase font-bold text-amber-400">{month}</span>
                      <span className="text-lg font-bold">{day}</span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-500 font-medium block">{weekday}</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadgeColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {event.highlighted && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 rounded">
                      Featured
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-stone-900 text-base leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveModalEvent(event)}
                  className="text-xs font-semibold text-rose-900 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Event Briefing</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => downloadIcs(event)}
                  className="p-1.5 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                  title="Export to iCalendar (.ics)"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${getCategoryBadgeColor(activeModalEvent.category)} mb-2`}>
                  {activeModalEvent.category}
                </span>
                <h3 className="text-xl font-bold font-display text-stone-900">
                  {activeModalEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="p-3 bg-stone-50 rounded-lg space-y-1 font-mono">
                <p><strong>Date:</strong> {activeModalEvent.date} {activeModalEvent.endDate ? `to ${activeModalEvent.endDate}` : ''}</p>
                <p><strong>Time:</strong> {activeModalEvent.time}</p>
                <p><strong>Location:</strong> {activeModalEvent.venue}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-stone-900">Official Programme & Instructions:</h4>
                <p className="text-sm leading-relaxed text-stone-700">
                  {activeModalEvent.description}
                </p>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                <p className="font-semibold">Parent & Guardian Notice:</p>
                <p>Ensure student clearance slips and personal academic diaries are inspected. All vehicles to be parked at Gate 2 designated bays.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => downloadIcs(activeModalEvent)}
                className="px-4 py-2 text-xs font-semibold text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Phone (.ics)</span>
              </button>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
