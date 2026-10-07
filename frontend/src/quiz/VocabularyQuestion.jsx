import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

const OUTCOME_LABELS = {
  correct: 'Correct',
  incorrect: 'Not quite',
  skipped: 'Skipped',
  timed_out: "Time's up",
}

export default function VocabularyQuestion({
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

  useEffect(() => {
    if (outcome !== 'correct' || celebratedQuestion.current === question.id) return

    celebratedQuestion.current = question.id
    confetti({
      particleCount: 92,
      spread: 64,
      startVelocity: 38,
      origin: { y: 0.68 },
      colors: ['#f2c14e', '#e36b52', '#2f7a68', '#f7f0d2'],
    })
  }, [outcome, question.id])

  const timeProgress = Math.max(0, (secondsLeft / timerSeconds) * 100)

  return (
    <main className="quiz-play-shell">
      <header className="quiz-play-header">
        <div>
          <p className="quiz-kicker">Question {questionNumber} of {questionCount}</p>
          <div className="quiz-progress-track" aria-label={`${questionNumber} of ${questionCount} questions`}>
            <span style={{ width: `${(questionNumber / questionCount) * 100}%` }} />
          </div>
        </div>
        <div className={secondsLeft <= 5 && !outcome ? 'quiz-clock urgent' : 'quiz-clock'} aria-live="polite">
          <strong>{secondsLeft}</strong><span>s</span>
        </div>
      </header>

      <section className="quiz-question-panel" aria-labelledby="quiz-prompt">
        <div className="quiz-question-meta">
          <span>{question.group_name}</span>
          <span>
            {question.prompt_type === 'example'
              ? 'Sentence completion'
              : question.prompt_type === 'GRE practice'
                ? 'GRE practice question'
                : 'Meaning clue'}
          </span>
        </div>
        <p id="quiz-prompt" className="quiz-prompt">{question.prompt}</p>
        <div className="quiz-question-timer" aria-hidden="true">
          <span style={{ width: `${timeProgress}%` }} />
        </div>

        <div className="quiz-answer-list" role="group" aria-label="Answer choices">
          {question.choices.map((choice, index) => {
            const isCorrect = choice === question.correct_answer
            const isSelected = selectedAnswer === choice
            const stateClass = outcome && isCorrect
              ? ' answer-correct'
              : outcome === 'incorrect' && isSelected
                ? ' answer-incorrect'
                : ''

            return (
              <button
                key={choice}
                type="button"
                className={`quiz-answer${stateClass}`}
                onClick={() => onAnswer(choice)}
                disabled={Boolean(outcome)}
              >
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <span>{choice}</span>
                {outcome && isCorrect && <span className="answer-mark" aria-label="Correct answer">✓</span>}
              </button>
            )
          })}
        </div>

        {outcome ? (
          <div className={`quiz-feedback feedback-${outcome}`} role="status" aria-live="polite">
            <div>
              <strong>{OUTCOME_LABELS[outcome]}</strong>
              <p><b>{question.correct_answer}</b> means {question.definition}</p>
              {(outcome === 'skipped' || outcome === 'timed_out') && (
                <p className="reveal-countdown">Next question in {advanceIn ?? 5}s</p>
              )}
            </div>
            <button
              type="button"
              className="quiz-next-button"
              onClick={onNext}
              disabled={outcome === 'skipped' || outcome === 'timed_out'}
            >
              {questionNumber === questionCount ? 'Finish round' : 'Next question'}
            </button>
          </div>
        ) : (
          <div className="quiz-question-actions">
            <p>Select an answer, or reveal the word and skip.</p>
            <button type="button" className="quiz-skip-button" onClick={onNext}>
              Skip and reveal
            </button>
          </div>
        )}
      </section>
    </main>
  )
}