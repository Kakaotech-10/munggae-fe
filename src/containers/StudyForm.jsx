// StudyForm.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import WriteForm from "./WriteForm";
import Postlist from "../component/Postlist";
import Pagination from "../component/Pagination";
import SortButtons from "../component/SortButtons";
import "./styles/StudyForm.scss";
import { getPosts } from "../api/useGetPosts";

const StudyForm = () => {
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortBy]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getPosts(currentPage, pageSize, sortBy);

      let sortedPosts;
      if (sortBy === "oldest") {
        sortedPosts = [...data.content].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      } else if (sortBy === "latest") {
        sortedPosts = [...data.content].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      } else {
        sortedPosts = [...data.content].sort(
          (a, b) => b.post_likes - a.post_likes
        );
      }

      setPosts(sortedPosts);
      setTotalPages(Math.ceil(data.totalPages));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(0);
  };

  const handleWriteClick = () => {
    navigate("/studypage/writepage");
  };

  const handleCloseWriteForm = () => {
    setShowWriteForm(false);
  };

  const handlePostCreated = async (newPost) => {
    try {
      const formattedPost = {
        post_id: newPost.id,
        post_title: newPost.title,
        post_content: newPost.content,
        post_likes: 0,
        created_at: newPost.createdAt,
        updated_at: newPost.updatedAt,
        clean: newPost.clean,
        imageUrls: newPost.imageUrls || [],
        member: newPost.member,
      };

      setPosts((prevPosts) => [formattedPost, ...prevPosts]);
      setShowWriteForm(false);
      await fetchPosts();
    } catch (error) {
      console.error("Error handling new post:", error);
      alert("게시글 작성 중 오류가 발생했습니다.");
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/studypage/studyviewpage/${postId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="study-content-wrapper">
        <div className="study-search-area">
          <Search />
        </div>

        <div className="study-header">
          <h2>학습게시판</h2>
          <div className="header-right">
            <SortButtons onSort={handleSort} currentSort={sortBy} />
            <div className="write-button-area">
              <button
                className="write-button"
                onClick={handleWriteClick}
                disabled={isLoading}
              >
                작성하기
              </button>
            </div>
          </div>
        </div>

        <hr className="divider" />
        <div className="posts-area">
          {isLoading ? (
            <div className="loading">로딩 중...</div>
          ) : (
            posts.map((post) => (
              <div
                key={post.post_id}
                onClick={() => handlePostClick(post.post_id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePostClick(post.post_id);
                  }
                }}
                role="button"
                tabIndex={0}
                className="post-item"
              >
                <Postlist
                  id={post.post_id}
                  title={post.post_title}
                  imageUrls={post.imageUrls}
                  likes={(post.post_likes !== undefined
                    ? post.post_likes
                    : 0
                  ).toString()}
                  clean={post.clean}
                />
              </div>
            ))
          )}
        </div>

        <div className="pagination-container">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {showWriteForm && (
        <WriteForm
          onClose={handleCloseWriteForm}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default StudyForm;
