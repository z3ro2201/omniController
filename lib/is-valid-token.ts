function decodeJwtPayload(token: string | null) {
  if (!token || typeof token !== "string") throw new Error("Empty token");

  // Bearer 제거 + 양끝 공백 제거
  let raw: string = token.startsWith("Bearer ") ? token.slice(7) : token;
  raw = raw.trim();

  // 쿠키/헤더에서 URL 인코딩되어 들어오는 케이스 보정
  try {
    raw = decodeURIComponent(raw);
  } catch (_) {}

  // 따옴표로 감싸진 값 보정 ("eyJ....")
  raw = raw.replace(/^"(.+)"$/, "$1");

  const parts = raw.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");

  const payloadPart = parts[1];

  // Base64URL → Base64 + padding
  let base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);

  // atob에서 DOMException 날 수 있으니 여기서 한 번 더 보호
  let decoded;
  try {
    decoded = atob(base64);
  } catch (e) {
    throw new Error("atob failed (payload is not valid base64)");
  }

  // UTF-8 안전 변환
  const json: string = decodeURIComponent(
    decoded
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );

  return JSON.parse(json);
}

function isValidToken({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
  const currentTime = Math.floor(Date.now() / 1000);

  let isAccessTokenValid: boolean = false;
  let isRefreshTokenValid: boolean = false;

  try {
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);
      isAccessTokenValid = typeof payload.exp === "number" && payload.exp > currentTime;
    }
  } catch (err) {
    console.error("accessToken 디코딩 실패:", err);
  }

  try {
    if (refreshToken) {
      const payload = decodeJwtPayload(refreshToken);
      isRefreshTokenValid = typeof payload.exp === "number" && payload.exp > currentTime;
    }
  } catch (err) {
    console.error("refreshToken 디코딩 실패:", err);
  }

  return { isAccessTokenValid, isRefreshTokenValid };
}

export default isValidToken;
