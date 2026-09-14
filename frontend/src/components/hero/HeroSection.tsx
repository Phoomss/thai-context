"use client";
import dynamic from "next/dynamic";
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  type RefObject,
} from "react";
import gsap from "gsap";
import HeroSearch from "./HeroSearch";
import HeroFlashOverlay from "./HeroFlashOverlay";
import { initialCinema, type HeroState } from "./types";
const Hero3DScene = dynamic(() => import("./Hero3DScene"), { ssr: false });
class HeroSceneBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export type HeroHandle = {
  play: (onWhite: () => void, onComplete: () => void) => void;
  reset: () => void;
};
export default function HeroSection({
  heroRef,
  onSearch,
}: {
  heroRef: RefObject<HeroHandle | null>;
  onSearch: (query: string) => void;
}) {
  const [state, setState] = useState<HeroState>("idle");
  const [reduced, setReduced] = useState(false);
  const [motionPreferenceReady, setMotionPreferenceReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [failed, setFailed] = useState(false);
  const [canRenderScene, setCanRenderScene] = useState(false);
  const cinema = useRef(initialCinema());
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const accepted = useRef(false);
  const ui = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const bloom = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const backgroundVideo = useRef<HTMLVideoElement>(null);
  const videoWasInView = useRef(true);

  useEffect(() => {
    // R3F initializes asynchronously; a React boundary cannot catch every
    // renderer initialization rejection. Probe support before mounting Canvas.
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (context) {
      context.getExtension("WEBGL_lose_context")?.loseContext();
      setCanRenderScene(true);
    } else setFailed(true);
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(media.matches);
      setMotionPreferenceReady(true);
    };
    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      timeline.current?.kill();
    };
  }, []);
  useEffect(() => {
    if (!root.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const video = backgroundVideo.current;
    if (!video || reduced) return;
    if (!inView) video.pause();
    else if (!videoWasInView.current) {
      try {
        const playback = video.play();
        if (playback) void playback.catch(() => undefined);
      } catch {
        // Autoplay can be rejected by browser policy; the poster remains visible.
      }
    }
    videoWasInView.current = inView;
  }, [inView, motionPreferenceReady, reduced]);
  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);
  function play(onWhite: () => void, onComplete: () => void) {
    if (accepted.current) return;
    accepted.current = true;
    setState("opening");
    gsap.set(overlay.current, { pointerEvents: "auto" });
    const finish = () => {
      gsap.set(overlay.current, { pointerEvents: "none" });
      setState("completed");
      onComplete();
    };
    const t = gsap.timeline({ onComplete: finish });
    timeline.current = t;
    if (reduced || !ready || failed) {
      t.to(ui.current, { opacity: 0, duration: 0.14 }, 0).to(
        overlay.current,
        { opacity: 1, duration: 0.14, ease: "power1.inOut" },
        0,
      );
      t.call(onWhite).to(overlay.current, {
        opacity: 0,
        duration: 0.14,
        ease: "sine.out",
      });
      return;
    }
    t.to(cinema.current, { ambient: 0, duration: 0.25, ease: "sine.out" }, 0)
      .to(
        ui.current,
        { opacity: 0, duration: 0.42, ease: "power2.inOut" },
        0.15,
      )
      .to(
        cinema.current,
        { cover: 2.65, duration: 0.72, ease: "power2.inOut" },
        0.32,
      )
      .call(() => setState("zooming"), [], 0.6)
      .to(cinema.current, { dolly: 1, duration: 0.94, ease: "power2.in" }, 0.6)
      .to(
        cinema.current,
        { scale: 1.1, duration: 0.8, ease: "sine.inOut" },
        0.6,
      )
      .to(
        cinema.current,
        { light: 2.5, bloom: 3, duration: 0.65, ease: "sine.in" },
        0.85,
      )
      .call(() => setState("flash"), [], 1)
      .to(
        bloom.current,
        { opacity: 1, scale: 3, duration: 0.55, ease: "power2.in" },
        1,
      )
      .to(
        overlay.current,
        { opacity: 1, duration: 0.55, ease: "sine.inOut" },
        1.05,
      )
      .call(onWhite, [], 1.6)
      .to(
        overlay.current,
        { opacity: 0, duration: 0.32, ease: "sine.out" },
        1.6,
      );
    t.timeScale(1.12);
  }
  useImperativeHandle(heroRef, () => ({
    play,
    reset: () => {
      timeline.current?.kill();
      accepted.current = false;
      Object.assign(cinema.current, initialCinema());
      gsap.set(ui.current, { opacity: 1, y: 0 });
      gsap.set(overlay.current, { opacity: 0, pointerEvents: "none" });
      gsap.set(bloom.current, { opacity: 0, scale: 1 });
      setState("idle");
    },
  }));
  return (
    <section
      id="hero"
      ref={root}
      className="hero"
      data-state={state}
      data-scene={failed ? "fallback" : ready ? "ready" : "loading"}
      aria-label="ค้นหาคำจากความหมาย"
    >
      <div className="hero-background" aria-hidden="true">
        {motionPreferenceReady && !reduced && (
          <video
            ref={backgroundVideo}
            className="hero-background-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/assets/thai-context-hero-poster.webp"
            tabIndex={-1}
          >
            <source
              src="/assets/thai-context-hero-bg.webm"
              type="video/webm"
            />
            <source
              src="/assets/thai-context-hero-bg.mp4"
              type="video/mp4"
            />
          </video>
        )}
      </div>
      <div
        className="book-shadow"
        aria-hidden="true"
        style={{ opacity: state === "idle" ? 1 : 0 }}
      />
      {!ready && (
        <img
          className="book-poster"
          src="/assets/book-reference.png"
          alt=""
          aria-hidden="true"
        />
      )}
      <div className="scene-layer">
        {canRenderScene && !failed && (
          <HeroSceneBoundary onFail={onFail}>
            <Hero3DScene
              active={inView}
              cinema={cinema.current}
              state={state}
              reducedMotion={reduced}
              onReady={onReady}
              onFail={onFail}
            />
          </HeroSceneBoundary>
        )}
      </div>
      <div ref={ui} className="hero-ui" inert={state !== "idle"}>
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> พจนานุกรมไทยร่วมสมัย
          </p>
          <h1>
            ไม่ต้องรู้คำ
            <br />
            ก็รู้ว่าควรใช้<span className="accent">คำไหน</span>
          </h1>
          <p className="support">
            ค้นจากสิ่งที่คุณต้องการสื่อ สู่คำที่ใช่
            <br className="desktop-break" /> พร้อมความหมาย บริบท ตัวอย่าง และแหล่งที่มา
          </p>
          <p className="search-prompt">วันนี้คุณอยากสื่ออะไร?</p>
          <HeroSearch busy={state !== "idle"} onSearch={onSearch} />
        </div>
        <div className="hero-foot">
          <span>ไม่ต้องรู้คำ ก็รู้ว่าควรใช้คำไหน</span>
          <span className="edition">WORDS · PEOPLE · CONTEXTS</span>
          <span className="chapter">
            บทที่ ๐๑ <i /> จุดเริ่มต้นของความหมาย
          </span>
        </div>
      </div>
      <div ref={bloom} className="book-bloom" aria-hidden="true" />
      <HeroFlashOverlay overlayRef={overlay} />
    </section>
  );
}
