"use client";
import { useState } from "react";
import clsx from "clsx";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import { REPORT_REASONS } from "@/lib/types";
import { reportContent } from "@/lib/api";
import { friendlyError } from "@/lib/supabase";

export default function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
}: {
  open: boolean;
  onClose: () => void;
  targetType: "question" | "answer";
  targetId: string;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!reason) return;
    setState("sending");
    setError(null);
    try {
      await reportContent({ targetType, targetId, reason, details });
      setState("done");
    } catch (err) {
      setError(friendlyError(err));
      setState("idle");
    }
  }

  function close() {
    onClose();
    setTimeout(() => {
      setReason(null);
      setDetails("");
      setState("idle");
      setError(null);
    }, 300);
  }

  return (
    <Modal open={open} onClose={close} title={state === "done" ? undefined : `Report this ${targetType}`}>
      {state === "done" ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="font-display text-2xl text-ink">Thanks for flagging it.</p>
          <p className="text-sm text-ink-muted">A moderator will take a look. Your report is anonymous.</p>
          {reason === "Someone may be in danger" && (
            <p className="mt-3 text-sm text-ink-muted">
              If someone is in immediate danger, call <strong>112</strong>. In India, Tele-MANAS offers free
              24/7 mental-health support at <strong>14416</strong>.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={clsx(
                  "border px-4 py-2.5 text-left text-sm transition-colors",
                  reason === r ? "border-forest bg-forest-tint text-forest" : "border-border text-ink-muted hover:border-border-strong"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Textarea
            label="Anything else? (optional)"
            rows={3}
            maxLength={500}
            showCount
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button disabled={!reason || state === "sending"} onClick={submit} className="w-full">
            {state === "sending" ? "Sending…" : "Send report"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
