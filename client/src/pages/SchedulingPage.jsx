import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getOverlaps, scheduleRequest } from "../services/requestService";

function SchedulingPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [overlaps, setOverlaps] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionTopic, setSessionTopic] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getOverlaps(requestId).then((data) => {
      setOverlaps(data.overlaps);
      setMessage(data.message);
    });
  }, [requestId]);

  const submit = async () => {
    if (!selectedSlot) return;
    await scheduleRequest(requestId, { selectedSlot, sessionTopic, meetingLink });
    navigate("/dashboard");
  };

  return (
    <section className="page">
      <h2>Scheduling</h2>
      {!overlaps.length ? (
        <div className="form-card">
          <p>{message || "No common slots found"}</p>
          <Link to="/profile" className="btn-link">Update Availability</Link>
        </div>
      ) : (
        <div className="form-card">
          <h3>Common Slots</h3>
          {overlaps.map((slot, idx) => (
            <button
              className={selectedSlot === slot ? "selected-slot" : ""}
              key={`${slot.day}-${idx}`}
              type="button"
              onClick={() => setSelectedSlot(slot)}
            >
              {slot.day} - {slot.startTime} to {slot.endTime}
            </button>
          ))}
          <input placeholder="Session topic" value={sessionTopic} onChange={(e) => setSessionTopic(e.target.value)} />
          <input placeholder="Google Meet link" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
          <button type="button" onClick={submit}>Schedule Session</button>
        </div>
      )}
    </section>
  );
}

export default SchedulingPage;
