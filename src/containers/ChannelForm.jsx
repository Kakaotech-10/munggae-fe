import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./SideForm";
import Search from "../component/Search";
import WriteForm from "./WriteForm";
import Postlist from "../component/Postlist";
import Pagination from "../component/Pagination";
import SortButtons from "../component/SortButtons";
import ViewPage from "../component/ViewPage";
import { CustomButton } from "../component/CustomButton";
import CustomModal from "../component/CustomModal";
import { CustomInput } from "../component/CustomInput";
import CustomAlert from "../component/CustomAlert";
import api from "../api/config";
import "./styles/Community.scss";

const ChannelForm = () => {
  const { channelId } = useParams();
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ memberId: "", canPost: false });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const pageSize = 5;

  const loadChannelInfo = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/channels/${channelId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setChannelInfo(response.data);
      setError(null);
    } catch (error) {
      console.error("Failed to load channel info:", error);
      setError("채널 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/channels/${channelId}/posts`, {
        params: {
          page: currentPage,
          size: pageSize,
          sort: sortBy,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = response.data;
      let sortedPosts;

      if (sortBy === "oldest") {
        sortedPosts = [...data.content].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      } else if (sortBy === "latest") {
        sortedPosts = [...data.content].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      } else {
        sortedPosts = [...data.content].sort(
          (a, b) => b.post_likes - a.post_likes
        );
      }

      setPosts(sortedPosts);
      setTotalPages(Math.ceil(data.totalPages));
      setError(null);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("게시물을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      if (!newMember.memberId.trim()) {
        showAlertMessage("멤버 ID를 입력해주세요.");
        return;
      }

      const response = await api.post(
        `/api/v1/channels/${channelId}/members`,
        {
          memberId: parseInt(newMember.memberId),
          canPost: newMember.canPost,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setShowAddMemberModal(false);
      setNewMember({ memberId: "", canPost: false });
      showAlertMessage("멤버가 추가되었습니다.");
      await loadChannelInfo();
    } catch (error) {
      console.error("Failed to add member:", error);
      showAlertMessage("멤버 추가에 실패했습니다.");
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const checkWritePermission = () => {
    const userRole = localStorage.getItem("memberRole");
    const userId = parseInt(localStorage.getItem("userId"));

    // 채널 멤버 찾기
    const channelMember = channelInfo?.members?.find(
      (member) => member.memberId === userId
    );

    return (
      userRole === "MANAGER" ||
      (userRole === "STUDENT" && channelMember?.canPost)
    );
  };

  useEffect(() => {
    loadChannelInfo();
    fetchPosts();
  }, [channelId, currentPage, sortBy]);

  const handleSort = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(0);
  };

  const handleWriteClick = () => {
    if (checkWritePermission()) {
      setShowWriteForm(true);
    } else {
      showAlertMessage("게시글 작성 권한이 없습니다.");
    }
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
      showAlertMessage("게시글이 작성되었습니다.");
    } catch (error) {
      console.error("Error handling new post:", error);
      showAlertMessage("게시글 작성에 실패했습니다.");
    }
  };

  const handlePostClick = async (postId) => {
    try {
      setIsLoading(true);
      setCommentError(null);

      const [postData, commentsData] = await Promise.all([
        api.get(`/api/v1/channels/${channelId}/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }),
        api.get(`/api/v1/channels/${channelId}/posts/${postId}/comments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }),
      ]);

      setSelectedPost(postData.data);

      if (commentsData.data?.error) {
        setCommentError(commentsData.data.error);
        setComments([]);
      } else {
        const commentsArray = commentsData.data?.content || [];
        setComments(commentsArray);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      setSelectedPost(null);
      setCommentError("게시물을 불러오는데 실패했습니다.");
      setComments([]);
    } finally {
      setIsLoading(false);
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
      setCommentError("댓글 업데이트에 실패했습니다.");
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
        const response = await api.get(
          `/api/v1/channels/${channelId}/posts/${updatedPost.id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.data?.content) {
          setComments(response.data.content);
        }
      }

      setSelectedPost(null);
      await fetchPosts();
      showAlertMessage("게시글이 수정되었습니다.");
    } catch (error) {
      console.error("Error updating post:", error);
      showAlertMessage("게시글 수정에 실패했습니다.");
    }
  };

  const handlePostDelete = async (postId) => {
    try {
      await api.delete(`/api/v1/channels/${channelId}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== postId)
      );
      setSelectedPost(null);
      setComments([]);
      await fetchPosts();
      showAlertMessage("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting post:", error);
      showAlertMessage("게시글 삭제에 실패했습니다.");
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
        <div className="commu-search-area">
          <Search />
        </div>

        <div className="community-header">
          <h2>{channelInfo?.name || "채널"}</h2>
          <div className="header-right">
            <SortButtons onSort={handleSort} currentSort={sortBy} />
            <div className="button-group">
              {localStorage.getItem("memberRole") === "MANAGER" && (
                <CustomButton onClick={() => setShowAddMemberModal(true)}>
                  멤버 추가
                </CustomButton>
              )}
              <button
                className="write-button"
                onClick={handleWriteClick}
                disabled={isLoading || !checkWritePermission()}
              >
                작성하기
              </button>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {error ? (
          <div className="error-message">{error}</div>
        ) : (
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
                    likes={post.post_likes.toString()}
                    clean={post.clean}
                  />
                </div>
              ))
            )}
          </div>
        )}

        <div className="pagination-container">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {showWriteForm && (
          <WriteForm
            onClose={handleCloseWriteForm}
            onPostCreated={handlePostCreated}
            channelId={channelId}
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
            channelId={channelId}
          />
        )}

        <CustomModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          title="채널 멤버 추가"
          footer={
            <>
              <CustomButton
                variant="outline"
                onClick={() => setShowAddMemberModal(false)}
              >
                취소
              </CustomButton>
              <CustomButton onClick={handleAddMember}>추가하기</CustomButton>
            </>
          }
        >
          <div className="member-form">
            <CustomInput
              id="memberId"
              label="멤버 ID"
              value={newMember.memberId}
              onChange={(e) =>
                setNewMember((prev) => ({ ...prev, memberId: e.target.value }))
              }
            />

            <div className="permission-switch">
              <label>
                <input
                  type="checkbox"
                  checked={newMember.canPost}
                  onChange={(e) =>
                    setNewMember((prev) => ({
                      ...prev,
                      canPost: e.target.checked,
                    }))
                  }
                />
                게시글 작성 권한 부여
              </label>
            </div>
          </div>
        </CustomModal>

        {showAlert && (
          <CustomAlert
            title="알림"
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChannelForm;
