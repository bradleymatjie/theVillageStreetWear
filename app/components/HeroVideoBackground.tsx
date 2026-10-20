"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const videoId = "IDQw22fZf0s";
// This clip is portrait. Cover the hero using the video's actual proportions
// so YouTube does not add landscape-player pillarboxing around it.
const videoAspectRatio = 9 / 16;

type Player = {
  mute: () => void;
  playVideo: () => void;
  destroy: () => void;
};

type YouTubeApi = {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady: (event: { target: Player }) => void;
      onStateChange: (event: { data: number }) => void;
      onError: () => void;
      onAutoplayBlocked: () => void;
    };
  }) => Player;
};

export default function HeroVideoBackground() {
  const container = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [apiReady, setApiReady] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!scriptLoaded) return;
    // The entry script loads the player API asynchronously.
    const check = () => {
      if ((window as Window & { YT?: YouTubeApi }).YT?.Player) {
        setApiReady(true);
        window.clearInterval(interval);
      }
    };
    const interval = window.setInterval(check, 100);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 15000);
    check();
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [scriptLoaded]);

  useEffect(() => {
    if (!apiReady || reducedMotion !== false || !container.current) return;

    const youtube = (window as Window & { YT?: YouTubeApi }).YT;
    if (!youtube?.Player) return;

    const host = container.current;
    const target = document.createElement("div");
    host.appendChild(target);
    const player = new youtube.Player(target, {
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        loop: 1,
        playlist: videoId,
        fs: 0,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: ({ target: readyPlayer }) => {
          const iframe = host.querySelector("iframe");
          if (iframe) {
            iframe.title = "The Village background video";
            iframe.tabIndex = -1;
          }
          readyPlayer.mute();
          readyPlayer.playVideo();
        },
        onStateChange: ({ data }) => setPlaying(data === 1),
        onError: () => setPlaying(false),
        onAutoplayBlocked: () => setPlaying(false),
      },
    });

    return () => {
      player.destroy();
      host.replaceChildren();
    };
  }, [apiReady, reducedMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[url('/joziHome.jpg')] bg-cover bg-[center_28%] lg:bg-center" style={{ containerType: "size" }}>
      {reducedMotion === false && (
        <Script
          src="https://www.youtube.com/iframe_api"
          strategy="afterInteractive"
          onReady={() => setScriptLoaded(true)}
        />
      )}
      <div
        ref={container}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0 ${playing && reducedMotion === false ? "opacity-100" : "opacity-0"}`}
        style={{
          width: `max(100cqw, ${100 * videoAspectRatio}cqh)`,
          height: `max(100cqh, ${100 / videoAspectRatio}cqw)`,
        }}
      />
    </div>
  );
}
