import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Avatar className={cn("size-5", className)}>
      <AvatarImage src={imageUrl} alt={name} />
      <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
    </Avatar>
  );
}
