import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

BANK_PATH = "tmp-grammar-bank/bank-all.json"
CLEANED_PATH = "tmp-grammar-bank/bank-cleaned-thorough.json"
INVALID_PATH = "tmp-grammar-bank/bank-invalid-thorough.json"

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

def fix_and_validate_question(q):
    answer = str(q.get("answer", "")).strip()
    choices = q.get("choices", [])
    body = q.get("body", [])
    prompt = str(q.get("prompt", ""))
    q_kind = str(q.get("question_kind", ""))
    
    if not answer:
        return False, "Answer is empty"

    circle_to_num = {"①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5}
    abc_to_num = {"ⓐ": 1, "ⓑ": 2, "ⓒ": 3, "ⓓ": 4, "ⓔ": 5}

    # Auto-fix: if no choices but answer is multiple choice
    if not choices:
        is_mc = answer in circle_to_num
        if not is_mc:
            try:
                if int(answer) <= 5 and q_kind == "객관식":
                    is_mc = True
            except ValueError:
                pass
                
        if is_mc:
            body_text = " ".join(body)
            
            # Case 1: body has ①, ②, ③ embedded
            if "①" in body_text:
                q["choices"] = [
                    {"no": 1, "text": "①"},
                    {"no": 2, "text": "②"},
                    {"no": 3, "text": "③"},
                    {"no": 4, "text": "④"},
                    {"no": 5, "text": "⑤"}
                ]
                # Filter to only the ones actually present
                q["choices"] = [c for c in q["choices"] if c["text"] in body_text]
                choices = q["choices"]
                
            # Case 2: prompt asks about ⓐ, ⓑ, ⓒ
            elif "ⓐ" in prompt or "ⓐ" in body_text:
                q["choices"] = [
                    {"no": 1, "text": "ⓐ"},
                    {"no": 2, "text": "ⓑ"},
                    {"no": 3, "text": "ⓒ"},
                    {"no": 4, "text": "ⓓ"},
                    {"no": 5, "text": "ⓔ"}
                ]
                q["choices"] = [c for c in q["choices"] if c["text"] in prompt or c["text"] in body_text]
                choices = q["choices"]

    # Now validate
    if choices:
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
    else:
        if answer in circle_to_num:
            return False, f"Answer {answer} implies multiple choice, but no choices provided or embedded."
        try:
            if int(answer) <= 5 and q_kind == "객관식":
                return False, f"Answer {answer} implies multiple choice, but no choices provided or embedded."
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

    cleaned_questions = []
    invalid_questions = []
    
    for q in data:
        cleaned_q = clean_item(q)
        is_valid, reason = fix_and_validate_question(cleaned_q)
        
        if is_valid:
            cleaned_questions.append(cleaned_q)
        else:
            cleaned_q["_invalid_reason"] = reason
            invalid_questions.append(cleaned_q)
            
    print("-" * 30)
    print("Thorough Audit & Fix Results:")
    print(f" - Valid & Auto-fixed questions: {len(cleaned_questions)}")
    print(f" - True invalid questions remaining: {len(invalid_questions)}")
    
    with open(CLEANED_PATH, "w", encoding="utf-8") as f:
        json.dump(cleaned_questions, f, ensure_ascii=False, indent=2)
        
    with open(INVALID_PATH, "w", encoding="utf-8") as f:
        json.dump(invalid_questions, f, ensure_ascii=False, indent=2)
        
    print("Done!")

if __name__ == "__main__":
    main()
