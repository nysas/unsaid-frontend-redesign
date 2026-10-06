"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/UserProfileProvider";
import { User } from "@/lib/types";

/**
 * Wrap any page that needs a real signed-in user. Redirects to /login once
 * mounted if there's no session. Renders nothing while that decision is made
 * or while redirecting, and passes the resolved user down via children fn.
 */
export default function AuthGate({
  children,
}: {
  children: (user: User) => React.ReactNode;
}) {
  const { user, isLoggedIn, mounted } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !isLoggedIn) router.replace("/login");
  }, [mounted, isLoggedIn, router]);

  if (!mounted || !isLoggedIn || !user) return null;

  return <>{children(user)}</>;
}
