import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Users } from "lucide-react";
import { useConference } from "../hooks/useConference";
import { Video } from "../components/Video";

import { startCase } from "lodash";
import { ParticipantsList } from "../components/ParticipantsList";

function VideoRoom() {
  const user = JSON.parse(localStorage.getItem("user"));

  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [roomInfo, setRoomInfo] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const currentUser = location.state?.isGuest
    ? { id: `guest_${Date.now()}`, username: location.state.guestName, isGuest: true }
    : user;

  useEffect(() => {
    if (!currentUser) {
      navigate(`/guest/${roomId}`);
      return;
    }

    fetchRoomInfo();
  }, [roomId]);

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`);
      const data = await response.json();
      if (data.success) {
        setRoomInfo(data.room);
      }
    } catch (err) {
      console.error("Failed to fetch room info:", err);
    }
  };

  const { camOff, isMuted, participants, hasVideo, toggleCam, toggleMute } = useConference();

  return (
    <div className="video-room">
      <div className="video-room-header">
        <div className="room-title">
          <h2>{roomInfo?.name || "Loading..."}</h2>
          <span className="participant-count">
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="video-room-buttons">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="video-room-action"
          >
            <Users />
          </button>
          <button onClick={() => setShowChat(!showChat)} className="video-room-action">
            <MessageSquare />
          </button>
          <button onClick={() => navigate("/")} className="leave-btn">
            Leave Room
          </button>
        </div>
      </div>

      <div className="video-container">
        {participants.map((p) => (
          <div
            key={p.id}
            className="participant video-wrapper"
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <div className="audio-only-placeholder">
              <div className="avatar">{p.id?.charAt(0).toUpperCase()}</div>
              <div className="username">{startCase(p.id)}</div>
            </div>
            <Video
              id={`video-${p.id}`}
              autoPlay
              playsInline
              muted={p.id === "me"}
              srcObject={p.stream}
              className="video-element"
            />
          </div>
        ))}

        {showParticipants && (
          <ParticipantsList
            room={roomInfo}
            participants={participants}
            onClose={() => setShowParticipants(false)}
          />
        )}

        {/* {showChat && (
          <Chat room={room} onClose={() => setShowChat(false)} socket={socketRef.current} />
        )} */}
      </div>

      <div className="controls">
        <button
          onClick={toggleMute}
          className={`control-btn mic ${isMuted ? "muted" : ""}`}
          title={!isMuted ? "Mute" : "Unmute"}
        >
          {!isMuted ? "🎤" : "🔇"}
        </button>

        {hasVideo && (
          <button
            onClick={toggleCam}
            className={`control-btn camera ${camOff ? "off" : ""}`}
            title={!camOff ? "Turn off camera" : "Turn on camera"}
          >
            {!camOff ? "📹" : "📷"}
          </button>
        )}
      </div>
    </div>
  );
}

export default VideoRoom;
