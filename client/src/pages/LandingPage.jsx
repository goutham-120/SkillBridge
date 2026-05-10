import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <section className="page landing-page">
      <div className="landing-hero">
        <div>
          <p className="eyebrow">Peer learning made simple</p>
          <h1>SkillBridge</h1>
          <p>Find people who can teach what you want to learn, share what you know, and schedule sessions without the back-and-forth.</p>
          <div className="row">
            <Link to="/signup" className="btn-link">Get Started</Link>
            <Link to="/login" className="btn-link secondary-link">Login</Link>
          </div>
        </div>
        <div className="landing-panel">
          <h3>How it works</h3>
          <p>Add your skills, match with the right learners, request a session, and review the exchange after it is complete.</p>
        </div>
      </div>
      <div className="landing-strip">
        <span>Skill matching</span>
        <span>Scheduling</span>
        <span>Ratings</span>
        <span>Admin moderation</span>
      </div>
    </section>
  );
}

export default LandingPage;
