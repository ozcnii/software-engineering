import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiClientError } from '../../shared/api/client';
import { labyrinthsApi } from '../../shared/api/labyrinthsApi';
import type {
  Coordinate,
  LabyrinthDetail,
  LabyrinthListItem,
  LabyrinthTheme,
  SolvingAlgorithm,
  User,
} from '../../shared/types/domain';
import { themeLabels, themeMarks } from '../../shared/ui/labels';
import { AutoSolvePanel } from './AutoSolvePanel';
import { ManualControls } from './ManualControls';
import { MazeGrid } from './MazeGrid';
import { PlayerInfoModals } from './PlayerInfoModals';
import { PlayerLabyrinthList } from './PlayerLabyrinthList';
import { PlayerStatsPanel } from './PlayerStatsPanel';
import { PlayerThemePicker } from './PlayerThemePicker';
import {
  createInitialRunState,
  formatElapsed,
  getCell,
  hasProgress,
  isWalkableCell,
  moveCoordinate,
  sameCoordinate,
  type AutoDisplayMode,
  type ControlMode,
  type Direction,
  type PlayerRunState,
} from './playerState';

type PlayerModal = 'about' | 'system' | null;
type ConfirmAction = 'reset' | 'exit' | 'auto' | null;

interface PlayerLayoutProps {
  user: User;
  onLogout: () => Promise<void>;
}

export function PlayerLayout({ user, onLogout }: PlayerLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabyrinth, setSelectedLabyrinth] = useState<LabyrinthDetail | null>(null);
  const [run, setRun] = useState<PlayerRunState | null>(null);
  const [themeOverride, setThemeOverride] = useState<LabyrinthTheme | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>('manual');
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isWallFeedbackActive, setIsWallFeedbackActive] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [activeModal, setActiveModal] = useState<PlayerModal>(null);
  const [autoAlgorithm, setAutoAlgorithm] = useState<SolvingAlgorithm>('bfs');
  const [autoDisplayMode, setAutoDisplayMode] = useState<AutoDisplayMode>('animated');
  const [autoSpeed, setAutoSpeed] = useState(3);
  const [solveError, setSolveError] = useState('');
  const [isSolveLoading, setIsSolveLoading] = useState(false);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
  const [animationPath, setAnimationPath] = useState<Coordinate[] | null>(null);
  const detailRequestIdRef = useRef(0);
  const solveRequestIdRef = useRef(0);

  const activeTheme = themeOverride ?? selectedLabyrinth?.theme ?? 'winter';
  const canUseLevel = Boolean(selectedLabyrinth && run);
  const isBusy = isSolveLoading || isAnimationRunning || animationPath !== null;

  useEffect(() => {
    if (!isTimerRunning) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRun((current) =>
        current
          ? {
              ...current,
              elapsedSeconds: current.elapsedSeconds + 1,
            }
          : current,
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  useEffect(() => {
    if (!animationPath) {
      return undefined;
    }

    if (animationPath.length <= 1) {
      setRun((current) =>
        current
          ? {
              ...current,
              trail: animationPath,
              position: animationPath[animationPath.length - 1] ?? current.position,
              steps: Math.max(0, animationPath.length - 1),
              isFinished: true,
              progressSource: 'auto',
            }
          : current,
      );
      setIsTimerRunning(false);
      setIsAnimationRunning(false);
      setAnimationPath(null);
      setIsCompletionOpen(true);
      return undefined;
    }

    let index = 0;
    const delay = 1000 / autoSpeed;
    setIsAnimationRunning(true);
    setRun((current) =>
      current
        ? {
            ...current,
            position: animationPath[0],
            trail: [animationPath[0]],
            steps: 0,
            isFinished: false,
            progressSource: 'auto',
          }
        : current,
    );

    const interval = window.setInterval(() => {
      index += 1;
      const point = animationPath[index];

      if (!point) {
        window.clearInterval(interval);
        setIsAnimationRunning(false);
        setIsTimerRunning(false);
        setAnimationPath(null);
        return;
      }

      const isLast = index >= animationPath.length - 1;
      setRun((current) =>
        current
          ? {
              ...current,
              position: point,
              trail: animationPath.slice(0, index + 1),
              steps: index,
              isFinished: isLast,
              progressSource: 'auto',
            }
          : current,
      );

      if (isLast) {
        window.clearInterval(interval);
        setIsAnimationRunning(false);
        setIsTimerRunning(false);
        setAnimationPath(null);
        setIsCompletionOpen(true);
      }
    }, delay);

    return () => window.clearInterval(interval);
  }, [animationPath, autoSpeed]);

  const resetRun = useCallback(() => {
    if (!selectedLabyrinth) {
      return;
    }

    setAnimationPath(null);
    setIsAnimationRunning(false);
    setIsTimerRunning(false);
    setIsCompletionOpen(false);
    setSolveError('');
    setRun(createInitialRunState(selectedLabyrinth));
  }, [selectedLabyrinth]);

  const exitLevel = useCallback(() => {
    detailRequestIdRef.current += 1;
    solveRequestIdRef.current += 1;
    setSelectedId(null);
    setSelectedLabyrinth(null);
    setRun(null);
    setThemeOverride(null);
    setControlMode('manual');
    setIsDetailLoading(false);
    setDetailError('');
    setIsTimerRunning(false);
    setIsCompletionOpen(false);
    setConfirmAction(null);
    setSolveError('');
    setIsSolveLoading(false);
    setIsAnimationRunning(false);
    setAnimationPath(null);
  }, []);

  const selectLabyrinth = useCallback((labyrinth: LabyrinthListItem) => {
    const requestId = detailRequestIdRef.current + 1;
    detailRequestIdRef.current = requestId;
    solveRequestIdRef.current += 1;

    setSelectedId(labyrinth.id);
    setSelectedLabyrinth(null);
    setRun(null);
    setThemeOverride(null);
    setControlMode('manual');
    setIsDetailLoading(true);
    setDetailError('');
    setIsTimerRunning(false);
    setIsCompletionOpen(false);
    setConfirmAction(null);
    setSolveError('');
    setIsSolveLoading(false);
    setIsAnimationRunning(false);
    setAnimationPath(null);

    labyrinthsApi
      .detail(labyrinth.id)
      .then((detail) => {
        if (detailRequestIdRef.current !== requestId) {
          return;
        }

        setSelectedLabyrinth(detail);
        setRun(createInitialRunState(detail));
      })
      .catch((error: unknown) => {
        if (detailRequestIdRef.current !== requestId) {
          return;
        }

        setSelectedId(null);
        setSelectedLabyrinth(null);
        setRun(null);
        setDetailError(errorMessage(error, 'Не удалось загрузить лабиринт'));
      })
      .finally(() => {
        if (detailRequestIdRef.current === requestId) {
          setIsDetailLoading(false);
        }
      });
  }, []);

  const movePlayer = useCallback(
    (direction: Direction) => {
      if (
        !selectedLabyrinth ||
        !run ||
        controlMode !== 'manual' ||
        isAnimationRunning ||
        isSolveLoading ||
        run.isFinished
      ) {
        return;
      }

      const nextPosition = moveCoordinate(run.position, direction);
      const nextCell = getCell(selectedLabyrinth.grid, nextPosition);

      if (!isWalkableCell(nextCell)) {
        setIsWallFeedbackActive(true);
        window.setTimeout(() => setIsWallFeedbackActive(false), 260);
        return;
      }

      const isFinished = sameCoordinate(nextPosition, selectedLabyrinth.exit);

      setRun({
        ...run,
        position: nextPosition,
        trail: [...run.trail, nextPosition],
        steps: run.steps + 1,
        isFinished,
        progressSource: 'manual',
      });

      if (isFinished) {
        setIsTimerRunning(false);
        setIsCompletionOpen(true);
      } else if (!isTimerRunning) {
        setIsTimerRunning(true);
      }
    },
    [controlMode, isAnimationRunning, isSolveLoading, isTimerRunning, run, selectedLabyrinth],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!selectedLabyrinth || controlMode !== 'manual' || activeModal || confirmAction) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const directionByKey: Record<string, Direction | undefined> = {
        ArrowUp: 'up',
        w: 'up',
        W: 'up',
        ц: 'up',
        Ц: 'up',
        ArrowDown: 'down',
        s: 'down',
        S: 'down',
        ы: 'down',
        Ы: 'down',
        ArrowLeft: 'left',
        a: 'left',
        A: 'left',
        ф: 'left',
        Ф: 'left',
        ArrowRight: 'right',
        d: 'right',
        D: 'right',
        в: 'right',
        В: 'right',
      };
      const direction = directionByKey[event.key];

      if (direction) {
        event.preventDefault();
        movePlayer(direction);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, confirmAction, controlMode, movePlayer, selectedLabyrinth]);

  const runAutoSolve = useCallback(async () => {
    if (!selectedLabyrinth || isBusy) {
      return;
    }

    const requestId = solveRequestIdRef.current + 1;
    solveRequestIdRef.current = requestId;
    const initialRun = createInitialRunState(selectedLabyrinth);

    setConfirmAction(null);
    setSolveError('');
    setAnimationPath(null);
    setIsAnimationRunning(false);
    setIsSolveLoading(true);
    setIsTimerRunning(true);
    setIsCompletionOpen(false);
    setRun(initialRun);

    try {
      const result = await labyrinthsApi.solve(selectedLabyrinth.id, autoAlgorithm);

      if (solveRequestIdRef.current !== requestId) {
        return;
      }

      if (autoDisplayMode === 'instant') {
        const finish = result.path[result.path.length - 1] ?? selectedLabyrinth.exit;
        setRun((current) => ({
          ...(current ?? initialRun),
          position: finish,
          trail: result.path,
          steps: result.steps,
          isFinished: true,
          progressSource: 'auto',
        }));
        setIsTimerRunning(false);
        setIsCompletionOpen(true);
      } else {
        setIsAnimationRunning(true);
        setAnimationPath(result.path);
      }
    } catch (error: unknown) {
      if (solveRequestIdRef.current !== requestId) {
        return;
      }

      setSolveError(errorMessage(error, 'Не удалось построить путь'));
      setIsTimerRunning(false);
      setRun(initialRun);
    } finally {
      if (solveRequestIdRef.current === requestId) {
        setIsSolveLoading(false);
      }
    }
  }, [autoAlgorithm, autoDisplayMode, isBusy, selectedLabyrinth]);

  const title = selectedLabyrinth ? selectedLabyrinth.name : 'Выберите лабиринт';
  const statusText = isDetailLoading
    ? 'загрузка'
    : run?.isFinished
      ? 'завершён'
      : selectedLabyrinth
        ? 'в процессе'
        : 'выбор';

  return (
    <div className="player-layout">
      <header className="player-header">
        <span className="player-logo">Лабиринт</span>
        <span className="player-role-label">Экран игрока</span>
        <div className="player-header-right">
          <span className="badge badge-success">игрок</span>
          <span className="muted">{user.login}</span>
          <button className="btn btn-sm btn-ghost" type="button" onClick={() => void onLogout()}>
            Выйти
          </button>
        </div>
      </header>

      <aside className="player-left">
        <PlayerLabyrinthList selectedId={selectedId} detailError={detailError} onSelect={selectLabyrinth} />

        <hr className="divider" />

        <PlayerThemePicker
          value={selectedLabyrinth ? activeTheme : null}
          disabled={!selectedLabyrinth}
          onChange={setThemeOverride}
        />

        <hr className="divider" />

        <div>
          <div className="panel-title">Информация</div>
          <button className="btn btn-ghost btn-sm btn-full" type="button" onClick={() => setActiveModal('about')}>
            О разработчике
          </button>
          <button
            className="btn btn-ghost btn-sm btn-full info-button"
            type="button"
            onClick={() => setActiveModal('system')}
          >
            О системе
          </button>
        </div>
      </aside>

      <main className="player-main">
        <div className="player-level-head">
          <div className="player-level-title">
            {selectedLabyrinth ? `${themeMarks[activeTheme]} ${title}` : title}
          </div>
          <span className="badge badge-accent">{statusText}</span>
        </div>

        <div className="player-maze-area">
          {isDetailLoading ? <MazeSkeleton /> : null}

          {!isDetailLoading && selectedLabyrinth && run ? (
            <MazeGrid
              grid={selectedLabyrinth.grid}
              position={run.position}
              trail={run.trail}
              theme={activeTheme}
              isWallFeedbackActive={isWallFeedbackActive}
            />
          ) : null}

          {!isDetailLoading && !selectedLabyrinth ? (
            <div className="choose-level-state">
              <div className="card-title">Выберите лабиринт</div>
              <p className="muted">Список доступных уровней находится слева.</p>
            </div>
          ) : null}
        </div>

        <div className="player-controls-card">
          <div className="tabs-sm">
            <button
              className={`tab-sm ${controlMode === 'manual' ? 'active' : ''}`}
              type="button"
              disabled={!canUseLevel || isBusy}
              onClick={() => setControlMode('manual')}
            >
              Ручное
            </button>
            <button
              className={`tab-sm ${controlMode === 'auto' ? 'active' : ''}`}
              type="button"
              disabled={!canUseLevel || isBusy}
              onClick={() => setControlMode('auto')}
            >
              Авто-решение
            </button>
          </div>

          {controlMode === 'manual' ? (
            <ManualControls disabled={!canUseLevel || isBusy || Boolean(run?.isFinished)} onMove={movePlayer} />
          ) : (
            <AutoSolvePanel
              algorithm={autoAlgorithm}
              displayMode={autoDisplayMode}
              speed={autoSpeed}
              error={solveError}
              disabled={!canUseLevel || isBusy}
              isRunning={isBusy}
              onAlgorithmChange={setAutoAlgorithm}
              onDisplayModeChange={setAutoDisplayMode}
              onSpeedChange={setAutoSpeed}
              onStart={() => {
                if (run && run.steps > 0 && run.progressSource === 'manual') {
                  setConfirmAction('auto');
                } else {
                  void runAutoSolve();
                }
              }}
            />
          )}
        </div>
      </main>

      <PlayerStatsPanel
        run={run}
        disabled={!canUseLevel || isBusy}
        onReset={() => {
          if (run?.steps) {
            setConfirmAction('reset');
          } else {
            resetRun();
          }
        }}
        onExit={() => {
          if (hasProgress(run)) {
            setConfirmAction('exit');
          } else {
            exitLevel();
          }
        }}
      />

      <footer className="player-footer">
        <span>{selectedLabyrinth ? selectedLabyrinth.name : 'Лабиринт не выбран'}</span>
        <span className="footer-separator">·</span>
        <span>Тема: {selectedLabyrinth ? themeLabels[activeTheme] : '-'}</span>
        <span className="footer-separator">·</span>
        <span>Режим: {controlMode === 'manual' ? 'ручное управление' : 'авто-решение'}</span>
        <span className="footer-time">{formatElapsed(run?.elapsedSeconds ?? 0)}</span>
      </footer>

      <PlayerInfoModals activeModal={activeModal} onClose={() => setActiveModal(null)} />

      {isCompletionOpen ? (
        <SimpleModal title="Уровень пройден" onClose={() => setIsCompletionOpen(false)}>
          <p>
            Финиш достигнут. Шагов: <b>{run?.steps ?? 0}</b>, время:{' '}
            <b>{formatElapsed(run?.elapsedSeconds ?? 0)}</b>.
          </p>
        </SimpleModal>
      ) : null}

      {confirmAction ? (
        <ConfirmModal
          action={confirmAction}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction === 'reset') {
              setConfirmAction(null);
              resetRun();
              return;
            }

            if (confirmAction === 'exit') {
              exitLevel();
              return;
            }

            void runAutoSolve();
          }}
        />
      ) : null}
    </div>
  );
}

function MazeSkeleton() {
  const grid = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 'path' as const));

  return (
    <MazeGrid
      grid={grid}
      position={null}
      trail={[]}
      theme="winter"
      isWallFeedbackActive={false}
      isPlaceholder
    />
  );
}

function SimpleModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="Закрыть">
            x
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn btn-sm btn-primary" type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  action,
  onCancel,
  onConfirm,
}: {
  action: Exclude<ConfirmAction, null>;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const copy = {
    reset: {
      title: 'Сбросить прохождение?',
      text: 'Текущий путь, шаги и время будут очищены.',
      confirm: 'Сбросить',
    },
    exit: {
      title: 'Выйти из уровня?',
      text: 'Текущий прогресс будет потерян.',
      confirm: 'Выйти',
    },
    auto: {
      title: 'Запустить авто-решение?',
      text: 'Авто-решение начнёт прохождение заново от входа.',
      confirm: 'Запустить',
    },
  }[action];

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h2>{copy.title}</h2>
          <button className="modal-close" type="button" onClick={onCancel} aria-label="Закрыть">
            x
          </button>
        </div>
        <div className="modal-body">
          <p>{copy.text}</p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-sm btn-ghost" type="button" onClick={onCancel}>
            Отмена
          </button>
          <button className="btn btn-sm btn-primary" type="button" onClick={onConfirm}>
            {copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}
