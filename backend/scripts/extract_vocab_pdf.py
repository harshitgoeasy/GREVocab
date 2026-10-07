import json
import re
from pathlib import Path

from pypdf import PdfReader

PDF_PATH = Path('/Users/harshit/Desktop/DevWithHarshit/GRE/Vocab Mountain.pdf')
OUTPUT_PATH = Path('/Users/harshit/Desktop/DevWithHarshit/GRE/backend/data/vocab_groups.json')


def extract_text_from_pdf(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    text = '\n'.join(page.extract_text() or '' for page in reader.pages)
    return text.replace('\u00a0', ' ')


def parse_pdf_to_groups(pdf_text: str):
    lines = [line.strip() for line in pdf_text.splitlines() if line.strip()]
    header_indexes = [
        i for i, line in enumerate(lines) if re.match(r'^Group\s+\d+$', line, re.I)
    ]
    header_indexes.append(len(lines))

    groups = []

    for idx in range(len(header_indexes) - 1):
        start = header_indexes[idx]
        end = header_indexes[idx + 1]
        group_lines = lines[start:end]
        if idx == 0:
            group_no = idx + 1
        else:
            group_no = idx + 1

        entries = []
        current_entry = None
        in_synonyms = False
        example_open = False

        for line in group_lines[1:]:
            if re.match(r'^Group\s+\d+$', line, re.I):
                continue

            number_match = re.match(r'^(\d+)\.?\s+([A-Za-z][A-Za-z\'-]*)\s*$', line)
            if number_match:
                if current_entry:
                    entries.append(current_entry)
                current_entry = {
                    'number': int(number_match.group(1)),
                    'word': number_match.group(2),
                    'part_of_speech': [],
                    'definitions': [],
                    'synonyms': [],
                    'example_sentence': '',
                }
                in_synonyms = False
                example_open = False
                continue

            if current_entry is None:
                continue

            pos_match = re.match(r'^(verb|adjective|noun|adverb|preposition|pronoun|interjection|article)\s*:?$', line, re.I)
            if pos_match:
                current_entry['part_of_speech'].append(pos_match.group(1).lower())
                in_synonyms = False
                example_open = False
                continue

            if line.lower() == 'synonyms:':
                in_synonyms = True
                example_open = False
                continue

            if line.startswith('• ') or line.startswith('- '):
                text_value = line[2:].strip()
                if in_synonyms:
                    current_entry['synonyms'].append(text_value)
                else:
                    current_entry['definitions'].append(text_value)
                example_open = False
                continue

            if in_synonyms:
                if line.startswith('• ') or line.startswith('- '):
                    current_entry['synonyms'].append(line[2:].strip())
                else:
                    current_entry['synonyms'].append(line)
                example_open = False
                continue

            if not example_open and current_entry['definitions'] and line[:1].islower():
                current_entry['definitions'][-1] += ' ' + line
                continue

            if not line.lower().startswith('synonyms:'):
                if example_open:
                    current_entry['example_sentence'] += ' ' + line
                else:
                    separator = ' | ' if current_entry['example_sentence'] else ''
                    current_entry['example_sentence'] += separator + line
                example_open = True

        if current_entry:
            entries.append(current_entry)

        groups.append({
            'group_number': group_no,
            'name': f'Group {group_no}',
            'entries': entries,
        })

    return groups


def main():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    raw_text = extract_text_from_pdf(PDF_PATH)
    groups = parse_pdf_to_groups(raw_text)
    OUTPUT_PATH.write_text(json.dumps(groups, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'Parsed {len(groups)} groups and saved to {OUTPUT_PATH}')
    print(f'Total entries: {sum(len(group["entries"]) for group in groups)}')


if __name__ == '__main__':
    main()
