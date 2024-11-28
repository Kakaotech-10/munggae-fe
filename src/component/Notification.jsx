import { useState, useEffect } from "react";
import Alerticon from "../image/alerticon.svg";
import Alertshow from "../image/alertshow.svg";
import useNotifications from "../api/useNotifications";
import NotificationTestButton from "../test/NotificationTest";

import "./styles/Notification.scss";

const NotificationSection = () => {
  const {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasUnreadNotifications = notifications.some((notif) => !notif.isRead);

  // Load read status from localStorage on component mount
  useEffect(() => {
    const readNotifications = JSON.parse(
      localStorage.getItem("readNotifications") || "{}"
    );

    // Update notifications with stored read status
    notifications.forEach((notification) => {
      if (readNotifications[notification.id]) {
        markAsRead(notification.id);
      }
    });
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);

    // Store read status in localStorage
    const readNotifications = JSON.parse(
      localStorage.getItem("readNotifications") || "{}"
    );
    readNotifications[notificationId] = true;
    localStorage.setItem(
      "readNotifications",
      JSON.stringify(readNotifications)
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();

    // Store all current notifications as read in localStorage
    const readNotifications = JSON.parse(
      localStorage.getItem("readNotifications") || "{}"
    );
    notifications.forEach((notification) => {
      readNotifications[notification.id] = true;
    });
    localStorage.setItem(
      "readNotifications",
      JSON.stringify(readNotifications)
    );
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className={`right-section calendar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="section-header">
        <div className="title-container" onClick={toggleCollapse}>
          <div className="alert-dot-wrapper">
            {hasUnreadNotifications && <div className="alert-dot" />}
            <img className="alerticon" src={Alerticon} alt="알림" />
          </div>
          <span>알림</span>
          {isConnected && <span className="connection-status">(연결)</span>}
        </div>
        <NotificationTestButton />
        <div className="notification-actions">
          {notifications.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
              className="mark-all-read"
            >
              모두 읽음
            </button>
          )}
          <img
            className={`toggle-icon ${isCollapsed ? "" : "rotated"}`}
            src={Alertshow}
            alt="Toggle"
            onClick={toggleCollapse}
          />
        </div>
      </div>
      {!isCollapsed && (
        <div className="section-content">
          {notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <p>{notification.text}</p>
                    <span className="notification-time">
                      {notification.time}
                    </span>
                  </div>
                  <button
                    className="remove-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-notifications">새로운 알림이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSection;
