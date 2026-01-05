import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { TOAST_DURATION } from "../../components/utils/constants";

const Toast = ({ message, type = "success", show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, TOAST_DURATION);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const config = {
    success: {
      bgColor: "bg-green-600",
      Icon: CheckCircle,
    },
    error: {
      bgColor: "bg-red-600",
      Icon: XCircle,
    },
    warning: {
      bgColor: "bg-yellow-600",
      Icon: AlertCircle,
    },
    info: {
      bgColor: "bg-blue-600",
      Icon: AlertCircle,
    },
  };

  const { bgColor, Icon } = config[type];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
