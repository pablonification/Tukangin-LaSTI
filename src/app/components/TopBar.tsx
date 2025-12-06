import Image from "next/image";
import Link from "next/link";

interface TopBarProps {
  backHref: string;
  text?: string;
  textClassName?: string;
  className?: string;
  iconSrc?: string;
}

export const TopBar = ({ backHref, text, textClassName = "", className = "", iconSrc }: TopBarProps) => {
  return (
    <div 
      className={`sticky top-0 left-0 right-0 bg-white z-40 border-b border-[#D4D4D4] ${className}`}
      style={{
        paddingTop: 'max(1.5rem, env(safe-area-inset-top))'
      }}
    >
      <div className="absolute left-6 z-50" style={{ top: 'max(1.5rem, env(safe-area-inset-top))' }}>
        <Link 
          href={backHref}
          className="inline-flex items-center justify-center p-2 -m-2 active:scale-90 transition-transform"
        >
          <Image src={iconSrc || "/back.svg"} alt="Back" width={20} height={20} />
        </Link>
      </div>
      <div className="px-6 pb-4">
        {text && (
          <div className="ml-8 -translate-y-0.5">
            <p className={`${textClassName || "text-sh3b text-[#141414]"} break-words`}>{text}</p>
          </div>
        )}
      </div>
    </div>
  );
};