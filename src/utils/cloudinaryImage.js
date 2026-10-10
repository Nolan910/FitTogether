const UPLOAD_SEGMENT = '/image/upload/';

export const isCloudinaryUrl = (url) => typeof url === 'string'
  && url.startsWith('https://res.cloudinary.com/')
  && url.includes(UPLOAD_SEGMENT);

export const cloudinaryUrl = (url, { width, height, crop = 'limit' } = {}) => {
  if (!isCloudinaryUrl(url)) return url;

  const transformation = [
    'f_auto',
    'q_auto',
    `c_${crop}`,
    width && `w_${width}`,
    height && `h_${height}`,
    crop === 'fill' && 'g_auto',
  ].filter(Boolean).join(',');

  const [base, rest] = url.split(UPLOAD_SEGMENT);
  return `${base}${UPLOAD_SEGMENT}${transformation}/${rest}`;
};

export const cloudinarySrcSet = (url, widths) => {
  if (!isCloudinaryUrl(url)) return undefined;
  return widths.map((width) => `${cloudinaryUrl(url, { width })} ${width}w`).join(', ');
};
