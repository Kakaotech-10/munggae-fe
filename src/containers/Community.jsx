import { useState, useEffect } from "react";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import WriteForm from "./WriteForm";
import Postlist from "../component/Postlist";
import Pagination from "../component/Pagination";
import SortButtons from "../component/SortButtons";
import ViewPage from "../component/ViewPage";
import "./styles/Community.scss";
import { getPosts } from "../api/useGetPosts";
import { getPost } from "../api/useGetPost";

const Community = () => {
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const pageSize = 5;

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortBy]);

  const fetchPosts = async () => {
    try {
      const data = await getPosts(currentPage, pageSize);
      setPosts(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleWriteClick = () => {
    setShowWriteForm(true);
  };

  const handleCloseWriteForm = () => {
    setShowWriteForm(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    fetchPosts();
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePostClick = async (postId) => {
    try {
      const postData = await getPost(postId);
      setSelectedPost(postData);
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  const handleCloseViewPage = () => {
    setSelectedPost(null);
  };

  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="content-wrapper">
        <div className="search-area">
          <Search />
        </div>

        <div className="community-header">
          <h2>커뮤니티</h2>
          <div className="header-right">
            <SortButtons onSort={handleSort} />
            <div className="write-button-area">
              <button className="write-button" onClick={handleWriteClick}>
                작성하기
              </button>
            </div>
          </div>
        </div>

        <hr className="divider" />
        <div className="posts-area">
          {posts.map((post) => (
            <div
              key={post.post_id}
              onClick={() => handlePostClick(post.post_id)}
            >
              <Postlist
                id={post.post_id}
                title={post.post_title}
                likes={(post.post_likes !== undefined
                  ? post.post_likes
                  : 0
                ).toString()}
              />
            </div>
          ))}
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
      {selectedPost && (
        <ViewPage post={selectedPost} onClose={handleCloseViewPage} />
      )}
    </div>
  );
};

export default Community;
