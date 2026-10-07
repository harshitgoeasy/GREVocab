import random
import re

from app.data import GROUPS


def _word_forms(word):
    forms = [(word, 'base')]
    lower_word = word.casefold()

    if lower_word.endswith('y'):
        forms.append((word + 'ing', 'gerund_ing'))
        if len(word) > 1 and lower_word[-2] not in 'aeiou':
            forms.extend([
                (word[:-1] + 'ies', 'present_ies'),
                (word[:-1] + 'ied', 'past_ied'),
            ])
        else:
            forms.extend([(word + 's', 'present_s'), (word + 'ed', 'past_ed')])
    else:
        if lower_word.endswith(('s', 'x', 'z', 'ch', 'sh', 'o')):
            forms.append((word + 'es', 'present_es'))
        else:
            forms.append((word + 's', 'present_s'))

        if lower_word.endswith('e'):
            forms.extend([
                (word + 'd', 'past_d'),
                (word[:-1] + 'ing', 'gerund_drop_e'),
            ])
        else:
            forms.append((word + 'ed', 'past_ed'))
            if re.search(r'[^aeiou][aeiou][^aeiouwxy]$', lower_word):
                forms.append((word + word[-1] + 'ed', 'past_doubled'))
            forms.append((word + 'ing', 'gerund_ing'))

    return forms


def _question_prompt(word):
    target = word['word']
    forms = sorted(_word_forms(target), key=lambda form: len(form[0]), reverse=True)
    patterns = [(re.compile(rf'\b{re.escape(form)}\b', re.IGNORECASE), form_rule)
                for form, form_rule in forms]

    matching_prompts = []
    examples = (word.get('example_sentence') or '').split(' | ')
    for example in examples:
        sentence = example.strip()
        if not sentence.endswith(('.', '?', '!')):
            continue
        for pattern, form_rule in patterns:
            match = pattern.search(sentence)
            if match:
                answer = match.group(0)
                answer = answer[:1].upper() + answer[1:]
                matching_prompts.append((pattern.sub('________', sentence, count=1), answer, form_rule))
                break

    if matching_prompts:
        prompt, answer, form_rule = random.choice(matching_prompts)
        return prompt, 'example', answer, form_rule

    definition = word['definition'].strip().rstrip('.,;:')
    return f'The word that means {definition} is ________.', 'definition', target, 'base'


def _inflect_choice(word, form_rule):
    if form_rule == 'present_s':
        return word + 's'
    if form_rule == 'present_es':
        return word + 'es'
    if form_rule == 'present_ies':
        return word[:-1] + 'ies'
    if form_rule == 'past_ed':
        return word + 'ed'
    if form_rule == 'past_d':
        return word + 'd'
    if form_rule == 'past_ied':
        return word[:-1] + 'ied'
    if form_rule == 'past_doubled':
        return word + word[-1] + 'ed'
    if form_rule == 'gerund_ing':
        return word + 'ing'
    if form_rule == 'gerund_drop_e':
        return word[:-1] + 'ing'
    if form_rule == 'gerund_y':
        return word[:-1] + 'ying'
    return word


def _word_choices(answer, part_of_speech, form_rule):
    candidates = {}
    same_pos_candidates = {}
    for group in GROUPS:
        for word in group['words']:
            candidate = word['word'].strip()
            key = candidate.casefold()
            candidate_pos = {pos.casefold() for pos in word.get('part_of_speech', [])}
            if candidate and key != answer.casefold():
                choice = _inflect_choice(candidate, form_rule)
                if choice.casefold() != answer.casefold():
                    candidates.setdefault(choice.casefold(), choice)
                    if candidate_pos.intersection(part_of_speech):
                        same_pos_candidates.setdefault(choice.casefold(), choice)

    pool = same_pos_candidates if len(same_pos_candidates) >= 4 else candidates
    distractors = random.sample(list(pool.values()), k=4)
    choices = [answer, *distractors]
    random.shuffle(choices)
    return choices


def build_quiz(group_ids, question_count):
    unique_group_ids = list(dict.fromkeys(group_ids))
    selected_groups = [group for group in GROUPS if group['id'] in unique_group_ids]
    if len(selected_groups) != len(unique_group_ids):
        raise ValueError('One or more selected vocabulary groups do not exist.')

    pool = []
    seen_words = set()
    for group in selected_groups:
        for word in group['words']:
            key = word['word'].casefold()
            if key not in seen_words:
                seen_words.add(key)
                pool.append((word, group))

    if not pool:
        raise ValueError('No vocabulary words are available in the selected groups.')
    if question_count < 1 or question_count > len(pool):
        raise ValueError(f'Choose between 1 and {len(pool)} questions for this pool.')

    selected_words = random.sample(pool, k=question_count)
    questions = []
    for word, group in selected_words:
        part_of_speech = word.get('part_of_speech', ['unknown'])
        prompt, prompt_type, correct_answer, form_rule = _question_prompt(word)
        correct_answer = correct_answer[:1].upper() + correct_answer[1:]
        questions.append({
            'id': f"{group['id']}:{word['word']}",
            'group_id': group['id'],
            'group_name': group['name'],
            'word': word['word'],
            'part_of_speech': part_of_speech,
            'prompt': prompt,
            'prompt_type': prompt_type,
            'definition': word['definition'],
            'correct_answer': correct_answer,
            'choices': _word_choices(correct_answer, {pos.casefold() for pos in part_of_speech}, form_rule),
        })

    return {
        'question_count': len(questions),
        'available_count': len(pool),
        'questions': questions,
    }