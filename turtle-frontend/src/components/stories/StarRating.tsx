// StarRating.tsx
import React from 'react';
import styles from '@/styles/stories/StarRating.module.scss';

type StarRatingProps = {
  rating: number;
};

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
      stars.push(
        <div className={styles.star} key={i}>
          <div
            className={styles.starFilled}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      );
    }
    return <div className={styles.ratingStars}>{stars}</div>;
  };

  return renderStars();
};

export default StarRating;
