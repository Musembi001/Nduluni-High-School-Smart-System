import React from 'react';
import { SCHOOL_INFO } from '../data/mockData';
import { 
  Award, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  Microscope, 
  Calculator, 
  Globe2, 
  Languages, 
  Cpu
} from 'lucide-react';

export const AcademicsSection: React.FC = () => {
  const departments = [
    {
      name: "Mathematics Department",
      hod: "Mr. Dennis Ochieng",
      subjects: ["Mathematics Alt A"],
      performance: "Mean: 9.42 (A-)",
      icon: Calculator,
      description: "Pioneering peer-tutoring circles and daily analytical speed drills that consistently place Nduluni among the best math centers in the region."
    },
    {
      name: "Sciences & STEM Faculty",
      hod: "Mr. James Mutunga",
      subjects: ["Biology", "Physics", "Chemistry"],
      performance: "Mean: 8.85 (B+)",
      icon: Microscope,
      description: "Hands-on laboratory investigations every week, research methodology mentoring, and regional science congress championship trophies."
    },
    {
      name: "Languages Faculty",
      hod: "Mrs. Caroline Muthoni",
      subjects: ["English", "Kiswahili", "French"],
      performance: "Mean: 8.91 (B+)",
      icon: Languages,
      description: "Cultivating eloquent debate, creative writing, and journalistic precision through active press club and National Drama Festival participation."
    },
    {
      name: "Humanities Department",
      hod: "Mr. Peter Maingi",
      subjects: ["History & Gov", "Geography", "C.R.E"],
      performance: "Mean: 9.15 (A-)",
      icon: Globe2,
      description: "Rigorous historical synthesis, constitutional literacy, and geographic GIS fieldwork trips across the Great Rift Valley."
    },
    {
      name: "Technicals & Applied Sciences",
      hod: "Mr. Bernard Kyalo",
      subjects: ["Agriculture", "Computer Studies", "Business Studies"],
      performance: "Mean: 9.60 (A)",
      icon: Cpu,
      description: "Practical farm management plots with dairy and drip irrigation trials, alongside coding and algorithms in our modern ICT suites."
    }
  ];

  const historicalTrends = [
    { year: 2021, mean: 7.42, grade: "C+", universityRate: 64, candidates: 240 },
    { year: 2022, mean: 7.85, grade: "B-", universityRate: 71, candidates: 262 },
    { year: 2023, mean: 8.31, grade: "B", universityRate: 77, candidates: 278 },
    { year: 2024, mean: 8.64, grade: "B", universityRate: 81, candidates: 289 },
    { year: 2025, mean: 8.92, grade: "B+", universityRate: 84, candidates: 295 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            KNEC Centre Code 12314502 · Academic Deanery
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold font-display">
            Academics & KCSE National Performance
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Nduluni High School is renowned for intellectual vigor, sustained pedagogical excellence, and top-tier direct university admissions under the Kenya Universities and Colleges Central Placement Service (KUCCPS).
          </p>
        </div>
      </div>

      {/* KCSE 5-Year Trajectory */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-stone-900">
              5-Year KCSE Mean Trajectory (2021 - 2025)
            </h2>
            <p className="text-xs text-stone-500">Unbroken upward academic progression audited by Ministry of Education</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1 rounded">
              Current Mean: 8.92 (B+)
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-5 gap-3 sm:gap-6 pt-6 pb-2 items-end border-b border-stone-200 min-h-[220px]">
          {historicalTrends.map((trend) => {
            const heightPercent = ((trend.mean - 6) / (10 - 6)) * 100;
            return (
              <div key={trend.year} className="flex flex-col items-center gap-2 group">
                <span className="text-xs font-mono font-bold text-stone-900 tabular-nums">
                  {trend.mean} <span className="text-[10px] text-stone-500">({trend.grade})</span>
                </span>
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[50px] bg-rose-950 rounded-t-md group-hover:bg-rose-800 transition-all flex items-end justify-center pb-2 text-[10px] text-amber-300 font-mono"
                >
                </div>
                <span className="text-xs font-bold text-stone-700 font-mono">{trend.year}</span>
                <span className="text-[10px] text-stone-500">{trend.universityRate}% KUCCPS</span>
              </div>
            );
          })}
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <th className="py-2.5 px-3">Examination Year</th>
                <th className="py-2.5 px-3">Candidature</th>
                <th className="py-2.5 px-3 text-center">Mean Score</th>
                <th className="py-2.5 px-3 text-center">Mean Grade</th>
                <th className="py-2.5 px-3 text-center">Direct University Transitions</th>
                <th className="py-2.5 px-3">Leading Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {historicalTrends.map((t) => (
                <tr key={t.year} className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-bold font-mono">{t.year}</td>
                  <td className="py-2 px-3 font-mono">{t.candidates} Candidates</td>
                  <td className="py-2 px-3 text-center font-bold font-mono text-rose-950">{t.mean}</td>
                  <td className="py-2 px-3 text-center font-bold">{t.grade}</td>
                  <td className="py-2 px-3 text-center font-mono text-emerald-800 font-semibold">{t.universityRate}%</td>
                  <td className="py-2 px-3 text-stone-600">Medicine, Engineering, Computer Science, Law</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Departments */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-stone-900">
            Subject Departments & Pedagogical Faculties
          </h2>
          <p className="text-xs text-stone-500">Every faculty is headed by experienced Teachers Service Commission (TSC) specialists</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4 hover:border-stone-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {dept.performance}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-stone-900 text-base">{dept.name}</h3>
                  <p className="text-xs text-stone-500">Head of Department: {dept.hod}</p>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {dept.description}
                </p>

                <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
                  {dept.subjects.map((sub, sIdx) => (
                    <span key={sIdx} className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
