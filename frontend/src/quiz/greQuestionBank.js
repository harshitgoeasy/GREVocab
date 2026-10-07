import questionBankHtml from '../../../greQuestion.html?raw'

let cachedGroups

export function getGreQuestionGroups() {
  if (cachedGroups) return cachedGroups

  const document = new DOMParser().parseFromString(questionBankHtml, 'text/html')
  const groups = []
  let currentGroup

  for (const element of document.body.children) {
    if (element.matches('h2')) {
      const match = element.textContent.match(/Group\s+(\d+)/i)
      if (!match) continue

      currentGroup = {
        id: Number(match[1]),
        group_number: Number(match[1]),
        name: `Group ${match[1]}`,
        word_count: 0,
        questions: [],
      }
      groups.push(currentGroup)
      continue
    }

    if (!currentGroup) continue

    if (element.matches('.question-block')) {
      const questionText = element.querySelector('.question-text')?.textContent.trim()
      const options = Array.from(element.querySelectorAll('.options li'), (option) => {
        const text = option.textContent.trim()
        const match = text.match(/^([A-E])\)\s*(.+)$/)
        return match ? { letter: match[1], text: match[2].trim() } : null
      }).filter(Boolean)

      if (questionText && options.length) {
        currentGroup.questions.push({ questionText, options })
      }
      continue
    }

    if (element.matches('.key-section')) {
      const answers = Array.from(element.querySelectorAll('ol > li'), (item) => {
        const answerText = item.querySelector('strong')?.textContent.trim() || ''
        const answerMatch = answerText.match(/^([A-E])\)\s*(.+)$/)
        const explanation = item.textContent
          .replace(answerText, '')
          .replace(/^[\s—-]+/, '')
          .replace(/\[span_\d+\]\([^)]*\)/g, '')
          .trim()

        return answerMatch
          ? { letter: answerMatch[1], answer: answerMatch[2].trim(), explanation }
          : null
      }).filter(Boolean)

      currentGroup.questions = currentGroup.questions.flatMap((question, index) => {
        const answer = answers[index]
        const correctOption = question.options.find((option) => option.letter === answer?.letter)
        if (!answer || !correctOption) return []

        return [{
          id: `gre-${currentGroup.id}-${index + 1}`,
          group_id: currentGroup.id,
          group_name: currentGroup.name,
          word: correctOption.text,
          prompt: question.questionText.replace(/^\d+\.\s*/, ''),
          prompt_type: 'GRE practice',
          definition: answer.explanation || answer.answer,
          correct_answer: correctOption.text,
          choices: question.options.map((option) => option.text),
        }]
      })
      currentGroup.word_count = currentGroup.questions.length
    }
  }

  if (!groups.length || groups.some((group) => group.questions.length === 0)) {
    throw new Error('The GRE question bank could not be read or is missing answer keys.')
  }

  cachedGroups = groups
  return cachedGroups
}

export function buildGreQuestionSet(groupIds, questionCount) {
  const selectedGroups = getGreQuestionGroups().filter((group) => groupIds.includes(group.id))
  const questionPool = selectedGroups.flatMap((group) => group.questions)

  if (!questionPool.length) {
    throw new Error('Choose at least one group from the GRE question bank.')
  }
  if (questionCount > questionPool.length) {
    throw new Error(`Choose between 1 and ${questionPool.length} questions for this pool.`)
  }

  const shuffled = [...questionPool]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled.slice(0, questionCount)
}
