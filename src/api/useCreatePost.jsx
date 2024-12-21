import api from "./config";

export const createPost = async (postData) => {
  // channelId 유효성 검사
  if (!postData.channelId) {
    throw new Error("게시글을 생성하기 위해서는 channelId가 필요합니다");
  }

  try {
    // 날짜와 시간 형식 검증 및 변환 함수
    const formatDateTime = (date, time) => {
      if (!date || !time) return null;

      // 날짜와 시간이 모두 존재하는 경우에만 ISO 형식으로 변환
      try {
        const dateTimeString = `${date}T${time}:00`;
        const dateObj = new Date(dateTimeString);

        // 유효한 날짜인지 확인
        if (isNaN(dateObj.getTime())) {
          throw new Error("잘못된 날짜/시간 형식입니다");
        }

        return dateTimeString;
      } catch (error) {
        console.error("날짜/시간 변환 중 오류:", error);
        return null;
      }
    };

    // 예약 시간과 마감 시간 변환
    const reservationTime = formatDateTime(
      postData.uploadDate,
      postData.uploadTime
    );
    const deadLine = formatDateTime(
      postData.deadlineDate,
      postData.deadlineTime
    );

    // 필수 필드 검증
    if (!postData.title?.trim()) {
      throw new Error("게시글 제목을 입력해주세요");
    }

    if (!postData.content?.trim()) {
      throw new Error("게시글 내용을 입력해주세요");
    }

    const response = await api.post(
      "/api/v1/posts",
      {
        title: postData.title.trim(),
        content: postData.content.trim(),
        reservationTime,
        deadLine,
      },
      {
        params: {
          channelId: postData.channelId,
          memberId: postData.memberId,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data) {
      throw new Error("서버로부터 응답을 받지 못했습니다");
    }

    console.log("게시글 생성 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("게시글 생성 중 오류 발생:", error);

    // 사용자 친화적인 에러 메시지 반환
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "게시글 생성에 실패했습니다");
  }
};
