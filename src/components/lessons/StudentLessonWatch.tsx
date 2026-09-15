"use client";

import { LazyLessonPlayerGate } from "@/components/lessons/LazyLessonPlayerGate";
import { YouTubeLessonWatch } from "@/components/lessons/YouTubeLessonWatch";
import { VimeoLessonPlayer } from "@/components/lessons/VimeoLessonPlayer";
import { resolveLessonVideo } from "@/lib/video/lesson-fields";
import { Icon } from "@/components/layout/NavIcon";

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
      <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-slate-500">
        등록된 동영상이 없어요.
      </div>
    );
  }

  if (resolved.provider === "youtube") {
    return (
      <LazyLessonPlayerGate title={title}>
        <div className="space-y-4">
          <p className="rounded-md bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-700">
            이 영상은 시청 기록이 저장되지 않아요. 끝까지 봐도 완료로 표시되지 않으니
            선생님께 알려 주세요.
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
      <div className="space-y-4">
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
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Icon name="download" size={16} />
            PDF 학습자료 받기
          </a>
        )}
      </div>
    </LazyLessonPlayerGate>
  );
}
