export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
export const mediaUrl = (url) =>
  url?.startsWith('/uploads/') ? `${API_URL.replace(/\/api\/v1\/?$/, '')}${url}` : url;
export async function api(path, { body, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...(body === undefined ? {} : { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The server is unavailable. Please try again.');
  }
  if (!response.ok || !result.success) {
    const error = new Error(result.message || 'Request failed');
    error.status = response.status;
    throw error;
  }
  return result.data;
}
