"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { formatDuration } from "@/lib/video/format-duration";
import type { CourseCard } from "@/lib/courses/course-cards";

/** 동영상강좌 목록 (관리자·선생님 공통) */
export function CourseCardGrid({
  cards,
  hrefBase,
  newHref,
  showTeacher,
}: {
  cards: CourseCard[];
  hrefBase: string;
  newHref: string;
  showTeacher?: boolean;
}) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="font-semibold text-slate-800">아직 강좌가 없어요</p>
        <p className="mt-1 text-sm text-slate-500">
          강좌를 만들고 Vimeo·YouTube 링크를 붙여 넣으면 학생이 휴대폰으로 보고, 본 만큼 기록돼요.
        </p>
        <ButtonLink href={newHref} variant="primary" size="sm" className="mt-4">
          + 새 강좌
        </ButtonLink>
      </div>
    );
  }

  return <FilteredGrid cards={cards} hrefBase={hrefBase} showTeacher={showTeacher} />;
}

const ETC = "기타";

/** 카테고리 버튼(전체·문법·독해 …)으로 걸러 보기. 카테고리가 하나뿐이면 버튼은 숨긴다 */
function FilteredGrid({ cards, hrefBase, showTeacher }: { cards: CourseCard[]; hrefBase: string; showTeacher?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const catOf = (c: CourseCard) => c.course.category?.trim() || ETC;
  const counts = new Map<string, number>();
  for (const c of cards) counts.set(catOf(c), (counts.get(catOf(c)) ?? 0) + 1);
  const cats = [...counts.keys()].sort((a, b) => (a === ETC ? 1 : b === ETC ? -1 : a.localeCompare(b, "ko")));
  const shown = active ? cards.filter((c) => catOf(c) === active) : cards;

  return (
    <div className="space-y-4">
      {cats.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {[null, ...cats].map((c) => (
            <button
              key={c ?? "all"}
              type="button"
              onClick={() => setActive(c)}
              className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                active === c ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {c ?? "전체"} <span className="ml-0.5 text-xs opacity-70">{c ? counts.get(c) : cards.length}</span>
            </button>
          ))}
        </div>
      ) : null}
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {shown.map(({ course, teacherName, lessonCount, studentCount, thumbnail, totalSeconds }) => (
        <li key={course.id}>
          <Link
            href={`${hrefBase}/${course.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:border-brand-200 hover:shadow-card-hover"
          >
            <span className="relative block aspect-video overflow-hidden bg-gradient-to-br from-side-active to-side">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnail} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-white/70">
                  <Icon name="video" size={28} />
                </span>
              )}
              <span
                className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  course.is_published ? "bg-green-600 text-white" : "bg-white/90 text-slate-600"
                }`}
              >
                {course.is_published ? "공개" : "비공개"}
              </span>
              {totalSeconds > 0 ? (
                <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                  총 {formatDuration(totalSeconds)}
                </span>
              ) : null}
            </span>
            <span className="flex flex-1 flex-col p-4">
              {course.category ? (
                <span className="mb-1 w-fit rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold text-brand-700">
                  {course.category}
                </span>
              ) : null}
              <span className="font-bold text-slate-900 group-hover:text-brand-800">{course.title}</span>
              <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  영상 <b className="text-slate-800">{lessonCount}</b>
                </span>
                <span>
                  수강생 <b className="text-slate-800">{studentCount}</b>
                </span>
                {showTeacher ? <span>담당 {teacherName ?? "미배정"}</span> : null}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
    </div>
  );
}
