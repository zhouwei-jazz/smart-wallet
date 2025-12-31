import type { PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<{
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
}>;

export function Card({ title, action, className = '', children }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/5 bg-white/5 p-5 shadow-lg shadow-sky-900/10 backdrop-blur-xl ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <div className="text-lg font-semibold text-white">{title}</div>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
