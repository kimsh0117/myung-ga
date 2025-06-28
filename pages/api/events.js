export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  // Vercel에서 SSE 설정
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader(
    "Cache-Control",
    "no-cache, no-store, max-age=0, must-revalidate"
  );
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Cache-Control");
  res.setHeader("X-Accel-Buffering", "no"); // Nginx 버퍼링 비활성화

  // SSE 클라이언트 목록 관리 (Vercel에서는 메모리 공유 제한)
  if (!global.sseClients) {
    global.sseClients = new Set();
  }

  global.sseClients.add(res);

  // 연결 종료 시 클라이언트 목록에서 제거
  req.on("close", () => {
    global.sseClients.delete(res);
  });

  req.on("error", () => {
    global.sseClients.delete(res);
  });

  // 초기 연결 확인
  res.write('data: {"type": "connected"}\n\n');

  // Vercel의 타임아웃을 방지하기 위한 heartbeat
  const heartbeat = setInterval(() => {
    if (res.destroyed) {
      clearInterval(heartbeat);
      return;
    }
    res.write('data: {"type": "heartbeat"}\n\n');
  }, 25000); // 25초마다 heartbeat

  req.on("close", () => {
    clearInterval(heartbeat);
  });
}
