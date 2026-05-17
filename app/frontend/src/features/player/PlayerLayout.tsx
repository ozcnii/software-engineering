import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { labyrinthsApi } from '../../shared/api/labyrinthsApi';
import { getErrorMessage } from '../../shared/lib/errors';
import type {
  Coordinate,
  LabyrinthDetail,
  LabyrinthListItem,
  LabyrinthTheme,
  SolvingAlgorithm,
  User,
} from '@labyrinth/shared/types/domain';
import { AppModal } from '../../shared/ui/AppModal';
import { themeLabels, themeMarks } from '../../shared/ui/labels';
import { DevelopersModal } from '../help/HelpPage';
import { AutoSolvePanel } from './AutoSolvePanel';
import { ManualControls } from './ManualControls';
import { MazeGrid } from './MazeGrid';
import { PlayerLabyrinthList } from './PlayerLabyrinthList';
import { PlayerStatsPanel } from './PlayerStatsPanel';
import { PlayerThemePicker } from './PlayerThemePicker';
import { usePlayerKeyboardMovement } from './hooks/usePlayerKeyboardMovement';
import { usePlayerTimer } from './hooks/usePlayerTimer';
import {
  appendVisibleTrail,
  getCell,
  isWalkableCell,
  moveCoordinate,
  sameCoordinate,
} from './lib/playerMovement';
import {
  createInitialRunState,
  formatElapsed,
  hasProgress,
  type AutoDisplayMode,
  type ControlMode,
  type Direction,
  type PlayerRunState,
} from './model/playerState';

type ConfirmAction = 'reset' | 'exit' | 'auto' | null;

interface PlayerLayoutProps {
  user: User;
  onLogout: () => Promise<void>;
}

export function PlayerLayout({ user, onLogout }: PlayerLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLabyrinth, setSelectedLabyrinth] = useState<LabyrinthDetail | null>(
    null,
  );
  const [run, setRun] = useState<PlayerRunState | null>(null);
  const [themeOverride, setThemeOverride] = useState<LabyrinthTheme | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>('manual');
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isWallFeedbackActive, setIsWallFeedbackActive] = useState(false);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isDevelopersOpen, setIsDevelopersOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [autoAlgorithm, setAutoAlgorithm] = useState<SolvingAlgorithm>('wave');
  const [autoDisplayMode, setAutoDisplayMode] = useState<AutoDisplayMode>('animated');
  const [autoSpeed, setAutoSpeed] = useState(3);
  const [solveError, setSolveError] = useState('');
  const [isSolveLoading, setIsSolveLoading] = useState(false);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);
  const [animationPath, setAnimationPath] = useState<Coordinate[] | null>(null);
  const detailRequestIdRef = useRef(0);
  const solveRequestIdRef = useRef(0);
  const animationSpeedRef = useRef(autoSpeed);

  const activeTheme = themeOverride ?? selectedLabyrinth?.theme ?? 'winter';
  const canUseLevel = Boolean(selectedLabyrinth && run);
  const isBusy = isSolveLoading || isAnimationRunning || animationPath !== null;

  const incrementTimer = useCallback(() => {
    setRun((current) =>
      current
        ? {
            ...current,
            elapsedSeconds: current.elapsedSeconds + 1,
          }
        : current,
    );
  }, []);

  usePlayerTimer(isTimerRunning, incrementTimer);

  useEffect(() => {
    animationSpeedRef.current = autoSpeed;
  }, [autoSpeed]);

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
    let timeoutId: number | null = null;
    let isCancelled = false;
    let visibleTrail = [animationPath[0]];
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

    const animateNextStep = () => {
      if (isCancelled) {
        return;
      }

      index += 1;
      const point = animationPath[index];

      if (!point) {
        setIsAnimationRunning(false);
        setIsTimerRunning(false);
        setAnimationPath(null);
        return;
      }

      const isLast = index >= animationPath.length - 1;
      visibleTrail = appendVisibleTrail(visibleTrail, point);
      setRun((current) =>
        current
          ? {
              ...current,
              position: point,
              trail: visibleTrail,
              steps: visibleTrail.length - 1,
              isFinished: isLast,
              progressSource: 'auto',
            }
          : current,
      );

      if (isLast) {
        setIsAnimationRunning(false);
        setIsTimerRunning(false);
        setAnimationPath(null);
        setIsCompletionOpen(true);
        return;
      }

      timeoutId = window.setTimeout(animateNextStep, 1000 / animationSpeedRef.current);
    };

    timeoutId = window.setTimeout(animateNextStep, 1000 / animationSpeedRef.current);

    return () => {
      isCancelled = true;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [animationPath]);

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
        setDetailError(getErrorMessage(error, 'Не удалось загрузить лабиринт'));
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
      const visibleTrail = appendVisibleTrail(run.trail, nextPosition);

      setRun({
        ...run,
        position: nextPosition,
        trail: visibleTrail,
        steps: visibleTrail.length - 1,
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
    [
      controlMode,
      isAnimationRunning,
      isSolveLoading,
      isTimerRunning,
      run,
      selectedLabyrinth,
    ],
  );

  usePlayerKeyboardMovement({
    enabled: Boolean(selectedLabyrinth && controlMode === 'manual' && !confirmAction),
    onMove: movePlayer,
  });

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
      const solveAlgorithm = autoDisplayMode === 'instant' ? 'wave' : autoAlgorithm;
      const result = await labyrinthsApi.solve(selectedLabyrinth.id, solveAlgorithm);

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

      setSolveError(getErrorMessage(error, 'Не удалось построить путь'));
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
          <button
            className="btn btn-sm btn-ghost"
            type="button"
            onClick={() => void onLogout()}
          >
            Выйти
          </button>
        </div>
      </header>

      <aside className="player-left">
        <PlayerLabyrinthList
          selectedId={selectedId}
          detailError={detailError}
          onSelect={selectLabyrinth}
        />

        <hr className="divider" />

        <PlayerThemePicker
          value={selectedLabyrinth ? activeTheme : null}
          disabled={!selectedLabyrinth}
          onChange={setThemeOverride}
        />

        <hr className="divider" />

        <div>
          <div className="panel-title">Информация</div>
          <Link className="btn btn-ghost btn-sm btn-full" to="/player/help">
            О системе
          </Link>
          <button
            className="btn btn-ghost btn-sm btn-full"
            type="button"
            onClick={() => setIsDevelopersOpen(true)}
          >
            О разработчиках
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
            <ManualControls
              disabled={!canUseLevel || isBusy || Boolean(run?.isFinished)}
              onMove={movePlayer}
            />
          ) : (
            <AutoSolvePanel
              algorithm={autoAlgorithm}
              displayMode={autoDisplayMode}
              speed={autoSpeed}
              error={solveError}
              disabled={!canUseLevel || isBusy}
              isRunning={isBusy}
              speedDisabled={!canUseLevel || isSolveLoading}
              onAlgorithmChange={setAutoAlgorithm}
              onDisplayModeChange={(mode) => {
                if (mode === 'instant') {
                  setAutoAlgorithm('wave');
                }

                setAutoDisplayMode(mode);
              }}
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
        <span>
          Режим: {controlMode === 'manual' ? 'ручное управление' : 'авто-решение'}
        </span>
        <span className="footer-time">{formatElapsed(run?.elapsedSeconds ?? 0)}</span>
      </footer>

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

      {isDevelopersOpen ? (
        <DevelopersModal onClose={() => setIsDevelopersOpen(false)} />
      ) : null}
    </div>
  );
}

function MazeSkeleton() {
  const grid = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => 'path' as const),
  );

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

function SimpleModal({ title, children, onClose }: Parameters<typeof AppModal>[0]) {
  return (
    <AppModal
      title={title}
      onClose={onClose}
      actions={
        <>
          <button className="btn btn-sm btn-primary" type="button" onClick={onClose}>
            Закрыть
          </button>
        </>
      }
    >
      <div className="modal-body">{children}</div>
    </AppModal>
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
    <AppModal
      title={copy.title}
      onClose={onCancel}
      actions={
        <>
          <button className="btn btn-sm btn-ghost" type="button" onClick={onCancel}>
            Отмена
          </button>
          <button className="btn btn-sm btn-primary" type="button" onClick={onConfirm}>
            {copy.confirm}
          </button>
        </>
      }
    >
      <div className="modal-body">
        <p>{copy.text}</p>
      </div>
    </AppModal>
  );
}
