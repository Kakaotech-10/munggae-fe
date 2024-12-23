import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Alerticon from "../image/alerticon.svg";
import Alertshow from "../image/alertshow.svg";
import useNotifications from "../api/useNotifications";
import "./styles/Notification.scss";

const NotificationSection = () => {
  const navigate = useNavigate();
  const { notifications, isConnected, markAsRead, markAllAsRead } =
    useNotifications();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasUnreadNotifications = useMemo(
    () => notifications.some((notif) => !notif.isRead),
    [notifications]
  );

  // 새 알림이 오면 즉시 펼치고 처리
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (!latestNotification.isRead) {
        console.log("New notification detected:", latestNotification);
        setIsCollapsed(false);
      }
    }
  }, [notifications]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ADD_REPLY_COMMENT":
        return "💬";
      default:
        return "📢";
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark the notification as read
    await handleMarkAsRead(notification.id);

    // Navigate based on the channel
    if (notification.channelId === 5 || notification.channelId === "5") {
      // 학습게시판 (StudyViewForm)
      navigate(`/channel/5/${notification.postId}`);
    } else {
      // 다른 게시판 (ChannelForm)
      navigate(`/channel/${notification.channelId}`);
    }
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
          {isConnected && <span className="connection-status">(연결됨)</span>}
        </div>
        <div className="notification-actions">
          {notifications.length > 0 && (
            <button onClick={handleMarkAllAsRead} className="mark-all-read">
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
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-type-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-text">
                      <p>{notification.text}</p>
                      <span className="notification-time">
                        {notification.time}
                      </span>
                    </div>
                  </div>
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
