import Image from "next/image";
import Link from "next/link";

export const Logo = ({
  href = "/",
  width = 100,
  height = 27,
  className,
}: {
  href?: string;
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <Link href={href} className={className}>
      <Image
        width={width}
        height={height}
        src="/logo_light-mode.svg"
        alt="Logo"
        className="block dark:hidden"
      />
      <Image
        width={width}
        height={height}
        src="/logo_dark-mode.svg"
        alt="Logo"
        className="hidden dark:block"
      />
    </Link>
  );
};
