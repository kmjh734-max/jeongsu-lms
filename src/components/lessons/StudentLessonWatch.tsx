"use client";

import { LazyLessonPlayerGate } from "@/components/lessons/LazyLessonPlayerGate";
import { YouTubeLessonWatch } from "@/components/lessons/YouTubeLessonWatch";
import { VimeoLessonPlayer } from "@/components/lessons/VimeoLessonPlayer";
import { resolveLessonVideo } from "@/lib/video/lesson-fields";

interface StudentLessonWatchProps {
  lessonId: string;
  title: string;
  videoProvider?: string | null;
  vimeoUrl?: string | null;
  vimeoVideoId?: string | null;
  youtubeUrl?: string | null;
  youtubeVideoId?: string | null;
  initialIsCompleted: boolean;
  initialProgressPercent: number;
  initialWatchedSeconds?: number;
  materialUrl?: string | null;
}

export function StudentLessonWatch({
  lessonId,
  title,
  videoProvider,
  vimeoUrl,
  vimeoVideoId,
  youtubeUrl,
  youtubeVideoId,
  initialIsCompleted,
  initialProgressPercent,
  initialWatchedSeconds = 0,
  materialUrl,
}: StudentLessonWatchProps) {
  const resolved = resolveLessonVideo({
    video_provider: videoProvider,
    vimeo_url: vimeoUrl,
    vimeo_video_id: vimeoVideoId,
    youtube_url: youtubeUrl,
    youtube_video_id: youtubeVideoId,
  });

  if (!resolved) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
        등록된 동영상이 없습니다.
      </div>
    );
  }

  if (resolved.provider === "youtube") {
    return (
      <LazyLessonPlayerGate title={title}>
        <div className="space-y-4">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            이 영상은 <strong>YouTube</strong>로 등록되어 있습니다. 수강 진도·이어보기·
            건너뛰기 제한은 <strong>Vimeo 링크</strong> 영상에서만 적용됩니다. 관리자·강사
            화면에서 Vimeo 공유 링크로 바꿔 주세요.
          </p>
          <YouTubeLessonWatch
            videoId={resolved.videoId}
            title={title}
            materialUrl={materialUrl}
          />
        </div>
      </LazyLessonPlayerGate>
    );
  }

  return (
    <LazyLessonPlayerGate title={title}>
      <div className="space-y-6">
        <VimeoLessonPlayer
          lessonId={lessonId}
          videoId={resolved.videoId}
          title={title}
          initialIsCompleted={initialIsCompleted}
          initialProgressPercent={initialProgressPercent}
          initialWatchedSeconds={initialWatchedSeconds}
        />

          {materialUrl && (
          <a
            href={materialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            PDF 학습자료 다운로드
          </a>
        )}
      </div>
    </LazyLessonPlayerGate>
  );
}
