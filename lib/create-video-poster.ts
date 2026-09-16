// Extract a real video frame in the approving admin's browser.
export async function createVideoPoster(file: Blob): Promise<Blob> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Video preview timed out. Try a browser-compatible video.")), 20000);
      const fail = () => { clearTimeout(timer); reject(new Error("Unable to read this video format.")); };
      video.onerror = fail;
      video.onloadeddata = () => {
        if (!video.videoWidth || !video.videoHeight) { fail(); return; }
        clearTimeout(timer); resolve();
      };
      video.preload = "auto";
      video.src = url;
      video.load();
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(1200, video.videoWidth);
    canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Video preview is unavailable in this browser.");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Unable to create video preview.")), "image/jpeg", 0.85);
    });
  } finally {
    video.onerror = null; video.onloadeddata = null;
    video.removeAttribute("src"); video.load(); URL.revokeObjectURL(url);
  }
}
