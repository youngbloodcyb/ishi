import Image from "next/image";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className = "", showText = true }: LogoProps) {
  if (showText) {
    return (
      <>
        <Image
          src="/logo_light-mode.svg"
          alt="Outr"
          width={120}
          height={32}
          className={`dark:hidden ${className}`}
          priority
        />
        <Image
          src="/logo_dark-mode.svg"
          alt="Outr"
          width={120}
          height={32}
          className={`hidden dark:block ${className}`}
          priority
        />
      </>
    );
  }

  return (
    <div className={`flex aspect-square items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground ${className}`}>
      <Image
        src="/icon.svg"
        alt="Outr"
        width={24}
        height={24}
        priority
      />
    </div>
  );
}
