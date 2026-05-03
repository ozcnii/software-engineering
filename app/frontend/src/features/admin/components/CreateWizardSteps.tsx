export type WizardStep = 1 | 2 | 3;

export function CreateWizardSteps({ step }: { step: WizardStep }) {
  const labels = ['Параметры', 'Редактор', 'Сохранить'];

  return (
    <div className="wiz-stepper">
      {labels.map((label, index) => {
        const stepNumber = (index + 1) as WizardStep;
        const isDone = stepNumber < step;
        const isActive = stepNumber === step;

        return (
          <div className="stepper-part" key={label}>
            <div className={`wiz-dot ${isDone ? 's-done' : ''} ${isActive ? 's-active' : ''}`}>
              {stepNumber}
            </div>
            <span className={`wiz-lbl ${isActive ? 's-active' : ''}`}>{label}</span>
            {index < labels.length - 1 ? <div className={`wiz-line ${isDone ? 's-done' : ''}`} /> : null}
          </div>
        );
      })}
    </div>
  );
}

interface WizardNavProps {
  prevLabel?: string;
  nextLabel: string;
  onPrev?: () => void;
  onCancel: () => void;
  onNext?: () => void;
  nextType?: 'button' | 'submit';
  nextDisabled?: boolean;
}

export function WizardNav({
  prevLabel,
  nextLabel,
  onPrev,
  onCancel,
  onNext,
  nextType = 'button',
  nextDisabled = false,
}: WizardNavProps) {
  return (
    <div className="wiz-nav">
      {onPrev ? (
        <button className="btn btn-ghost btn-sm" type="button" onClick={onPrev}>
          {prevLabel}
        </button>
      ) : null}
      <div className="toolbar-spacer" />
      <button className="btn btn-ghost btn-sm" type="button" onClick={onCancel}>
        Отмена
      </button>
      <button className="btn btn-primary" type={nextType} onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </button>
    </div>
  );
}
