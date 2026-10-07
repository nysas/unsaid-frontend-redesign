"use client";
import { useState } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import { FEEDBACK_CATEGORIES } from "@/lib/types";
import clsx from "clsx";
import { giveFeedback } from "@/lib/api";
import { friendlyError } from "@/lib/supabase";

/** Detailed feedback, shown only to the person who asked the question. */
export default function FeedbackModal({
  open,
  onClose,
  answerId,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  answerId: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(cat: string) {
    setCategories((c) => (c.includes(cat) ? c.filter((x) => x !== cat) : [...c, cat]));
  }

  async function submit() {
    setSending(true);
    setError(null);
    try {
      await giveFeedback({
        answerId,
        helpful: !categories.includes("Wasn't helpful"),
        rating,
        categories,
        note,
      });
    } catch (err) {
      setError(friendlyError(err));
      setSending(false);
      return;
    }
    setSending(false);
    setSubmitted(true);
    setTimeout(() => {
      onSubmitted();
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
          <p className="text-sm text-ink-muted">They&apos;ll see what helped — never who said it.</p>
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

          {error && <p className="text-sm text-danger">{error}</p>}
          <Button disabled={rating === 0 || sending} onClick={submit} className="w-full">
            {sending ? "Sending…" : "Submit feedback"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
