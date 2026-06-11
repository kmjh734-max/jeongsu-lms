import type { VocabItem } from "@/types/database";

export interface VocabPrintEnrichment {
  example_sentence?: string;
  example_meaning?: string;
  companion_words?: string;
}

export interface VocabPrintRow extends VocabItem {
  enrichment?: VocabPrintEnrichment;
}

export interface VocabPrintSection {
  setId: string;
  title: string;
  description?: string | null;
  items: VocabPrintRow[];
}
