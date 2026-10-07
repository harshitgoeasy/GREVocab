import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import VocabularyReader from './VocabularyReader'
import QuizSetup from './quiz/QuizSetup'
import VocabularyQuestion from './quiz/VocabularyQuestion'
import QuizSummary from './quiz/QuizSummary'
import ConfirmQuitDialog from './quiz/ConfirmQuitDialog'
import { useQuizSession } from './quiz/useQuizSession'
import './quiz/quiz.css'

const STORAGE_KEY = 'gre-vocab-progress'
const PLAYER_NAME_KEY = 'gre-vocab-name'
const SELECTED_GROUP_KEY = 'gre-vocab-selected-group'
const STREAK_KEY = 'gre-study-streak'
const THEME_KEY = 'gre-vocab-theme'
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_BASE_URL = (
  /^https?:\/\//i.test(configuredApiBaseUrl)
    ? configuredApiBaseUrl
    : `https://${configuredApiBaseUrl}`
).replace(/\/+$/, '')

const fetchJson = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json()
}

const DEFAULT_DASHBOARD_STATE = {
  selectedGroup: 1,
  activeView: 'WELCOME',
  filter: 'ALL',
}

const FOOTER_SECTIONS = [
  {
    title: 'Identity & Dispatch',
    items: [
      { label: 'Brand / Tagline', value: 'Lexicon Vault & Curious Mind' },
      { label: 'Location', value: 'Delhi, India' },
      { label: 'Contact', value: 'starwar.9905@gmail.com', href: 'mailto:starwar.9905@gmail.com' },
      { label: 'Status', value: 'Open to collaboration & knowledge exchange' },
      { label: 'RSS / Feed', value: 'Hacker News', href: 'https://news.ycombinator.com/rss' },
    ],
  },
  {
    title: 'Verbal Arsenal (GRE & Lexicon)',
    items: [
      { label: 'GRE High-Frequency Word Groups (32-Set PDF)', href: 'https://forums.gregmat.com/uploads/short-url/wcrxrA5W35MmXALcUOU9mVuhvjt.pdf' },
      { label: 'The Power of Lexical Depth (Why Vocab Matters)', href: 'https://textinspector.com/vocabulary-in-language-learning/' },
      { label: 'The Grand Art of Eloquence: Shashi Tharoor', href: 'https://en.wikipedia.org/wiki/Shashi_Tharoor' },
      { label: 'Etymological Roots: Online Etymology Dictionary', href: 'https://www.etymonline.com/' },
      { label: 'Precision Writing: Merriam-Webster Word of the Day', href: 'https://www.merriam-webster.com/word-of-the-day' },
      { label: 'Advanced Rhetoric & Literary Devices', href: 'https://literarydevices.net/' },
    ],
  },
  {
    title: 'Fandom & Cosmic Archives',
    items: [
      { label: 'Multiverse Lexicon: Marvel Universe Glossary', href: 'https://marvel.fandom.com/wiki/Category:Glossary' },
      { label: 'Cosmic Frontiers: NASA Space Place Terminology', href: 'https://spaceplace.nasa.gov/glossary/en/' },
      { label: 'Wanderlust Ledger: 100 Global Cities to Explore', href: 'https://www.delicious.com.au/travel/international/gallery/100-cities-deserve-place-travel-bucket-list/o4lzlr69' },
      { label: 'Astronomy Picture of the Day (APOD)', href: 'https://apod.nasa.gov/apod/astropix.html' },
      { label: 'DC Multiverse Database', href: 'https://dc.fandom.com/wiki/DC_Comics_Database' },
      { label: 'Deep Space Missions: ESA Science Archives', href: 'https://www.cosmos.esa.int/' },
    ],
  },
  {
    title: 'Code, Tools & Mental Models',
    items: [
      { label: 'Algorithmic Playground: LeetCode Problems', href: 'https://leetcode.com/problemset/' },
      { label: 'Language Documentation: Microsoft Learn C# Guide', href: 'https://learn.microsoft.com/en-us/dotnet/csharp/' },
      { label: 'Clear Thinking: Farnam Street Mental Models', href: 'https://fs.blog/mental-models/' },
      { label: 'The Developer Roadmap (Frontend, Backend & AI)', href: 'https://roadmap.sh/' },
      { label: 'Open Source Exploration: GitHub Trending', href: 'https://github.com/trending' },
    ],
  },
  {
    title: 'Global Curiosities & Field Notes',
    items: [
      { label: 'UNESCO World Heritage Sites Directory', href: 'https://whc.unesco.org/en/list/' },
      { label: 'Atlas Obscura: Curious & Wondrous Travel Guide', href: 'https://www.atlasobscura.com/' },
      { label: 'Our World in Data (Global Research & Metrics)', href: 'https://ourworldindata.org/' },
      { label: 'Internet Archive Wayback Machine', href: 'https://archive.org/web/' },
    ],
  },
]

function App() {
  const [playerName, setPlayerName] = useState('Guest Learner')
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark')
  const [groups, setGroups] = useState([])
  const [dashboardState, setDashboardState] = useState(DEFAULT_DASHBOARD_STATE)
  const [progress, setProgress] = useState({})
  const [studyStreak, setStudyStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [readerWords, setReaderWords] = useState([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState('')
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false)
  const [questionBankGroups, setQuestionBankGroups] = useState([])
  const [questionBankLoading, setQuestionBankLoading] = useState(false)
  const questionBankModule = useRef(null)

  const handleQuizOutcome = (result) => {
    setProgress((current) => {
      const groupProgress = current[result.group_id] || {}
      const updated = {
        ...current,
        [result.group_id]: {
          ...groupProgress,
          score: (groupProgress.score || 0) + (result.outcome === 'correct' ? 1 : 0),
          attempts: (groupProgress.attempts || 0) + 1,
        },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })

    setStudyStreak((current) => {
      const nextStreak = result.outcome === 'correct' ? current + 1 : 0
      localStorage.setItem(STREAK_KEY, String(nextStreak))
      return nextStreak
    })
  }

  const quizSession = useQuizSession(handleQuizOutcome)

  const loadQuestionBank = async () => {
    if (questionBankModule.current) return questionBankModule.current

    setQuestionBankLoading(true)
    try {
      const module = await import('./quiz/greQuestionBank.js')
      setQuestionBankGroups(module.getGreQuestionGroups())
      questionBankModule.current = module
      return module
    } finally {
      setQuestionBankLoading(false)
    }
  }

  useEffect(() => {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY) || 'Guest Learner'
    const savedSelectedGroup = Number(localStorage.getItem(SELECTED_GROUP_KEY) || 1)
    const savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const savedStreak = Number(localStorage.getItem(STREAK_KEY) || 0)
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark'

    setPlayerName(savedName)
    setProgress(savedProgress)
    setStudyStreak(savedStreak)
    setTheme(savedTheme)
    setDashboardState((current) => ({ ...current, selectedGroup: savedSelectedGroup }))

    fetchJson(`${API_BASE_URL}/api/groups`)
      .then((data) => {
        const nextGroups = Array.isArray(data) ? data : []
        setGroups(nextGroups)
        setLoading(false)
      })
      .catch(() => {
        setGroups([])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!dashboardState.selectedGroup) return
    localStorage.setItem(SELECTED_GROUP_KEY, String(dashboardState.selectedGroup))
  }, [dashboardState.selectedGroup])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (dashboardState.activeView !== 'READER' && dashboardState.activeView !== 'GROUP_DETAIL') return
    fetchJson(`${API_BASE_URL}/api/groups/${dashboardState.selectedGroup}/words`)
      .then((data) => setReaderWords(Array.isArray(data) ? data : []))
      .catch(() => setReaderWords([]))
  }, [dashboardState.activeView, dashboardState.selectedGroup])

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === dashboardState.selectedGroup) || groups[0],
    [groups, dashboardState.selectedGroup],
  )

  const masteryByGroup = useMemo(() => {
    return groups.reduce((map, group) => {
      const raw = JSON.parse(localStorage.getItem(`vocab_mastery_${group.id}`) || '{}')
      const mastered = Object.values(raw).filter((entry) => entry && entry.known).length
      map[group.id] = mastered
      return map
    }, {})
  }, [groups, dashboardState.activeView, readerWords])

  const totalAttempts = Object.values(progress).reduce((sum, item) => sum + (item.attempts || 0), 0)
  const totalCorrect = Object.values(progress).reduce((sum, item) => sum + (item.score || 0), 0)
  const accuracyRate = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  const totalWordsExplored = Object.values(progress).reduce((sum, item) => sum + (item.attempts || 0), 0)
  const totalMasteredWords = groups.reduce((sum, group) => sum + (masteryByGroup[group.id] || 0), 0)
  const selectedGroupMastered = selectedGroup ? masteryByGroup[selectedGroup.id] || 0 : 0
  const needReviewCount = selectedGroup ? Math.max((selectedGroup.word_count || 0) - selectedGroupMastered, 0) : 0

  const startQuiz = async ({ groupIds, questionCount, timerSeconds, questionType = 'vocabulary' }) => {
    setQuizLoading(true)
    setQuizError('')
    try {
      if (questionType === 'gre-bank') {
        const questionBank = await loadQuestionBank()
        quizSession.start(questionBank.buildGreQuestionSet(groupIds, questionCount), timerSeconds)
        setDashboardState((current) => ({ ...current, activeView: 'QUIZ_ACTIVE' }))
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_ids: groupIds, question_count: questionCount }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Could not prepare this quiz.')
      if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
        throw new Error('No quiz questions are available for this selection.')
      }

      quizSession.start(payload.questions, timerSeconds)
      setDashboardState((current) => ({ ...current, activeView: 'QUIZ_ACTIVE' }))
    } catch (error) {
      setQuizError(error.message || 'Could not prepare this quiz. Please try again.')
    } finally {
      setQuizLoading(false)
    }
  }

  const leaveQuiz = () => {
    setShowQuitConfirmation(false)
    quizSession.stop()
    setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))
  }

  const requestQuitQuiz = () => setShowQuitConfirmation(true)
  const continueQuiz = () => setShowQuitConfirmation(false)

  const resetProgress = () => {
    setProgress({})
    setStudyStreak(0)
    setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))
    localStorage.setItem(STORAGE_KEY, '{}')
    localStorage.setItem(STREAK_KEY, '0')

    groups.forEach((group) => {
      localStorage.removeItem(`vocab_mastery_${group.id}`)
    })
  }

  const launchQuizSetup = () => {
    setDashboardState((current) => ({
      ...current,
      activeView: 'QUIZ_SETUP',
    }))
  }

  const launchMode = (mode) => {
    setDashboardState((current) => ({
      ...current,
      activeView: mode === 'READER' ? 'READER' : 'WELCOME',
    }))
  }

  const handleGroupChange = (groupId, openDetail = false) => {
    setDashboardState((current) => ({
      ...current,
      selectedGroup: groupId,
      ...(openDetail ? { activeView: 'GROUP_DETAIL' } : {}),
    }))
  }

  const renderGroupDetailView = () => (
    <main className="group-detail-shell">
      <div className="group-detail-header">
        <button type="button" className="secondary-button" onClick={() => setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))}>
          ← Back
        </button>

        <div>
          <p className="eyebrow">Vocabulary Set</p>
          <h2>{selectedGroup?.name || 'GRE Group'}</h2>
        </div>

        <button type="button" className="primary-button" onClick={() => launchMode('READER')}>
          Study this group
        </button>
      </div>

      <div className="group-detail-grid">
        {readerWords.length ? (
          readerWords.map((word, index) => (
            <article key={`${word.word}-${index}`} className="word-detail-card">
              <div className="word-detail-header">
                <div>
                  <span className="word-number">#{index + 1}</span>
                  <h3>{word.word}</h3>
                </div>
                <span className="word-pos">{(word.part_of_speech || ['Word']).join(', ')}</span>
              </div>

              <p className="word-definition">
                <strong>Meaning:</strong> {word.definition}
              </p>

              <p className="word-example">
                <strong>Example:</strong> {word.example_sentence || 'No example sentences were provided for this word.'}
              </p>

              <div className="word-synonyms">
                <strong>Possible synonyms:</strong>
                <div className="synonym-list">
                  {(Array.isArray(word.synonyms) && word.synonyms.length ? word.synonyms : ['related concept']).map((synonym, synonymIndex) => (
                    <span key={`${word.word}-synonym-${synonymIndex}`} className="synonym-pill">
                      {synonym}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="card empty-state">This group does not have any vocabulary loaded yet.</div>
        )}
      </div>
    </main>
  )

  const renderWelcomeBoard = () => (
    <main className="welcome-board">
      <section className="brand-bar">
        <div className="dashboard-identity">
          <img src="/batman-logo.svg" alt="Batman logo" className="app-logo" />
          <div>
            <p className="eyebrow">GRE Vocabulary</p>
            <h1>Study dashboard</h1>
          </div>
        </div>
        <button type="button" className="dashboard-quiz-cta" onClick={launchQuizSetup}>
          Start a quiz <span aria-hidden="true">→</span>
        </button>
      </section>

      <section className="stats-bar">
        <div className="stat-card">
          <span>Total words explored</span>
          <strong>{totalWordsExplored}</strong>
        </div>

        <div className="stat-card">
          <span>Accuracy</span>
          <strong>{accuracyRate}%</strong>
        </div>

        <div className="stat-card">
          <span>Correct streak</span>
          <strong>{studyStreak}</strong>
        </div>
      </section>

      <section className="summary-strip">
        <div className="summary-chip">
          <span>Mastered</span>
          <strong>{totalMasteredWords}</strong>
        </div>
        <div className="summary-chip">
          <span>In this group</span>
          <strong>{selectedGroupMastered}</strong>
        </div>
        <div className="summary-chip">
          <span>Needs review</span>
          <strong>{needReviewCount}</strong>
        </div>
      </section>

      <section className="focus-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Study Focus</p>
            <h2>{selectedGroup ? selectedGroup.name : 'GRE Group'}</h2>
          </div>
          <span className="focus-badge">{selectedGroup?.word_count || 0} words</span>
        </div>

        <p className="focus-description">
          {selectedGroup?.description || 'Select a group to begin your GRE vocabulary study session.'}
        </p>

        <div className="focus-progress">
          <div className="progress-meta">
            <span>Mastery</span>
            <strong>
              {selectedGroup ? `${masteryByGroup[selectedGroup.id] || 0}/${selectedGroup.word_count}` : '0/0'}
            </strong>
          </div>
          <div className="progress-bar">
            <span
              style={{
                width: selectedGroup
                  ? `${((masteryByGroup[selectedGroup.id] || 0) / selectedGroup.word_count) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </div>

      </section>

      <section className="group-board">
        <div className="section-header">
          <div>
            <p className="eyebrow">Select Group</p>
            <h2>Pick a study set</h2>
          </div>
        </div>

        <div className="group-grid">
          {groups.map((group) => {
            const isSelected = dashboardState.selectedGroup === group.id
            const masteryCount = masteryByGroup[group.id] || 0
            return (
              <button
                key={group.id}
                type="button"
                className={isSelected ? 'group-card active' : 'group-card'}
                onClick={() => handleGroupChange(group.id, true)}
              >
                <span className="group-label">Group {group.group_number}</span>
                <strong>{group.name}</strong>
                <small>{group.word_count} words</small>
                <em>{masteryCount}/{group.word_count} learned</em>
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )

  const renderQuizSetup = () => (
    <QuizSetup
      groups={groups}
      questionBankGroups={questionBankGroups}
      onLoadQuestionBank={loadQuestionBank}
      initialGroupId={dashboardState.selectedGroup}
      loading={loading || quizLoading || questionBankLoading}
      error={quizError}
      onStart={startQuiz}
      onCancel={() => setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))}
    />
  )

  const renderQuizView = () => {
    if (quizSession.isComplete) {
      return (
        <QuizSummary
          results={quizSession.results}
          questionCount={quizSession.questions.length}
          onReturn={leaveQuiz}
        />
      )
    }

    if (!quizSession.currentQuestion) {
      return <div className="card empty-state">No quiz questions are available for this selection.</div>
    }

    return (
      <div className="quiz-active-view">
        <div className="quiz-topbar">
          <button type="button" className="secondary-button" onClick={requestQuitQuiz}>Leave quiz</button>
        </div>
        <VocabularyQuestion
          question={quizSession.currentQuestion}
          questionNumber={quizSession.questionIndex + 1}
          questionCount={quizSession.questions.length}
          timerSeconds={quizSession.timerSeconds}
          secondsLeft={quizSession.secondsLeft}
          outcome={quizSession.outcome}
          selectedAnswer={quizSession.selectedAnswer}
          advanceIn={quizSession.advanceIn}
          onAnswer={quizSession.answer}
          onNext={quizSession.next}
        />
      </div>
    )
  }

  return (
    <div className={`app-shell ${theme}`}>
      <div className="app-top-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      {dashboardState.activeView === 'WELCOME' && renderWelcomeBoard()}
      {dashboardState.activeView === 'GROUP_DETAIL' && renderGroupDetailView()}
      {dashboardState.activeView === 'READER' && (
        <VocabularyReader
          words={readerWords}
          groupId={dashboardState.selectedGroup}
          groupName={selectedGroup?.name || 'GRE Group'}
          filter={dashboardState.filter}
          onFilterChange={(filterValue) => setDashboardState((current) => ({ ...current, filter: filterValue }))}
          onClose={() => setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))}
        />
      )}
      {dashboardState.activeView === 'QUIZ_SETUP' && renderQuizSetup()}
      {dashboardState.activeView === 'QUIZ_ACTIVE' && renderQuizView()}
      {showQuitConfirmation && dashboardState.activeView === 'QUIZ_ACTIVE' && (
        <ConfirmQuitDialog onContinue={continueQuiz} onQuit={leaveQuiz} />
      )}

      {dashboardState.activeView === 'WELCOME' && (
        <footer className="site-footer">
        <div className="footer-grid">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="footer-column">
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={`${section.title}-${item.label}`}>
                    {item.label && item.value ? (
                      <>
                        <strong>{item.label}:</strong> {item.href ? (
                          <a href={item.href} target="_blank" rel="noreferrer">{item.value}</a>
                        ) : (
                          item.value
                        )}
                      </>
                    ) : item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                    ) : (
                      item.label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        </footer>
      )}
    </div>
  )
}

export default App
