const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const getOverlappingSlots = (userAAvailability = [], userBAvailability = []) => {
  const overlaps = [];

  for (const a of userAAvailability) {
    for (const b of userBAvailability) {
      if (a.day !== b.day) continue;

      const start = Math.max(toMinutes(a.startTime), toMinutes(b.startTime));
      const end = Math.min(toMinutes(a.endTime), toMinutes(b.endTime));

      if (start < end) {
        overlaps.push({
          day: a.day,
          startTime: `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`,
          endTime: `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`,
        });
      }
    }
  }

  return overlaps;
};

module.exports = { getOverlappingSlots };
