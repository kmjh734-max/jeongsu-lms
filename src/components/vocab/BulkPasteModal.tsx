"use client";

import { useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { ModalShell, Segmented } from "@/components/vocab/VocabUi";
import { fetchPassageVocabulary } from "@/lib/vocab/extract-passage-client";
import {
  parseBulkPaste,
  type ParsedVocabRow,
} from "@/lib/vocab/parse-bulk-paste";

type ImportMode = "paste" | "passage";

interface BulkPasteModalProps {
  open: boolean;
  onClose: () => void;
  onApplyRows: (rows: ParsedVocabRow[]) => { added: number; duplicates: string[] };
}

export function BulkPasteModal({ open, onClose, onApplyRows }: BulkPasteModalProps) {
  const [mode, setMode] = useState<ImportMode>("paste");
  const [pasteText, setPasteText] = useState("");
  const [passageText, setPassageText] = useState("");
  const [hint, setHint] = useState<{ text: string; bad: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  function finishApply(result: { added: number; duplicates: string[] }) {
    if (result.added === 0) {
      setHint({
        text:
          result.duplicates.length > 0
            ? `이미 있는 단어라 넣지 않았어요: ${result.duplicates.join(", ")}`
            : "넣을 단어가 없어요.",
        bad: true,
      });
      return;
    }
    setHint({
      text:
        result.duplicates.length > 0
          ? `${result.added}개를 넣었어요. 겹치는 단어는 뺐어요: ${result.duplicates.join(", ")}`
          : `${result.added}개를 표에 넣었어요. 확인하고 저장해 주세요.`,
      bad: false,
    });
    if (mode === "paste") setPasteText("");
    else setPassageText("");
    window.setTimeout(() => {
      setHint(null);
      onClose();
    }, 1200);
  }

  function handlePasteApply() {
    const parsed = parseBulkPaste(pasteText);
    if (parsed.length === 0) {
      setHint({
        text: "단어를 찾지 못했어요. 영어 단어 뒤에 한글 뜻이 오는지, 칸이 탭으로 나뉘었는지 봐 주세요.",
        bad: true,
      });
      return;
    }
    finishApply(onApplyRows(parsed));
  }

  async function handlePassageApply() {
    const trimmed = passageText.trim();
    if (trimmed.length < 30) {
      setHint({ text: "지문이 너무 짧아요. 영어 지문을 조금 더 넣어 주세요.", bad: true });
      return;
    }
    setLoading(true);
    setHint(null);
    const result = await fetchPassageVocabulary(trimmed);
    setLoading(false);
    if (!result.ok) {
      setHint({
        text: /AI|OpenAI/i.test(result.message)
          ? "단어를 뽑지 못했어요. 다시 해 주세요."
          : result.message,
        bad: true,
      });
      return;
    }
    finishApply(
      onApplyRows(
        result.items.map((item) => ({
          word: item.word,
          meaning: item.meaning,
          example_sentence: "",
          example_meaning: "",
        }))
      )
    );
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      busy={loading}
      widthClass="max-w-2xl"
      title="단어 가져오기"
      subtitle="표를 붙여넣거나, 영어 지문에서 단어를 뽑아 표에 넣어요."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            닫기
          </Button>
          <Button
            onClick={mode === "paste" ? handlePasteApply : () => void handlePassageApply()}
            disabled={loading}
          >
            <Icon name={mode === "paste" ? "plus" : "sparkle"} size={16} strokeWidth={2} />
            {loading ? "뽑는 중…" : mode === "paste" ? "표에 넣기" : "단어 뽑아 넣기"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3.5 px-5 py-5 sm:px-[22px]">
        <Segmented
          value={mode}
          onChange={(m) => {
            setMode(m);
            setHint(null);
          }}
          options={[
            { value: "paste", label: "표 붙여넣기" },
            { value: "passage", label: "지문에서 뽑기" },
          ]}
        />
        {mode === "paste" ? (
          <>
            <p className="text-[13px] leading-relaxed text-slate-500">
              엑셀·구글 시트에서 복사해 붙여넣으세요. 칸은 탭으로 나누고, 한 줄로
              붙여넣을 때는 영어 단어와 한글 뜻 사이만 나눠요. 뜻 안의 쉼표(예: 여러
              가지의, 다른)는 그대로 둬요.
            </p>
            <textarea
              className="ui-input min-h-[220px] font-mono text-[13px]"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`provide\t제공하다\ndifferent\t여러 가지의, 다른`}
            />
          </>
        ) : (
          <>
            <p className="text-[13px] leading-relaxed text-slate-500">
              영어 지문을 붙여넣으면 중요한 단어·숙어를 뽑아 줘요. 동사는 원형으로
              바꾸고, 한글 뜻과 함께 표에 넣어요.
            </p>
            <textarea
              className="ui-input min-h-[240px] text-[13px] leading-relaxed"
              value={passageText}
              onChange={(e) => setPassageText(e.target.value)}
              disabled={loading}
              placeholder="예: Last summer, our class visited a science museum. We looked forward to seeing the new exhibition about space exploration..."
            />
          </>
        )}
        {hint ? (
          <p
            className={`rounded-md px-3 py-2 text-[13px] ${
              hint.bad ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"
            }`}
            role="status"
          >
            {hint.text}
          </p>
        ) : null}
      </div>
    </ModalShell>
  );
}
