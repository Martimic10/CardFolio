import Image from "next/image";

type BrandMarkProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandMark({
  size = 36,
  className = "",
  priority = false,
}: BrandMarkProps) {
  return (
    <Image
      src="/cardfolio-mark.png"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden
      priority={priority}
    />
  );
}
