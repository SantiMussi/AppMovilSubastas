export async function safeJson(response) {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
}
