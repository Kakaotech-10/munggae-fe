import Sidebar from "./SideForm";
import Search from "../component/Search";
const MyList = () => {
  return (
    <div className="start-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="content-wrapper">
        <div className="search-area">
          <Search />
        </div>
        <div className="setting-area"></div>
      </div>
    </div>
  );
};

export default MyList;
