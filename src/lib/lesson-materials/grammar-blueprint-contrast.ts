import type { GrammarContrastType } from "@/lib/lesson-materials/grammar-blueprint-types";
import { minimizeChoicePair } from "@/lib/lesson-materials/grammar-choice-minimize";

export function inferContrastType(
  title: string,
  bookTerm: string,
  targetText: string
): GrammarContrastType {
  const hay = `${title} ${bookTerm} ${targetText}`.toLowerCase();
  if (/allow/.test(hay) && /to\s+\w+/i.test(targetText)) return "ALLOW_OBJECT_TO_INF";
  if (/help/.test(hay) && /원형|bare/.test(hay)) return "HELP_OBJECT_BARE_INF";
  if (/made to|be made/.test(hay)) return "BE_MADE_TO_INF";
  if (/meant to|be meant/.test(hay)) return "BE_MEANT_TO_INF";
  if (/how to|의문사.*to/.test(hay)) return "HOW_TO_INFINITIVE";
  if (/전치사.*동명사|동명사/.test(hay) && /ing\b/i.test(targetText)) {
    return "PREPOSITION_GERUND";
  }
  if (/진행.*수동|수동|능동/.test(hay)) return "ACTIVE_PASSIVE";
  if (/관계대명사|관계부사|계속적|관계사/.test(hay)) return "RELATIVE_PRONOUN";
  if (/간접의문|명사절|that절|whether/.test(hay)) return "NOUN_CLAUSE_CONNECTOR";
  if (/수\s*일치|agreement/.test(hay)) return "SUBJECT_VERB_AGREEMENT";
  if (/가주어|진주어|형식주어|dummy/.test(hay)) return "DUMMY_IT";
  if (/병렬/.test(hay)) return "PARALLEL_FORM";
  if (/분사/.test(hay)) return "PARTICIPLE_VOICE";
  if (/to부정사|동명사|준동사/.test(hay)) return "INFINITIVE_GERUND";
  if (/가정법/.test(hay)) return "SUBJUNCTIVE";
  if (/도치/.test(hay)) return "INVERSION";
  if (/비교/.test(hay)) return "COMPARISON";
  if (/시제|완료|진행/.test(hay)) return "TENSE_ASPECT";
  return "OTHER";
}

/**
 * Produce an incorrect form by changing one grammar feature.
 * Prefers analysis wrongForm when it is a minimal contrast with correct.
 */
export function guessIncorrectFromContrast(
  correct: string,
  contrastType: GrammarContrastType,
  wrongFormHint?: string | null
): string | null {
  const c = correct.trim();
  if (!c) return null;

  if (wrongFormHint) {
    const w = wrongFormHint.trim();
    if (w && w !== c) {
      const min = minimizeChoicePair(c, w);
      if (min && min.correctText.toLowerCase() === c.toLowerCase()) {
        return min.incorrectText;
      }
      // Align single-token correct against multi-token wrong
      const cToks = c.split(/\s+/);
      const wToks = w.split(/\s+/);
      if (cToks.length === 1 && wToks[0] && wToks[0]!.toLowerCase() !== c.toLowerCase()) {
        return wToks[0]!;
      }
      if (cToks.length === wToks.length) return w;
    }
  }

  switch (contrastType) {
    case "RELATIVE_PRONOUN":
      if (/^which$/i.test(c)) return "that";
      if (/^that$/i.test(c)) return "what";
      if (/^what$/i.test(c)) return "which";
      if (/^who$/i.test(c)) return "which";
      if (/which\b/i.test(c)) return c.replace(/\bwhich\b/i, "that");
      if (/\bthat\b/i.test(c)) return c.replace(/\bthat\b/i, "what");
      break;
    case "PREPOSITION_GERUND":
      if (/^focusing$/i.test(c)) return "focused";
      if (/^moving$/i.test(c)) return "move";
      if (/^attracting$/i.test(c)) return "attracted";
      if (/ing$/i.test(c)) return c.replace(/ing$/i, "ed");
      break;
    case "ACTIVE_PASSIVE":
      if (/^are being held$/i.test(c)) return "are holding";
      if (/being held/i.test(c)) return c.replace(/being held/i, "holding");
      if (/were created/i.test(c)) return "created";
      break;
    case "HOW_TO_INFINITIVE":
      if (/how to /i.test(c)) return c.replace(/how to /i, "how ").replace(/(\w+)$/i, (m) =>
        /e$/i.test(m) ? `${m.slice(0, -1)}ing` : `${m}ing`
      );
      if (/^to\s+/i.test(c)) {
        const base = c.replace(/^to\s+/i, "");
        return /e$/i.test(base) ? `${base.slice(0, -1)}ing` : `${base}ing`;
      }
      break;
    case "ALLOW_OBJECT_TO_INF":
    case "BE_MADE_TO_INF":
    case "BE_MEANT_TO_INF":
    case "INFINITIVE_GERUND":
      if (/^to\s+/i.test(c)) {
        const base = c.replace(/^to\s+/i, "");
        return /e$/i.test(base) ? `${base.slice(0, -1)}ing` : `${base}ing`;
      }
      break;
    case "HELP_OBJECT_BARE_INF":
    case "PARALLEL_FORM":
      if (/^to\s+/i.test(c)) return c.replace(/^to\s+/i, "");
      if (!/^to\s+/i.test(c) && /^\w+$/i.test(c)) return `to ${c}`;
      break;
    case "SUBJECT_VERB_AGREEMENT":
      if (/s$/i.test(c) && !/ss$/i.test(c)) return c.replace(/s$/i, "");
      if (/contradict$/i.test(c)) return "contradicts";
      if (/contradicts$/i.test(c)) return "contradict";
      if (/states$/i.test(c)) return "state";
      break;
    case "DUMMY_IT":
      if (/^It$/i.test(c)) return "There";
      if (/^It is$/i.test(c)) return "There is";
      break;
    case "PARTICIPLE_VOICE":
      if (/ing$/i.test(c)) return c.replace(/ing$/i, "ed");
      if (/ed$/i.test(c)) return c.replace(/ed$/i, "ing");
      break;
    case "FINITE_NONFINITE":
      if (/^think$/i.test(c)) return "thinking";
      if (/^visualize$/i.test(c)) return "visualizing";
      break;
    default:
      if (/^which$/i.test(c)) return "that";
      if (/^that$/i.test(c)) return "what";
      if (/^what$/i.test(c)) return "which";
      if (/ing$/i.test(c)) return c.replace(/ing$/i, "ed");
      if (/^to\s+/i.test(c)) {
        const base = c.replace(/^to\s+/i, "");
        return /e$/i.test(base) ? `${base.slice(0, -1)}ing` : `${base}ing`;
      }
      break;
  }
  return null;
}

/** After minimize, ensure incorrect still contrasts with correct. */
export function buildIncorrectForTarget(
  targetText: string,
  contrastType: GrammarContrastType,
  wrongFormHint?: string | null
): { correctText: string; incorrectText: string } | null {
  const incorrect = guessIncorrectFromContrast(
    targetText,
    contrastType,
    wrongFormHint
  );
  if (!incorrect || incorrect === targetText) return null;
  const min = minimizeChoicePair(targetText, incorrect);
  if (!min) {
    return { correctText: targetText, incorrectText: incorrect };
  }
  // If minimize moved correct away from targetText, keep original target as correct
  // by aligning incorrect only
  if (min.correctText.toLowerCase() !== targetText.toLowerCase()) {
    // Prefer keeping full target if minimize shrunk differently
    const aligned = guessIncorrectFromContrast(
      targetText,
      contrastType,
      incorrect
    );
    if (aligned && aligned !== targetText) {
      const m2 = minimizeChoicePair(targetText, aligned);
      if (m2 && m2.correctText.toLowerCase() === targetText.toLowerCase()) {
        return {
          correctText: targetText,
          incorrectText: m2.incorrectText,
        };
      }
    }
    return { correctText: targetText, incorrectText: incorrect };
  }
  return {
    correctText: min.correctText,
    incorrectText: min.incorrectText,
  };
}
