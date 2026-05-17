import type { EditorTool } from '../lib/mazeEditorRules';

interface MazeEditorToolbarProps {
  tool: EditorTool;
  enabledTools: EditorTool[];
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: EditorTool) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function MazeEditorToolbar({
  tool,
  enabledTools,
  canUndo,
  canRedo,
  onToolChange,
  onUndo,
  onRedo,
}: MazeEditorToolbarProps) {
  return (
    <div className="card editor-toolbar">
      <span className="muted">Инструмент:</span>
      <ToolButton
        active={tool === 'wall'}
        disabled={!enabledTools.includes('wall')}
        label="Стена"
        onClick={() => onToolChange('wall')}
      />
      <ToolButton
        active={tool === 'path'}
        disabled={!enabledTools.includes('path')}
        label="Проход"
        onClick={() => onToolChange('path')}
      />
      <ToolButton
        active={tool === 'entry'}
        disabled={!enabledTools.includes('entry')}
        label="S Вход"
        onClick={() => onToolChange('entry')}
      />
      <ToolButton
        active={tool === 'exit'}
        disabled={!enabledTools.includes('exit')}
        label="E Выход"
        onClick={() => onToolChange('exit')}
      />
      <div className="toolbar-spacer" />
      <button
        className="btn btn-sm btn-ghost"
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
      >
        Отмена
      </button>
      <button
        className="btn btn-sm btn-ghost"
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
      >
        Повтор
      </button>
    </div>
  );
}

function ToolButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`btn btn-sm ${active ? 'btn-primary' : ''}`}
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
