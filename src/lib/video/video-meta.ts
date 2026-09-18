import { resolveLessonVideo } from "@/lib/video/lesson-fields";

export type VideoMeta = { thumbnail: string | null; durationSeconds: number | null };

type LessonVideoLike = {
  id: string;
  video_provider?: string | null;
  vimeo_url?: string | null;
  vimeo_video_id?: string | null;
  youtube_url?: string | null;
  youtube_video_id?: string | null;
};

/** Vimeo 미리보기 그림·길이 (하루 동안 캐시). 비공개 설정 등으로 못 받으면 빈 값 */
async function vimeoMeta(videoId: string): Promise<VideoMeta> {
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${videoId}`)}&width=960`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return { thumbnail: null, durationSeconds: null };
    const d = (await res.json()) as { thumbnail_url?: string; duration?: number };
    return {
      thumbnail: d.thumbnail_url ?? null,
      durationSeconds: typeof d.duration === "number" && d.duration > 0 ? d.duration : null,
    };
  } catch {
    return { thumbnail: null, durationSeconds: null };
  }
}

/** 강의마다 미리보기 그림·길이를 모은다 (동시에 받아 느려지지 않게) */
export async function loadLessonVideoMeta(lessons: LessonVideoLike[]): Promise<Record<string, VideoMeta>> {
  const entries = await Promise.all(
    lessons.map(async (l): Promise<[string, VideoMeta]> => {
      const v = resolveLessonVideo(l);
      if (!v) return [l.id, { thumbnail: null, durationSeconds: null }];
      if (v.provider === "youtube") {
        return [l.id, { thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`, durationSeconds: null }];
      }
      return [l.id, await vimeoMeta(v.videoId)];
    })
  );
  return Object.fromEntries(entries);
}
