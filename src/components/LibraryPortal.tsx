import React, { useState, useMemo } from 'react';
import { Book, INITIAL_BOOKS } from '../data/mockBooks';
import { SCHOOL_INFO } from '../data/mockData';
import { 
  BookOpen, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Bookmark, 
  Download, 
  Layers, 
  MapPin, 
  RotateCcw, 
  FileText, 
  User, 
  ShieldCheck, 
  Check, 
  X,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

interface LibraryPortalProps {
  studentAdmissionNo?: string;
  onNavigateToPortal?: () => void;
}

export const LibraryPortal: React.FC<LibraryPortalProps> = ({ 
  studentAdmissionNo = 'NHS/3412/2023',
  onNavigateToPortal 
}) => {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  
  // Real-time Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedForm, setSelectedForm] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'title' | 'available' | 'category'>('title');

  // Interactive Modals
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [borrowAdmNo, setBorrowAdmNo] = useState(studentAdmissionNo);
  const [borrowerName, setBorrowerName] = useState('Brian Mutua Musyoki');
  const [borrowSuccessMsg, setBorrowSuccessMsg] = useState<string | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // Categories list
  const categories = [
    'ALL',
    'KCSE Set Books',
    'Sciences & STEM',
    'Mathematics',
    'Humanities & Business',
    'Languages & Dictionaries',
    'Past Papers & Revision'
  ];

  // Statuses list
  const statuses = [
    { id: 'ALL', label: 'All Statuses' },
    { id: 'Available', label: 'Available on Shelf', color: 'emerald' },
    { id: 'Borrowed', label: 'Checked Out / On Loan', color: 'amber' },
    { id: 'Reference Only', label: 'Reference Desk Only', color: 'purple' },
    { id: 'Reserved', label: 'Reserved', color: 'blue' }
  ];

  // Form Levels
  const forms = ['ALL', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'All Forms'];

  // Real-time Filtered and Sorted Books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Real-time Title, Author, Accession No, or ISBN Search
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.author.toLowerCase().includes(query);
        const matchesAccession = book.accessionNo.toLowerCase().includes(query);
        const matchesIsbn = book.isbn.toLowerCase().includes(query);
        const matchesSearch = query === '' || matchesTitle || matchesAuthor || matchesAccession || matchesIsbn;

        // Category Filter
        const matchesCategory = selectedCategory === 'ALL' || book.category === selectedCategory;

        // Availability Status Filter
        const matchesStatus = selectedStatus === 'ALL' || book.status === selectedStatus;

        // Form Level Filter
        const matchesForm = selectedForm === 'ALL' || book.formLevel === selectedForm || book.formLevel === 'All Forms';

        return matchesSearch && matchesCategory && matchesStatus && matchesForm;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else if (sortBy === 'available') {
          return b.availableCopies - a.availableCopies;
        } else {
          return a.category.localeCompare(b.category);
        }
      });
  }, [books, searchQuery, selectedCategory, selectedStatus, selectedForm, sortBy]);

  // Aggregate Metrics for Library Stats
  const metrics = useMemo(() => {
    const totalTitles = books.length;
    const totalPhysicalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
    const totalAvailableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
    const totalBorrowedCopies = totalPhysicalCopies - totalAvailableCopies;
    const digitalCount = books.filter(b => b.isDigital).length;

    return {
      totalTitles,
      totalPhysicalCopies,
      totalAvailableCopies,
      totalBorrowedCopies,
      digitalCount
    };
  }, [books]);

  // Handle Book Borrowing Simulation
  const handleConfirmBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForBorrow) return;

    if (selectedBookForBorrow.availableCopies <= 0 && selectedBookForBorrow.status !== 'Available') {
      alert('This volume is currently checked out or non-circulating.');
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Update state
    setBooks(prev => prev.map(b => {
      if (b.id === selectedBookForBorrow.id) {
        const newAvailable = Math.max(0, b.availableCopies - 1);
        return {
          ...b,
          availableCopies: newAvailable,
          status: newAvailable === 0 ? 'Borrowed' : 'Available',
          currentBorrower: {
            studentName: borrowerName,
            admissionNo: borrowAdmNo,
            dueDate: dueDateStr
          }
        };
      }
      return b;
    }));

    setBorrowSuccessMsg(
      `Accession #${selectedBookForBorrow.accessionNo} ("${selectedBookForBorrow.title}") successfully issued to ${borrowerName} (${borrowAdmNo}). Due date: ${dueDateStr}.`
    );
    setSelectedBookForBorrow(null);
    setTimeout(() => setBorrowSuccessMsg(null), 6000);
  };

  // Reset all search and filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedForm('ALL');
    setSortBy('title');
  };

  const isFiltering = searchQuery !== '' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedForm !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Library Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-stone-800 text-amber-300 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Nduluni High School Digital Library & Information Center</span>
              <span className="text-stone-500">·</span>
              <span className="text-emerald-400 font-bold">OPAC 3.0 ONLINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display">
              Library Catalog & E-Resource Portal
            </h1>
            <p className="text-stone-300 text-sm max-w-2xl font-sans">
              Search over 4,800 curriculum volumes, KCSE prescribed set books, STEM reference encyclopedias, and past examination papers. Check real-time shelf availability and borrow instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToPortal && (
              <button
                onClick={onNavigateToPortal}
                className="px-4 py-2.5 text-xs font-semibold text-stone-900 bg-white hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Return to Student Dossier</span>
              </button>
            )}
          </div>
        </div>

        {/* Heraldic Kenyan Colors Ribbon */}
        <div className="absolute bottom-0 left-0 right-0 h-1 flex">
          <div className="w-1/3 bg-black"></div>
          <div className="w-1/3 bg-rose-700"></div>
          <div className="w-1/3 bg-emerald-700"></div>
        </div>
      </div>

      {/* Real-Time Library Statistical KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Catalog Titles</span>
          <div className="text-2xl font-bold text-stone-900 font-mono">{metrics.totalTitles} Titles</div>
          <p className="text-[11px] text-stone-500">{metrics.totalPhysicalCopies} Physical Copies</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Available on Shelves</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{metrics.totalAvailableCopies} Copies</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready for Issue</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Currently On Loan</span>
          <div className="text-2xl font-bold text-amber-700 font-mono">{metrics.totalBorrowedCopies} Borrowed</div>
          <p className="text-[11px] text-stone-500">14-Day Lending Window</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">Digital E-Guides</span>
          <div className="text-2xl font-bold text-rose-950 font-mono">{metrics.digitalCount} E-Packs</div>
          <p className="text-[11px] text-rose-800 font-medium">Free Scholar Downloads</p>
        </div>
      </div>

      {/* Notifications */}
      {borrowSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{borrowSuccessMsg}</span>
          </div>
          <button onClick={() => setBorrowSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {downloadSuccessMsg && (
        <div className="p-4 bg-sky-50 border border-sky-200 text-sky-950 rounded-xl text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="font-semibold">{downloadSuccessMsg}</span>
          </div>
          <button onClick={() => setDownloadSuccessMsg(null)} className="text-sky-700 hover:text-sky-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* REAL-TIME SEARCH & FILTER TOOLBAR CONTROLS                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Real-time Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search books by title (e.g. Fathers of Nations, Chemistry, Physics), author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-950/20 focus:border-rose-950 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Controls: Form Level & Sort */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Class:</span>
              <select
                value={selectedForm}
                onChange={(e) => setSelectedForm(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-950 cursor-pointer"
              >
                {forms.map(f => (
                  <option key={f} value={f}>{f === 'ALL' ? 'All Classes' : f}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-stone-50 font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-950 cursor-pointer"
              >
                <option value="title">Book Title (A - Z)</option>
                <option value="available">Availability (Most Copies)</option>
                <option value="category">Category</option>
              </select>
            </div>

            {isFiltering && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg text-rose-950 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer font-semibold ml-auto sm:ml-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Category Filter Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-rose-950" />
              <span>Subject & Department Category:</span>
            </span>
            <span className="text-stone-400">
              Showing <strong>{filteredBooks.length}</strong> of {books.length} volumes
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = cat === 'ALL' 
                ? books.length 
                : books.filter(b => b.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-rose-950 text-white shadow-2xs font-semibold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{cat === 'ALL' ? 'All Subjects & Set Books' : cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-amber-400 text-stone-950 font-bold' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Availability Status Filter Pills */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">
            Filter by Availability Status:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((st) => {
              const count = st.id === 'ALL'
                ? books.length
                : books.filter(b => b.status === st.id).length;
              const isSelected = selectedStatus === st.id;

              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    st.id === 'Available' ? 'bg-emerald-500' :
                    st.id === 'Borrowed' ? 'bg-amber-500' :
                    st.id === 'Reference Only' ? 'bg-purple-500' :
                    st.id === 'Reserved' ? 'bg-blue-500' : 'bg-stone-400'
                  }`} />
                  <span>{st.label}</span>
                  <span className="text-[10px] text-stone-400 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filter Badges Bar */}
      {isFiltering && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500">Active criteria:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-950 border border-rose-200 font-medium">
              <span>Title/Author: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-rose-700 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 font-medium">
              <span>Category: {selectedCategory}</span>
              <button onClick={() => setSelectedCategory('ALL')} className="hover:text-stone-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStatus !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 font-medium">
              <span>Status: {selectedStatus}</span>
              <button onClick={() => setSelectedStatus('ALL')} className="hover:text-stone-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedForm !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 font-medium">
              <span>Class: {selectedForm}</span>
              <button onClick={() => setSelectedForm('ALL')} className="hover:text-stone-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-rose-900 hover:underline font-semibold cursor-pointer ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* BOOK CATALOG RESULTS GRID                                 */}
      {/* ======================================================== */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 font-display">No matching volumes found</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              No books in the library catalog matched your search "{searchQuery}" with the selected category and status filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-950 hover:bg-rose-900 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0 && book.status === 'Available';
            const isReference = book.status === 'Reference Only';
            const isBorrowed = book.status === 'Borrowed' || book.availableCopies === 0;

            return (
              <div 
                key={book.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Top Category and Form Tags */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-950 border border-rose-200">
                      {book.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                      {book.formLevel}
                    </span>
                  </div>

                  {/* Title and Author */}
                  <div>
                    <h3 className="text-base font-bold text-stone-900 font-display line-clamp-2 group-hover:text-rose-950 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      by <span className="font-semibold text-stone-800">{book.author}</span>
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                      {book.publisher} ({book.yearPublished})
                    </p>
                  </div>

                  {/* Synopsis snippet */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {book.synopsis}
                  </p>

                  {/* Location & Dewey Classification */}
                  <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-200 text-[11px]">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{book.shelfLocation}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-500 font-mono text-[10px]">
                      <span>Dewey: {book.deweyDecimal}</span>
                      <span>Acc: {book.accessionNo.replace('NHS-LIB-', '')}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Availability Status & Action Buttons */}
                <div className="pt-4 border-t border-stone-100 mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      {isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>{book.availableCopies} of {book.totalCopies} on Shelf</span>
                        </span>
                      ) : isReference ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                          <Bookmark className="w-3 h-3 text-purple-700" />
                          <span>Reference Desk Only</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>All Copies Checked Out</span>
                        </span>
                      )}
                    </div>

                    {book.isDigital && (
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>E-Resource</span>
                      </span>
                    )}
                  </div>

                  {/* If borrowed, show borrower hint */}
                  {book.currentBorrower && (
                    <div className="text-[10px] text-stone-500 bg-amber-50/50 p-1.5 rounded border border-amber-200/60 font-mono">
                      Loaned to {book.currentBorrower.studentName.split(' ')[0]} · Due: {book.currentBorrower.dueDate}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    {isAvailable ? (
                      <button
                        onClick={() => setSelectedBookForBorrow(book)}
                        className="flex-1 py-2 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer hover:scale-101"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Borrow / Request</span>
                      </button>
                    ) : isReference ? (
                      <button
                        onClick={() => setSelectedBookForDetails(book)}
                        className="flex-1 py-2 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>View Desk Details</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          alert(`Book "${book.title}" is currently on loan. A reservation hold has been queued for your admission number.`);
                        }}
                        className="flex-1 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Join Waitlist</span>
                      </button>
                    )}

                    {book.isDigital ? (
                      <button
                        onClick={() => {
                          setDownloadSuccessMsg(`Downloaded digital study guide for "${book.title}" (${book.digitalFileSize}).`);
                          setTimeout(() => setDownloadSuccessMsg(null), 4000);
                        }}
                        className="p-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 cursor-pointer"
                        title={`Download PDF Study Guide (${book.digitalFileSize})`}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedBookForDetails(book)}
                        className="p-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 cursor-pointer"
                        title="View Full Book Details & ISBN"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* BORROW BOOK INTERACTIVE MODAL                             */}
      {/* ======================================================== */}
      {selectedBookForBorrow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-950" />
                <h3 className="font-bold text-base text-stone-900 font-display">
                  Circulation Desk: Issue Book
                </h3>
              </div>
              <button 
                onClick={() => setSelectedBookForBorrow(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Book Specimen Summary */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-xs">
              <span className="font-bold text-rose-950 text-sm block">{selectedBookForBorrow.title}</span>
              <p className="text-stone-600">Author: {selectedBookForBorrow.author}</p>
              <div className="flex items-center justify-between text-stone-500 font-mono text-[11px] pt-1">
                <span>Accession: {selectedBookForBorrow.accessionNo}</span>
                <span className="text-emerald-700 font-bold">{selectedBookForBorrow.availableCopies} Copies Available</span>
              </div>
              <p className="text-[11px] text-stone-500">{selectedBookForBorrow.shelfLocation}</p>
            </div>

            <form onSubmit={handleConfirmBorrow} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Scholar Full Name</label>
                <input
                  type="text"
                  required
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Admission Number</label>
                <input
                  type="text"
                  required
                  value={borrowAdmNo}
                  onChange={(e) => setBorrowAdmNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1 text-[11px]">
                <div className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                  <span>Nduluni High School Library Regulations:</span>
                </div>
                <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                  <li>Standard loan duration is 14 days from issue date.</li>
                  <li>Max 2 curriculum volumes per scholar at any time.</li>
                  <li>Damage or defacing requires full book replacement fee.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedBookForBorrow(null)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-white font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Confirm Issue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BOOK DETAILS MODAL                                        */}
      {/* ======================================================== */}
      {selectedBookForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {selectedBookForDetails.category}
                </span>
                <h3 className="font-bold text-lg text-stone-900 font-display mt-1">
                  {selectedBookForDetails.title}
                </h3>
                <p className="text-xs text-stone-600">by {selectedBookForDetails.author}</p>
              </div>
              <button 
                onClick={() => setSelectedBookForDetails(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-stone-700 block mb-1">Synopsis & Academic Scope:</span>
                <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {selectedBookForDetails.synopsis}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 font-mono text-[11px]">
                <div>
                  <span className="text-stone-500 font-sans block">Accession Number:</span>
                  <strong className="text-stone-900">{selectedBookForDetails.accessionNo}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-sans block">ISBN:</span>
                  <strong className="text-stone-900">{selectedBookForDetails.isbn}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-sans block">Dewey Decimal:</span>
                  <strong className="text-stone-900">{selectedBookForDetails.deweyDecimal}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-sans block">Shelf Location:</span>
                  <strong className="text-stone-900">{selectedBookForDetails.shelfLocation}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-sans block">Publisher:</span>
                  <strong className="text-stone-900">{selectedBookForDetails.publisher} ({selectedBookForDetails.yearPublished})</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-sans block">Stock Status:</span>
                  <strong className="text-emerald-700">{selectedBookForDetails.availableCopies} of {selectedBookForDetails.totalCopies} Available</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              {selectedBookForDetails.availableCopies > 0 && selectedBookForDetails.status === 'Available' ? (
                <button
                  onClick={() => {
                    const bk = selectedBookForDetails;
                    setSelectedBookForDetails(null);
                    setSelectedBookForBorrow(bk);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-950 hover:bg-rose-900 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Borrow This Book</span>
                </button>
              ) : (
                <span className="text-xs text-stone-500 font-medium italic">
                  Non-circulating or currently on loan
                </span>
              )}

              <button
                onClick={() => setSelectedBookForDetails(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
