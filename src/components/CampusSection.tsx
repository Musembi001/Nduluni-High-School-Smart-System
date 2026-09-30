import React from 'react';
import { 
  Building, 
  BookOpen, 
  FlaskConical, 
  Trophy, 
  Home, 
  ShieldCheck, 
  Users, 
  HeartHandshake 
} from 'lucide-react';

export const CampusSection: React.FC = () => {
  const facilities = [
    {
      title: "Main Campus Entrance & Security Perimeter",
      image: "/src/assets/images/nduluni_campus_gate_1790759053495.jpg",
      description: "Iconic gate and manned security post with 24/7 CCTV surveillance, biometric visitor screening, and paved driveway leading into administrative plaza."
    },
    {
      title: "Ultra-Modern Library & Digital E-Resource Center",
      image: "/src/assets/images/nduluni_students_library_1790759068789.jpg",
      description: "Equipped with over 15,000 curriculum reference volumes, peer-study alcoves, broadband internet terminals, and digital research archives."
    },
    {
      title: "Science, Robotics & Engineering Laboratories",
      image: "/src/assets/images/nduluni_science_stem_1790759091787.jpg",
      description: "Dedicated chemistry, biology, and physics discovery complexes with individual gas taps, digital microscopes, and STEM robotics kits."
    },
    {
      title: "Championship Athletic Track & Sports Arena",
      image: "/src/assets/images/nduluni_athletics_field_1790759103853.jpg",
      description: "Full-sized football pitch, rugby 7s grid, standard 400m running track, outdoor volleyball, and basketball hard courts."
    }
  ];

  const boardingHouses = [
    { name: "Kilimanjaro House", color: "border-sky-500 bg-sky-50/50", captain: "Master B. Mutua", motto: "Peak of Discipline" },
    { name: "Tsavo House", color: "border-amber-500 bg-amber-50/50", captain: "Master K. Kioko", motto: "Strength in Courage" },
    { name: "Mara House", color: "border-emerald-500 bg-emerald-50/50", captain: "Master E. Kiprono", motto: "Endurance & Honor" },
    { name: "Aberdare House", color: "border-rose-500 bg-rose-50/50", captain: "Master D. Mutiso", motto: "Unyielding Resolve" }
  ];

  const clubs = [
    { name: "Robotics & Innovation Lab", members: "64 Scholars", focus: "Arduino, Python & IoT Prototypes" },
    { name: "St. John Ambulance Cadets", members: "90 Cadets", focus: "First Aid & Disaster Emergency Response" },
    { name: "President's Award Scheme", members: "120 Participants", focus: "Gold & Silver Expeditions" },
    { name: "Drama & Music Troupe", members: "55 Performers", focus: "Kenya National Drama Festival" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Campus Infrastructure & Student Life
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold font-display">
            Life at Nduluni High School
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Spanning over 25 scenic acres in the gentle hills of Eastern Kenya, our serene, secure boarding environment is engineered for total academic focus, athletic growth, and character formation.
          </p>
        </div>
      </div>

      {/* Facilities Showcase Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-stone-900">
            World-Class Learning Infrastructure
          </h2>
          <p className="text-xs text-stone-500">Every facility is designed to meet strict Ministry of Education safety and pedagogical standards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {facilities.map((fac, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-stone-100">
                <img 
                  src={fac.image} 
                  alt={fac.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6 space-y-2">
                <h3 className="font-bold text-stone-900 text-base font-display">
                  {fac.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {fac.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boarding House System */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display text-stone-900">
            The Boarding House System
          </h2>
          <p className="text-xs text-stone-500">
            Each student is inducted into one of four historic houses, fostering brotherhood, clean inter-house rivalry, and pastoral care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {boardingHouses.map((house, hIdx) => (
            <div 
              key={hIdx}
              className={`p-5 rounded-xl border-l-4 border ${house.color} space-y-2`}
            >
              <h3 className="font-bold text-stone-900 text-base">{house.name}</h3>
              <p className="text-xs text-stone-600 italic">"{house.motto}"</p>
              <div className="pt-2 text-xs text-stone-500 border-t border-stone-200/60 font-mono">
                House Captain: {house.captain}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clubs & Societies */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display text-stone-900">
            Active Clubs & Co-Curricular Societies
          </h2>
          <p className="text-xs text-stone-500">Every Friday afternoon from 2:00 PM to 4:00 PM is reserved for student societies</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clubs.map((c, i) => (
            <div key={i} className="p-4 bg-white rounded-lg border border-stone-200 space-y-1">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{c.name}</h4>
              <p className="text-xs text-rose-900 font-semibold">{c.members}</p>
              <p className="text-[11px] text-stone-500">{c.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
