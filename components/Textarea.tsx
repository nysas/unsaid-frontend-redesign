import { TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, showCount, maxLength, id, value, ...props }, ref) => {
    const areaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const length = typeof value === "string" ? value.length : 0;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={areaId} className="eyebrow">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          value={value}
          maxLength={maxLength}
          className={clsx(
            "w-full resize-none border-0 border-b border-border bg-transparent px-0.5 py-3 font-display text-xl leading-relaxed text-ink placeholder:text-ink-faint/60 transition-colors focus:border-forest focus:outline-none",
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between">
          {hint ? <p className="text-xs text-ink-faint">{hint}</p> : <span />}
          {showCount && maxLength && (
            <p className="eyebrow text-ink-faint/70">{length}/{maxLength}</p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export default Textarea;
