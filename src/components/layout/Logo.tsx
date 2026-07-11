import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Marca oficial (palheta sem fundo branco). */
const LOGO_SRC = '/favico.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/** Proporção ~488×511 */
const sizes = {
  sm: { height: 32, width: 31 },
  md: { height: 40, width: 38 },
  lg: { height: 48, width: 46 },
};

const textSizes = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-5xl',
};

export function Logo({ className, size = 'lg' }: LogoProps) {
  const dim = sizes[size];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src={LOGO_SRC}
        alt=""
        width={dim.width}
        height={dim.height}
        className="shrink-0 object-contain"
        style={{ height: dim.height, width: 'auto' }}
        priority
        aria-hidden
      />
      <span
        className={cn('font-chakra font-bold tracking-tight text-neutral-900', textSizes[size])}
      >
        Cifra
        <span className="text-primary-400">Tom</span>
      </span>
    </span>
  );
}
