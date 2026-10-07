import unittest

from fastapi.testclient import TestClient

from app.data import GROUPS
from app.main import app
from app.quiz import _question_prompt, build_quiz


class QuizBuilderTests(unittest.TestCase):
    def test_builds_distinct_questions_with_five_word_choices(self):
        result = build_quiz([1], 5)
        questions = result['questions']

        self.assertEqual(result['question_count'], 5)
        self.assertEqual(len({question['word'].casefold() for question in questions}), 5)
        for question in questions:
            self.assertEqual(len(question['choices']), 5)
            self.assertEqual(len({choice.casefold() for choice in question['choices']}), 5)
            self.assertIn(question['correct_answer'], question['choices'])
            self.assertIn('________', question['prompt'])

    def test_all_groups_can_supply_a_hundred_word_sample(self):
        result = build_quiz([group['id'] for group in GROUPS], 100)

        self.assertEqual(result['question_count'], 100)
        self.assertEqual(len({question['word'].casefold() for question in result['questions']}), 100)

    def test_wrapped_pdf_example_is_recovered_and_blanked(self):
        word = next(
            word
            for group in GROUPS
            for word in group['words']
            if word['word'] == 'Amorphous'
        )

        prompt, prompt_type, answer, _ = _question_prompt(word)

        self.assertEqual(prompt_type, 'example')
        self.assertEqual(answer, 'Amorphous')
        self.assertEqual(
            prompt,
            'His plans for the future were still ________, changing every few weeks.',
        )

    def test_inflected_source_word_is_the_answer(self):
        word = next(
            word
            for group in GROUPS
            for word in group['words']
            if word['word'] == 'Deify'
        )

        prompt, prompt_type, answer, _ = _question_prompt(word)

        self.assertEqual(prompt_type, 'example')
        self.assertEqual(answer, 'Deified')
        self.assertIn('was ________ and worshiped', prompt)

    def test_unusable_example_gets_definition_prompt(self):
        word = next(
            word
            for group in GROUPS
            for word in group['words']
            if _question_prompt(word)[1] == 'definition'
        )

        prompt, prompt_type, _, _ = _question_prompt(word)

        self.assertEqual(prompt_type, 'definition')
        self.assertIn(word['definition'], prompt)
        self.assertIn('________', prompt)

    def test_rejects_question_count_above_available_pool(self):
        with self.assertRaises(ValueError):
            build_quiz([1], len(GROUPS[0]['words']) + 1)


class QuizRouteTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_quiz_endpoint_returns_question_contract(self):
        response = self.client.post('/api/quiz', json={
            'group_ids': [1],
            'question_count': 5,
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['question_count'], 5)
        self.assertEqual(len(response.json()['questions']), 5)

    def test_quiz_endpoint_rejects_unknown_groups(self):
        response = self.client.post('/api/quiz', json={
            'group_ids': [999],
            'question_count': 1,
        })

        self.assertEqual(response.status_code, 400)


if __name__ == '__main__':
    unittest.main()