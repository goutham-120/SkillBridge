import api from "./api";

export const sendRequest = async (receiver, sessionTopic) =>
  (await api.post("/requests", { receiver, sessionTopic })).data;
export const respondToRequest = async (id, status) =>
  (await api.patch(`/requests/${id}/respond`, { status })).data;
export const getDashboardData = async () => (await api.get("/requests/dashboard")).data;
export const getPendingReviews = async () => (await api.get("/requests/pending-reviews")).data;
export const getOverlaps = async (requestId) => (await api.get(`/requests/${requestId}/overlap`)).data;
export const scheduleRequest = async (requestId, payload) =>
  (await api.patch(`/requests/${requestId}/schedule`, payload)).data;
export const completeRequest = async (requestId) =>
  (await api.patch(`/requests/${requestId}/complete`)).data;
export const rateRequest = async (requestId, stars) =>
  (await api.post(`/requests/${requestId}/rate`, { stars })).data;
export const continueExchange = async (requestId) =>
  (await api.post(`/requests/${requestId}/continue`)).data;
export const dismissPendingReview = async (requestId) =>
  (await api.patch(`/requests/${requestId}/review/dismiss`)).data;
