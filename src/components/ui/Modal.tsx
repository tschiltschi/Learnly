import { useT } from '@/i18n';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({
  open,
  onClose,
  children,
  className,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const t = useT();
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-[fade-up_.2s_ease-out_both] bg-ink-950/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative max-h-[92vh] w-full animate-scale-in overflow-y-auto rounded-t-3xl border border-white/10 bg-ink-850 shadow-2xl sm:max-w-lg sm:rounded-3xl',
          className,
        )}
      >
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-lg p-1.5 text-fog-400 transition hover:bg-white/10 hover:text-fog-100" aria-label={t('Close')}>
          <X className="h-4 w-4" />
        </button>
        {title && (
          <div className="px-6 pb-2 pt-6">
            <h2 className="pr-8 font-display text-lg font-semibold text-fog-100">{title}</h2>
            {description && <p className="mt-1 text-sm text-fog-400">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} className="sm:max-w-md">
      <div className="flex justify-end gap-2 px-6 pb-6 pt-4">
        <button onClick={onClose} className="h-10 rounded-xl px-4 text-sm text-fog-300 hover:bg-white/5">
          {t('Cancel')}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="h-10 rounded-xl bg-rose-500 px-4 text-sm font-medium text-white hover:bg-rose-400"
        >
          {confirmLabel ?? t('Delete')}
        </button>
      </div>
    </Modal>
  );
}
