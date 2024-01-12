export function formatTimeDifference(startDate: number, endDate: number) {
  // Calculate the difference in milliseconds
  const timeDifference = endDate - startDate;

  // Convert the difference to seconds, minutes, and hours
  const seconds = Math.floor(timeDifference / 1000) % 60;
  const minutes = Math.floor(timeDifference / (1000 * 60)) % 60;
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));

  // Construct a legible string
  const formattedDifference = `${hours > 0 ? `${hours} hours, ` : ''}${
    minutes > 0 ? `${minutes} minutes, ` : ''
  }${seconds > 0 ? `${seconds} seconds` : ''}`;

  return formattedDifference;
}
