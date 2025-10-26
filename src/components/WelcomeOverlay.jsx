import { useState, useEffect } from "react";

export function WelcomeOverlay() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("welcomeShown");
    if (!hasSeen) {
      setVisible(true);
    }
  }, []);

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(() => {
      localStorage.setItem("welcomeShown", "true");
      setVisible(false);
    }, 800);
  };

  if (!visible) return null;

  return (
    <div className={`welcome-overlay ${fadeOut ? "fade-out" : "fade-in"}`}>
      <div className="welcome-box">
        <h1 className="welcome-title">Добро пожаловать в «УткиУУУ» 🦆</h1>
        <p className="welcome-subtitle">
          Простое и стабильное приложение для онлайн-встреч и командной работы.
        </p>

        <div className="welcome-features">
          <div className="fade-item" style={{ animationDelay: "0.2s" }}>
            <h3>🎥 Видео и голосовые встречи</h3>
            <p>Создавайте конференции и подключайтесь без лагов через WebRTC.</p>
          </div>

          <div className="fade-item" style={{ animationDelay: "0.4s" }}>
            <h3>💬 Встроенный чат</h3>
            <p>Общайтесь прямо во время звонков — сообщения сохраняются автоматически.</p>
          </div>

          <div className="fade-item" style={{ animationDelay: "0.6s" }}>
            <h3>👥 Гостевой вход</h3>
            <p>Присоединяйтесь без регистрации — просто по ссылке на комнату.</p>
          </div>

          <div className="fade-item" style={{ animationDelay: "0.8s" }}>
            <h3>⚙️ Надёжная архитектура</h3>
            <p>Node.js + React + WebSocket — скорость, устойчивость и масштабируемость.</p>
          </div>
        </div>

        <button className="welcome-btn" onClick={handleStart}>
          Поехали!
        </button>
      </div>
    </div>
  );
}
