import type { AiAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function AiAvatarBadge({
  avatar,
  size = "md",
}: {
  avatar: AiAvatar;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 text-base",
    md: "h-10 w-10 text-xl",
    lg: "h-14 w-14 text-3xl",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        sizes[size],
        avatar.bgClass
      )}
      title={avatar.label}
    >
      <span role="img" aria-label={avatar.label}>
        {avatar.emoji}
      </span>
    </div>
  );
}
