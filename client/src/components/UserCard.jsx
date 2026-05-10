function UserCard({ user, onSendRequest }) {
  const ratingLabel = user.ratingCount
    ? `${user.averageRating} / 5 (${user.ratingCount})`
    : "No ratings yet";

  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <p><strong>Rating:</strong> {ratingLabel}</p>
      <p><strong>Matched Skills:</strong> {user.matchedSkills?.join(", ") || "None"}</p>
      <button onClick={() => onSendRequest(user._id)} type="button">Send Request</button>
    </div>
  );
}

export default UserCard;
