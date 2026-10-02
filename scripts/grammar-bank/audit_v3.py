import json
import re
import sys

# Ensure UTF-8 output for Windows console
sys.stdout.reconfigure(encoding="utf-8")

BANK_PATH = "tmp-grammar-bank/bank-all.json"
CLEANED_PATH = "tmp-grammar-bank/bank-cleaned.json"
INVALID_PATH = "tmp-grammar-bank/bank-invalid.json"

# Regex for weird symbols: Private Use Area characters and other junk
# Adding some known OCR junk patterns if needed
JUNK_PATTERN = re.compile(r"[\ue000-\uf8ff\ufffd]|광충")

def clean_text(text):
    if not isinstance(text, str):
        return text
    return JUNK_PATTERN.sub("", text).strip()

def clean_item(item):
    if isinstance(item, str):
        return clean_text(item)
    elif isinstance(item, list):
        return [clean_item(x) for x in item]
    elif isinstance(item, dict):
        return {k: clean_item(v) for k, v in item.items()}
    return item

def validate_question(q):
    """
    Checks if the answer matches the choices.
    Returns (is_valid, reason)
    """
    answer = str(q.get("answer", "")).strip()
    choices = q.get("choices", [])
    q_kind = str(q.get("question_kind", ""))
    
    # Check if answer is empty
    if not answer:
        return False, "Answer is empty"

    # Map circled numbers to integers
    circle_to_num = {"①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5}
    
    if choices:
        # If choices exist, the answer should typically point to one of them
        # Sometimes answer is like "①", "1", "1, 2"
        # We'll do a simple check: if answer is a single circled number, check if that choice exists
        if answer in circle_to_num:
            ans_num = circle_to_num[answer]
            if not any(c.get("no") == ans_num for c in choices):
                return False, f"Answer {answer} points to non-existent choice."
        else:
            try:
                ans_num = int(answer)
                if not any(c.get("no") == ans_num for c in choices):
                    return False, f"Answer {answer} points to non-existent choice."
            except ValueError:
                pass
            
        # If it's something like "①, ③" or multiple choices, we could parse it,
        # but for now, we just catch the most obvious missing choices.
    else:
        # If no choices, it's a subjective question.
        # But if the answer is a circled number, that's an error because there are no choices.
        if answer in circle_to_num:
            return False, f"Answer {answer} implies multiple choice, but no choices provided."
        try:
            if int(answer) <= 5 and q_kind == "객관식":
                return False, f"Answer {answer} implies multiple choice, but no choices provided."
        except ValueError:
            pass
            
    return True, ""

def main():
    print(f"Loading {BANK_PATH}...")
    try:
        with open(BANK_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to load: {e}")
        return

    print(f"Total questions loaded: {len(data)}")
    
    cleaned_questions = []
    invalid_questions = []
    
    symbol_cleaned_count = 0
    
    for q in data:
        # 1. Clean weird symbols
        q_str_before = json.dumps(q, ensure_ascii=False)
        cleaned_q = clean_item(q)
        q_str_after = json.dumps(cleaned_q, ensure_ascii=False)
        
        if q_str_before != q_str_after:
            symbol_cleaned_count += 1
            
        # 2. Validate answer vs choices
        is_valid, reason = validate_question(cleaned_q)
        
        if is_valid:
            cleaned_questions.append(cleaned_q)
        else:
            cleaned_q["_invalid_reason"] = reason
            invalid_questions.append(cleaned_q)
            
    print("-" * 30)
    print("Audit Results:")
    print(f" - Questions cleaned of weird symbols: {symbol_cleaned_count}")
    print(f" - Valid questions: {len(cleaned_questions)}")
    print(f" - Invalid questions (answer mismatch): {len(invalid_questions)}")
    
    print(f"Saving valid questions to {CLEANED_PATH}...")
    with open(CLEANED_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned_questions, f, ensure_ascii=False, indent=2)
        
    print(f"Saving invalid questions to {INVALID_PATH}...")
    with open(INVALID_PATH, "w", encoding="utf-8") as f:
        json.dump(invalid_questions, f, ensure_ascii=False, indent=2)
        
    print("Done!")

if __name__ == "__main__":
    main()
