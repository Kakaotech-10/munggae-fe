import { useState, useEffect } from "react";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import Pagination from "../component/Pagination";
import SortButtons from "../component/SortButtons";
import "./styles/Community.scss";
import { getPosts } from "../api/useGetPosts";

const ClubForm = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = 5;

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortBy]);

  const fetchPosts = async () => {
    try {
      const data = await getPosts(currentPage, pageSize);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
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
          <h2>동아리</h2>
          <div className="header-right">
            <SortButtons onSort={handleSort} />
            <div className="write-button-area">
              <button className="write-button">작성하기</button>
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div className="pagination-container">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ClubForm;
