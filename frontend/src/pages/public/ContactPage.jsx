import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export const ContactPage = () => {
  const { addToast } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);
    addToast('📬 Message received! Our support desk will reply promptly.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
          Support & Local Merchant Onboarding
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Get in Touch with QuickKart
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions about registering your physical store, onboarding APIs, or customer support? Reach out anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
        {/* Contact Info (Left) */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 rounded-3xl space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Contact Details</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Headquarters</p>
                  <p className="text-slate-400">Department of Computer Science & Engineering, New Delhi - 110001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Email Support</p>
                  <p className="text-slate-400">support@quickkart.com • merchant@quickkart.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Merchant Helpline</p>
                  <p className="text-slate-400">+91 11 2345 6789 (Mon–Sat, 9AM–8PM)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300">
            <span className="font-bold text-emerald-400 block mb-0.5">✓ 100% Free Store Registration</span>
            No monthly subscription fees or listing charges for neighborhood retailers.
          </div>
        </div>

        {/* Contact Form (Right) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Send us a Message</h3>

          {sent ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base">Message Sent Successfully!</h4>
              <p className="text-xs text-emerald-800">
                Thank you for contacting QuickKart. A representative will respond to your inquiry within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Message / Inquiry *
                </label>
                <textarea
                  required
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help your local shopping or store onboarding experience?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
