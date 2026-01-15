/**
 * Utility functions for formatting dates, currency, and booking data
 */

export const formatCurrency = (amount, currency = "USD") => {
  if (!amount) return "N/A";
  
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  } catch (err) {
    return `${amount} ${currency}`;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch (err) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (err) {
    return dateString;
  }
};

export const getStatusColor = (status) => {
  const colors = {
    draft: "gray",
    pending_payment: "amber",
    paid: "green",
    confirmed: "green",
    failed: "red",
    cancelled: "gray",
  };
  return colors[status] || "gray";
};

export const getStatusLabel = (status) => {
  const labels = {
    draft: "Draft",
    pending_payment: "Pending Payment",
    paid: "Paid",
    confirmed: "Confirmed",
    failed: "Failed",
    cancelled: "Cancelled",
  };
  return labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatPartySize = (size) => {
  if (!size || size === 0) return "N/A";
  return `${size} ${size === 1 ? "person" : "people"}`;
};

export const formatDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "N/A";
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  } catch (err) {
    return "N/A";
  }
};

// Export for Badge component compatibility
export const getStatusVariant = (status) => {
  switch (status) {
    case "paid":
    case "confirmed":
      return "success";
    case "pending_payment":
    case "pending":
      return "warning";
    case "cancelled":
    case "failed":
      return "danger";
    case "draft":
    default:
      return "secondary";
  }
};
