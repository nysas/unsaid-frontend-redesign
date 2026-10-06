import clsx from "clsx";

export default function Divider({ className }: { className?: string }) {
  return <hr className={clsx("divider border-t", className)} />;
}
