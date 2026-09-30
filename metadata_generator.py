import csv
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path


ADOBE_CATEGORIES = {
    1: "Animals", 2: "Buildings and Architecture", 3: "Business",
    4: "Drinks", 5: "The Environment", 6: "States of Mind",
    7: "Food", 8: "Graphic Resources", 9: "Hobbies and Leisure",
    10: "Industry", 11: "Landscapes", 12: "Lifestyle", 13: "Miscellaneous",
    14: "Nature", 15: "People", 16: "Culture and Religion",
    17: "Objects", 18: "Parks/Outdoor", 19: "Technology",
    20: "Transport", 21: "Travel", 22: "Vintage",
}

ADOBE_LANGUAGES = {
    "en": "English", "de": "German", "es": "Spanish",
    "fr": "French", "it": "Italian", "ja": "Japanese",
    "ko": "Korean", "nl": "Dutch", "pl": "Polish",
    "pt": "Portuguese", "ru": "Russian", "sv": "Swedish",
    "tr": "Turkish", "zh": "Chinese",
}


def sanitize_filename(name: str) -> str:
    return re.sub(r'[\\/*?:"<>|]', "_", name).strip()


def extract_keywords_from_text(text: str) -> list:
    stop_words = {
        "a", "an", "the", "is", "it", "and", "or", "in", "on", "of",
        "to", "for", "with", "at", "by", "this", "that", "are", "was",
        "were", "be", "been", "being", "have", "has", "had", "do", "does",
        "did", "but", "not", "so", "if", "out", "up", "no", "can", "will",
    }
    words = re.findall(r'[a-zA-Z][a-zA-Z0-9]{1,}', text.lower())
    return list(dict.fromkeys(w for w in words if w not in stop_words and len(w) > 2))


def generate_metadata(
    filename: str,
    title: str = "",
    keywords: list = None,
    category: int = None,
    language: str = "en",
    description: str = "",
    adult_type: str = "standard",
    is_editorial: bool = False,
    additional_properties: dict = None,
):
    stem = Path(filename).stem
    keywords = keywords or extract_keywords_from_text(title or stem)

    metadata = {
        "filename": filename,
        "title": title or stem.replace("_", " ").replace("-", " ").title(),
        "keywords": ",".join(keywords),
        "category": category,
        "language": language,
        "description": description or title,
        "adult_type": adult_type,
        "is_editorial": str(is_editorial).lower(),
    }

    if additional_properties:
        metadata.update(additional_properties)

    return {k: v for k, v in metadata.items() if v is not None}


def print_metadata(meta: dict, format: str = "table"):
    if format == "json":
        print(json.dumps(meta, indent=2, ensure_ascii=False))
        return

    if format == "csv_line":
        w = csv.writer(sys.stdout)
        w.writerow(meta.values())
        return

    max_key = max(len(k) for k in meta)
    print(f"\n{'='*60}")
    print(f"  Adobe Stock Metadata")
    print(f"{'='*60}")
    for k, v in meta.items():
        label = k.replace("_", " ").title()
        val = v if v else "—"
        print(f"  {label:<{max_key+2}} {val}")
    print(f"{'='*60}\n")


def batch_process(files: list, **kwargs):
    results = []
    for f in files:
        meta = generate_metadata(f, **kwargs)
        results.append(meta)
        print_metadata(meta)
    return results


def export_csv(records: list, output: str = "adobe_stock_metadata.csv"):
    if not records:
        print("No records to export.")
        return
    keys = records[0].keys()
    with open(output, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader()
        w.writerows(records)
    print(f"Exported {len(records)} record(s) to {output}")


def export_json(records: list, output: str = "adobe_stock_metadata.json"):
    with open(output, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print(f"Exported {len(records)} record(s) to {output}")


def interactive():
    print("Adobe Stock Metadata Generator (interactive)")
    print("-" * 40)
    filename = input("Filename (image/video): ").strip()
    title = input("Title (Enter to auto-generate): ").strip()
    kw_input = input("Keywords (comma-separated, Enter to extract from title): ").strip()
    keywords = [k.strip() for k in kw_input.split(",")] if kw_input else None

    print("Categories:")
    for cid, cname in ADOBE_CATEGORIES.items():
        print(f"  {cid}: {cname}")
    cat_input = input("Category ID (Enter to skip): ").strip()
    category = int(cat_input) if cat_input.isdigit() else None

    lang_input = input(f"Language code [{', '.join(f'{k} ({v})' for k, v in ADOBE_LANGUAGES.items())}]: ").strip()
    language = lang_input if lang_input in ADOBE_LANGUAGES else "en"

    description = input("Description (Enter to reuse title): ").strip()
    adult = input("Adult type [standard/restricted] (default: standard): ").strip() or "standard"
    editorial = input("Is editorial? [y/N]: ").strip().lower() == "y"

    meta = generate_metadata(
        filename, title, keywords, category, language, description, adult, editorial
    )
    print_metadata(meta)
    return [meta]


def main():
    args = sys.argv[1:]
    
    if not args or args[0] in ("-i", "--interactive"):
        records = interactive()
        export_csv(records)
        return

    if args[0] in ("-b", "--batch"):
        files = args[1:] if len(args) > 1 else []
        if not files:
            print("Usage: metadata_generator.py -b <file1> <file2> ...")
            return
        records = batch_process(files)
        export_csv(records)
        return

    if args[0] in ("-d", "--dir"):
        directory = args[1] if len(args) > 1 else "."
        pattern = args[2] if len(args) > 2 else "*"
        ext = args[3] if len(args) > 3 else "*"
        path = Path(directory)
        files = [str(f) for f in path.glob(f"{pattern}.{ext}") if f.is_file()]
        if not files:
            print(f"No files found in {directory}/{pattern}.{ext}")
            return
        print(f"Found {len(files)} file(s)")
        records = batch_process(files)
        export_csv(records)
        export_json(records)
        return

    if args[0] in ("-h", "--help"):
        print(f"Usage: python {Path(__file__).name} [OPTIONS] [files...]")
        print()
        print("Options:")
        print("  -i, --interactive    Interactive mode (default)")
        print("  -b, --batch FILE..   Batch process specific files")
        print("  -d, --dir [DIR] [pattern] [ext]  Process all files in a directory")
        print("  -h, --help           Show this help")
        print()
        print("Examples:")
        print("  metadata_generator.py")
        print("  metadata_generator.py -b image1.jpg image2.png video.mp4")
        print("  metadata_generator.py -d . IMG jpg")
        print("  metadata_generator.py -d C:/images * mp4")
        return

    records = []
    for f in args:
        meta = generate_metadata(f)
        print_metadata(meta)
        records.append(meta)
    if records:
        export_csv(records)


if __name__ == "__main__":
    main()
