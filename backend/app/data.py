import json
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / 'data' / 'vocab_groups.json'


def _clean_definition(values):
    text = ' '.join(v for v in values if v).strip()
    text = text.replace('  ', ' ')
    return text


def _normalize_group(raw_group):
    group_number = raw_group.get('group_number', 1)
    entries = raw_group.get('entries', [])
    words = []

    for entry in entries:
        word = (entry.get('word') or '').strip()
        if not word:
            continue

        definition = _clean_definition(entry.get('definitions', []))
        example_sentence = (entry.get('example_sentence') or '').strip()
        part_of_speech = entry.get('part_of_speech') or ['unknown']
        pos = [str(item).strip() for item in part_of_speech if str(item).strip()]
        if not pos:
            pos = ['unknown']

        candidates = []
        for value in entry.get('synonyms', []):
            clean = str(value).strip()
            if clean and clean.lower() != definition.lower() and clean not in candidates:
                candidates.append(clean)
        if not definition:
            definition = 'Definition was not extracted cleanly from the PDF.'
        while len(candidates) < 3:
            candidates.append('related concept')
        choices = [definition] + candidates[:3]
        if len(choices) < 4:
            choices = choices + ['context clue'] * (4 - len(choices))

        words.append({
            'word': word,
            'part_of_speech': pos,
            'definition': definition,
            'example_sentence': example_sentence,
            'synonyms': candidates[:6],
            'choices': choices[:4],
        })

    return {
        'id': group_number,
        'group_number': group_number,
        'name': f'Group {group_number}',
        'description': f'GRE vocabulary group {group_number} extracted from the source PDF.',
        'words': words,
    }


def load_groups():
    if not DATA_FILE.exists():
        return []

    raw_groups = json.loads(DATA_FILE.read_text(encoding='utf-8'))
    return [_normalize_group(group) for group in raw_groups]


GROUPS = load_groups()
