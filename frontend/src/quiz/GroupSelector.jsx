import { useState } from 'react'
import './group-selector.css'

export default function GroupSelector({ groups, onSelectGroup, onStartQuiz, loading }) {
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isQuizMode, setIsQuizMode] = useState(false)

  const handleGroupClick = (group) => {
    setSelectedGroup(group)
    setIsQuizMode(true)
    if (onSelectGroup) {
      onSelectGroup(group)
    }
  }

  const handleStartQuiz = (group) => {
    if (onStartQuiz) {
      onStartQuiz({
        groupIds: [group.id],
        questionCount: 30,
        timerSeconds: 15,
      })
    }
  }

  if (isQuizMode && selectedGroup) {
    return (
      <div className="group-quiz-container">
        <div className="quiz-header-minimal">
          <button 
            className="back-button"
            onClick={() => {
              setIsQuizMode(false)
              setSelectedGroup(null)
            }}
          >
            ← Back to Groups
          </button>
          <h2>{selectedGroup.group_name}</h2>
          <p className="vocab-count">{selectedGroup.word_count} vocabularies to master</p>
        </div>

        <div className="vocab-grid-preview">
          <div className="vocab-cards-container">
            {/* Preview of vocabularies - showing placeholder structure */}
            <div className="vocab-preview-grid">
              {Array.from({ length: Math.min(6, selectedGroup.word_count) }).map((_, i) => (
                <div key={i} className="vocab-card-skeleton">
                  <div className="skeleton-word"></div>
                  <div className="skeleton-definition"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="quiz-action-section">
          <div className="quiz-config-summary">
            <div className="config-item">
              <span className="config-label">Questions:</span>
              <span className="config-value">30</span>
            </div>
            <div className="config-item">
              <span className="config-label">Time/Question:</span>
              <span className="config-value">15s</span>
            </div>
            <div className="config-item">
              <span className="config-label">Pool Size:</span>
              <span className="config-value">{selectedGroup.word_count}</span>
            </div>
          </div>
          <button
            className="start-quiz-button"
            onClick={() => handleStartQuiz(selectedGroup)}
            disabled={loading}
          >
            {loading ? 'Launching Quiz...' : '🚀 Start 30-Question Quiz'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group-selector-container">
      <div className="selector-header">
        <h1 className="selector-title">Choose Your Vocabulary Group</h1>
        <p className="selector-subtitle">Select a group to launch your personalized 30-vocabulary quiz</p>
      </div>

      <div className="groups-grid">
        {groups.map((group) => (
          <button
            key={group.id}
            className="group-card"
            onClick={() => handleGroupClick(group)}
            title={`${group.group_name} - ${group.word_count} words`}
          >
            <div className="group-card-header">
              <span className="group-number">Group {group.group_number}</span>
              <span className="group-badge">
                {group.word_count}
                <span className="badge-label">vocabs</span>
              </span>
            </div>
            <h3 className="group-name">{group.group_name}</h3>
            <div className="group-card-footer">
              <div className="progress-indicator">
                <div className="progress-bar"></div>
              </div>
              <span className="card-cta">Open →</span>
            </div>
          </button>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="empty-state">
          <p>No vocabulary groups available. Please try again later.</p>
        </div>
      )}
    </div>
  )
}
