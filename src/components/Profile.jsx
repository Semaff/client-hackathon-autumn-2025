import React, { useState, useMemo, useEffect } from "react"
import { X, Upload, User } from "lucide-react";

export const Profile = ({ user, setUser, onClose }) => {
    const [username, setUsername] = useState(user.username);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const formData = new FormData();
            formData.append("username", username);

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
                method: "PATCH",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setSuccess("Профиль успешно обновлен!");
                if (setUser) {
                    setUser(data.user);
                    localStorage.setItem("user", JSON.stringify(data.user));
                }

                setAvatarFile(null);
            } else {
                setError(data.error || "Ошибка при обновлении профиля");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("Ошибка сети при обновлении профиля");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Файл слишком большой. Максимальный размер: 5MB");
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError("Пожалуйста, выберите изображение");
                return;
            }

            setAvatarFile(file);
            setError("");
        }
    };

    const avatarUrl = useMemo(() => {
        if (avatarFile && avatarFile instanceof File) {
            return URL.createObjectURL(avatarFile);
        }

        if (user.avatar && typeof user.avatar === 'string') {
            if (user.avatar.startsWith('http')) {
                return user.avatar;
            } else {
                return `${import.meta.env.VITE_API_URL}/${user.avatar}`;
            }
        }

        return null;
    }, [avatarFile, user.avatar]);

    useEffect(() => {
        return () => {
            if (avatarFile && avatarUrl && avatarUrl.startsWith('blob:')) {
                URL.revokeObjectURL(avatarUrl);
            }
        };
    }, [avatarFile, avatarUrl]);

    return (
        <div className="profile">
            <div className="profile-header">
                <h3>Профиль</h3>
                <button onClick={onClose} disabled={isLoading}>
                    <X />
                </button>
            </div>

            <div className="profile-body">
                <form onSubmit={handleSaveProfile} className="profile-form">
                    <div className="avatar-section">
                        <div className="avatar-preview">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar preview"
                                    className="avatar-image"
                                />
                            ) : (
                                <div className="avatar-placeholder">
                                    <User size={48} />
                                </div>
                            )}
                        </div>

                        <div className="avatar-controls">
                            <label htmlFor="avatar-upload" className="avatar-upload-btn">
                                <Upload size={16} />
                                Выбрать фото
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="avatar-input"
                            />
                            {avatarFile && (
                                <button
                                    type="button"
                                    onClick={() => setAvatarFile(null)}
                                    className="avatar-remove-btn"
                                >
                                    Отменить выбор
                                </button>
                            )}
                        </div>
                    </div>

                    <label className="profile-label" htmlFor="username">
                        Имя пользователя
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Введите имя пользователя..."
                        className="profile-input"
                        maxLength={255}
                        disabled={isLoading}
                    />

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (username === user.username && !avatarFile)}
                        className="profile-button"
                    >
                        {isLoading ? "Сохранение..." : "Сохранить"}
                    </button>
                </form>
            </div>
        </div>
    );
};