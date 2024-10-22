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

const MainForm = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      userName: "Mae.park(박세영)",
      uploadDate: "2024.09.25 오후12:00",
      postContent: "첫 번째 게시글입니다.",
      imageUrl: "https://example.com/image1.jpg",
      profileImageUrl: "https://example.com/profile1.jpg",
    },
    {
      id: 2,
      userName: "John Doe",
      uploadDate: "2024.09.26 오전10:30",
      postContent: "두 번째 게시글입니다.",
      profileImageUrl: "https://example.com/profile2.jpg",
    },
  ]);

  const addNewPost = (newPostData) => {
    setPosts((prevPosts) => [
      ...prevPosts,
      { id: prevPosts.length + 1, ...newPostData },
    ]);
  };

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
          {isMobile && (
            <button className="toggle-right-area" onClick={toggleRightArea}>
              {isRightAreaVisible ? "Hide Sidebar" : "Show Sidebar"}
            </button>
          )}
        </div>
        <div className="main-content">
          <div className="post-area">
            {posts.map((post) => (
              <Post
                key={post.id}
                userName={post.userName}
                uploadDate={post.uploadDate}
                postContent={post.postContent}
                imageUrl={post.imageUrl}
                profileImageUrl={post.profileImageUrl}
              />
            ))}
          </div>
          {(isRightAreaVisible || !isMobile) && (
            <div className="right-area">
              <div
                className={`right-section calendar ${
                  isAlertCollapsed ? "collapsed" : ""
                }`}
              >
                <div className="section-header" onClick={toggleAlertSection}>
                  <div className="title-container">
                    <img className="alerticon" src={Alerticon} alt="알림" />
                    <span>알림</span>
                  </div>
                  <img
                    className={`toggle-icon ${
                      isAlertCollapsed ? "" : "rotated"
                    }`}
                    src={Alertshow}
                    alt="Toggle"
                  />
                </div>
                <div className="section-content">
                  여기에 알림 내용이 들어갑니다.
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
                    공지사항
                  </div>
                </h3>
                <div className="section-content">
                  {/* Add task list component or content here */}
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
