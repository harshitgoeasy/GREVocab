import random
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.data import GROUPS

app = FastAPI(title='GRE Vocabulary API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def _group_summary(group):
    return {
        'id': group['id'],
        'group_number': group['group_number'],
        'name': group['name'],
        'title': group['name'],
        'description': group['description'],
        'word_count': len(group['words']),
    }


def _get_group_by_id(group_id: int):
    return next((group for group in GROUPS if group['id'] == group_id), None)


def _build_question(word, group):
    distractor_pool = [
        item['definition']
        for g in GROUPS
        for item in g['words']
        if item['word'] != word['word'] and item['definition'] != word['definition']
    ]
    distractors = []
    for candidate in distractor_pool:
        if candidate not in distractors:
            distractors.append(candidate)
        if len(distractors) >= 3:
            break

    if len(distractors) < 3:
        distractors.extend(['related concept', 'context clue', 'associated idea'][: 3 - len(distractors)])

    choices = [word['definition'], *distractors]
    random.shuffle(choices)

    return {
        'group_id': group['id'],
        'group_name': group['name'],
        'word': word['word'],
        'part_of_speech': word.get('part_of_speech', ['unknown']),
        'example_sentence': word['example_sentence'],
        'definition': word['definition'],
        'choices': choices,
    }


@app.get('/api/health')
def health_check():
    return {'status': 'ok', 'message': 'GRE vocabulary API is running'}


@app.get('/groups')
@app.get('/api/groups')
def get_groups():
    return [_group_summary(group) for group in GROUPS]


@app.get('/groups/{group_id}')
@app.get('/api/groups/{group_id}')
def get_group(group_id: int):
    group = _get_group_by_id(group_id)
    if group is None:
        return {'detail': 'Group not found'}
    return {
        'id': group['id'],
        'group_number': group['group_number'],
        'name': group['name'],
        'title': group['name'],
        'description': group['description'],
        'words': group['words'],
    }


@app.get('/groups/{group_id}/words')
@app.get('/api/groups/{group_id}/words')
def get_group_words(group_id: int):
    group = _get_group_by_id(group_id)
    if group is None:
        return {'detail': 'Group not found'}
    return [
        {
            'word': word['word'],
            'part_of_speech': word.get('part_of_speech', ['unknown']),
            'definition': word['definition'],
            'example_sentence': word['example_sentence'],
            'synonyms': word.get('synonyms', []),
        }
        for word in group['words']
    ]


@app.get('/groups/{group_id}/quiz')
@app.get('/api/groups/{group_id}/quiz')
def get_group_quiz(group_id: int, mode: str = 'practice'):
    group = _get_group_by_id(group_id)
    if group is None:
        return {'detail': 'Group not found'}

    questions = [_build_question(word, group) for word in group['words']]
    random.shuffle(questions)
    return {
        'group_id': group['id'],
        'group_name': group['name'],
        'mode': mode,
        'questions': questions,
    }


@app.get('/api/questions')
def get_questions(group_id: Optional[int] = None, limit: int = 5):
    valid_groups = GROUPS if group_id is None else [g for g in GROUPS if g['id'] == group_id]

    questions = []
    for group in valid_groups:
        for word in group['words']:
            questions.append(_build_question(word, group))

    if limit is not None:
        return questions[:limit]
    return questions


@app.get('/')
def root():
    return {'message': 'Welcome to GRE Vocabulary API'}
