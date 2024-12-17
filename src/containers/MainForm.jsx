import { useState, useEffect } from "react";
import Sidebar from "./SideForm";
import Post from "./PostForm";
import Search from "../component/Search";
import "./styles/MainForm.scss";
import DiscordIcon from "../image/discord.svg";
import NotionIcon from "../image/notion-icon.svg";
import CloudIcon from "../image/cloud-computing.svg";
import ZepIcon from "../image/letter-z.svg";
import Logo from "../image/logo_black.png";
import { getPosts } from "../api/useGetPosts";
import NotificationSection from "../component/Notification";
import NoticeSection from "../component/NoticeSection";
import Ranking from "../component/Ranking";

const MainForm = () => {
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

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRightAreaVisible, setIsRightAreaVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  return (
    <div className="main-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="content-wrapper">
        <div className="search-area">
          {isMobile && (
            <div className="mobile-logo">
              <img src={Logo} alt="Logo" className="logo-image" />
            </div>
          )}
          {!isMobile && <Search />}
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
              <NotificationSection />
              <NoticeSection />
              <Ranking />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainForm;
