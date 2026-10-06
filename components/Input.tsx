import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="eyebrow">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full border-0 border-b border-border bg-transparent px-0.5 py-2.5 text-base text-ink placeholder:text-ink-faint/70 transition-colors focus:border-forest focus:outline-none",
            error && "border-danger",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
