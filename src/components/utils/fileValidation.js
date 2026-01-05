import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

export const validateFile = (file, expectedType) => {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  // Check file type
  if (expectedType === "json" && file.type !== ALLOWED_FILE_TYPES.json) {
    return { valid: false, error: "Please upload a valid JSON file (.json)" };
  }

  if (expectedType === "csv" && file.type !== ALLOWED_FILE_TYPES.csv) {
    return { valid: false, error: "Please upload a valid CSV file (.csv)" };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  return { valid: true };
};

export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    
    reader.readAsText(file);
  });
};

export const parseJSON = (text) => {
  try {
    return { success: true, data: JSON.parse(text) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
