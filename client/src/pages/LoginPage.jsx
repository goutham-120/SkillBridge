import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

function LoginPage({ onAuthSuccess }) {
  const [form, setForm] = useState({ email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      onAuthSuccess(data);
      navigate(form.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="page auth-page">
      <h2>Login</h2>
      <form className="form-card" onSubmit={submit}>
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="user">Login as user</option>
          <option value="admin">Login as admin</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
        <p>New here? <Link to="/signup">Signup</Link></p>
      </form>
    </section>
  );
}

export default LoginPage;
