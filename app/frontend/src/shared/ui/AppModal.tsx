import { useId, type ReactNode } from 'react';

interface AppModalProps {
  title: string;
  titleId?: string;
  className?: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}

export function AppModal({ title, titleId, className = '', children, actions, onClose }: AppModalProps) {
  const generatedTitleId = useId();
  const headingId = titleId ?? generatedTitleId;

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className={`modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <div className="modal-head">
          <h2 id={headingId}>{title}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">
            x
          </button>
        </div>
        {children}
        {actions ? <div className="modal-actions">{actions}</div> : null}
      </section>
    </div>
  );
}
