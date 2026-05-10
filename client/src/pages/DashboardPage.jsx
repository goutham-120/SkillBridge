import { useEffect, useMemo, useState } from "react";
import UserCard from "../components/UserCard";
import RequestCard from "../components/RequestCard";
import { getMatches } from "../services/userService";
import {
  sendRequest,
  respondToRequest,
  getDashboardData,
  getPendingReviews,
  completeRequest,
  rateRequest,
  continueExchange,
  dismissPendingReview,
} from "../services/requestService";
import { createReport } from "../services/adminService";

function DashboardSection({ title, count, emptyText, children }) {
  return (
    <div className="dashboard-section">
      <div className="section-title">
        <h3>{title}</h3>
        <span>{count}</span>
      </div>
      {count ? <div className="card-grid">{children}</div> : <p className="empty">{emptyText}</p>}
    </div>
  );
}

function ReviewActions({ request, onDone }) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [myRating, setMyRating] = useState(request.myRating);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const otherUser = request.sender?._id === currentUser.id ? request.receiver : request.sender;

  const rate = async (stars) => {
    try {
      await rateRequest(request._id, stars);
      setMyRating(stars);
      setMessage("");
      await onDone();
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Could not save rating");
    }
  };

  const report = async () => {
    if (!reason.trim()) return setMessage("Add a reason");
    await createReport(otherUser?._id, reason.trim());
    setReason("");
    setMessage("Report sent");
  };

  return (
    <>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} disabled={Boolean(myRating)} onClick={() => rate(n)} type="button">{n}</button>
        ))}
      </div>
      {myRating && <p className="success">Rated {myRating} out of 5</p>}
      <div className="report-row">
        <input placeholder={`Report ${otherUser?.name || "user"}`} value={reason} onChange={(e) => setReason(e.target.value)} />
        <button className="action-report" onClick={report} type="button">Report</button>
      </div>
      {message && <p className={message === "Report sent" ? "success" : "error"}>{message}</p>}
    </>
  );
}

function DashboardPage() {
  const [matches, setMatches] = useState([]);
  const [dashboard, setDashboard] = useState({ incoming: [], sent: [], active: [], scheduled: [] });
  const [pendingReviews, setPendingReviews] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [matchFilter, setMatchFilter] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const loadData = async () => {
    const [matchData, dashboardData, reviewsData] = await Promise.all([
      getMatches(),
      getDashboardData(),
      getPendingReviews(),
    ]);
    setMatches(matchData);
    setDashboard(dashboardData);
    setPendingReviews(reviewsData);
  };

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, []);

  const handleSendRequest = async (receiverId) => {
    try {
      await sendRequest(receiverId, topicInput);
      setTopicInput("");
      setRequestMessage("Request sent");
      loadData();
    } catch (error) {
      setRequestMessage(error.response?.data?.message || error.message || "Could not send request");
    }
  };

  const filteredMatches = useMemo(() => {
    const filter = matchFilter.trim().toLowerCase();
    if (!filter) return matches;

    return matches.filter((user) => {
      const searchable = [
        user.name,
        user.email,
        ...(user.matchedSkills || []),
        ...(user.skillsOffered || []),
      ].join(" ").toLowerCase();

      return searchable.includes(filter);
    });
  }, [matchFilter, matches]);

  return (
    <section className="page dashboard-page">
      <div className="dashboard-hero">
        <div>
          <h2>Dashboard</h2>
          <p>Find matches, manage requests, and schedule your sessions.</p>
        </div>
        <div className="stats">
          <div><strong>{matches.length}</strong><span>Matches</span></div>
          <div><strong>{dashboard.incoming.length}</strong><span>Incoming</span></div>
          <div><strong>{dashboard.scheduled.length}</strong><span>Scheduled</span></div>
        </div>
      </div>

      <div className="topic-box">
        <label htmlFor="topic">Topic for new requests</label>
        <input
          id="topic"
          placeholder="Example: React basics"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
        />
        {requestMessage && (
          <p className={requestMessage === "Request sent" ? "success" : "error"}>{requestMessage}</p>
        )}
      </div>

      <div className="topic-box">
        <label htmlFor="match-filter">Filter matches</label>
        <input
          id="match-filter"
          placeholder="Search by name, email, or skill"
          value={matchFilter}
          onChange={(e) => setMatchFilter(e.target.value)}
        />
      </div>

      <DashboardSection title="Pending Reviews" count={pendingReviews.length} emptyText="No reviews waiting.">
        {pendingReviews.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            extra={<ReviewActions request={request} onDone={loadData} />}
            actions={[
              { label: "Continue Exchange", onClick: async () => { await continueExchange(request._id); loadData(); } },
              { label: "x", onClick: async () => { await dismissPendingReview(request._id); loadData(); } },
            ]}
          />
        ))}
      </DashboardSection>

      <DashboardSection title="Matched Users" count={filteredMatches.length} emptyText={matches.length ? "No matches fit this filter." : "No matches yet. Add skills in your profile."}>
        {filteredMatches.map((user) => <UserCard key={user._id} user={user} onSendRequest={handleSendRequest} />)}
      </DashboardSection>

      <DashboardSection title="Incoming Requests" count={dashboard.incoming.length} emptyText="No incoming requests.">
        {dashboard.incoming.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            actions={[
              { label: "Accept", onClick: async () => { await respondToRequest(request._id, "Accepted"); loadData(); } },
              { label: "Reject", onClick: async () => { await respondToRequest(request._id, "Rejected"); loadData(); } },
            ]}
          />
        ))}
      </DashboardSection>

      <DashboardSection title="Sent Requests" count={dashboard.sent.length} emptyText="You have not sent any requests.">
        {dashboard.sent.map((request) => <RequestCard key={request._id} request={request} />)}
      </DashboardSection>

      <DashboardSection title="Active Exchanges" count={dashboard.active.length} emptyText="No active exchanges right now.">
        {dashboard.active.map((request) => (
          <RequestCard key={request._id} request={request} showSchedule={request.status === "Accepted"} />
        ))}
      </DashboardSection>

      <DashboardSection title="Scheduled Sessions" count={dashboard.scheduled.length} emptyText="No sessions scheduled yet.">
        {dashboard.scheduled.map((request) => (
          <RequestCard
            key={request._id}
            request={request}
            actions={[{ label: "Mark Completed", onClick: async () => { await completeRequest(request._id); loadData(); } }]}
          />
        ))}
      </DashboardSection>
    </section>
  );
}

export default DashboardPage;
