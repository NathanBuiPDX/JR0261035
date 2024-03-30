export const extractNumberFromString = (string) => {
  if (!string) return null;
  let arr = string.trim().split(" ");
  if (arr[1] === "MHz") arr[0] /= 1000;
  return parseFloat(arr[0]) || null;
};

export const calculateArrayAvg = (arr) => {
  if (!arr || arr.length === 0) return 0;
  let sum = arr.reduce((sum, num) => sum + num, 0);
  return (sum / arr.length).toFixed(1);
};
