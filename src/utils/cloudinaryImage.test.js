import { describe, expect, test } from 'vitest';
import { cloudinarySrcSet, cloudinaryUrl, isCloudinaryUrl } from './cloudinaryImage';

const ORIGINAL = 'https://res.cloudinary.com/dkzrgtcbw/image/upload/v1791132336/FitTogether/photo.png';

describe('Images Cloudinary', () => {
  test('ajoute la taille, le format et la qualité automatiques à une image Cloudinary', () => {
    expect(cloudinaryUrl(ORIGINAL, { width: 800 })).toBe(
      'https://res.cloudinary.com/dkzrgtcbw/image/upload/f_auto,q_auto,c_limit,w_800/v1791132336/FitTogether/photo.png'
    );
  });

  test('recadre en carré centré sur le sujet pour les avatars', () => {
    expect(cloudinaryUrl(ORIGINAL, { width: 64, height: 64, crop: 'fill' })).toBe(
      'https://res.cloudinary.com/dkzrgtcbw/image/upload/f_auto,q_auto,c_fill,w_64,h_64,g_auto/v1791132336/FitTogether/photo.png'
    );
  });

  test('génère un srcset avec une version par largeur', () => {
    expect(cloudinarySrcSet(ORIGINAL, [400, 800])).toBe(
      'https://res.cloudinary.com/dkzrgtcbw/image/upload/f_auto,q_auto,c_limit,w_400/v1791132336/FitTogether/photo.png 400w, '
      + 'https://res.cloudinary.com/dkzrgtcbw/image/upload/f_auto,q_auto,c_limit,w_800/v1791132336/FitTogether/photo.png 800w'
    );
  });

  test.each([
    ['une image hébergée ailleurs', 'https://static.vecteezy.com/avatar.jpg'],
    ['une prévisualisation locale', 'blob:http://localhost:5173/abc'],
    ['une valeur absente', undefined],
  ])('laisse %s intacte', (_, url) => {
    expect(isCloudinaryUrl(url)).toBe(false);
    expect(cloudinaryUrl(url, { width: 800 })).toBe(url);
    expect(cloudinarySrcSet(url, [400, 800])).toBeUndefined();
  });
});
