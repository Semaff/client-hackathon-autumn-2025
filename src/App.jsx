import { Video } from "./components/Video";
import { useConference } from "./hooks/useConference";

export default function App() {
  const { toggleMute, toggleCam, isMuted, camOff, participants } = useConference();

  return (
    <div style={{ padding: 20 }}>
      <h2>🎥 Audio+Video Call (WebRTC)</h2>
      <button onClick={toggleMute}>{isMuted ? "Вкл микрофон" : "Выкл микрофон"}</button>
      <button onClick={toggleCam}>{camOff ? "Вкл камеру" : "Выкл камеру"}</button>
      <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>
        {participants.map((p) => (
          <div
            key={p.id}
            className="participant"
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <div>{p.id === "me" ? "Я" : `Участник: ${p.id}`}</div>
            <Video
              id={`video-${p.id}`}
              autoPlay
              playsInline
              muted={p.id === "me"}
              srcObject={p.stream}
              style={{
                width: 200,
                border: "2px solid gray",
                borderRadius: 4,
                background: "black",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

