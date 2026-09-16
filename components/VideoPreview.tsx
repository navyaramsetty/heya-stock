"use client";
import { useEffect, useRef, useState } from "react";
export default function VideoPreview({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <video ref={ref} src={visible ? src : undefined} muted playsInline preload={visible ? "metadata" : "none"} aria-label="Video preview" className={className} />;
}
