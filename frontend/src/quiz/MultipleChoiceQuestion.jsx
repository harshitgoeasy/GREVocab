import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

const OUTCOME_LABELS = {
  correct: '✓ Correct',
  incorrect: '✗ Not quite',
  skipped: 'Skipped',
  timed_out: "⏱ Time's up",
}

const OUTCOME_EMOJIS = {
  correct: '🎉',
  incorrect: '💭',
  skipped: '⏭️',
  timed_out: '⏰',
}

export default function MultipleChoiceQuestion({
  question,
  questionNumber,
  questionCount,
  timerSeconds,
  secondsLeft,
  outcome,
  selectedAnswer,
  advanceIn,
  onAnswer,
  onNext,
}) {
  const celebratedQuestion = useRef(null)
  const [hoveredChoice, setHoveredChoice] = useState(null)

  useEffect(() => {
    if (outcome !== 'correct' || celebratedQuestion.current === question.id) return

    celebratedQuestion.current = question.id
    confetti({
      particleCount: 120,
      spread: 70,
      startVelocity: 42,
      origin: { y: 0.65 },
      colors: ['#e9b949', '#27745c', '#ff8a78', '#69c59a', '#f7f0d2'],
      gravity: 0.8,
      friction: 0.95,
    })
  }, [outcome, question.id])

  const timeProgress = Math.max(0, (secondsLeft / timerSeconds) * 100)
  const isTimerUrgent = secondsLeft <= 5 && !outcome
  const isTimerWarning = secondsLeft <= 10 && !outcome

  return (
    <main className="mcq-shell">
      <header className="mcq-header">
        <div className="mcq-progress-section">
          <p className="mcq-kicker">Question {questionNumber} of {questionCount}</p>
          <div className="mcq-progress-track" aria-label={`${questionNumber} of ${questionCount} questions`}>
            <span 
              className="mcq-progress-bar"
              style={{ width: `${(questionNumber / questionCount) * 100}%` }} 
            />
          </div>
        </div>
        <div className={`mcq-timer ${isTimerUrgent ? 'urgent' : isTimerWarning ? 'warning' : ''}`} aria-live="polite">
          <span className="timer-display">{secondsLeft}</span>
          <span className="timer-unit">s</span>
        </div>
      </header>

      <section className="mcq-question-container" aria-labelledby="mcq-prompt">
        <div className="mcq-metadata">
          <span className="mcq-group-tag">{question.group_name}</span>
          <span className="mcq-type-tag">
            {question.prompt_type === 'example' ? '📝 Sentence' : '💡 Meaning'}
          </span>
        </div>

        <div className="mcq-question-wrapper">
          <p id="mcq-prompt" className="mcq-prompt">
            {question.prompt}
          </p>
          <div className="mcq-timer-bar">
            <span 
              className={`mcq-timer-fill ${isTimerWarning ? 'warning' : ''} ${isTimerUrgent ? 'urgent' : ''}`}
              style={{ width: `${timeProgress}%` }} 
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="mcq-choices" role="group" aria-label="Answer choices">
          {question.choices.map((choice, index) => {
            const isCorrect = choice === question.correct_answer
            const isSelected = selectedAnswer === choice
            const stateClass = outcome && isCorrect
              ? ' state-correct'
              : outcome === 'incorrect' && isSelected
                ? ' state-incorrect'
                : ''
            const isHovered = hoveredChoice === index && !outcome

            return (
              <button
                key={choice}
                type="button"
                className={`mcq-choice-button${stateClass}${isHovered ? ' hovered' : ''}`}
                onClick={() => onAnswer(choice)}
                onMouseEnter={() => setHoveredChoice(index)}
                onMouseLeave={() => setHoveredChoice(null)}
                disabled={Boolean(outcome)}
                aria-pressed={isSelected}
              >
                <span className="choice-indicator">{String.fromCharCode(65 + index)}</span>
                <span className="choice-text">{choice}</span>
                {outcome && isCorrect && (
                  <span className="choice-mark" aria-label="Correct answer">
                    ✓
                  </span>
                )}
                {outcome === 'incorrect' && isSelected && (
                  <span className="choice-mark wrong" aria-label="Wrong answer">
                    ✗
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {outcome ? (
          <div 
            className={`mcq-feedback mcq-feedback-${outcome}`} 
            role="status" 
            aria-live="polite"
          >
            <div className="feedback-content">
              <div className="feedback-header">
                <span className="feedback-emoji">{OUTCOME_EMOJIS[outcome]}</span>
                <strong className="feedback-label">{OUTCOME_LABELS[outcome]}</strong>
              </div>
              <div className="feedback-definition">
                <p>
                  <b className="word-emphasis">{question.correct_answer}</b>
                  <span className="definition-text"> means {question.definition}</span>
                </p>
              </div>
              {(outcome === 'skipped' || outcome === 'timed_out') && (
                <p className="reveal-countdown">
                  Next question in <strong>{advanceIn ?? 5}s</strong>
                </p>
              )}
            </div>
            <button
              type="button"
              className="mcq-next-button"
              onClick={onNext}
              disabled={outcome === 'skipped' || outcome === 'timed_out'}
            >
              {questionNumber === questionCount ? 'Finish Round' : 'Next Question'}
            </button>
          </div>
        ) : (
          <div className="mcq-actions">
            <p className="mcq-hint">Select an answer, or reveal the word and skip.</p>
            <button type="button" className="mcq-skip-button" onClick={onNext}>
              ⏭️ Skip and Reveal
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
