import React from "react";
import { UploadCloud, Download } from "lucide-react";

const UploadCard = ({
  title,
  description,
  Icon,
  iconColor,
  buttonText,
  buttonColor,
  onUpload,
  onDownloadTemplate,
  accept,
  disabled = false,
  inputId,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 border-2 border-dashed ${
        disabled
          ? "border-gray-300 opacity-60"
          : "border-gray-300 hover:border-blue-400 transition-colors"
      }`}
    >
      <div className="text-center">
        <Icon className={`w-12 h-12 ${iconColor} mx-auto mb-4`} />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        {!disabled && (
          <>
            <input
              type="file"
              accept={accept}
              onChange={onUpload}
              className="hidden"
              id={inputId}
              disabled={disabled}
            />

            <label
              htmlFor={inputId}
              className={`inline-flex items-center gap-2 px-4 py-2 ${buttonColor} text-white rounded-lg hover:opacity-90 cursor-pointer transition-opacity`}
            >
              <UploadCloud className="w-4 h-4" />
              {buttonText}
            </label>

            {onDownloadTemplate && (
              <div className="mt-4">
                <button
                  onClick={onDownloadTemplate}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mx-auto"
                >
                  <Download className="w-3 h-3" />
                  Download Template
                </button>
              </div>
            )}
          </>
        )}

        {disabled && (
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
          >
            <UploadCloud className="w-4 h-4" />
            Not Available
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadCard;
