const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

const URI_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const LOCAL_BACKEND_HOST_PATTERN = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i;
const PRODUCT_PHOTO_PATH_PATTERN = /^\/api\/v1\/products\/photos\/\d+\/content(?:[?#]|$)/i;

export function normalizeImageUri(value) {
  if (!value) return null;

  if (Array.isArray(value)) return byteArrayToDataUri(value);

  if (typeof value === 'object') {
    return normalizeImageUri(
      value.url
      || value.uri
      || value.imageUrl
      || value.imagenUrl
      || value.imagenPrincipal
      || value.ruta
      || value.foto
      || value.image
    );
  }

  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('//')) return rewriteLocalBackendUrl(`${apiProtocol()}${trimmed}`);
  if (trimmed.startsWith('/') || trimmed.startsWith('api/')) return joinBaseUrl(trimmed);
  if (URI_SCHEME_PATTERN.test(trimmed)) return rewriteLocalBackendUrl(trimmed);

  return byteArrayToDataUri(trimmed);
}

export function uniqueImageUris(values) {
  return values
    .map(normalizeImageUri)
    .filter(Boolean)
    .filter((uri, index, list) => list.indexOf(uri) === index);
}

function apiProtocol() {
  const match = API_BASE.match(/^(https?:)/i);
  return match?.[1] || 'https:';
}

function joinBaseUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function rewriteLocalBackendUrl(uri) {
  if (!API_BASE || !/^https?:\/\//i.test(uri)) return uri;

  const source = splitHttpUrl(uri);
  const target = splitHttpUrl(API_BASE);
  if (!source || !target) return uri;

  const isBackendPhoto = PRODUCT_PHOTO_PATH_PATTERN.test(source.path);
  if (!isBackendPhoto && !LOCAL_BACKEND_HOST_PATTERN.test(source.host)) return uri;

  return `${target.origin}${source.path}`;
}

function splitHttpUrl(uri) {
  const match = uri.match(/^(https?:\/\/)([^/]+)(.*)$/i);
  if (!match) return null;
  const path = match[3] || '/';
  return {
    origin: `${match[1]}${match[2]}`.replace(/\/+$/, ''),
    host: match[2],
    path,
  };
}

function byteArrayToDataUri(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
  }

  if (Array.isArray(value)) {
    const binary = value.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    if (typeof btoa === 'function') return `data:image/jpeg;base64,${btoa(binary)}`;
  }

  return null;
}