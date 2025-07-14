
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import * as geminiService from './services/geminiService.ts';
import type { GameState, SyllabusTopic, Flashcard as FlashcardType, QuizQuestion, Badge, LeaderboardUser, ActivityLogEntry } from './types.ts';
import { GameState as GameStateEnum } from './types.ts';
import { INITIAL_BADGES, XP_PER_FLASHCARD_SESSION, XP_PER_QUIZ_CORRECT_ANSWER, XP_TO_LEVEL_UP } from './constants.tsx';
import { getRankDisplay, getLevelName, getLevelIcon } from './utils/uiHelpers.ts';

// --- Component Imports ---
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { ErrorDisplay } from './components/ErrorDisplay.tsx';
import { ToastNotification } from './components/ToastNotification.tsx';
import { AchievementUnlockedToast } from './components/AchievementUnlockedToast.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { ProgressDashboard } from './components/ProgressDashboard.tsx';
import { CompactLeaderboard } from './components/CompactLeaderboard.tsx';
import { ActivityLogPanel } from './components/ActivityLogPanel.tsx';
import { FloatingActionButton } from './components/FloatingActionButton.tsx';
import { RulesModal } from './components/RulesModal.tsx';
import { MainScreen } from './components/MainScreen.tsx';
import { SyllabusView } from './components/SyllabusView.tsx';
import { StudySession } from './components/StudySession.tsx';
import { QuizView } from './components/QuizView.tsx';
import { ResultsView } from './components/ResultsView.tsx';

// --- Helper Functions & Constants ---

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
