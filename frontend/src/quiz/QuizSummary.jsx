const OUTCOMES = [
  ['correct', 'Correct'],
  ['incorrect', 'Incorrect'],
  ['skipped', 'Skipped'],
  ['timed_out', 'Timed out'],
]

export default function QuizSummary({ results, questionCount, onReturn }) {
  const totals = results.reduce((counts, result) => {
    counts[result.outcome] += 1
    return counts
  }, { correct: 0, incorrect: 0, skipped: 0, timed_out: 0 })
  const answered = totals.correct + totals.incorrect
  const accuracy = answered ? Math.round((totals.correct / answered) * 100) : 0
  const groups = Object.values(results.reduce((summary, result) => {
    const key = result.group_id
    if (!summary[key]) {
      summary[key] = { id: key, name: result.group_name, correct: 0, total: 0 }
    }
    summary[key].total += 1
    if (result.outcome === 'correct') summary[key].correct += 1
    return summary
  }, {}))
  const reviewWords = results.filter((result) => result.outcome !== 'correct')

  return (
    <main className="quiz-summary-shell">
      <header className="quiz-summary-heading">
        <p className="quiz-kicker">Round complete</p>
        <h1>Here’s your readout.</h1>
        <p>{questionCount} questions · {totals.correct} correct</p>
      </header>

      <section className="quiz-scoreline" aria-label="Quiz score and accuracy">
        <div className="quiz-score-primary">
          <span>Score</span>
          <strong>{totals.correct}<small>/{questionCount}</small></strong>
        </div>
        <div className="quiz-score-primary">
          <span>Accuracy on answered</span>
          <strong>{accuracy}<small>%</small></strong>
        </div>
      </section>

      <section className="quiz-outcome-grid" aria-label="Question outcomes">
        {OUTCOMES.map(([key, label]) => (
          <div className={`quiz-outcome-stat outcome-${key}`} key={key}>
            <span>{label}</span>
            <strong>{totals[key]}</strong>
          </div>
        ))}
      </section>

      {groups.length > 1 && (
        <section className="quiz-analysis-section">
          <div className="quiz-analysis-heading">
            <p className="quiz-kicker">By group</p>
            <h2>Where you landed</h2>
          </div>
          <div className="quiz-group-results">
            {groups.map((group) => (
              <div className="quiz-group-result" key={group.id}>
                <span>{group.name}</span>
                <strong>{group.correct}/{group.total}</strong>
                <div className="quiz-group-bar" aria-hidden="true">
                  <span style={{ width: `${(group.correct / group.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {reviewWords.length > 0 && (
        <section className="quiz-analysis-section">
          <div className="quiz-analysis-heading">
            <p className="quiz-kicker">Review list</p>
            <h2>Words to revisit</h2>
          </div>
          <div className="quiz-review-list">
            {reviewWords.map((result) => (
              <article className="quiz-review-row" key={result.question_id}>
                <div>
                  <strong>{result.word}</strong>
                  <p>{result.definition}</p>
                </div>
                <span className={`review-outcome outcome-${result.outcome}`}>
                  {result.outcome.replace('_', ' ')}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}

      <button type="button" className="quiz-start-button" onClick={onReturn}>Return to dashboard</button>
    </main>
  )
}