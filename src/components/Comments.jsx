import React from "react";
import { FaUserCircle } from "react-icons/fa";

const Comments = ({ comments }) => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá sản phẩm</h3>
      {comments.length > 0 ? (
        comments.map((comment, index) => (
          <div key={index} className="flex items-start mb-6">
            {/* Avatar mặc định */}
            <FaUserCircle className="text-4xl text-gray-400 mr-4" />

            {/* Nội dung bình luận */}
            <div>
              <div className="flex items-center mb-1">
                <span className="font-semibold text-gray-800">{comment.user}</span>
                <span className="ml-2 text-sm text-gray-500">{new Date(comment.date).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600">{comment.comment}</p>
              <div className="flex items-center mt-2">
                {/* Hiển thị số sao đánh giá */}
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < comment.rating ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600">Chưa có đánh giá nào cho sản phẩm này.</p>
      )}
    </div>
  );
};

export default Comments;