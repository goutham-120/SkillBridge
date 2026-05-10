import { useEffect, useState } from "react";
import { getAllUsers, toggleBan, getAllReports } from "../services/adminService";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  const load = async () => {
    const [usersData, reportsData] = await Promise.all([getAllUsers(), getAllReports()]);
    setUsers(usersData);
    setReports(reportsData);
  };

  useEffect(() => {
    Promise.resolve().then(load);
  }, []);

  return (
    <section className="page">
      <h2>Admin Panel</h2>

      <h3>Users</h3>
      <div className="card-grid">
        {users.map((user) => (
          <div key={user._id} className="card">
            <p><strong>{user.name}</strong> ({user.email})</p>
            <p>Role: {user.role}</p>
            <p>Status: {user.isBanned ? "Banned" : "Active"}</p>
            {user.role !== "admin" && (
              <button type="button" onClick={async () => { await toggleBan(user._id); load(); }}>
                {user.isBanned ? "Unban" : "Ban"}
              </button>
            )}
          </div>
        ))}
      </div>

      <h3>Reports</h3>
      <div className="card-grid">
        {reports.map((report) => (
          <div key={report._id} className="card">
            <p><strong>Reported User:</strong> {report.reportedUser?.name}</p>
            <p><strong>Reported By:</strong> {report.reportedBy?.name}</p>
            <p><strong>Reason:</strong> {report.reason}</p>
            {report.reportedUser?._id && (
              <button className="action-ban" type="button" onClick={async () => { await toggleBan(report.reportedUser._id); load(); }}>
                {report.reportedUser.isBanned ? "Unban" : "Ban"}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdminPage;
