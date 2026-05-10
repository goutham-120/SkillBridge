import { Link } from "react-router-dom";

function RequestCard({ request, actions = [], showSchedule = false, extra = null }) {
  const oppositeUser = request.sender?.name
    ? `${request.sender.name} -> ${request.receiver?.name || ""}`
    : `${request.receiver?.name || ""}`;
  const statusClass = request.status?.toLowerCase() || "pending";

  return (
    <div className="card">
      <p><strong>User:</strong> {oppositeUser}</p>
      <p><strong>Status:</strong> <span className={`status-badge ${statusClass}`}>{request.status}</span></p>
      {request.sessionTopic && <p><strong>Topic:</strong> {request.sessionTopic}</p>}
      {request.scheduledSlot?.day && (
        <p>
          <strong>Slot:</strong> {request.scheduledSlot.day} {request.scheduledSlot.startTime} - {request.scheduledSlot.endTime}
        </p>
      )}
      {request.meetingLink && (
        <p>
          <strong>Meeting:</strong> <a href={request.meetingLink} target="_blank" rel="noreferrer">Open link</a>
        </p>
      )}
      {extra}
      <div className="row">
        {actions.map((action) => (
          <button className={`action-${action.label.toLowerCase().split(" ")[0]}`} key={action.label} onClick={action.onClick} type="button">{action.label}</button>
        ))}
        {showSchedule && <Link to={`/schedule/${request._id}`} className="btn-link">Schedule</Link>}
      </div>
    </div>
  );
}

export default RequestCard;
