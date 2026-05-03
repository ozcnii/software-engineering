import type { EditorTool } from '../lib/mazeEditorRules';

interface MazeEditorToolbarProps {
  tool: EditorTool;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: EditorTool) => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function MazeEditorToolbar({
  tool,
  canUndo,
  canRedo,
  onToolChange,
  onUndo,
  onRedo,
}: MazeEditorToolbarProps) {
  return (
    <div className="card editor-toolbar">
      <span className="muted">Инструмент:</span>
      <ToolButton active={tool === 'wall'} label="Стена" onClick={() => onToolChange('wall')} />
      <ToolButton active={tool === 'path'} label="Проход" onClick={() => onToolChange('path')} />
      <ToolButton active={tool === 'entry'} label="S Вход" onClick={() => onToolChange('entry')} />
      <ToolButton active={tool === 'exit'} label="E Выход" onClick={() => onToolChange('exit')} />
      <div className="toolbar-spacer" />
      <button className="btn btn-sm btn-ghost" type="button" onClick={onUndo} disabled={!canUndo}>
        Отмена
      </button>
      <button className="btn btn-sm btn-ghost" type="button" onClick={onRedo} disabled={!canRedo}>
        Повтор
      </button>
    </div>
  );
}

function ToolButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={`btn btn-sm ${active ? 'btn-primary' : ''}`} type="button" onClick={onClick}>
      {label}
    </button>
  );
}
