import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Star, X, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  bookingId: string;
  mechanicId?: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  bookingId,
  mechanicId = 'mech-1',
  isOpen,
  onClose,
  onReviewSubmitted
}) => {
  const { user } = useAuth();
  const [overallRating, setOverallRating] = useState(5);
  const [responseTimeRating, setResponseTimeRating] = useState(5);
  const [professionalismRating, setProfessionalismRating] = useState(5);
  const [repairQualityRating, setRepairQualityRating] = useState(5);
  const [pricingTransparencyRating, setPricingTransparencyRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await api.addReview({
        bookingId,
        customerId: user.id,
        mechanicId,
        overallRating,
        responseTimeRating,
        professionalismRating,
        repairQualityRating,
        pricingTransparencyRating,
        comment: comment || 'Excellent and transparent roadside service!'
      });

      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRatingInput = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
      <span className="text-xs text-slate-300 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-125 transition-transform"
          >
            <Star
              className={`w-4 h-4 ${
                star <= value
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-left space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-white">Rate & Review Mechanic</h3>
            <p className="text-[11px] text-slate-400">Help the community with your feedback</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Thank You for Your Review!</h4>
            <p className="text-xs text-slate-400">Your rating has been published to the mechanic profile.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <StarRatingInput
                label="Overall Service Experience"
                value={overallRating}
                onChange={setOverallRating}
              />
              <StarRatingInput
                label="Response Time & Arrival"
                value={responseTimeRating}
                onChange={setResponseTimeRating}
              />
              <StarRatingInput
                label="Professionalism & Attitude"
                value={professionalismRating}
                onChange={setProfessionalismRating}
              />
              <StarRatingInput
                label="Repair & Diagnostics Quality"
                value={repairQualityRating}
                onChange={setRepairQualityRating}
              />
              <StarRatingInput
                label="Pricing Transparency"
                value={pricingTransparencyRating}
                onChange={setPricingTransparencyRating}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Written Review</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (e.g. fast arrival, clear explanation of parts, respectful demeanor)..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Service Rating'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
