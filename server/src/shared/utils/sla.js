// SLA (Service Level Agreement) tracking.
// A complaint is considered "Overdue" if it has sat in "Submitted" status
// (no action taken yet) for more than OVERDUE_DAYS.

const OVERDUE_DAYS = 7;

function isComplaintOverdue(complaint) {
  if (complaint.status !== "Submitted") return false;

  const daysSinceSubmitted = (Date.now() - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24);
  return daysSinceSubmitted > OVERDUE_DAYS;
}

module.exports = { isComplaintOverdue, OVERDUE_DAYS };