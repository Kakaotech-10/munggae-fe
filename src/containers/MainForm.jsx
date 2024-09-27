// MainForm.jsx
import { useState } from "react";
import Sidebar from "./SideForm";
import Post from "./PostForm";
import Search from "../component/Search";
import "./styles/MainForm.scss";

const MainForm = () => {
  // 게시글 데이터를 관리하기 위한 상태
  const [posts, setPosts] = useState([
    {
      id: 1,
      userName: "Mae.park(박세영)",
      uploadDate: "2024.09.25 오후12:00",
      postContent: "첫 번째 게시글입니다.",
      imageUrl: "https://example.com/image1.jpg",
      profileImageUrl: "https://example.com/profile1.jpg",
    },
    {
      id: 2,
      userName: "John Doe",
      uploadDate: "2024.09.26 오전10:30",
      postContent: "두 번째 게시글입니다.",
      profileImageUrl: "https://example.com/profile2.jpg",
    },
    // 더 많은 게시글 데이터를 추가할 수 있습니다.
  ]);

  // 새 게시글을 추가하는 함수 (예시)
  const addNewPost = (newPostData) => {
    setPosts((prevPosts) => [
      ...prevPosts,
      { id: prevPosts.length + 1, ...newPostData },
    ]);
  };

  return (
    <div className="main-container">
      <div className="sidebar-area">
        <Sidebar />
      </div>
      <div className="content-wrapper">
        <div className="search-area">
          <Search />
        </div>
        <div className="post-area">
          {posts.map((post) => (
            <Post
              key={post.id}
              userName={post.userName}
              uploadDate={post.uploadDate}
              postContent={post.postContent}
              imageUrl={post.imageUrl}
              profileImageUrl={post.profileImageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainForm;
