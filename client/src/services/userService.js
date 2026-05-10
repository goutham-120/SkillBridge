import api from "./api";

export const getProfile = async () => (await api.get("/users/me")).data;
export const updateProfile = async (payload) => (await api.put("/users/me/profile", payload)).data;
export const updateAvailability = async (availability) =>
  (await api.put("/users/me/availability", { availability })).data;
export const getMatches = async () => (await api.get("/users/matches")).data;
export const getSessionCount = async (otherUserId) =>
  (await api.get(`/users/session-count/${otherUserId}`)).data;
