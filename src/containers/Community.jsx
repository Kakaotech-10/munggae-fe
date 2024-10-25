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
import { getPostComments } from "../api/useGetComment";

const Community = () => {
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]); // 빈 배열로 초기화
  const [commentError, setCommentError] = useState(null);

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

  const handlePostCreated = async (newPost) => {
    // API 응답 형식에 맞게 데이터 구조 변환
    const formattedPost = {
      post_id: newPost.id,
      post_title: newPost.title,
      post_content: newPost.content,
      post_likes: 0,
      created_at: newPost.createdAt,
      updated_at: newPost.updatedAt,
      member: newPost.member,
    };

    // 새 게시글을 목록 맨 앞에 추가
    setPosts((prevPosts) => [formattedPost, ...prevPosts]);

    // 게시글 작성 폼 닫기
    setShowWriteForm(false);

    // 전체 목록 새로고침
    await fetchPosts();
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(0);
  };

  const handlePostEdit = async (updatedPost) => {
    try {
      // 수정된 게시물로 목록 업데이트
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === updatedPost.id
            ? {
                post_id: updatedPost.id,
                post_title: updatedPost.title,
                post_content: updatedPost.content,
                post_likes: post.post_likes,
                created_at: updatedPost.createdAt,
                updated_at: updatedPost.updatedAt,
                member: updatedPost.member,
              }
            : post
        )
      );

      // 선택된 게시물 초기화
      setSelectedPost(null);

      // 게시물 목록 새로고침
      await fetchPosts();
    } catch (error) {
      console.error("Error updating posts after edit:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePostClick = async (postId) => {
    try {
      const postData = await getPost(postId);
      setSelectedPost(postData);
      const { error, comments } = await getPostComments(postId);
      if (error) {
        setCommentError(error);
        setComments([]);
      } else {
        setCommentError(null);
        // comments.content가 실제 댓글 배열이므로 이를 사용
        setComments(comments.content || []);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      setSelectedPost(null);
      setCommentError("게시물을 불러오는 중 오류가 발생했습니다.");
    }
  };

  const handleCloseViewPage = () => {
    setSelectedPost(null);
    setComments([]); // ViewPage를 닫을 때 댓글 상태 초기화
  };

  const handlePostDelete = async (postId) => {
    try {
      // 게시물 목록에서 삭제된 게시물 제거
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== postId)
      );

      // 선택된 게시물 초기화 및 ViewPage 닫기
      setSelectedPost(null);
      setComments([]);

      // 필요한 경우 게시물 목록 새로고침
      await fetchPosts();
    } catch (error) {
      console.error("Error updating posts after deletion:", error);
    }
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
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePostClick(post.post_id);
                }
              }}
              role="button"
              tabIndex={0}
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
        <ViewPage
          post={selectedPost}
          comments={comments}
          commentError={commentError}
          onClose={handleCloseViewPage}
          onPostDelete={handlePostDelete}
          onPostEdit={handlePostEdit} // 추가
        />
      )}
    </div>
  );
};

export default Community;
