import api from "./api";

export const getAllUsers = async () => (await api.get("/admin/users")).data;
export const toggleBan = async (id) => (await api.patch(`/admin/users/${id}/ban-toggle`)).data;
export const getAllReports = async () => (await api.get("/admin/reports")).data;
export const createReport = async (reportedUser, reason) =>
  (await api.post("/reports", { reportedUser, reason })).data;
