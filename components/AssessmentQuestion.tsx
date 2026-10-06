import clsx from "clsx";
import Textarea from "@/components/Textarea";
import { AssessmentQuestionT } from "@/lib/types";

export default function AssessmentQuestion({
  question,
  value,
  onChange,
}: {
  question: AssessmentQuestionT;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-display text-2xl leading-[1.35] text-ink sm:text-3xl">
        {question.question}
      </p>
      {question.type === "mcq" && question.options ? (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={clsx(
                "flex items-center gap-3 border px-4 py-3 text-left text-[15px] transition-colors",
                value === option
                  ? "border-forest bg-forest-tint text-forest"
                  : "border-border text-ink-muted hover:border-border-strong"
              )}
            >
              <span className="text-base leading-none">{value === option ? "●" : "○"}</span>
              {option}
            </button>
          ))}
        </div>
      ) : (
        <Textarea
          placeholder="Write your response…"
          rows={7}
          maxLength={1200}
          showCount
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
