import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function CountingPage() {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCount();
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

  const updateCount = async (action, value = null) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/count", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, value }),
      });

      const data = await response.json();
      setCount(data.count);

      if (action === "set") {
        setInputValue("");
      }
    } catch (error) {
      console.error("Failed to update count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetValue = () => {
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      updateCount("set", numValue);
    } else {
      alert("올바른 숫자를 입력해주세요.");
    }
  };

  return (
    <>
      <Head>
        <title>카운팅 앱 - 컨트롤</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="counting-container">
        <div className="header">
          <h1>카운트 컨트롤</h1>
          <div className="current-count">현재: {count}</div>
        </div>

        <div className="controls">
          <div className="button-group">
            <button
              className="control-button increase"
              onClick={() => updateCount("increase")}
              disabled={isLoading}
            >
              + 증가
            </button>

            <button
              className="control-button decrease"
              onClick={() => updateCount("decrease")}
              disabled={isLoading}
            >
              - 감소
            </button>
          </div>

          <div className="input-group">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="숫자 입력"
              className="number-input"
            />
            <button
              className="control-button set"
              onClick={handleSetValue}
              disabled={isLoading || !inputValue}
            >
              숫자 변경
            </button>
          </div>
        </div>

        <div className="nav-links">
          <Link href="/" className="nav-button">
            메인 페이지로 이동
          </Link>
        </div>

        {isLoading && <div className="loading">처리 중...</div>}
      </div>
    </>
  );
}
