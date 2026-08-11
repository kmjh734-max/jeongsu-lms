/** 인쇄용: 보기가 ①–⑤ 번호뿐이면 목록을 숨기고 그림만 쓴다 */
export function shouldHideTextChoicesForFigure(opts: {
  choiceImageUrls?: string[] | null;
  choices?: string[] | null;
  needsImageChoices?: boolean;
}): boolean {
  const urls = (opts.choiceImageUrls ?? []).filter((u) => String(u).trim());
  if (urls.length !== 1) return false;
  const choices = opts.choices ?? [];
  if (choices.length === 0) return true;
  const onlyCircled = choices.every((c) =>
    /^[①②③④⑤]\s*$/.test(String(c).trim())
  );
  return onlyCircled || Boolean(opts.needsImageChoices);
}
