// Search.jsx

import "./styles/Search.scss";
import Searchicon from "../image/Searchicon.svg";
const Search = () => {
  return (
    <div className="search-bar">
      <input type="text" placeholder="Search" />
      <button>
        <img src={Searchicon} />
      </button>
    </div>
  );
};

export default Search;
