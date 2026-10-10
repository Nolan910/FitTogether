import { useState } from 'react';
import { cloudinaryUrl, isCloudinaryUrl } from '../utils/cloudinaryImage';

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

  const square = (dimension) => cloudinaryUrl(src, { width: dimension, height: dimension, crop: 'fill' });

  return (
    <img
      className="avatar"
      style={style}
      src={square(size * 2)}
      srcSet={isCloudinaryUrl(src) ? `${square(size)} 1x, ${square(size * 2)} 2x, ${square(size * 3)} 3x` : undefined}
      width={size}
      height={size}
      alt={alt}
      onError={() => setFailedSrc(src)}
    />
  );
}
