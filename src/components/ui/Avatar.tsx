import clsx from 'clsx';

interface AvatarProps {
  src?: string | null;
  username: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({ src, username, size = 'md', className }: AvatarProps) {
  const letter = username[0]?.toUpperCase() ?? '?';

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center flex-shrink-0 font-semibold overflow-hidden',
        SIZES[size],
        className
      )}
      style={{ background: '#0d0d0d', color: '#c8a96e' }}
    >
      {src ? (
        <img src={src} alt={username} className="w-full h-full object-cover" />
      ) : (
        letter
      )}
    </div>
  );
}
