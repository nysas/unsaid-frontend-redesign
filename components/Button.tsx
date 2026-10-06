import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none",
          {
            "bg-cta-bg text-cta-text hover:opacity-90": variant === "primary",
            "border border-border-strong text-ink hover:border-forest hover:text-forest bg-transparent":
              variant === "secondary",
            "text-ink-muted hover:text-ink bg-transparent": variant === "ghost",
            "text-forest underline-offset-4 hover:underline bg-transparent p-0":
              variant === "text",
          },
          variant !== "text" && {
            "text-xs px-4 py-2": size === "sm",
            "text-sm px-6 py-3": size === "md",
            "text-sm px-8 py-4": size === "lg",
          },
          variant !== "text" && "rounded-[3px] uppercase",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export default Button;
