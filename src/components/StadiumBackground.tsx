'use client';

const IMAGE_SRC = '/background-trivia.jpg';

export default function StadiumBackground() {
  return (
    <div className="stadium-noir" aria-hidden="true">
      <img
        className="stadium-video"
        src={IMAGE_SRC}
        alt=""
        decoding="async"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
}
