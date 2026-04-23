import { buildApiUrl } from './api';

const API_URL = buildApiUrl('/reviews');

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  rating: number;
  content: string;
  createdAt: string;
  adminReply: string;
  adminReplyAt: string | null;
  adminReplyAuthor: string;
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });
  } catch {
    throw new Error('Không thể kết nối đến máy chủ');
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Yêu cầu thất bại');
  }

  return response.json() as Promise<T>;
};

export const fetchReviews = async (productId: string): Promise<Review[]> => {
  return requestJson<Review[]>(`${API_URL}/${productId}`);
};

export const createReview = async (
  productId: string,
  userId: string,
  rating: number,
  content: string,
): Promise<Review> => {
  return requestJson<Review>(`${API_URL}/${productId}`, {
    method: 'POST',
    body: JSON.stringify({ userId, rating, content }),
  });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await requestJson<{ message: string }>(`${API_URL}/${reviewId}`, {
    method: 'DELETE',
  });
};

export const replyToReview = async (
  reviewId: string,
  adminReply: string,
  adminReplyAuthor: string,
): Promise<Review> => {
  return requestJson<Review>(`${API_URL}/${reviewId}/reply`, {
    method: 'PUT',
    body: JSON.stringify({ adminReply, adminReplyAuthor }),
  });
};
