import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function GuestJoin() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [guestName, setGuestName] = useState("");
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    navigate(`/room/${roomId}`, {
      state: { guestName, isGuest: true },
    });
  };

  if (loading) {
    return <div className="loading">Loading room...</div>;
  }

  if (!roomInfo) {
    return <div className="loading">Room not found. Please check the link and try again.</div>;
  }

  return (
    <div className="guest-join-page">
      <form className="guest-join-form" onSubmit={handleJoin}>
        <h2>Join Room</h2>
        <p>
          You're joining: <strong>{roomInfo.name}</strong>
        </p>

        <div className="form-group">
          <label>Your Name</label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn">
          Join as Guest
        </button>
      </form>
    </div>
  );
}

export default GuestJoin;

