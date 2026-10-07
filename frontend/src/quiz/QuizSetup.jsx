import { useState } from 'react'

const QUESTION_PRESETS = [5, 10, 15, 30]
const TIMER_PRESETS = [8, 10, 15, 20, 30]

function NumberOptions({ label, options, selected, onSelect, customValue, onCustomChange, suffix, max }) {
  return (
    <fieldset className="quiz-setting-group">
      <legend>{label}</legend>
      <div className="setting-options">
        {options.map((option) => (
          <label key={option} className={selected === option ? 'setting-option selected' : 'setting-option'}>
            <input
              type="radio"
              name={label}
              value={option}
              checked={selected === option}
              onChange={() => onSelect(option)}
              disabled={max !== undefined && option > max}
            />
            <span>{option}{suffix}</span>
          </label>
        ))}
        <label className={selected === 'custom' ? 'setting-option selected custom-option' : 'setting-option custom-option'}>
          <input
            type="radio"
            name={label}
            value="custom"
            checked={selected === 'custom'}
            onChange={() => onSelect('custom')}
          />
          <span>Custom</span>
          <input
            type="number"
            min="1"
            max={max}
            value={customValue}
            aria-label={`Custom ${label.toLowerCase()}`}
            onFocus={() => onSelect('custom')}
            onChange={(event) => onCustomChange(event.target.value)}
          />
          <span>{suffix}</span>
        </label>
      </div>
    </fieldset>
  )
}

export default function QuizSetup({ groups, questionBankGroups = [], onLoadQuestionBank, initialGroupId, loading, error, onStart, onCancel }) {
  const [questionType, setQuestionType] = useState('vocabulary')
  const [poolMode, setPoolMode] = useState('manual')
  const [selectedGroupIds, setSelectedGroupIds] = useState(() => (initialGroupId ? [initialGroupId] : []))
  const [questionPreset, setQuestionPreset] = useState(5)
  const [customQuestionCount, setCustomQuestionCount] = useState('30')
  const [timerPreset, setTimerPreset] = useState(15)
  const [customTimer, setCustomTimer] = useState('30')
  const [loadingQuestionBank, setLoadingQuestionBank] = useState(false)
  const [questionBankLoadError, setQuestionBankLoadError] = useState('')

  const availableGroups = questionType === 'vocabulary' ? groups : questionBankGroups
  const selectedGroups = poolMode === 'all'
    ? availableGroups
    : availableGroups.filter((group) => selectedGroupIds.includes(group.id))
  const availableCount = selectedGroups.reduce((total, group) => total + group.word_count, 0)
  const questionCount = questionPreset === 'custom' ? Number(customQuestionCount) : questionPreset
  const timerSeconds = timerPreset === 'custom' ? Number(customTimer) : timerPreset
  const hasValidSelection = selectedGroups.length > 0
    && Number.isInteger(questionCount)
    && questionCount > 0
    && questionCount <= availableCount
    && Number.isInteger(timerSeconds)
    && timerSeconds > 0

  const toggleGroup = (groupId) => {
    setSelectedGroupIds((current) => current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId])
  }

  const startQuiz = (event) => {
    event.preventDefault()
    if (!hasValidSelection || loading) return
    onStart({
      groupIds: selectedGroups.map((group) => group.id),
      questionCount,
      timerSeconds,
      questionType,
    })
  }

  const changeQuestionType = (nextType) => {
    setQuestionType(nextType)
    const nextGroups = nextType === 'vocabulary' ? groups : questionBankGroups
    if (!selectedGroupIds.some((id) => nextGroups.some((group) => group.id === id))) {
      setSelectedGroupIds(nextGroups[0] ? [nextGroups[0].id] : [])
    }
    if (nextType === 'gre-bank' && !nextGroups.length && onLoadQuestionBank) {
      setQuestionBankLoadError('')
      setLoadingQuestionBank(true)
      onLoadQuestionBank()
        .then((module) => {
          const loadedGroups = module.getGreQuestionGroups()
          if (!selectedGroupIds.some((id) => loadedGroups.some((group) => group.id === id))) {
            setSelectedGroupIds([loadedGroups[0].id])
          }
        })
        .catch((loadError) => setQuestionBankLoadError(loadError.message || 'Could not load the GRE question bank.'))
        .finally(() => setLoadingQuestionBank(false))
    }
  }

  return (
    <main className="quiz-setup-shell">
      <header className="quiz-setup-heading">
        <div>
          <p className="quiz-kicker">Build your round</p>
          <h1>Set the pace.</h1>
          <p>Choose a question type, question pool, and time per answer.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onCancel}>Back</button>
      </header>

      <form className="quiz-setup-form" onSubmit={startQuiz}>
        <fieldset className="quiz-setting-group">
          <legend>Question type</legend>
          <div className="pool-mode-control" role="group" aria-label="Question type">
            <button
              type="button"
              className={questionType === 'vocabulary' ? 'pool-mode active' : 'pool-mode'}
              aria-pressed={questionType === 'vocabulary'}
              onClick={() => changeQuestionType('vocabulary')}
            >
              Vocabulary practice
            </button>
            <button
              type="button"
              className={questionType === 'gre-bank' ? 'pool-mode active' : 'pool-mode'}
              aria-pressed={questionType === 'gre-bank'}
              disabled={loadingQuestionBank}
              onClick={() => changeQuestionType('gre-bank')}
            >
              {loadingQuestionBank ? 'Loading question bank…' : 'GRE question bank'}
            </button>
          </div>
        </fieldset>

        <fieldset className="quiz-setting-group">
          <legend>{questionType === 'vocabulary' ? 'Vocabulary pool' : 'GRE question groups'}</legend>
          <div className="pool-mode-control" role="group" aria-label="Vocabulary pool mode">
            <button
              type="button"
              className={poolMode === 'manual' ? 'pool-mode active' : 'pool-mode'}
              aria-pressed={poolMode === 'manual'}
              onClick={() => setPoolMode('manual')}
            >
              Choose groups
            </button>
            <button
              type="button"
              className={poolMode === 'all' ? 'pool-mode active' : 'pool-mode'}
              aria-pressed={poolMode === 'all'}
              onClick={() => setPoolMode('all')}
            >
              ALL - {availableGroups.length} groups
            </button>
          </div>

          {poolMode === 'manual' ? (
            <div className="quiz-group-picker">
              {availableGroups.map((group) => {
                const checked = selectedGroupIds.includes(group.id)
                return (
                  <label key={group.id} className={checked ? 'quiz-group-choice checked' : 'quiz-group-choice'}>
                    <input type="checkbox" checked={checked} onChange={() => toggleGroup(group.id)} />
                    <span>Group {group.group_number}</span>
                    <small>{group.word_count} {questionType === 'vocabulary' ? 'words' : 'questions'}</small>
                  </label>
                )
              })}
            </div>
          ) : (
            <p className="pool-description">All {availableGroups.length} groups are in the pool. Questions are sampled without repeats.</p>
          )}
          <p className="pool-count">
            {availableCount} {questionType === 'vocabulary' ? 'words' : 'questions'} available in this pool
          </p>
        </fieldset>

        <div className="quiz-setup-grid">
          <NumberOptions
            label="Questions"
            options={QUESTION_PRESETS}
            selected={questionPreset}
            onSelect={setQuestionPreset}
            customValue={customQuestionCount}
            onCustomChange={setCustomQuestionCount}
            max={availableCount}
          />
          <NumberOptions
            label="Seconds per question"
            options={TIMER_PRESETS}
            selected={timerPreset}
            onSelect={setTimerPreset}
            customValue={customTimer}
            onCustomChange={setCustomTimer}
            suffix="s"
          />
        </div>

        {error && <p className="quiz-setup-error" role="alert">{error}</p>}
        {questionBankLoadError && <p className="quiz-setup-error" role="alert">{questionBankLoadError}</p>}
        <div className="quiz-setup-actions">
          <button type="submit" className="quiz-start-button" disabled={!hasValidSelection || loading}>
            {loading ? 'Preparing questions…' : `Start ${questionCount || 0}-question quiz`}
          </button>
        </div>
      </form>
    </main>
  )
}