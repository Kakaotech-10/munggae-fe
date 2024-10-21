import PropTypes from "prop-types";
import Hearticon from "../image/Hearticon.svg";

export const CommentPropType = PropTypes.shape({
  comment_id: PropTypes.number.isRequired,
  post_id: PropTypes.number.isRequired,
  member_id: PropTypes.number.isRequired,
  parent_comment_id: PropTypes.number,
  comment_content: PropTypes.string.isRequired,
  depth: PropTypes.number.isRequired,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired,
  member: PropTypes.shape({
    member_name: PropTypes.string.isRequired,
    member_name_english: PropTypes.string.isRequired,
  }).isRequired,
  likes: PropTypes.number,
  replies: PropTypes.arrayOf(PropTypes.object), // This will be recursively defined
});

const Comment = ({ comment, depth }) => (
  <div className={`comment depth-${depth}`}>
    <div className="comment-header">
      <span className="comment-author">{`${comment.member.member_name}(${comment.member.member_name_english})`}</span>
    </div>
    <div className="comment-content">{comment.comment_content}</div>
    <div className="comment-footer">
      <span className="comment-date">
        {new Date(comment.created_at).toLocaleString()}
      </span>
      <img src={Hearticon} alt="좋아요" className="comment-like-icon" />
      <span>{comment.likes || 0}</span>
    </div>
    {comment.replies &&
      comment.replies.map((reply) => (
        <Comment key={reply.comment_id} comment={reply} depth={depth + 1} />
      ))}
  </div>
);

Comment.propTypes = {
  comment: CommentPropType.isRequired,
  depth: PropTypes.number.isRequired,
};

export default Comment;
