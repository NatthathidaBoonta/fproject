import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
export const API_BASE_URL = API_URL.replace('/api', '');

// สร้าง axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id;
  } catch {
    return undefined;
  }
};

// ล็อกอิน
export const login = async (credentials: any) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// ดึงข้อมูล users ทั้งหมด
export const getUsers = async (search = '') => {
  try {
    const url = search ? `/users?search=${search}` : '/users';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// สร้าง user ใหม่
export const createUser = async (userData: any) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// อัพเดท user
export const updateUser = async (id: number, userData: any) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// ลบ user
export const deleteUser = async (id: number) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ส่งข้อความ
export const sendMessage = async (message: string) => {
  try {
    const response = await api.post('/message', { message });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// ดึงข้อความทั้งหมด
export const getMessages = async () => {
  try {
    const response = await api.get('/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// ดึงคำร้องขอจบทั้งหมด (พร้อมข้อมูลนักศึกษา)
export const getRequests = async (params?: { step?: string; studentId?: string; submittedOnly?: boolean }) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.get('/requests', {
      params: {
        ...(params || {}),
        userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

export const createRequest = async (payload: { studentId: string; academicYear: string; semester: string }) => {
  try {
    const response = await api.post('/requests', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

export const submitRequestForReview = async (requestId: string, userId: string) => {
  try {
    const response = await api.post(`/requests/${requestId}/submit`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error submitting request for review:', error);
    throw error;
  }
};

export const getRequestById = async (requestId: string) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/requests/${requestId}`, {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching request detail:', error);
    throw error;
  }
};

// อัปเดตสถานะรายแผนก
export const updateRequestStep = async (requestId: string, payload: any) => {
  try {
    const response = await api.patch(`/requests/${requestId}/step`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating request step:', error);
    throw error;
  }
};

// อัปเดตสถานะแบบกลุ่มรายแผนก
export const updateRequestStepBatch = async (payload: { ids: string[]; step: string; status: string; comment?: string; userId: string }) => {
  try {
    const response = await api.patch('/requests/batch/step', payload);
    return response.data;
  } catch (error) {
    console.error('Error updating request step batch:', error);
    throw error;
  }
};


export const uploadRequestDocument = async (
  requestId: string,
  file: File,
  userId?: string,
  documentType?: 'general' | 'internship_receipt'
) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
      formData.append('userId', userId);
    }
    if (documentType) {
      formData.append('documentType', documentType);
    }

    const response = await api.post(`/requests/${requestId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading request document:', error);
    throw error;
  }
};

// ดึงการแจ้งเตือนทั้งหมด
export const getNotifications = async (userId: string) => {
  try {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// อัพเดตการแจ้งเตือนว่าอ่านแล้ว
export const markNotificationAsRead = async (id: string) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// อัพเดตการแจ้งเตือนทั้งหมดของนักศึกษา/ผู้ใช้ว่าอ่านแล้ว
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const response = await api.patch(`/notifications/user/${userId}/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export default api;

