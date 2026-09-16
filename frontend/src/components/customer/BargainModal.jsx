import React, { useState } from 'react';
import { MessageCircle, Send, TrendingDown } from 'lucide-react';
import { Modal } from '../common/Modal';

export const BargainModal = ({ product, isOpen, onClose, onSubmitted }) => {
  const [quantity, setQuantity] = useState(1);
  const [targetPrice, setTargetPrice] = useState(product?.price || '');
  const [maxPrice, setMaxPrice] = useState(product?.price || '');
  const [message, setMessage] = useState('Can you offer a better price for this quantity?');
  const [submitted, setSubmitted] = useState(false);

  if (!product) return null;

  const submitOffer = (event) => {
    event.preventDefault();
    setSubmitted(true);
    onSubmitted?.({ quantity, targetPrice, maxPrice, message, product });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bargain with shop owner" maxWidth="max-w-lg">
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><Send className="w-5 h-5" /></div>
          <h3 className="font-black text-slate-900">Offer sent for review</h3>
          <p className="text-xs text-slate-500">{product.shopId?.shopName || 'The shop owner'} can reply with a counter-offer in chat.</p>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">Done</button>
        </div>
      ) : (
        <form onSubmit={submitOffer} className="space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-xs font-black text-slate-900">{product.name}</p>
            <p className="text-xs text-slate-500 mt-1">{product.shopId?.shopName || 'Local shop'} • Listed at ₹{product.price} / {product.unit}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs font-bold text-slate-700">Quantity<input type="number" min="1" max={product.quantityInStock || 1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs" /></label>
            <label className="text-xs font-bold text-slate-700">Target ₹<input type="number" min="1" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs" /></label>
            <label className="text-xs font-bold text-slate-700">Max ₹<input type="number" min={targetPrice || 1} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs" /></label>
          </div>
          <label className="block text-xs font-bold text-slate-700">Message to shop owner<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="3" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs resize-none" /></label>
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800"><TrendingDown className="w-4 h-4" /> Your target is ₹{targetPrice} and you can go up to ₹{maxPrice}.</div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Send offer to shop owner</button>
        </form>
      )}
    </Modal>
  );
};
