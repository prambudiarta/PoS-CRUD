function calculateEndTime(startTime: string, duration: any) {
  // Parse the startTime string into a Date object
  const startDate = new Date(startTime);

  // Add one hour to the startTime
  startDate.setHours(startDate.getHours() + Number(duration));

  // Extract and format individual parts of the date and time
  // Using local time getters as startTime is considered to be in local time (GMT+7)
  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, '0'); // +1 because months are 0 indexed
  const day = String(startDate.getDate()).padStart(2, '0');
  const hours = String(startDate.getHours()).padStart(2, '0');
  const minutes = String(startDate.getMinutes()).padStart(2, '0');

  // Combine the parts into the final endTime string
  const endTime = `${year}-${month}-${day} ${hours}:${minutes}`;
  return endTime;
}

export default calculateEndTime;
