import { useState } from "react";

const useComment = () => {
  const [comments, setComments] = useState([]); // Danh sách bình luận
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái gửi bình luận

  // Fetch bình luận từ API
  const fetchComments = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3001/comments?productId=${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  // Thêm bình luận mới
  const addComment = async (commentData) => {
    setIsSubmitting(true);
    try {
      // Lấy thông tin người dùng từ localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        throw new Error("User not logged in");
      }

      // Chuẩn bị dữ liệu bình luận
      const commentWithAvatar = {
        ...commentData,
        avatar: user.imageUrl || null, // Sử dụng avatar nếu có
      };

      // Gửi bình luận lên API
      const response = await fetch("http://localhost:3001/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentWithAvatar),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prevComments) => [...prevComments, newComment]); // Cập nhật danh sách bình luận
        return true;
      } else {
        console.error("Failed to add comment");
        return false;
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments, // Danh sách bình luận
    isSubmitting, // Trạng thái gửi bình luận
    fetchComments, // Hàm fetch bình luận
    addComment, // Hàm thêm bình luận
  };
};

export default useComment;