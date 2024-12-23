import FirstIcon from "../image/1st.svg";
import SecondIcon from "../image/2st.svg";
import ThirdIcon from "../image/3st.svg";
import { useRanking } from "../api/useRanking";

const Ranking = () => {
  const {
    rankings,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useRanking();

  const defaultTopics = [
    { rank: 1, topic: "Topic 1", count: 30 },
    { rank: 2, topic: "Topic 2", count: 20 },
    { rank: 3, topic: "Topic 3", count: 10 },
  ];

  const getIconForRank = (rank) => {
    switch (rank) {
      case 1:
        return FirstIcon;
      case 2:
        return SecondIcon;
      case 3:
        return ThirdIcon;
      default:
        return null;
    }
  };

  const renderTopics = (topics) => {
    return topics
      .sort((a, b) => a.rank - b.rank)
      .map((topic) => (
        <div key={topic.rank} className={`topic-item rank-${topic.rank}`}>
          <img
            src={getIconForRank(topic.rank)}
            alt={`Rank ${topic.rank}`}
            className="rank-icon"
          />
          <div className="topic-bar" style={{ height: `${topic.count}%` }}>
            <span className="topic-name">{topic.topic}</span>
          </div>
        </div>
      ));
  };

  const renderContent = () => {
    if (rankingsLoading) {
      return <div className="loading">Loading...</div>;
    }

    if (rankingsError) {
      return (
        <div className="error">Error loading rankings: {rankingsError}</div>
      );
    }

    const topicsToRender =
      rankings && rankings.length > 0 ? rankings : defaultTopics;
    return renderTopics(topicsToRender);
  };

  return (
    <div className="right-section top-topics">
      <h3>
        <div className="title-container">실시간 Top Topic</div>
      </h3>
      <div className="section-content">
        <p className="subtitle">현재 이슈가 되고 있는 내용은 무엇일까요?</p>
        <div className="topics-podium">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Ranking;
