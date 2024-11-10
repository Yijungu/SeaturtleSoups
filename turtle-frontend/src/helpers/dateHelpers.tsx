import { toKSTISOString } from "../utils/dateUtils";

// helpers/dateHelpers.ts
export const isSameDay = (dateString: string): boolean => {
    if (!dateString) return false;
    
    const targetDate = new Date(dateString).toISOString().split("T")[0]; // Extract YYYY-MM-DD
    const currentDate = toKSTISOString(new Date()); // Current date in YYYY-MM-DD
  
    return targetDate === currentDate;
  };
  