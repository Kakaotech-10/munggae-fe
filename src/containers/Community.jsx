// Community.jsx
import { useState } from "react";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import WriteForm from "./WriteForm";

const Community = () => {
  const [showWriteForm, setShowWriteForm] = useState(false);

  const handleWriteClick = () => {
    setShowWriteForm(true);
  };

  const handleCloseWriteForm = () => {
    setShowWriteForm(false);
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
        <div className="setting-area">
          <button className="write-button" onClick={handleWriteClick}>
            작성하기
          </button>
        </div>
      </div>
      {showWriteForm && <WriteForm onClose={handleCloseWriteForm} />}
    </div>
  );
};

export default Community;
