import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Profile } from "../components/Profile";

function Dashboard({ user, setUser, token, onLogout }) {
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/users/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: roomName, token }),
      });

      const data = await response.json();
      if (data.success) {
        setRoomName("");
        fetchRooms();
        navigate(`/room/${data.room.id}`);
      }
    } catch (err) {
      console.error("Failed to create room:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyRoomLink = (roomId) => {
    const link = `${window.location.origin}/guest/${roomId}`;
    navigator.clipboard.writeText(link);
    alert("Ссылка скопирована!");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Привет, {user.username}!</h1>
        <div className="dashboard-header-btns">
          <button onClick={() => setShowProfile(!showProfile)} className="btn --not-w-full">Профиль</button>
          <button onClick={onLogout} className="btn-secondary">
            Выход
          </button>
        </div>
      </div>

      {showProfile && (
        <Profile user={user} setUser={setUser} onClose={() => setShowProfile(false)} />
      )}

      <div className="create-room-section">
        <h2>Создать комнату</h2>
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <input
            type="text"
            placeholder="Введите имя комнаты..."
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Создание..." : "Создать комнату"}
          </button>
        </form>
      </div>

      <div className="rooms-list">
        <h2>Ваши комнаты</h2>
        {rooms.length === 0 ? (
          <p style={{ color: "#999" }}>Пока комнат нет. Создайте свою первую!</p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="room-item">
              <div className="room-info">
                <h3>{room.name}</h3>
                <p>Создана: {new Date(room.created_at).toLocaleDateString()}</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => copyRoomLink(room.id)} className="btn-secondary">
                  Скопировать ссылку
                </button>
                <a href={`/room/${room.id}`} className="room-link">
                  Присоединиться
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;

