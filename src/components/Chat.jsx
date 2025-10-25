import React, { useEffect, useState } from "react";
import { X, Send } from "lucide-react";

export const Chat = ({ user, room, onClose, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${room.id}`);
        const data = await response.json();
        if (data) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }

    fetchMessages();

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "newMessage") {
        setMessages((prev) => [...prev, data.payload]);
      }
    });

    socket.send(
      JSON.stringify({
        type: "joinChat",
        payload: { roomId: room.id },
      })
    );
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const content = newMessage.trim();

      socket.send(
        JSON.stringify({
          type: "sendMessage",
          payload: {
            roomId: room.id,
            userId: user.isGuest ? undefined : user.id,
            by: user.username,
            content,
          },
        })
      );

      setNewMessage("");
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <h3>Чат</h3>
        <button onClick={onClose}>
          <X />
        </button>
      </div>

      <div className="chat-body flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="chat-body-empty">Сообщений пока нет. Начните общение!</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="chat-body-item"
              style={{ flexDirection: msg.userId === user.id ? "row-reverse" : "" }}
            >
              <div className="chat-body-item-avatar">{msg.by.charAt(0).toUpperCase()}</div>

              <div
                className="chat-body-item-message"
                style={{ textAlign: msg.userId === user.id ? "right" : "" }}
              >
                <div className="chat-body-item-message-meta">
                  <span className="chat-body-item-message-by">{msg.by}</span>
                  <span className="chat-body-item-message-created">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <div
                  className={`chat-body-item-message-content  ${
                    msg.userId === user.id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
                  }`}
                  style={{
                    background: msg.userId === user.id ? "#3b82f6" : "#374151",
                    color: msg.userId === user.id ? "white" : "#9ca3af",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-footer">
        <form onSubmit={handleSendMessage} className="chat-footer-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="chat-input"
            maxLength={500}
          />
          <button type="submit" className="chat-button">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

