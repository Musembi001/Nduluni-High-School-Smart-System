import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, LockKeyhole, Save, X } from 'lucide-react';

export const AccountSettingsModal: React.FC = () => {
  const { currentUser, updateAccount, isSettingsOpen, setIsSettingsOpen } = useAuth();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSettingsOpen) return;
    setName(currentUser.name);
    setPhone(currentUser.phone || '');
    setEmail(currentUser.email || '');
    setError(null);
    setSaved(false);
  }, [isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateAccount({ name, phone, email });
      if (result.success) {
        setSaved(true);
      } else {
        setError(result.error || 'Settings could not be saved.');
      }
    } catch {
      setError('Could not reach the account service. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="account-settings-title" className="w-full max-w-lg bg-white rounded-xl border border-stone-200 shadow-2xl">
        <header className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-stone-200">
          <div>
            <h2 id="account-settings-title" className="text-xl font-bold font-display text-stone-900">Account Settings</h2>
            <p className="mt-1 text-xs text-stone-500">Manage your contact details for school communications.</p>
          </div>
          <button type="button" onClick={() => setIsSettingsOpen(false)} className="p-1 text-stone-500 hover:text-stone-900" aria-label="Close settings">
            <X className="w-5 h-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <LockKeyhole className="w-4 h-4 text-rose-900 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900">{currentUser.roleTitle}</p>
              <p className="text-xs text-stone-500">Login: {currentUser.username} | Role assignments are managed by the school.</p>
            </div>
          </div>

          {error && <p role="alert" className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs">{error}</p>}
          {saved && <p role="status" aria-live="polite" className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 shrink-0" /> Changes saved successfully.</p>}

          <label className="block text-xs font-semibold text-stone-700">
            Full name
            <input required value={name} onChange={event => setName(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-stone-300 bg-white font-normal focus:outline-none focus:ring-2 focus:ring-rose-900/20" />
          </label>
          <label className="block text-xs font-semibold text-stone-700">
            Phone number
            <input type="tel" value={phone} onChange={event => setPhone(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-stone-300 bg-white font-normal focus:outline-none focus:ring-2 focus:ring-rose-900/20" />
          </label>
          <label className="block text-xs font-semibold text-stone-700">
            Email address
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-stone-300 bg-white font-normal focus:outline-none focus:ring-2 focus:ring-rose-900/20" />
          </label>

          <footer className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsSettingsOpen(false)} className="px-3 py-2 rounded-md border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50">Close</button>
            <button type="submit" disabled={saving} className={`px-3 py-2 rounded-md text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-2 ${saved ? 'bg-emerald-800 hover:bg-emerald-700' : 'bg-rose-950 hover:bg-rose-900'}`}>
              {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />} {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};
