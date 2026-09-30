import React, { useState } from 'react';
import { SCHOOL_INFO } from '../data/mockData';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building, 
  Bus, 
  ExternalLink, 
  Compass, 
  ShieldCheck 
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Map view toggle (Satellite / Standard Terrain)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Main Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Physical Campus & Administrative Secretariat
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold font-display">
            Contact Nduluni High School
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Welcome to the official contact portal of Nduluni High School. Reach the Chief Principal's office, bursar accounts department, boarding masters, or submit your admission and general inquiries directly below.
          </p>
        </div>
      </div>

      {/* Contact Cards Grid: Address, Phones, Emails, Office Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Physical Address */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Physical Address</h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Nduluni High School Main Campus<br />
              Nduluni Market Centre Corridor<br />
              Machakos County, Eastern Kenya
            </p>
          </div>
          <div className="pt-2 border-t border-stone-100 text-xs font-mono text-stone-500">
            P.O. Box 48 - 90130, Nduluni
          </div>
        </div>

        {/* Card 2: Phone Numbers */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Telephone Lines</h3>
            <div className="text-xs space-y-1 mt-1 font-mono">
              <p className="text-stone-700">
                <span className="text-stone-500 block font-sans text-[11px]">General Administration:</span>
                <a href="tel:+254722849201" className="hover:text-rose-900 font-bold">+254 722 849 201</a>
              </p>
              <p className="text-stone-700">
                <span className="text-stone-500 block font-sans text-[11px]">Bursar & Accounts:</span>
                <a href="tel:+254733912405" className="hover:text-rose-900 font-bold">+254 733 912 405</a>
              </p>
              <p className="text-stone-700">
                <span className="text-stone-500 block font-sans text-[11px]">Boarding Duty Desk:</span>
                <a href="tel:+254711340982" className="hover:text-rose-900 font-bold">+254 711 340 982</a>
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Email Inquiries */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-900 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Electronic Mail</h3>
            <div className="text-xs space-y-1.5 mt-1 font-mono">
              <div>
                <span className="text-stone-500 block font-sans text-[11px]">General Inquiries:</span>
                <a href="mailto:info@ndulunihigh.ac.ke" className="text-rose-900 hover:underline font-semibold">
                  info@ndulunihigh.ac.ke
                </a>
              </div>
              <div>
                <span className="text-stone-500 block font-sans text-[11px]">Chief Principal Desk:</span>
                <a href="mailto:principal@ndulunihigh.ac.ke" className="text-rose-900 hover:underline font-semibold">
                  principal@ndulunihigh.ac.ke
                </a>
              </div>
              <div>
                <span className="text-stone-500 block font-sans text-[11px]">Admissions & NEMIS:</span>
                <a href="mailto:admissions@ndulunihigh.ac.ke" className="text-rose-900 hover:underline font-semibold">
                  admissions@ndulunihigh.ac.ke
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Office Working Hours */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Office Working Hours</h3>
            <div className="text-xs space-y-1 mt-1 text-stone-700">
              <p>
                <strong>Monday – Friday:</strong><br />
                8:00 AM – 5:00 PM EAT
              </p>
              <p>
                <strong>Saturday (Bursar Consultations):</strong><br />
                8:30 AM – 1:00 PM EAT
              </p>
              <p className="text-stone-500 text-[11px] pt-1">
                Sunday & Public Holidays: Closed to general visitors (Pastoral student care only)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Interactive Map + Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Interactive Google Map & Directions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
            {/* Map Header with Controls */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50">
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-rose-900" />
                  <span>Google Maps: Nduluni High School Location</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Coordinates: <span className="font-mono text-stone-700">1°45'30.0"S 37°37'30.0"E</span> · Machakos County
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://maps.google.com/?q=Nduluni+High+School+Machakos+Kenya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold text-rose-900 bg-white hover:bg-rose-50 border border-stone-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Embedded Interactive Google Map Iframe */}
            <div className="relative w-full h-[360px] sm:h-[420px] bg-stone-100">
              <iframe
                title="Nduluni High School Map Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://maps.google.com/maps?q=Nduluni%20High%20School,%20Machakos,%20Kenya&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-none"
                loading="lazy"
              ></iframe>

              {/* Floating Verified School Pin Overlay Badge */}
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-stone-200 shadow-md rounded-lg p-3 max-w-xs text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-rose-950 font-bold">
                  <MapPin className="w-4 h-4 text-rose-800" />
                  <span>Nduluni High School Main Gate</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Off Kaiti - Wote Highway corridor, Machakos County.
                </p>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>MoE Public School Landmark</span>
                </div>
              </div>
            </div>

            {/* Getting Here: Public Transit & Road Travel Advice */}
            <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <Bus className="w-4 h-4 text-rose-900" />
                <span>Travel & Transportation Guidelines:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-stone-600 leading-relaxed">
                <div>
                  <strong className="text-stone-800 block mb-0.5">By Private Vehicle:</strong>
                  From Nairobi or Machakos Town, follow the Machakos-Wote highway towards the Kaiti junction, branching into the Nduluni educational center. Clear road signboards point directly to the main gate.
                </div>
                <div>
                  <strong className="text-stone-800 block mb-0.5">By Public Matatu:</strong>
                  Board matatus heading to Nduluni / Kaiti from the Machakos Central Bus Stage or Sultan Hamud Junction on Mombasa Road. Alight right at Nduluni High School Gate 1.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive Contact & Inquiry Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                Direct Inquiry Form
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Have questions regarding student admission, fee statements, or academic records? Send an inquiry directly to the secretariat.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-sm">Inquiry Dispatched Successfully</h4>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you, <strong>{name}</strong>. Your message regarding <em>"{subject}"</em> has been received by the Nduluni High School registry.
                </p>
                <div className="p-3 bg-white/80 rounded border border-emerald-200 text-[11px] font-mono text-emerald-900 space-y-0.5">
                  <p>Ticket No: <strong className="text-stone-900">NHS-INQ-{Math.floor(1000 + Math.random() * 9000)}</strong></p>
                  <p>Confirmation Email: {email}</p>
                  <p>Expected Response: Within 24 Business Hours</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Your Full Name <span className="text-rose-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Mutua"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-rose-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Email Address <span className="text-rose-700">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. samuel@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-rose-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Phone Number (Mobile) <span className="text-rose-700">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0722 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-rose-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Inquiry Department / Subject <span className="text-rose-700">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none"
                  >
                    <option value="">Select department...</option>
                    <option value="Admissions & Form 1 NEMIS Placement">Admissions & Form 1 NEMIS Placement</option>
                    <option value="Online Fees & M-Pesa Payment Statement">Online Fees & M-Pesa Payment Statement</option>
                    <option value="Student Academic Terminal Report Inquiry">Student Academic Terminal Report Inquiry</option>
                    <option value="Form 2 / Form 3 Transfer Vacancy">Form 2 / Form 3 Transfer Vacancy</option>
                    <option value="Boarding Facilities & Pastoral Care">Boarding Facilities & Pastoral Care</option>
                    <option value="General Administration / Office of the Principal">General Administration / Office of the Principal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Message Details <span className="text-rose-700">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide relevant information such as the student's admission number or specific question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-rose-900 text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Inquiry to Nduluni Secretariat</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span>Encrypted SSL Gateway</span>
              <span>Direct SMS alerts enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
