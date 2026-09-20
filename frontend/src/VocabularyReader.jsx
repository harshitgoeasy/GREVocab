import { useEffect, useMemo, useState } from 'react'

const FILTERS = ['ALL', 'UNMASTERED', 'BOOKMARKED']

const getMasteryStore = (groupId) => {
  try {
    const raw = localStorage.getItem(`vocab_mastery_${groupId}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function VocabularyReader({ words = [], groupId, groupName, filter = 'ALL', onFilterChange, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [masteryMap, setMasteryMap] = useState(() => getMasteryStore(groupId))

  useEffect(() => {
    setMasteryMap(getMasteryStore(groupId))
    setCurrentIndex(0)
    setShowDefinition(false)
  }, [groupId])

  useEffect(() => {
    localStorage.setItem(`vocab_mastery_${groupId}`, JSON.stringify(masteryMap))
  }, [groupId, masteryMap])

  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      const entry = masteryMap[word.word] || {}

      if (filter === 'UNMASTERED') return !entry.known
      if (filter === 'BOOKMARKED') return Boolean(entry.bookmarked)
      return true
    })
  }, [filter, masteryMap, words])

  useEffect(() => {
    if (!filteredWords.length) return
    if (currentIndex >= filteredWords.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, filteredWords])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!filteredWords.length) return

      if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % filteredWords.length)
        setShowDefinition(false)
      }

      if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length)
        setShowDefinition(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredWords])

  const activeWord = filteredWords[currentIndex] || null

  const updateEntry = (updates) => {
    if (!activeWord) return

    setMasteryMap((prev) => {
      const previous = prev[activeWord.word] || {}
      return {
        ...prev,
        [activeWord.word]: { ...previous, ...updates },
      }
    })
  }

  const markKnown = () => {
    updateEntry({ known: true, reviewed: true })
    setShowDefinition(true)
  }

  const markReviewLater = () => {
    updateEntry({ bookmarked: true, reviewed: true })
  }

  const gotoPrevious = () => {
    if (!filteredWords.length) return
    setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length)
    setShowDefinition(false)
  }

  const gotoNext = () => {
    if (!filteredWords.length) return
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length)
    setShowDefinition(false)
  }

  return (
    <main className="reader-shell">
      <div className="reader-panel">
        <div className="reader-header">
          <div>
            <p className="eyebrow">Vocabulary Reader</p>
            <h3>{groupName}</h3>
          </div>

          <div className="reader-controls">
            <button type="button" className="secondary-button small" onClick={onClose}>
              ✕ Exit
            </button>
          </div>
        </div>

        <div className="filter-row">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? 'filter-pill active' : 'filter-pill'}
              onClick={() => onFilterChange(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {!filteredWords.length ? (
          <div className="empty-state card">No words match this filter yet.</div>
        ) : (
          <>
            <button type="button" className="reader-card" onClick={() => setShowDefinition((prev) => !prev)}>
              <div className="reader-card-inner">
                <span className="reader-meta">
                  {activeWord.part_of_speech?.join(', ') || 'Word'}
                </span>
                <h4 className="reader-word">{activeWord.word}</h4>

                {showDefinition ? (
                  <>
                    <p className="reader-definition">{activeWord.definition}</p>
                    <p className="reader-example">
                      <strong>Example:</strong> {activeWord.example_sentence}
                    </p>
                  </>
                ) : (
                  <p className="reader-definition">Tap to reveal the meaning and example.</p>
                )}
              </div>
            </button>

            <div className="reader-actions">
              <button type="button" className="secondary-button" onClick={gotoPrevious}>
                Previous
              </button>

              <button type="button" className="secondary-button" onClick={gotoNext}>
                Next
              </button>

              <button type="button" className="primary-button" onClick={markKnown}>
                Mark as Known
              </button>

              <button type="button" className="secondary-button" onClick={markReviewLater}>
                Review Later
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
