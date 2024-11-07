// containers/Community.jsx
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
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortBy]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getPosts(currentPage, pageSize);
      console.log("Fetched posts:", data.content); // 디버깅 로그 추가
      setPosts(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteClick = () => {
    setShowWriteForm(true);
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
        imageUrls: newPost.imageUrls || [], // 이미지 URL 배열 추가
        member: newPost.member,
      };

      setPosts((prevPosts) => [formattedPost, ...prevPosts]);
      setShowWriteForm(false);
      await fetchPosts();
    } catch (error) {
      console.error("Error handling new post:", error);
      alert("게시글 작성 중 오류가 발생했습니다.");
    }
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(0);
  };

  const handleCommentsUpdate = async (updatedComments) => {
    try {
      console.log("Received updated comments:", updatedComments);

      // allComments 배열을 바로 사용하도록 수정
      if (Array.isArray(updatedComments)) {
        // 새로운 댓글들로 상태 업데이트
        console.log("Final organized comments:", updatedComments);
        setComments(updatedComments);
      } else {
        // 단일 댓글이 전달된 경우, 기존 댓글 배열에 추가
        const newComments = [...comments, updatedComments];
        console.log("Final organized comments:", newComments);
        setComments(newComments);
      }
    } catch (error) {
      console.error("Error updating comments:", error);
      setCommentError("댓글 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handlePostClick = async (postId) => {
    try {
      setIsLoading(true);
      setCommentError(null);

      console.log("Fetching post with ID:", postId);
      const [postData, commentsData] = await Promise.all([
        getPost(postId),
        getPostComments(postId),
      ]);

      console.log("Received post data:", postData); // 로깅 추가
      console.log("Post images:", postData.imageUrls); // 이미지 URL 로깅

      setSelectedPost(postData);

      if (commentsData.error) {
        setCommentError(commentsData.error);
        setComments([]);
      } else {
        const commentsArray = commentsData.comments?.content || [];
        setComments(commentsArray);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      setSelectedPost(null);
      setCommentError("게시물을 불러오는 중 오류가 발생했습니다.");
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostEdit = async (updatedPost) => {
    try {
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
                clean: updatedPost.clean,
                imageUrls: updatedPost.imageUrls || [], // 이미지 URL 배열 추가
                member: updatedPost.member,
              }
            : post
        )
      );

      if (updatedPost.id) {
        const { error, comments: newComments } = await getPostComments(
          updatedPost.id
        );
        if (!error && newComments?.content) {
          setComments(newComments.content);
        }
      }

      setSelectedPost(null);
      await fetchPosts();
    } catch (error) {
      console.error("Error updating posts after edit:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== postId)
      );
      setSelectedPost(null);
      setComments([]);
      await fetchPosts();
    } catch (error) {
      console.error("Error updating posts after deletion:", error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCloseViewPage = () => {
    setSelectedPost(null);
    setComments([]);
    setCommentError(null);
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
          {isLoading ? (
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
                  title={post.post_title}
                  imageUrls={post.imageUrls} // 이미지 URL 배열 전달
                  likes={(post.post_likes !== undefined
                    ? post.post_likes
                    : 0
                  ).toString()}
                  clean={post.clean}
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

      {selectedPost && (
        <ViewPage
          post={selectedPost}
          comments={comments}
          commentError={commentError}
          onClose={handleCloseViewPage}
          onPostDelete={handlePostDelete}
          onPostEdit={handlePostEdit}
          onCommentsUpdate={handleCommentsUpdate}
        />
      )}
    </div>
  );
};

export default Community;
