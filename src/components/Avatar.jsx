import { useState } from 'react';

export default function Avatar({ src, name = '', size = 32, alt = '' }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };

  if (!src || failedSrc === src) {
    const initial = name.trim().charAt(0).toUpperCase() || '?';
    return (
      <span className="avatar" style={style} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : 'true'}>
        {initial}
      </span>
    );
  }

  return (
    <img
      className="avatar"
      style={style}
      src={src}
      alt={alt}
      onError={() => setFailedSrc(src)}
    />
  );
}
