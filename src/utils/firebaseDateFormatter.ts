import { Timestamp } from 'firebase/firestore';

function formatDateFirestore(dateInput: Timestamp | string | Date): string {
  let date: Date;

  // If the input is a Firestore Timestamp, convert to JavaScript Date
  if (dateInput instanceof Timestamp) {
    date = dateInput.toDate();
  } else if (typeof dateInput === 'string' || dateInput instanceof String) {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    console.error('Invalid date input:', dateInput);
    return 'Invalid date';
  }

  // Check if the date is valid
  if (!isNaN(date.getTime())) {
    // Use toLocaleString() with options for 24-hour format
    return date.toLocaleString('en-US', { hour12: false });
  } else {
    console.error('Invalid date:', date);
    return 'Invalid date';
  }
}

export default formatDateFirestore;
