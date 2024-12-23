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
import useGetChannels from "../api/useGetChannel";

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
  const [hasMore, setHasMore] = useState(true);

  const { channels, loadUserChannels } = useGetChannels();

  const loadPosts = async () => {
    try {
      setIsLoading(true);

      let allPosts = [];
      for (const channel of channels) {
        const response = await getPosts(currentPage, 10, "latest", channel.id);
        allPosts = [...allPosts, ...response.content];
      }

      // 전체 게시글을 날짜순으로 정렬
      allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // 페이지네이션 처리
      const start = currentPage * 10;
      const paginatedPosts = allPosts.slice(start, start + 10);

      if (paginatedPosts.length === 0) {
        setHasMore(false);
        return;
      }

      setPosts((prevPosts) =>
        currentPage === 0 ? paginatedPosts : [...prevPosts, ...paginatedPosts]
      );
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 채널 목록 로드
  useEffect(() => {
    loadUserChannels();
  }, []);

  // channels가 로드된 후 posts 로드
  useEffect(() => {
    if (channels.length > 0) {
      loadPosts();
    }
  }, [channels, currentPage]);

  // 무한 스크롤 처리
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (
        scrollHeight - scrollTop <= clientHeight * 1.5 &&
        !isLoading &&
        hasMore
      ) {
        setCurrentPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, hasMore]);

  // 반응형 처리
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
              <a
                key={index}
                href={item.link}
                className="icon-wrapper"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={item.icon} alt={item.alt} className="search-icon" />
              </a>
            ))}
          </div>
          {isMobile && (
            <button className="toggle-right-area" onClick={toggleRightArea}>
              {isRightAreaVisible ? "사이드바 숨기기" : "사이드바 보기"}
            </button>
          )}
        </div>
        <div className="main-content">
          <div className="post-area">
            {posts.map((post) => (
              <Post key={post.post_id} post={post} />
            ))}
            {isLoading && <div className="loading">로딩 중...</div>}
            {!hasMore && !isLoading && (
              <div className="no-more-posts">더 이상 게시글이 없습니다.</div>
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
