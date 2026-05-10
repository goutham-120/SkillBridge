import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <section className="page center-page">
      <h1>SkillBridge</h1>
      <p>Connect with others, exchange skills, and schedule learning sessions.</p>
      <div className="row">
        <Link to="/login" className="btn-link">Login</Link>
        <Link to="/signup" className="btn-link">Signup</Link>
      </div>
    </section>
  );
}

export default LandingPage;
