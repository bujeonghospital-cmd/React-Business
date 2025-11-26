import ScaledCanvas from "../../ScaledCanvas";
import Link from "next/link";

type LogoProps = {
  className?: string;
  style?: React.CSSProperties;
};

export default function Logo({ className = "", style }: LogoProps) {
  return (
    <ScaledCanvas>
      <div
        className={`flex items-center justify-center ${className}`}
        style={style}
      >
        <Link href="/" className="inline-block shrink-0" aria-label="Go home">
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet="/images/logo/LOGO.png"
            />
            <source media="(min-width: 768px)" srcSet="/images/logo/LOGO.png" />
            <img
              src="/images/logo/LOGO.png"
              alt="BJH Bangkok - ศัลยกรรมตกแต่ง และความงาม"
              width={70}
              height={70}
              className="object-contain w-[70px] h-[70px]"
              loading="eager"
            />
          </picture>
        </Link>
      </div>
    </ScaledCanvas>
  );
}
