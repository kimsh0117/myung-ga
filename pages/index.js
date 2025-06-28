import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function MainPage() {
  const [count, setCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 초기 카운트 가져오기
    fetchCount();

    // SSE 연결 설정
    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.count !== undefined) {
        setCount(data.count);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchCount = async () => {
    try {
      const response = await fetch("/api/count");
      const data = await response.json();
      setCount(data.count);
    } catch (error) {
      console.error("Failed to fetch count:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Seoul Myung Ga</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="main-container">
        <div className="status-bar">
          <div
            className={`connection-status ${
              isConnected ? "connected" : "disconnected"
            }`}
          >
            {isConnected ? "🟢" : "🔴"}
          </div>
        </div>

        <div className="count-display">
          <h1>Текущий номер</h1>
          <div className="count-number">{count}</div>
        </div>
      </div>
    </>
  );
}
