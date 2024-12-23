import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import WriteForm from "./WriteForm";
import Postlist from "../component/Postlist";
import Pagination from "../component/Pagination";
import SortButtons from "../component/SortButtons";
import CustomAlert from "../component/CustomAlert";
import "./styles/StudyForm.scss";
import { getPosts } from "../api/useGetPosts";

const StudyForm = () => {
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const pageSize = 5;
  const navigate = useNavigate();

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getPosts(currentPage, pageSize, sortBy);

      if (!data.content || !Array.isArray(data.content)) {
        throw new Error("Invalid posts data received");
      }

      let sortedPosts = [...data.content];
      if (sortBy === "oldest") {
        sortedPosts.sort(
          (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
        );
      } else if (sortBy === "latest") {
        sortedPosts.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      } else {
        sortedPosts.sort(
          (a, b) => Number(b.post_likes || 0) - Number(a.post_likes || 0)
        );
      }

      setPosts(sortedPosts);
      setTotalPages(Math.ceil(data.totalPages || 1));
      setError(null);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("게시물을 불러오는데 실패했습니다.");
      setPosts([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortBy]);

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(0);
  };

  const handleWriteClick = () => {
    navigate("/channel/5/write");
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
      showAlertMessage("게시글이 작성되었습니다.");
    } catch (error) {
      console.error("Error handling new post:", error);
      showAlertMessage("게시글 작성에 실패했습니다.");
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/channel/5/${postId}`);
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
          {error ? (
            <div className="error-message">{error}</div>
          ) : isLoading ? (
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
                  title={post.post_title || ""}
                  imageUrls={post.imageUrls || []}
                  likes={String(post.post_likes || 0)}
                  clean={post.clean ?? true}
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

      {showAlert && (
        <CustomAlert
          title="알림"
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default StudyForm;
