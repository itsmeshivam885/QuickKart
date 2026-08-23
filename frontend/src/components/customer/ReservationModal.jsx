import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { reservationService } from '../../services/reservationService';
import { useNotification } from '../../context/NotificationContext';
import { ShoppingBag, Clock, ShieldCheck, MapPin, IndianRupee } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReservationModal = ({ isOpen, onClose, targetItem, onSuccess }) => {
  const { addToast } = useNotification();
  const [quantity, setQuantity] = useState(targetItem?.quantity || 1);
  const [customerNote, setCustomerNote] = useState('');
  const [holdMinutes, setHoldMinutes] = useState(60);
  const [loading, setLoading] = useState(false);

  if (!targetItem) return null;

  const unitPrice = targetItem.price || targetItem.offeredPrice || 0;
  const totalPrice = unitPrice * (parseInt(quantity) || 1);
  const shopName = targetItem.shopName || targetItem.shopId?.shopName || 'Local Shop';
  const shopId = targetItem.shopId?._id || targetItem.shopId;

  const handleConfirmHold = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await reservationService.createReservation({
        shopId,
        productId: targetItem._id && !targetItem.requestId ? targetItem._id : null,
        requestId: targetItem.requestId || null,
        productName: targetItem.name || targetItem.productName || targetItem.alternativeProductName,
        quantity: parseInt(quantity) || 1,
        unit: targetItem.unit || 'piece',
        agreedPrice: unitPrice,
        customerNote,
        holdDurationMinutes: holdMinutes,
      });

      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });

        addToast(
          `🎉 Product Hold Confirmed! Ticket Code: ${res.reservation.reservationCode}. Shop has set item aside for you.`,
          'success',
          7000
        );
        onClose();
        if (onSuccess) onSuccess(res.reservation);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create reservation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛍️ Confirm In-Store Hold & Reservation" maxWidth="max-w-md">
      <form onSubmit={handleConfirmHold} className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Zero Upfront Payment Required</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            The shopkeeper will hold this product exclusively for you. You inspect and pay at the shop counter when you visit.
          </p>
        </div>

        {/* Item Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Store:</span>
            <span className="font-bold text-slate-800">{shopName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Product:</span>
            <span className="font-bold text-slate-800">{targetItem.name || targetItem.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Unit Price:</span>
            <span className="font-bold text-slate-800">₹{unitPrice}</span>
          </div>
        </div>

        {/* Quantity & Hold Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Hold Duration
            </label>
            <select
              value={holdMinutes}
              onChange={(e) => setHoldMinutes(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes (Standard)</option>
              <option value={120}>2 Hours</option>
            </select>
          </div>
        </div>

        {/* Customer Note */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Note for Shopkeeper (Optional)
          </label>
          <input
            type="text"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="e.g. Arriving on bike in 25 mins"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Total Price Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white">
          <span className="text-xs font-medium text-slate-300">Total Payable at Counter:</span>
          <span className="text-xl font-black text-brand-400">₹{totalPrice}</span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            {loading ? 'Confirming Hold...' : 'Confirm In-Store Hold'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
