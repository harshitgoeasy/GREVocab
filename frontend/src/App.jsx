import { useEffect, useMemo, useState } from 'react'
import './App.css'
import VocabularyReader from './VocabularyReader'

const STORAGE_KEY = 'gre-vocab-progress'
const PLAYER_NAME_KEY = 'gre-vocab-name'
const SELECTED_GROUP_KEY = 'gre-vocab-selected-group'
const STREAK_KEY = 'gre-study-streak'
const THEME_KEY = 'gre-vocab-theme'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const ROUND_SECONDS = 30

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
  const [sessionQuestions, setSessionQuestions] = useState([])
  const [sessionIndex, setSessionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)

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

  useEffect(() => {
    if (dashboardState.activeView !== 'QUIZ_PRACTICE' && dashboardState.activeView !== 'QUIZ_TIMED') return

    const mode = dashboardState.activeView === 'QUIZ_TIMED' ? 'timed' : 'practice'
    fetchJson(`${API_BASE_URL}/api/groups/${dashboardState.selectedGroup}/quiz?mode=${mode}`)
      .then((data) => {
        const questions = Array.isArray(data) ? data : data.questions || []
        setSessionQuestions(questions)
        setSessionIndex(0)
        setSelectedAnswer('')
        setShowResult(false)
        setTimeLeft(ROUND_SECONDS)
      })
      .catch(() => {
        setSessionQuestions([])
        setSessionIndex(0)
        setSelectedAnswer('')
        setShowResult(false)
      })
  }, [dashboardState.activeView, dashboardState.selectedGroup])

  useEffect(() => {
    if (dashboardState.activeView !== 'QUIZ_TIMED' || !sessionQuestions[sessionIndex] || showResult) {
      if (dashboardState.activeView !== 'QUIZ_TIMED') {
        setTimeLeft(ROUND_SECONDS)
      }
      return
    }

    setTimeLeft(ROUND_SECONDS)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!showResult) {
            setSelectedAnswer('TIMEOUT')
            setShowResult(true)
            const updatedProgress = {
              ...progress,
              [dashboardState.selectedGroup]: {
                ...(progress[dashboardState.selectedGroup] || {}),
                score: progress[dashboardState.selectedGroup]?.score || 0,
                attempts: (progress[dashboardState.selectedGroup]?.attempts || 0) + 1,
              },
            }
            setProgress(updatedProgress)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress))
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [dashboardState.activeView, dashboardState.selectedGroup, progress, sessionQuestions, sessionIndex, showResult])

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === dashboardState.selectedGroup) || groups[0],
    [groups, dashboardState.selectedGroup],
  )

  const currentQuestion = sessionQuestions[sessionIndex]
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

  const updateLocalProgress = (updatedProgress) => {
    setProgress(updatedProgress)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress))
  }

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

  const handleAnswer = (answer) => {
    if (!currentQuestion || showResult) return

    const isCorrect = answer === currentQuestion.definition
    const updatedProgress = {
      ...progress,
      [dashboardState.selectedGroup]: {
        ...(progress[dashboardState.selectedGroup] || {}),
        score: (progress[dashboardState.selectedGroup]?.score || 0) + (isCorrect ? 1 : 0),
        attempts: (progress[dashboardState.selectedGroup]?.attempts || 0) + 1,
      },
    }

    updateLocalProgress(updatedProgress)
    setSelectedAnswer(answer)
    setShowResult(true)

    if (isCorrect) {
      const nextStreak = studyStreak + 1
      setStudyStreak(nextStreak)
      localStorage.setItem(STREAK_KEY, String(nextStreak))
    } else {
      setStudyStreak(0)
      localStorage.setItem(STREAK_KEY, '0')
    }
  }

  const handleNextQuestion = () => {
    if (!sessionQuestions.length) {
      setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))
      return
    }

    const nextIndex = sessionIndex + 1
    if (nextIndex < sessionQuestions.length) {
      setSessionIndex(nextIndex)
      setSelectedAnswer('')
      setShowResult(false)
      return
    }

    setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))
  }

  const launchMode = (mode) => {
    setDashboardState((current) => ({
      ...current,
      activeView: mode,
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
        <img src="/batman-logo.svg" alt="Batman logo" className="app-logo" />
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

      <section className="mode-launchpad">
        <div className="section-header">
          <div>
            <p className="eyebrow">Select Intent</p>
            <h2>Choose your action</h2>
          </div>
        </div>

        <div className="mode-grid">
          <button type="button" className="mode-card" onClick={() => launchMode('QUIZ_PRACTICE')}>
            <span className="mode-tag">Practice</span>
            <h3>Standard Practice</h3>
            <p>Untimed multiple-choice rounds for focused review.</p>
          </button>

          <button type="button" className="mode-card" onClick={() => launchMode('QUIZ_TIMED')}>
            <span className="mode-tag">Challenge</span>
            <h3>Timed Challenge</h3>
            <p>Fast-paced quiz mode with a 30-second clock.</p>
          </button>
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

        <div className="focus-actions">
          <button type="button" className="secondary-button" onClick={() => launchMode('QUIZ_PRACTICE')}>
            Practice
          </button>
          <button type="button" className="secondary-button" onClick={() => launchMode('QUIZ_TIMED')}>
            Timed Challenge
          </button>
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

  const renderQuizView = () => (
    <main className="quiz-shell">
      <div className="quiz-topbar">
        <button type="button" className="secondary-button" onClick={() => setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))}>
          ← Back to dashboard
        </button>
        <div className="timer-pill">{dashboardState.activeView === 'QUIZ_TIMED' ? `${timeLeft}s` : 'Practice mode'}</div>
      </div>

      {currentQuestion ? (
        <div className="card question-card">
          <div className="question-header">
            <div>
              <p className="question-label">Choose the best definition</p>
              <p className="question-counter">
                Word {sessionIndex + 1} / {sessionQuestions.length}
              </p>
            </div>
            <button type="button" className="secondary-button small" onClick={() => setDashboardState((current) => ({ ...current, activeView: 'WELCOME' }))}>
              Exit
            </button>
          </div>

          <h3>{currentQuestion.word}</h3>
          <p className="example">Example: {currentQuestion.example_sentence}</p>

          <div className="choices-grid">
            {currentQuestion.choices.map((choice) => {
              const isCorrect = choice === currentQuestion.definition
              const isSelected = selectedAnswer === choice
              const showCorrect = showResult && isCorrect
              const showWrong = showResult && isSelected && !isCorrect

              return (
                <button
                  key={choice}
                  type="button"
                  className={[ 'choice-button', showCorrect ? 'correct' : '', showWrong ? 'wrong' : '' ].filter(Boolean).join(' ')}
                  onClick={() => handleAnswer(choice)}
                  disabled={showResult}
                >
                  {choice}
                </button>
              )
            })}
          </div>

          {showResult && (
            <div className="result-box">
              <p>
                {selectedAnswer === 'TIMEOUT'
                  ? `Time’s up! `
                  : selectedAnswer === currentQuestion.definition
                    ? 'Correct! '
                    : 'Not quite. '}
                <strong>{currentQuestion.word}</strong> means: {currentQuestion.definition}
              </p>
              <button type="button" className="primary-button" onClick={handleNextQuestion}>
                {sessionIndex < sessionQuestions.length - 1 ? 'Next word' : 'Return to dashboard'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card empty-state">No quiz questions available for this group yet.</div>
      )}
    </main>
  )

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
      {(dashboardState.activeView === 'QUIZ_PRACTICE' || dashboardState.activeView === 'QUIZ_TIMED') && renderQuizView()}

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
    </div>
  )
}

export default App
