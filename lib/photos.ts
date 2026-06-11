export const guestPhotosUrl =
  process.env.NEXT_PUBLIC_GUEST_PHOTOS_URL?.trim() ||
  "https://photos.app.goo.gl/3Hk1hDNrFMUeV3MV6";

export function getGuestPhotosQrUrl(size = 640) {
  const encodedUrl = encodeURIComponent(guestPhotosUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=24&data=${encodedUrl}`;
}
