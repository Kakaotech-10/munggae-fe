import { useState, useEffect } from "react";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import WriteForm from "./WriteForm";
import Postlist from "../component/Postlist";
import Pagination from "../component/Pagination";
import SortButtons from "../component/SortButtons";
import "./styles/Community.scss";
import { getPosts } from "../api/useGetPosts";

const Community = () => {
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
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
            <Postlist
              key={post.post_id}
              id={post.post_id}
              title={post.post_title}
              content={post.post_content}
              author={post.member.member_name}
              createdAt={post.created_at}
              course={post.member.course}
              nameEnglish={post.member.member_name_english}
            />
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
    </div>
  );
};

export default Community;
