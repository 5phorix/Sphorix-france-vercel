import { existsSync } from "node:fs";
import path from "node:path";

import DemoAnimation from "./DemoAnimation";

const VIDEO_PUBLIC_PATH = "/videos/demo-methode.mp4";

// Dépose la vidéo dans public/videos/demo-methode.mp4 : elle remplace automatiquement l'animation.
export default function DemoVideo({ className = "" }: { className?: string }) {
  const hasVideo = existsSync(path.join(process.cwd(), "public", VIDEO_PUBLIC_PATH));

  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-2xl border border-[#cbd6cc] bg-[#172b27] shadow-2xl ${className}`}>
      {hasVideo ? (
        <video
          src={VIDEO_PUBLIC_PATH}
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
          aria-label="Démonstration de la méthode Sphorix"
        />
      ) : (
        <DemoAnimation />
      )}
    </div>
  );
}
