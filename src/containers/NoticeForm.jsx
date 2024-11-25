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
      // sortBy 파라미터를 서버에 전달
      const data = await getPosts(currentPage, pageSize, sortBy);

      let sortedPosts;
      if (sortBy === "oldest") {
        // 오래된순일 때는 created_at 기준으로 오름차순 정렬
        sortedPosts = [...data.content].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      } else if (sortBy === "latest") {
        // 최신순일 때는 created_at 기준으로 내림차순 정렬
        sortedPosts = [...data.content].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      } else {
        // 인기순일 때는 likes 기준으로 정렬
        sortedPosts = [...data.content].sort(
          (a, b) => b.post_likes - a.post_likes
        );
      }

      setPosts(sortedPosts);
      setTotalPages(Math.ceil(data.totalPages));
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(0); // 정렬 변경 시 첫 페이지로 이동
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
        imageUrls: newPost.imageUrls || [],
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

  const handleCommentsUpdate = async (updatedComments) => {
    try {
      if (Array.isArray(updatedComments)) {
        setComments(updatedComments);
      } else {
        const newComments = [...comments, updatedComments];
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

      const [postData, commentsData] = await Promise.all([
        getPost(postId),
        getPostComments(postId),
      ]);

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
                imageUrls: updatedPost.imageUrls || [],
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
      <div className="commu-content-wrapper">
        <div className="search-area">
          <Search />
        </div>

        <div className="community-header">
          <h2>공지사항</h2>
          <div className="header-right">
            <SortButtons onSort={handleSort} currentSort={sortBy} />
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
                  imageUrls={post.imageUrls}
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
