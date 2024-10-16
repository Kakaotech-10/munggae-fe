import { useState } from "react";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import WriteForm from "./WriteForm";
import Postlist from "../component/Postlist";
import Pagination from "../component/Pagination";
import SortButtons from "../component/SortButtons";
import "./styles/Community.scss";

const Community = () => {
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("latest");

  const handleWriteClick = () => {
    setShowWriteForm(true);
  };

  const handleCloseWriteForm = () => {
    setShowWriteForm(false);
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 임시 게시물 데이터
  const posts = [
    { id: 1, title: "안녕하세요~ 다들 함께해서 너무 반가워요", likes: 100 },
    {
      id: 2,
      title: "안녕하세요~ 저는 사진 첨부되지 않은 게시물이에요",
      likes: 100,
    },
    {
      id: 3,
      title: "안녕하세요~ 저는 사진 첨부되지 않은 게시물이에요",
      likes: 100,
    },
    {
      id: 4,
      title: "안녕하세요~ 저는 사진 첨부되지 않은 게시물이에요",
      likes: 100,
    },
    {
      id: 5,
      title: "안녕하세요~ 저는 사진 첨부되지 않은 게시물이에요",
      likes: 100,
    },
  ];

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
              key={post.id}
              imageUrl={post.imageUrl}
              title={post.title}
              likes={post.likes}
            />
          ))}
        </div>
        <div className="pagination-container">
          <Pagination
            currentPage={currentPage}
            totalPages={3}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      {showWriteForm && <WriteForm onClose={handleCloseWriteForm} />}
    </div>
  );
};

export default Community;
