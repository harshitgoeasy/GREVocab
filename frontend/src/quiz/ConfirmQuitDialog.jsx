import { useEffect, useRef } from 'react'

export default function ConfirmQuitDialog({ onContinue, onQuit }) {
  const continueButtonRef = useRef(null)

  useEffect(() => {
    continueButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onContinue()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onContinue])

  return (
    <div className="quiz-dialog-backdrop">
      <section
        className="quiz-quit-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="quiz-quit-title"
        aria-describedby="quiz-quit-description"
      >
        <p className="quiz-kicker">Round in progress</p>
        <h2 id="quiz-quit-title">Leave this quiz?</h2>
        <p id="quiz-quit-description">
          Your completed answers are saved. The remaining questions will not appear in this round's results.
        </p>
        <div className="quiz-quit-actions">
          <button ref={continueButtonRef} type="button" className="quiz-next-button" onClick={onContinue}>
            Continue quiz
          </button>
          <button type="button" className="quiz-skip-button" onClick={onQuit}>
            Quit quiz
          </button>
        </div>
      </section>
    </div>
  )
}