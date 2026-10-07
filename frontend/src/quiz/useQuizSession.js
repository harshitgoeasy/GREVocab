import { useEffect, useRef, useState } from 'react'

const REVEAL_SECONDS = 5

export function useQuizSession(onOutcome) {
  const [questions, setQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(15)
  const [secondsLeft, setSecondsLeft] = useState(15)
  const [outcome, setOutcome] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [advanceIn, setAdvanceIn] = useState(null)
  const [results, setResults] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const outcomeRef = useRef(null)
  const finishRef = useRef(null)
  const advanceRef = useRef(null)
  const onOutcomeRef = useRef(onOutcome)
  const currentQuestion = questions[questionIndex]
  const currentQuestionId = currentQuestion?.id

  const finishQuestion = (nextOutcome, answer = '') => {
    if (!currentQuestion || outcomeRef.current) return

    outcomeRef.current = nextOutcome
    setOutcome(nextOutcome)
    if (nextOutcome === 'skipped' || nextOutcome === 'timed_out') {
      setAdvanceIn(REVEAL_SECONDS)
    }
    setSelectedAnswer(answer)
    const result = {
      question_id: currentQuestion.id,
      group_id: currentQuestion.group_id,
      group_name: currentQuestion.group_name,
      word: currentQuestion.word,
      correct_answer: currentQuestion.correct_answer,
      selected_answer: answer,
      outcome: nextOutcome,
    }
    setResults((current) => [...current, result])
    onOutcomeRef.current?.(result)
  }

  const advanceQuestion = () => {
    if (questionIndex + 1 >= questions.length) {
      setIsComplete(true)
      return
    }

    outcomeRef.current = null
    setQuestionIndex((current) => current + 1)
    setOutcome(null)
    setSelectedAnswer('')
    setSecondsLeft(timerSeconds)
    setAdvanceIn(null)
  }

  useEffect(() => {
    onOutcomeRef.current = onOutcome
    finishRef.current = finishQuestion
    advanceRef.current = advanceQuestion
  })

  useEffect(() => {
    if (!currentQuestionId || outcome) return undefined

    const deadline = Date.now() + timerSeconds * 1000
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) {
        window.clearInterval(interval)
        finishRef.current?.('timed_out')
      }
    }, 200)

    return () => window.clearInterval(interval)
  }, [currentQuestionId, outcome, timerSeconds])

  useEffect(() => {
    if (outcome !== 'skipped' && outcome !== 'timed_out') return undefined

    const deadline = Date.now() + REVEAL_SECONDS * 1000
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setAdvanceIn(remaining)
      if (remaining === 0) {
        window.clearInterval(interval)
        advanceRef.current?.()
      }
    }, 200)

    return () => window.clearInterval(interval)
  }, [outcome, questionIndex])

  const start = (nextQuestions, nextTimerSeconds) => {
    outcomeRef.current = null
    setQuestions(nextQuestions)
    setQuestionIndex(0)
    setTimerSeconds(nextTimerSeconds)
    setSecondsLeft(nextTimerSeconds)
    setOutcome(null)
    setSelectedAnswer('')
    setAdvanceIn(null)
    setResults([])
    setIsComplete(false)
  }

  const stop = () => {
    outcomeRef.current = null
    setQuestions([])
    setQuestionIndex(0)
    setOutcome(null)
    setSelectedAnswer('')
    setAdvanceIn(null)
    setResults([])
    setIsComplete(false)
  }

  const answer = (value) => {
    if (!currentQuestion || outcomeRef.current) return
    finishQuestion(value === currentQuestion.correct_answer ? 'correct' : 'incorrect', value)
  }

  const next = () => {
    if (!outcomeRef.current) {
      finishQuestion('skipped')
      return
    }
    if (outcomeRef.current === 'skipped' || outcomeRef.current === 'timed_out') return
    advanceQuestion()
  }

  return {
    questions,
    questionIndex,
    currentQuestion,
    timerSeconds,
    secondsLeft,
    outcome,
    selectedAnswer,
    advanceIn,
    results,
    isComplete,
    start,
    stop,
    answer,
    next,
  }
}