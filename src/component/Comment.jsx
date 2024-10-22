// Comment.jsx

import PropTypes from "prop-types";
import Hearticon from "../image/Hearticon.svg";

const Comment = ({ comment, depth }) => (
  <div className={`comment depth-${depth}`}>
    <div className="comment-header">
      <span className="comment-author">{`${comment.member.name}(${comment.member.nameEnglish})`}</span>
    </div>
    <div className="comment-content">{comment.content}</div>
    <div className="comment-footer">
      <span className="comment-date">
        {new Date(comment.createdAt).toLocaleString()}
      </span>
      <img src={Hearticon} alt="좋아요" className="comment-like-icon" />
      <span>{comment.likes || 0}</span>
    </div>
    {comment.replies &&
      comment.replies.map((reply) => (
        <Comment key={`reply-${reply.id}`} comment={reply} depth={depth + 1} />
      ))}
  </div>
);

Comment.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    likes: PropTypes.number,
    member: PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameEnglish: PropTypes.string.isRequired,
    }).isRequired,
    replies: PropTypes.array,
  }).isRequired,
  depth: PropTypes.number.isRequired,
};

export default Comment;
