
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as geminiService from './services/geminiService.ts';
import type { GameState, SyllabusTopic, Flashcard as FlashcardType, QuizQuestion, Badge, LeaderboardUser, ActivityLogEntry, BadgeCategory } from './types.ts';
import { GameState as GameStateEnum } from './types.ts';
import { INITIAL_BADGES, XP_PER_FLASHCARD_SESSION, XP_PER_QUIZ_CORRECT_ANSWER, XP_TO_LEVEL_UP } from './constants.tsx';
import { SparklesIcon, AcademicCapIcon, TrophyIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon, UploadIcon, FileIcon, ImageIcon, CrownIcon, ChevronDownIcon, ChevronUpIcon, ClipboardListIcon, XIcon, InfoIcon, StarIcon, LockClosedIcon, BookOpenIcon, BrainIcon } from './components/icons.tsx';

// --- Helper Functions & Constants (Moved outside the component) ---

const MOCK_LEADERBOARD_DATA: Omit<LeaderboardUser, 'rank'>[] = [
    { name: 'SabelotodoSupremo', level: 15, xp: 3050 },
    { name: 'Cerebrito', level: 14, xp: 2890 },
    { name: 'MaestroDelQuiz', level: 12, xp: 2510 },
    { name: 'EstudianteEstrella', level: 11, xp: 2240 },
    { name: 'MenteBrillante', level: 10, xp: 2080 },
    { name: 'EstudiosoPro', level: 8, xp: 1750 },
    { name: 'ElIluminado', level: 7, xp: 1520 },
    { name: 'SumaPuntos', level: 6, xp: 1240 },
    { name: 'CazadorDeLogros', level: 4, xp: 880 },
    { name: 'AprendizConstante', level: 3, xp: 650 },
    { name: 'NovatoEstelar', level: 2, xp: 410 },
    { name: 'ElPersistente', level: 1, xp: 150 },
];

const getLevelName = (level: number): string => {
  if (level >= 15) return 'Supremo';
  if (level >= 10) return 'Avanzado';
  if (level >= 5) return 'Intermedio';
  return 'Principiante';
};

const getLevelIcon = (level: number) => {
    const className = "w-4 h-4 mr-1.5 flex-shrink-0";
    if (level >= 15) return <CrownIcon className={`${className} text-amber-400`} />;
    if (level >= 10) return <BrainIcon className={`${className} text-pink-400`} />;
    if (level >= 5) return <BookOpenIcon className={`${className} text-sky-400`} />;
    return <AcademicCapIcon className={`${className} text-green-400`} />;
};

const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        mimeType: file.type,
        data: await base64EncodedDataPromise,
    };
};


// --- UI Helper Components ---

const LoadingSpinner = ({ text = "Cargando..." }: { text?: string }) => (
  <div className="flex flex-col justify-center items-center p-10 gap-4">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
    <p className="text-sky-300">{text}</p>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-4 rounded-md shadow-lg" role="alert">
    <p className="font-bold">Ocurrió un Error</p>
    <p>{message}</p>
  </div>
);

const ToastNotification = ({ message, type = 'success', onDismiss }: { message: string; type?: 'success' | 'error'; onDismiss: () => void }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const fadeOutTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 2700);

        const unmountTimer = setTimeout(() => {
            onDismiss();
        }, 3000); // 2700ms visible + 300ms for fade out animation

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(unmountTimer);
        };
    }, [message, onDismiss]);

    const typeClasses = {
      success: 'bg-green-500/90 backdrop-blur-sm border border-green-400',
      error: 'bg-red-500/90 backdrop-blur-sm border border-red-400'
    };

    return (
        <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 text-white font-bold py-3 px-6 rounded-lg shadow-xl z-50 transition-opacity duration-300 ease-in-out ${typeClasses[type]} ${
                isFadingOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            👉 {message}
        </div>
    );
};

const AchievementUnlockedToast = ({ badge, onDismiss }: { badge: Badge, onDismiss: () => void }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const enterTimer = setTimeout(() => setIsVisible(true), 100);
        const hideTimer = setTimeout(() => setIsVisible(false), 2100);
        const dismissTimer = setTimeout(onDismiss, 2600); 

        return () => {
            clearTimeout(enterTimer);
            clearTimeout(hideTimer);
            clearTimeout(dismissTimer);
        };
    }, [badge, onDismiss]);

    return (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-gradient-to-br from-purple-800 to-indigo-900 border-2 border-purple-400 rounded-xl shadow-2xl shadow-purple-500/30 p-4 z-50 flex items-center gap-4 transition-all duration-500 ease-in-out transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
          role="alert"
          aria-live="assertive"
        >
            <div className="text-amber-300 animate-slow-glow">{badge.icon}</div>
            <div>
                <h4 className="font-bold text-white">¡Logro Desbloqueado!</h4>
                <p className="text-purple-200 text-sm">{badge.name}</p>
            </div>
        </div>
    );
};

const LoginScreen = ({ onSave }: { onSave: (name: string) => void }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('❗ Tenés que ingresar tu nombre para continuar');
            return;
        }
        onSave(trimmedName);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-amber-700 text-white font-bold text-center p-3 rounded-t-xl">
                    👉 Ingresá tu nombre para comenzar a jugar
                </div>
                <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-b-xl shadow-2xl border border-slate-700">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="Escribí tu apodo acá..."
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-white placeholder-slate-400 text-lg"
                        aria-label="Tu nombre de jugador"
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    <button type="submit" className="mt-6 w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors disabled:bg-slate-500">
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- Main UI Components ---

const AnimatedNumber = ({ target }: { target: number }) => {
    const [current, setCurrent] = useState(0);
    const ref = React.useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    let start = 0;
                    const end = target;
                    if (start === end) {
                        setCurrent(end);
                        return;
                    }

                    const duration = 1500;
                    const startTime = Date.now();

                    const step = () => {
                        const now = Date.now();
                        const time = now - startTime;
                        const progress = Math.min(time / duration, 1);
                        const value = Math.floor(progress * (end - start) + start);
                        setCurrent(value);
                        if (progress < 1) {
                            requestAnimationFrame(step);
                        }
                    };
                    requestAnimationFrame(step);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [target]);

    return <span ref={ref}>{current.toLocaleString()}</span>;
};


const ProgressDashboard = ({ 
    xp, level, badges, topicsCompleted, username
}: { 
    xp: number; level: number; badges: Badge[]; topicsCompleted: number; username: string;
}) => {
    const xpForNextLevel = XP_TO_LEVEL_UP;
    const currentLevelXp = xp - ((level -1) * XP_TO_LEVEL_UP);
    const progressPercentage = xpForNextLevel > 0 ? (currentLevelXp / xpForNextLevel) * 100 : 0;
    
    const groupedBadges = useMemo(() => {
        return badges.reduce((acc, badge) => {
            const category = badge.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(badge);
            return acc;
        }, {} as Record<BadgeCategory, Badge[]>);
    }, [badges]);

    const categoryColors: Record<BadgeCategory, string> = {
        'Temas Completados': 'text-sky-400',
        'XP Acumulado': 'text-amber-400',
        'Niveles Alcanzados': 'text-green-400',
        'Desafíos Especiales': 'text-purple-400',
    };

    return (
        <div className="bg-slate-800/60 backdrop-blur-xl p-5 md:p-6 rounded-3xl shadow-2xl shadow-slate-900/40 border border-slate-700/50 sticky top-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">Progreso de <span className="text-sky-400">{username}</span></h2>
            
            <div className="space-y-5">
                {/* Level & Progress */}
                <div className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/20">
                                <AcademicCapIcon className="h-7 w-7" />
                            </div>
                             <div>
                                <span className="font-bold text-lg text-slate-200">Nivel {level}</span>
                                <p className="text-sm text-slate-400">{getLevelName(level)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative w-full h-5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 animate-gradient-x transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white tracking-wider" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{currentLevelXp} / {xpForNextLevel} XP</span>
                    </div>
                </div>

                {/* Total XP */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 shadow-lg">
                    <div className="flex items-center justify-between text-slate-900">
                         <div className="flex items-center space-x-3">
                            <StarIcon className="h-7 w-7" />
                            <span className="font-bold text-lg">XP Total</span>
                        </div>
                        <span className="font-bold text-2xl">
                            <AnimatedNumber target={xp} />
                        </span>
                    </div>
                </div>

                {/* Badges */}
                <div className="p-4 bg-slate-900/50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4 text-purple-300">
                        <TrophyIcon />
                        <h3 className="text-lg font-bold text-slate-300">Insignias</h3>
                    </div>
                    <div className="space-y-4">
                        {(Object.keys(groupedBadges) as BadgeCategory[]).map(category => (
                            <div key={category}>
                                <h4 className={`font-bold text-sm uppercase tracking-wider mb-2 ${categoryColors[category]}`}>{category}</h4>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                    {groupedBadges[category].map(badge => (
                                        <div key={badge.id} className="relative group flex justify-center">
                                            <div className={`aspect-square p-2.5 rounded-xl transition-all duration-300 w-full flex items-center justify-center ${badge.achieved ? 'bg-purple-900/50 border-2 border-purple-500 animate-slow-glow' : 'bg-slate-800/60 border border-slate-700 opacity-50 grayscale'}`}>
                                                <div className={`${badge.achieved ? 'text-amber-300' : 'text-slate-500'}`}>{badge.icon}</div>
                                                { !badge.achieved && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                                        <LockClosedIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-full mb-2 w-48 px-3 py-2 text-sm font-medium text-white bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <h4 className={`font-bold ${categoryColors[category]}`}>{badge.name}</h4>
                                                <p className="text-xs text-slate-300">{badge.description}</p>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 
                 {/* Topics Completed */}
                 <div className="flex items-center justify-center gap-3 text-slate-300 font-medium bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <BookOpenIcon className="h-6 w-6" />
                    <span>Temas Completados: <span className="font-bold text-xl text-sky-400">{topicsCompleted}</span></span>
                 </div>
            </div>
        </div>
    );
};

const CompactLeaderboard = ({ leaderboardData, currentUser, isExpanded, onToggle }: { leaderboardData: LeaderboardUser[], currentUser: LeaderboardUser; isExpanded: boolean; onToggle: () => void; }) => {
  const currentUserIndex = leaderboardData.findIndex(u => u.name === currentUser.name);
  const currentUserData = leaderboardData[currentUserIndex];

  let motivationalText: React.ReactNode = null;
    if (currentUserData && currentUserIndex > 0) {
        const nextUser = leaderboardData[currentUserIndex - 1];
        const pointsNeeded = nextUser.xp - currentUserData.xp;
        if (pointsNeeded > 0) {
            motivationalText = (
                <span>
                    ¡Te faltan <strong className="text-white">{pointsNeeded.toLocaleString()}</strong> puntos para superar a <strong className="text-white">{nextUser.name}</strong>!
                </span>
            );
        }
    } else if (currentUserIndex === 0 && leaderboardData.length > 1) {
        motivationalText = "¡Estás en la cima! ¡Mantené la racha! 🚀";
    }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-700 z-30 shadow-2xl">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center p-2 cursor-pointer hover:bg-slate-800/50" onClick={onToggle}>
            <h3 className="font-bold text-slate-200 ml-2">Tabla de Clasificación</h3>
            <button className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" aria-label={isExpanded ? 'Minimizar tabla' : 'Expandir tabla'}>
                {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>
        </div>
        <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[26rem]' : 'max-h-0'}`}>
            {motivationalText && (
                <div className="px-4 py-2 text-center text-sm text-sky-300 bg-sky-900/40">
                    {motivationalText}
                </div>
            )}
            <div className={`h-full overflow-y-auto custom-scrollbar ${isExpanded ? 'max-h-[22rem]' : ''}`}>
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="sticky top-0 bg-slate-900/95 z-10">
                    <tr className="text-xs text-slate-400 font-semibold uppercase">
                      <th className="p-2 text-center w-12">Rank</th>
                      <th className="p-2">Usuario</th>
                      <th className="p-2">Nivel</th>
                      <th className="p-2 text-right">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((user) => {
                      const isCurrentUser = user.rank === currentUserData?.rank;
                      return (
                      <tr key={user.rank} className={`border-t border-slate-800 ${isCurrentUser ? 'bg-sky-800/70' : 'odd:bg-slate-800/20 even:bg-slate-800/50'}`}>
                        <td className={`p-2 text-center font-bold text-lg ${isCurrentUser ? 'text-white' : 'text-slate-400'}`}>
                          {getRankDisplay(user.rank)}
                        </td>
                        <td className="p-2 font-medium flex items-center">
                           {isCurrentUser && <StarIcon className="w-4 h-4 text-yellow-300 mr-2 flex-shrink-0" />}
                           <span className="truncate" title={user.name}>{user.name}</span>
                        </td>
                        <td className="p-2">
                           <div className="flex items-center">
                            {getLevelIcon(user.level)}
                            <span className="text-slate-400">{getLevelName(user.level)}</span>
                           </div>
                        </td>
                        <td className={`p-2 text-right font-mono font-bold ${isCurrentUser ? 'text-white' : 'text-amber-400'}`}>
                          {user.xp.toLocaleString()}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
            </div>
        </div>
      </div>
    </footer>
  );
};


const ActivityLogPanel = ({ log, isOpen, onClose }: { log: ActivityLogEntry[]; isOpen: boolean; onClose: () => void; }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-slate-100">Registro de Actividad</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {log.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">Todavía no completaste ninguna actividad. ¡A estudiar!</p>
                    ) : (
                        log.map((entry, index) => (
                            <div key={index} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg">
                                <div className="flex-shrink-0 text-green-400">✅</div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-200">{entry.activityName}</p>
                                    <p className="text-xs text-slate-400">📅 {new Date(entry.timestamp).toLocaleString('es-AR')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-amber-400">⭐ +{entry.xpGained} XP</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const FloatingActionButton = ({ onClick }: { onClick: () => void; }) => (
    <button
        onClick={onClick}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 bg-sky-600 text-white p-4 rounded-full shadow-lg hover:bg-sky-700 transition-transform hover:scale-110 z-20"
        aria-label="Ver registro de actividad"
    >
        <ClipboardListIcon />
    </button>
);

const RulesModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" aria-label="Cerrar modal">
                    <XIcon />
                </button>
                <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-slate-100 mb-6 text-center">🎮 Cómo funciona el juego</h3>
                    <ul className="space-y-4 text-slate-300">
                        <li className="flex items-start gap-4">
                            <span className="text-2xl pt-1">📚</span>
                            <div>
                                <h4 className="font-semibold text-slate-100 mb-1">Aprendé y Sumá Puntos</h4>
                                <p className="text-sm">Subí tus apuntes o elegí un tema. Completá las actividades (flashcards y cuestionarios) para ganar puntos de experiencia (XP).</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="text-2xl pt-1">🧠</span>
                            <div>
                                <h4 className="font-semibold text-slate-100 mb-1">Sistema de XP</h4>
                                <p className="text-sm">
                                    • <span className="font-bold text-amber-400">{XP_PER_FLASHCARD_SESSION} XP</span> por cada sesión de flashcards.<br/>
                                    • <span className="font-bold text-amber-400">{XP_PER_QUIZ_CORRECT_ANSWER} XP</span> por cada respuesta correcta en el cuestionario.
                                </p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <span className="text-2xl pt-1">🚀</span>
                             <div>
                                <h4 className="font-semibold text-slate-100 mb-1">Subí de Nivel</h4>
                                <p className="text-sm">Cada <span className="font-bold text-sky-400">{XP_TO_LEVEL_UP} XP</span> que ganás, subís de nivel. ¡Demostrá tu conocimiento en la tabla de clasificación!</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <span className="text-2xl pt-1">🏅</span>
                            <div>
                                <h4 className="font-semibold text-slate-100 mb-1">Ganás Insignias</h4>
                                <p className="text-sm">Desbloqueá insignias especiales al completar logros, como obtener un puntaje perfecto o alcanzar nuevos niveles.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};


const MainScreen = ({ onSubjectSelect, onFilesAnalyze, isLoading, onShowRules }: { onSubjectSelect: (subject: string) => void; onFilesAnalyze: (files: File[]) => void; isLoading: boolean; onShowRules: () => void; }) => {
    const [subject, setSubject] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const handleSubjectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject.trim()) {
            onSubjectSelect(subject.trim());
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            setFiles(fileList);
        }
    };
    
    const handleFilesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length > 0) {
            onFilesAnalyze(files);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-slate-100 mb-2">Bienvenido a Sabelo Todo</h1>
            <p className="text-lg text-slate-300 mb-8">La forma más inteligente de estudiar.</p>
             <p className="text-slate-300 mt-1 mb-8">¡Subí de nivel y liderá la tabla! Cuanto más aprendas, más puntos ganás.</p>

            <div className="space-y-8">
                {/* Option 1: Enter a topic */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-sky-400 mb-4">Empezá con un tema</h2>
                    <p className="text-slate-400 mb-4">Decinos qué querés estudiar y la IA creará un plan de estudio para vos.</p>
                    <form onSubmit={handleSubjectSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Ej: 'Inglés' o 'Revolución de Mayo'"
                            className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none text-white placeholder-slate-400"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors disabled:bg-slate-500" disabled={isLoading || !subject}>
                            Crear Plan
                        </button>
                    </form>
                </div>
                
                {/* Option 2: Upload documents */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-amber-400 mb-4">Estudiá desde tus apuntes</h2>
                    <p className="text-slate-400 mb-4">Subí imágenes o PDF de tus notas, y la IA las analizará para crear tu plan de estudio.</p>
                    <form onSubmit={handleFilesSubmit}>
                        <label className="w-full flex justify-center items-center gap-3 px-4 py-6 bg-slate-700 text-slate-300 rounded-lg shadow-md tracking-wide border-2 border-dashed border-slate-600 cursor-pointer hover:bg-slate-600 hover:border-sky-500 transition-colors">
                            <UploadIcon />
                            <span className="text-base leading-normal">{files.length > 0 ? `${files.length} archivos seleccionados` : 'Seleccionar imágenes o PDF'}</span>
                            <input type='file' className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileChange} disabled={isLoading} />
                        </label>
                         {files.length > 0 && (
                            <div className="mt-4 text-left">
                                <h4 className="font-semibold text-slate-300 mb-2">Archivos seleccionados:</h4>
                                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {files.map((file, index) => (
                                      <li key={index} className="flex items-center gap-3 bg-slate-700/80 p-2 rounded-md">
                                        {file.type.startsWith('image/') ? <ImageIcon /> : <FileIcon />}
                                        <span className="text-slate-300 text-sm truncate flex-1" title={file.name}>{file.name}</span>
                                        <span className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                                      </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button type="submit" className="mt-4 bg-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-amber-700 transition-colors disabled:bg-slate-500" disabled={isLoading || files.length === 0}>
                            Analizar Apuntes
                        </button>
                    </form>
                </div>
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={onShowRules}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 font-medium hover:text-sky-400 transition-colors"
                    aria-label="Mostrar reglas y puntuación"
                >
                    <InfoIcon />
                    <span>Reglas y Puntuación</span>
                </button>
            </div>
        </div>
    );
};


const SyllabusView = ({ subject, syllabus, onSelectTopic, onStartOver }: { subject: string, syllabus: SyllabusTopic[]; onSelectTopic: (topic: SyllabusTopic) => void; onStartOver: () => void; }) => (
    <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-slate-100">Plan de Estudio: <span className="text-sky-400">{subject}</span></h2>
        <p className="text-slate-300 mb-6">Seleccioná un tema para empezar tu sesión de estudio con flashcards generadas por IA.</p>
        <div className="space-y-3">
            {syllabus.map((topic, index) => (
                <div key={index} onClick={() => onSelectTopic(topic)} className="bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-700 hover:shadow-lg hover:border-sky-600 cursor-pointer transition-all">
                    <h3 className="font-bold text-xl text-slate-100">{topic.title}</h3>
                    <p className="text-slate-400">{topic.description}</p>
                </div>
            ))}
        </div>
        <button onClick={onStartOver} className="mt-8 text-sky-400 font-semibold hover:underline">Elegir otro método</button>
    </div>
);

const Flashcard = React.memo(({ question, answer, translation }: { question: string; answer: string; translation?: string; }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
    }, [question]);

    return (
        <div className="w-full h-80 [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(p => !p)}>
            <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 [backface-visibility:hidden]">
                    <p className="text-center text-2xl font-semibold text-slate-200">{question}</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-sky-900 rounded-xl shadow-2xl border border-sky-800 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <p className="text-center text-2xl font-semibold text-sky-200">{answer}</p>
                    {translation && (
                        <p className="text-center text-lg text-slate-300 mt-4 italic">{translation}</p>
                    )}
                </div>
            </div>
        </div>
    );
});

const StudySession = ({ topic, flashcards, onSessionComplete }: { topic: SyllabusTopic, flashcards: FlashcardType[], onSessionComplete: () => void; }) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const handleNext = () => {
        if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            onSessionComplete();
        }
    };
    
    const handlePrev = () => {
        if(currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
        }
    };

    const currentCard = flashcards[currentCardIndex];
    const isLastCard = currentCardIndex === flashcards.length - 1;
    const isFirstCard = currentCardIndex === 0;

    return (
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2 text-slate-100">Flashcards: <span className="text-sky-400">{topic.title}</span></h2>
            <p className="text-slate-300 mb-6">Hacé clic en la tarjeta para ver la respuesta. Usá los botones para navegar.</p>
            <Flashcard key={currentCard.id} question={currentCard.question} answer={currentCard.answer} translation={currentCard.translation} />
            <div className="mt-8 flex justify-center items-center gap-4">
                <button onClick={handlePrev} disabled={isFirstCard} className="bg-slate-700 text-white font-bold p-3 rounded-full shadow-md hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeftIcon />
                </button>
                <span className="text-slate-400 font-medium">{currentCardIndex + 1} / {flashcards.length}</span>
                <button onClick={handleNext} className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors">
                    {isLastCard ? '¡Listo! Ir al Cuestionario' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
};

const QuizView = ({ topic, quiz, onQuizComplete }: { topic: SyllabusTopic, quiz: QuizQuestion[], onQuizComplete: (answers: (string | null)[]) => void; }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const currentQuestion = quiz[currentQuestionIndex];

    const handleOptionSelect = (option: string) => {
        if (feedback) return;

        setSelectedOption(option);
        const isCorrect = option === currentQuestion.correctAnswer;
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = option;
        setUserAnswers(newAnswers);
    };
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setFeedback(null);
        } else {
            onQuizComplete(userAnswers);
        }
    };

    const getOptionClasses = (option: string) => {
        if (!feedback) {
            return 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-sky-500';
        }
        if (option === currentQuestion.correctAnswer) {
            return 'bg-green-800/50 border-green-500 animate-slow-glow';
        }
        if (option === selectedOption && option !== currentQuestion.correctAnswer) {
            return 'bg-red-800/50 border-red-500';
        }
        return 'bg-slate-800 border-slate-700 opacity-60';
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-slate-100">Cuestionario: <span className="text-sky-400">{topic.title}</span></h2>
            <p className="text-slate-300 mb-6">Pregunta {currentQuestionIndex + 1} de {quiz.length}</p>
            
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <p className="text-xl font-semibold text-slate-200 mb-6">{currentQuestion.question}</p>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            disabled={!!feedback}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${getOptionClasses(option)}`}
                        >
                            <span className="font-semibold">{option}</span>
                        </button>
                    ))}
                </div>
            </div>

            {feedback && (
                <div className={`mt-6 p-4 rounded-lg ${feedback === 'correct' ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
                    <h4 className={`font-bold ${feedback === 'correct' ? 'text-green-300' : 'text-red-300'}`}>{feedback === 'correct' ? '¡Correcto!' : 'Incorrecto'}</h4>
                    <p className="text-slate-300 text-sm mt-1">{currentQuestion.explanation}</p>
                    <button onClick={handleNextQuestion} className="mt-4 bg-sky-600 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:bg-sky-700 transition-colors w-full">
                        {currentQuestionIndex < quiz.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}
                    </button>
                </div>
            )}
        </div>
    );
};

const ResultsView = ({ subject, topic, quiz, userAnswers, studySuggestion, onPlayAgain, onBackToSyllabus }: {
    subject: string;
    topic: SyllabusTopic;
    quiz: QuizQuestion[];
    userAnswers: (string | null)[];
    studySuggestion: string;
    onPlayAgain: () => void;
    onBackToSyllabus: () => void;
}) => {
    const correctAnswersCount = useMemo(() => {
        return quiz.filter((q, i) => q.correctAnswer === userAnswers[i]).length;
    }, [quiz, userAnswers]);
    const totalQuestions = quiz.length;
    const scorePercentage = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    
    const scoreMessage = useMemo(() => {
        if (scorePercentage === 100) return "¡Puntaje perfecto! ¡Sos un genio!";
        if (scorePercentage >= 75) return "¡Excelente trabajo! Casi lo tenés.";
        if (scorePercentage >= 50) return "¡Nada mal! Un poco más de práctica y lo dominás.";
        return "¡No te desanimes! Repasar es la clave del éxito.";
    }, [scorePercentage]);
    
    return (
        <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2 text-slate-100">Resultados del Cuestionario</h2>
            <p className="text-lg text-slate-300 mb-6">Tema: <span className="font-semibold text-sky-400">{topic.title}</span></p>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-6">
                <p className="text-lg text-slate-300 mb-2">{scoreMessage}</p>
                <p className="text-5xl font-bold text-white mb-4">
                    {correctAnswersCount}<span className="text-3xl text-slate-400">/{totalQuestions}</span>
                </p>
                <div className="w-full h-6 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-1000 ease-out"
                        style={{ width: `${scorePercentage}%` }}
                    />
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-8 text-left">
                <h3 className="flex items-center gap-2 text-xl font-bold text-amber-300 mb-3">
                    <LightBulbIcon />
                    <span>Consejo de Estudio Personalizado</span>
                </h3>
                <p className="text-slate-300 whitespace-pre-wrap">{studySuggestion || "Generando consejo..."}</p>
            </div>
            
            <div className="flex justify-center gap-4">
                <button onClick={onPlayAgain} className="bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-700 transition-colors">
                    Reintentar Cuestionario
                </button>
                <button onClick={onBackToSyllabus} className="bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors">
                    Volver al Plan de Estudio
                </button>
            </div>
        </div>
    );
};

// --- The Main App Component ---

const App = () => {
    // --- State ---
    const [username, setUsername] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState>(GameStateEnum.TOPIC_SELECTION);
    const [subject, setSubject] = useState('');
    const [syllabus, setSyllabus] = useState<SyllabusTopic[]>([]);
    const [currentTopic, setCurrentTopic] = useState<SyllabusTopic | null>(null);
    const [studyMaterials, setStudyMaterials] = useState<{ flashcards: FlashcardType[], quiz: QuizQuestion[] } | null>(null);
    const [userQuizAnswers, setUserQuizAnswers] = useState<(string | null)[]>([]);
    const [studySuggestion, setStudySuggestion] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Gamification state
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
    const [topicsCompleted, setTopicsCompleted] = useState(0);
    const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
    const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // UI State
    const [isLeaderboardExpanded, setIsLeaderboardExpanded] = useState(false);
    const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

    // --- Data Management & Effects ---

    // Load progress from localStorage on initial render
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('sabeloTodoProgress');
            if (savedData) {
                const data = JSON.parse(savedData);
                setUsername(data.username || null);
                setXp(data.xp || 0);
                setLevel(data.level || 1);
                setBadges(data.badges || INITIAL_BADGES);
                setTopicsCompleted(data.topicsCompleted || 0);
                setActivityLog(data.activityLog || []);
            }
        } catch (e) {
            console.error("Failed to load progress from localStorage", e);
        }
    }, []);

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        if (username) { // Only save if the user is logged in
            try {
                const dataToSave = JSON.stringify({ username, xp, level, badges, topicsCompleted, activityLog });
                localStorage.setItem('sabeloTodoProgress', dataToSave);
            } catch(e) {
                console.error("Failed to save progress to localStorage", e);
            }
        }
    }, [username, xp, level, badges, topicsCompleted, activityLog]);
    
    // Save progress to Google Sheets with debounce
    useEffect(() => {
        if (!username) return;

        const handler = setTimeout(() => {
            geminiService.saveProgressToSheet({
                nombre: username,
                puntos: xp,
                temas: topicsCompleted,
                insignias: badges.filter(b => b.achieved).length
            });
        }, 2500);

        return () => clearTimeout(handler);
    }, [xp, topicsCompleted, badges, username]);


    // --- Badge & XP Logic ---

    const addXp = useCallback((points: number, activityName: string) => {
        const newXp = xp + points;
        setXp(newXp);

        const newLevel = Math.floor(newXp / XP_TO_LEVEL_UP) + 1;
        if (newLevel > level) {
            setLevel(newLevel);
            setToastMessage({ text: `¡Subiste al Nivel ${newLevel}!`, type: 'success' });
        }
        
        setActivityLog(prevLog => [{ activityName, xpGained: points, timestamp: new Date().toISOString() }, ...prevLog]);

        // Check for new badges
        const newBadges = [...badges];
        let changed = false;
        let newlyUnlocked: Badge | null = null;
        
        newBadges.forEach(badge => {
            if (badge.achieved) return;
            let conditionMet = false;
            
            if (badge.id.startsWith('xp_')) {
                const requiredXp = parseInt(badge.id.split('_')[1]);
                if (newXp >= requiredXp) conditionMet = true;
            } else if (badge.id.startsWith('level_')) {
                const requiredLevel = parseInt(badge.id.split('_')[1]);
                if (newLevel >= requiredLevel) conditionMet = true;
            } else if (badge.id.startsWith('topic_')) {
                 const requiredTopics = parseInt(badge.id.split('_')[1]);
                 if (topicsCompleted + 1 >= requiredTopics) conditionMet = true; // +1 because this runs before topicsCompleted is updated
            }

            if(conditionMet) {
                badge.achieved = true;
                changed = true;
                if (!newlyUnlocked) newlyUnlocked = badge;
            }
        });

        if (changed) {
            setBadges(newBadges);
            if(newlyUnlocked) setUnlockedBadge(newlyUnlocked);
        }

    }, [xp, level, badges, topicsCompleted]);


    // --- API & State Handlers ---

    const handleSaveName = (name: string) => {
        setUsername(name);
    };

    const handleStartOver = () => {
        setGameState(GameStateEnum.TOPIC_SELECTION);
        setSubject('');
        setSyllabus([]);
        setCurrentTopic(null);
        setStudyMaterials(null);
        setError(null);
    };

    const handleSubjectSelect = useCallback(async (selectedSubject: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { topics } = await geminiService.generateSyllabus(selectedSubject);
            setSubject(selectedSubject);
            setSyllabus(topics);
            setGameState(GameStateEnum.SYLLABUS_VIEW);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleFilesAnalyze = useCallback(async (files: File[]) => {
        setIsLoading(true);
        setError(null);
        try {
            const fileParts = await Promise.all(files.map(fileToGenerativePart));
            const { subject: generatedSubject, topics } = await geminiService.generateSyllabusFromFiles(fileParts);
            setSubject(generatedSubject);
            setSyllabus(topics);
            setGameState(GameStateEnum.SYLLABUS_VIEW);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocurrió un error desconocido.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSelectTopic = useCallback(async (topic: SyllabusTopic) => {
        setCurrentTopic(topic);
        setIsLoading(true);
        setError(null);
        try {
            const materials = await geminiService.generateStudyMaterials(subject, topic.title);
            setStudyMaterials(materials);
            setGameState(GameStateEnum.STUDYING);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Ocurrió un error desconocido.');
            setGameState(GameStateEnum.SYLLABUS_VIEW); // Go back if material generation fails
        } finally {
            setIsLoading(false);
        }
    }, [subject]);

    const handleFlashcardSessionComplete = useCallback(() => {
        addXp(XP_PER_FLASHCARD_SESSION, `Flashcards: ${currentTopic?.title}`);
        setGameState(GameStateEnum.QUIZ);
    }, [addXp, currentTopic]);

    const handleQuizComplete = useCallback(async (answers: (string | null)[]) => {
        setUserQuizAnswers(answers);

        const correctAnswers = studyMaterials?.quiz.filter((q, i) => q.correctAnswer === answers[i]).length || 0;
        const xpGained = correctAnswers * XP_PER_QUIZ_CORRECT_ANSWER;
        addXp(xpGained, `Cuestionario: ${currentTopic?.title}`);
        setTopicsCompleted(prev => prev + 1);

        setGameState(GameStateEnum.RESULTS);
        
        // Generate study suggestion in the background
        setStudySuggestion(''); // Clear previous suggestion
        try {
            const suggestion = await geminiService.generateStudySuggestion(subject, currentTopic!.title, studyMaterials!.quiz, answers);
            setStudySuggestion(suggestion);
        } catch (e) {
            setStudySuggestion("No se pudo generar un consejo. ¡Pero seguí estudiando!");
        }
    }, [addXp, studyMaterials, subject, currentTopic]);

    const handlePlayAgain = () => {
        setGameState(GameStateEnum.QUIZ);
        setUserQuizAnswers([]);
    };
    
    const handleBackToSyllabus = () => {
        setGameState(GameStateEnum.SYLLABUS_VIEW);
        setCurrentTopic(null);
        setStudyMaterials(null);
        setUserQuizAnswers([]);
        setStudySuggestion('');
    };
    

    // --- Memoized Derived State ---
    
    const leaderboardData = useMemo(() => {
        const currentUserData = { name: username || 'Tú', level, xp };
        const combinedData = [...MOCK_LEADERBOARD_DATA, currentUserData];
        
        const sortedData = combinedData
            .sort((a, b) => b.xp - a.xp)
            .map((user, index) => ({ ...user, rank: index + 1 }));
            
        return sortedData;
    }, [username, level, xp]);

    const currentUserForLeaderboard = useMemo(() => {
        return leaderboardData.find(u => u.name === (username || 'Tú')) || { rank: 0, name: username || 'Tú', level, xp };
    }, [leaderboardData, username, level, xp]);


    // --- Render Logic ---

    const renderGameState = () => {
        if (isLoading) {
            let loadingText = "Generando con IA...";
            if (gameState === GameStateEnum.TOPIC_SELECTION) loadingText = "Creando tu plan de estudio...";
            if (gameState === GameStateEnum.SYLLABUS_VIEW) loadingText = "Creando materiales de estudio...";
            return <LoadingSpinner text={loadingText} />;
        }

        if (error) {
            return <ErrorDisplay message={error} />;
        }
        
        switch (gameState) {
            case GameStateEnum.TOPIC_SELECTION:
                return <MainScreen onSubjectSelect={handleSubjectSelect} onFilesAnalyze={handleFilesAnalyze} isLoading={isLoading} onShowRules={() => setIsRulesModalOpen(true)} />;
            case GameStateEnum.SYLLABUS_VIEW:
                return <SyllabusView subject={subject} syllabus={syllabus} onSelectTopic={handleSelectTopic} onStartOver={handleStartOver} />;
            case GameStateEnum.STUDYING:
                if (currentTopic && studyMaterials?.flashcards) {
                    return <StudySession topic={currentTopic} flashcards={studyMaterials.flashcards} onSessionComplete={handleFlashcardSessionComplete} />;
                }
                return <ErrorDisplay message="No se encontraron materiales de estudio." />;
            case GameStateEnum.QUIZ:
                if (currentTopic && studyMaterials?.quiz) {
                    return <QuizView topic={currentTopic} quiz={studyMaterials.quiz} onQuizComplete={handleQuizComplete} />;
                }
                return <ErrorDisplay message="No se encontró el cuestionario." />;
            case GameStateEnum.RESULTS:
                 if (currentTopic && studyMaterials?.quiz) {
                    return <ResultsView subject={subject} topic={currentTopic} quiz={studyMaterials.quiz} userAnswers={userQuizAnswers} studySuggestion={studySuggestion} onPlayAgain={handlePlayAgain} onBackToSyllabus={handleBackToSyllabus} />;
                }
                return <ErrorDisplay message="No se encontraron los resultados." />;
            default:
                return <ErrorDisplay message="Estado de la aplicación desconocido." />;
        }
    };
    
    if (!username) {
        return <LoginScreen onSave={handleSaveName} />;
    }

    return (
        <div className="min-h-screen text-slate-200 p-4 sm:p-6 pb-28 md:pb-6 relative">
            
            {toastMessage && <ToastNotification message={toastMessage.text} type={toastMessage.type} onDismiss={() => setToastMessage(null)} />}
            {unlockedBadge && <AchievementUnlockedToast badge={unlockedBadge} onDismiss={() => setUnlockedBadge(null)} />}
            
            <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
            <ActivityLogPanel isOpen={isActivityLogOpen} onClose={() => setIsActivityLogOpen(false)} log={activityLog} />
            <FloatingActionButton onClick={() => setIsActivityLogOpen(true)} />

            <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
                <main className="flex-1">
                    {renderGameState()}
                </main>
                <aside className="w-full md:w-96 lg:w-[28rem] flex-shrink-0">
                    <ProgressDashboard 
                        xp={xp}
                        level={level}
                        badges={badges}
                        topicsCompleted={topicsCompleted}
                        username={username}
                    />
                </aside>
            </div>
            
            <CompactLeaderboard 
                leaderboardData={leaderboardData} 
                currentUser={currentUserForLeaderboard}
                isExpanded={isLeaderboardExpanded} 
                onToggle={() => setIsLeaderboardExpanded(p => !p)} 
            />
        </div>
    );
};

export default App;