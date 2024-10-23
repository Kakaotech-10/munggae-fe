import api from "./config";

export const editComment = async (commentId, memberId, commentData) => {
  try {
    const response = await api.put(
      "/comments/${commentId}",
      { content: commentData.content },
      { params: { memberId } }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing comment", error);
    throw error;
  }
};
