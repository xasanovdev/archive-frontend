export const formatDate = (date: Date | null): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const timeouts: Record<string, any> = {};

const cTimeout = (key = "key") => {
  if (timeouts[key]) {
    clearTimeout(timeouts[key]);
    timeouts[key] = undefined;
  }
};

export const debounce = (key = "key", fn = () => {}, timeout = 500) => {
  const sTimeout = (key: string, fn: () => void, timeout: number) => {
    cTimeout(key);

    timeouts[key] = setTimeout(() => {
      try {
        fn();
      } catch (e) {}

      timeouts[key] = undefined;
    }, timeout);
  };

  return sTimeout(key, fn, timeout);
};
