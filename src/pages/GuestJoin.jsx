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
    return <div className="loading">Комната загружается...</div>;
  }

  if (!roomInfo) {
    return <div className="loading">Комната не найдена. Проверьте ссылку и попробуйте еще раз.</div>;
  }

  return (
    <div className="guest-join-page">
      <form className="guest-join-form" onSubmit={handleJoin}>
        <h2>Присоединиться к комнате</h2>
        <p>
          Вы присоединяетесь к: <strong>{roomInfo.name}</strong>
        </p>

        <div className="form-group">
          <label>Ваше имя</label>
          <input
            type="text"
            placeholder="Введите ваше имя..."
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn">
          Присоединиться как Гость
        </button>
      </form>
    </div>
  );
}

export default GuestJoin;

