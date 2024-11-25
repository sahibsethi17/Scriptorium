import React from "react";

interface RatingsProps {
  upvotes: number;
  downvotes: number;
  userUpvoted: boolean;
  userDownvoted: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
}

const Ratings: React.FC<RatingsProps> = ({
  upvotes,
  downvotes,
  userUpvoted,
  userDownvoted,
  onUpvote,
  onDownvote,
}) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center cursor-pointer transition-all duration-300 p-2 rounded-md ${
          userUpvoted ? "bg-green-100" : "hover:bg-green-100"
        }`}
        onClick={onUpvote}
      >
        <img
          src="https://www.svgrepo.com/show/21106/thumbs-up.svg"
          alt="thumbs-up"
          className="w-6 h-6"
        />
        <span className="ml-2 text-lg font-semibold text-green-600">
          {upvotes}
        </span>
      </div>

      <div
        className={`flex items-center cursor-pointer transition-all duration-300 p-2 rounded-md ${
          userDownvoted ? "bg-red-100" : "hover:bg-red-100"
        }`}
        onClick={onDownvote}
      >
        <img
          src="https://www.svgrepo.com/show/56144/thumb-down.svg"
          alt="thumbs-down"
          className="w-6 h-6"
        />
        <span className="ml-2 text-lg font-semibold text-red-600">
          {downvotes}
        </span>
      </div>
    </div>
  );
};

export default Ratings;
