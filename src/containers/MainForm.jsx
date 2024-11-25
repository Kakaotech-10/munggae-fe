import { useState, useEffect } from "react";
import Sidebar from "./SideForm";
import Post from "./PostForm";
import Search from "../component/Search";
import "./styles/MainForm.scss";
import Alerticon from "../image/alerticon.svg";
import Noticeicon_black from "../image/Noticeicon_black.svg";
import Alertshow from "../image/alertshow.svg";
import FirstIcon from "../image/1sticon.svg";
import SecondIcon from "../image/2ndicon.svg";
import ThirdIcon from "../image/3rdicon.svg";
import DiscordIcon from "../image/discord.svg";
import NotionIcon from "../image/notion-icon.svg";
import CloudIcon from "../image/cloud-computing.svg";
import ZepIcon from "../image/letter-z.svg";
import { getPosts } from "../api/useGetPosts";
import { useNotifications } from "../api/useNotifications";

const MainForm = () => {
  const {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    formatNotificationTime,
  } = useNotifications();

  const searchAreaIcons = [
    { icon: DiscordIcon, alt: "Discord", link: "#" },
    {
      icon: NotionIcon,
      alt: "Notion",
      link: "https://goormkdx.notion.site/kakao-tech-bootcamp-0710eb08b5a743bea83e1871c5ae7465",
    },
    { icon: CloudIcon, alt: "Cloud", link: "https://exp.goorm.io" },
    { icon: ZepIcon, alt: "Zep", link: "https://zep.us/play/8lj15q" },
  ];

  //공지사항 데이터 예시
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "2024 상반기 프로젝트 발표회",
      content: "프로젝트 발표회 참석 필수입니다.",
      deadline: "2024-04-20", // YYYY-MM-DD 형식
      important: true,
    },
    {
      id: 2,
      title: "신규 서비스 업데이트 안내",
      content: "4월 1일부터 신규 서비스가 시작됩니다.",
      deadline: "2024-04-01",
      important: false,
    },
  ]);

  // D-day 계산 함수
  const calculateDday = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(deadline);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-day";
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    return `D-${diffDays}`;
  };

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const hasUnreadNotifications = notifications.some((notif) => !notif.isRead);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getPosts(currentPage, 10);
        setPosts(response.content);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  const [isRightAreaVisible, setIsRightAreaVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAlertCollapsed, setIsAlertCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      if (!newIsMobile) {
        setIsRightAreaVisible(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleRightArea = () => {
    setIsRightAreaVisible((prev) => !prev);
  };

  const toggleAlertSection = () => {
    setIsAlertCollapsed((prev) => !prev);
  };

  const topTopics = [
    { rank: 2, topic: "Topic 2", count: 80 },
    { rank: 1, topic: "Topic 1", count: 100 },
    { rank: 3, topic: "Topic 3", count: 60 },
  ];

  const getIconForRank = (rank) => {
    switch (rank) {
      case 1:
        return FirstIcon;
      case 2:
        return SecondIcon;
      case 3:
        return ThirdIcon;
      default:
        return null;
    }
  };

  return (
    <div className="main-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="content-wrapper">
        <div className="search-area">
          <Search />
          <div className="search-area-icons">
            {searchAreaIcons.map((item, index) => (
              <a key={index} href={item.link} className="icon-wrapper">
                <img src={item.icon} alt={item.alt} className="search-icon" />
              </a>
            ))}
          </div>
          {isMobile && (
            <button className="toggle-right-area" onClick={toggleRightArea}>
              {isRightAreaVisible ? "Hide Sidebar" : "Show Sidebar"}
            </button>
          )}
        </div>
        <div className="main-content">
          <div className="post-area">
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              posts.map((post) => <Post key={post.post_id} post={post} />)
            )}
          </div>
          {(isRightAreaVisible || !isMobile) && (
            <div className="right-area">
              <div
                className={`right-section calendar ${isAlertCollapsed ? "collapsed" : ""}`}
              >
                <div className="section-header">
                  <div className="title-container" onClick={toggleAlertSection}>
                    <div className="alert-dot-wrapper">
                      {hasUnreadNotifications && <div className="alert-dot" />}
                      <img className="alerticon" src={Alerticon} alt="알림" />
                    </div>
                    <span>알림</span>
                    {isConnected && (
                      <span className="connection-status">●</span>
                    )}
                  </div>
                  <div className="notification-actions">
                    {notifications.length > 0 && (
                      <button onClick={markAllAsRead} className="mark-all-read">
                        모두 읽음
                      </button>
                    )}
                    <img
                      className={`toggle-icon ${isAlertCollapsed ? "" : "rotated"}`}
                      src={Alertshow}
                      alt="Toggle"
                      onClick={toggleAlertSection}
                    />
                  </div>
                </div>
                <div className="section-content">
                  {notifications.length > 0 ? (
                    <div className="notifications-list">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                          onClick={() => markAsRead(notification.id)}
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
                    <div className="no-notifications">
                      새로운 알림이 없습니다.
                    </div>
                  )}
                </div>
              </div>
              <div className="right-section task-list">
                <h3>
                  <div className="title-container">
                    <img
                      className="noticeicon"
                      src={Noticeicon_black}
                      alt="공지사항"
                    />
                    <span>공지사항</span>
                  </div>
                </h3>
                <div className="section-content">
                  <div className="notice-list">
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        className={`notice-item ${notice.important ? "important" : ""}`}
                      >
                        <span className="notice-title">{notice.title}</span>
                        <span className="notice-dday">
                          {calculateDday(notice.deadline)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="right-section top-topics">
                <h3>
                  <div className="title-container">실시간 Top Topic</div>
                </h3>
                <div className="section-content">
                  <p className="subtitle">
                    현재 이슈가 되고 있는 내용은 무엇일까요?
                  </p>
                  <div className="topics-podium">
                    {topTopics
                      .sort((a, b) => a.rank - b.rank)
                      .map((topic) => (
                        <div
                          key={topic.rank}
                          className={`topic-item rank-${topic.rank}`}
                        >
                          <img
                            src={getIconForRank(topic.rank)}
                            alt={`Rank ${topic.rank}`}
                            className="rank-icon"
                          />
                          <div
                            className="topic-bar"
                            style={{ height: `${topic.count}%` }}
                          >
                            <span className="topic-name">{topic.topic}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainForm;
