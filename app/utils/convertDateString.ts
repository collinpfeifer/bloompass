export function convertDateString(dateString: string): {
  dayOfWeek: string;
  day: number;
  month: string;
  year: number;
  time: string;
} {
  const date = new Date(dateString);

  // Step 1: Extract the day of the week
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];

  // Step 2: Extract the day, month, and year
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  // Step 3: Extract the time
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    dayOfWeek,
    day,
    month,
    year,
    time,
  };
}
