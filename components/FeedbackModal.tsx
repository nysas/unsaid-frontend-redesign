"use client";
import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import { FEEDBACK_CATEGORIES } from "@/lib/types";
import clsx from "clsx";

export default function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function toggle(cat: string) {
    setCategories((c) => (c.includes(cat) ? c.filter((x) => x !== cat) : [...c, cat]));
  }

  function submit() {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setRating(0);
      setCategories([]);
      setNote("");
    }, 1300);
  }

  return (
    <Modal open={open} onClose={onClose} title={submitted ? undefined : "Was this helpful?"}>
      {submitted ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="font-display text-2xl text-ink">Thank you.</p>
          <p className="text-sm text-ink-muted">It helps repliers know what actually helps.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className={clsx(
                  "font-display text-2xl transition-colors",
                  n <= rating ? "text-gold" : "text-border-strong"
                )}
              >
                ●
              </button>
            ))}
          </div>

          <div>
            <p className="eyebrow mb-3">What did this help with?</p>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggle(cat)}
                  className={clsx(
                    "border px-3 py-1.5 text-sm transition-colors",
                    categories.includes(cat)
                      ? "border-forest text-forest bg-forest-tint"
                      : "border-border text-ink-muted hover:border-border-strong"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Tell them what helped (optional)"
            placeholder="Be specific."
            rows={3}
            maxLength={300}
            showCount
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <Button disabled={rating === 0} onClick={submit} className="w-full">
            Submit feedback
          </Button>
        </div>
      )}
    </Modal>
  );
}
