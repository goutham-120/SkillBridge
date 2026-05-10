import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const logout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to={user?.role === "admin" ? "/admin" : user ? "/dashboard" : "/"} className="brand">
        SkillBridge
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            {user.role === "admin" ? (
              <Link to="/admin">Admin Panel</Link>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/profile">Profile</Link>
              </>
            )}
            <button className="logout" onClick={logout} type="button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
