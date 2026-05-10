import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/userService";

const splitSkills = (text) =>
  text
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

const mergeSkills = (current, next) => {
  const skills = [...current, ...next];
  const seen = new Set();

  return skills.filter((skill) => {
    const key = skill.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    skillsOffered: [],
    skillsWanted: [],
    availability: [],
  });
  const [offered, setOffered] = useState("");
  const [wanted, setWanted] = useState("");
  const [slot, setSlot] = useState({ day: "Monday", startTime: "09:00", endTime: "10:00" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  const save = async (nextProfile = profile) => {
    try {
      const updated = await updateProfile(nextProfile);
      setProfile(updated);
      setMessage("Profile saved");
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Could not save profile");
    }
  };

  const removeSkill = (type, skill) => {
    const nextProfile = {
      ...profile,
      [type]: profile[type].filter((item) => item.toLowerCase() !== skill.toLowerCase()),
    };
    save(nextProfile);
  };

  const removeSlot = (slotIndex) => {
    const nextProfile = {
      ...profile,
      availability: profile.availability.filter((_, index) => index !== slotIndex),
    };
    save(nextProfile);
  };

  return (
    <section className="page">
      <h2>Profile</h2>
      <div className="form-card">
        <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        <button onClick={() => save()} type="button">Save Profile</button>
        {message && <p className={message === "Profile saved" ? "success" : "error"}>{message}</p>}
      </div>

      <div className="form-card">
        <h3>Skills Offered</h3>
        <div className="row">
          <input value={offered} onChange={(e) => setOffered(e.target.value)} placeholder="Add skill" />
          <button type="button" onClick={() => {
            const skills = splitSkills(offered);
            if (!skills.length) return;
            const nextProfile = { ...profile, skillsOffered: mergeSkills(profile.skillsOffered, skills) };
            save(nextProfile);
            setOffered("");
          }}>Add</button>
        </div>
        <div className="skill-list">
          {profile.skillsOffered.map((skill) => (
            <div className="skill-chip" key={skill}>
              {skill}
              <button type="button" onClick={() => removeSkill("skillsOffered", skill)}>x</button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h3>Skills Wanted</h3>
        <div className="row">
          <input value={wanted} onChange={(e) => setWanted(e.target.value)} placeholder="Add skill" />
          <button type="button" onClick={() => {
            const skills = splitSkills(wanted);
            if (!skills.length) return;
            const nextProfile = { ...profile, skillsWanted: mergeSkills(profile.skillsWanted, skills) };
            save(nextProfile);
            setWanted("");
          }}>Add</button>
        </div>
        <div className="skill-list">
          {profile.skillsWanted.map((skill) => (
            <div className="skill-chip" key={skill}>
              {skill}
              <button type="button" onClick={() => removeSkill("skillsWanted", skill)}>x</button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h3>Availability</h3>
        <div className="row">
          <select value={slot.day} onChange={(e) => setSlot({ ...slot, day: e.target.value })}>
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <input type="time" value={slot.startTime} onChange={(e) => setSlot({ ...slot, startTime: e.target.value })} />
          <input type="time" value={slot.endTime} onChange={(e) => setSlot({ ...slot, endTime: e.target.value })} />
          <button type="button" onClick={() => save({ ...profile, availability: [...profile.availability, slot] })}>Add Slot</button>
        </div>
        {profile.availability.map((a, i) => (
          <div className="slot-row" key={`${a.day}-${a.startTime}-${i}`}>
            <span>{a.day}: {a.startTime} - {a.endTime}</span>
            <button type="button" onClick={() => removeSlot(i)}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProfilePage;
