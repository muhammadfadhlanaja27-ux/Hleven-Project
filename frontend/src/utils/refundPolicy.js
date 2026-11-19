export const getRefundPolicy = (booking = {}) => {
  const isRefundable = booking.is_refundable !== false;
  const withinCutoff =
    booking.is_within_cutoff === true || booking.refund_block_reason === "cutoff";
  const canRefund =
    typeof booking.can_refund === "boolean"
      ? booking.can_refund
      : isRefundable && !withinCutoff;

  return {
    isRefundable,
    withinCutoff,
    canRefund,
    deadline: booking.refund_deadline || null,
    cutoffHours: booking.refund_cutoff_hours ?? 24,
    blockReason: booking.refund_block_reason || null,
  };
};

export const formatRefundDeadline = (deadline) => {
  if (!deadline) return "-";

  try {
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return deadline;

    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return deadline;
  }
};
