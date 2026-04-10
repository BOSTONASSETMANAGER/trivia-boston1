'use client';

const IMAGE_SRC =
  'https://ss4cnmwrqckodj1i.public.blob.vercel-storage.com/background.jpg';

export default function StadiumBackground() {
  return (
    <div className="stadium-noir" aria-hidden="true">
      <img
        className="stadium-video"
        src={IMAGE_SRC}
        alt=""
      />
    </div>
  );
}
