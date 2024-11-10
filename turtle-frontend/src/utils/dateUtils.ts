export const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  export const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  export const toKSTISOString = (date: Date): string  => {
    const offset = 9 * 60 * 60 * 1000; // KST는 UTC+9
    const kstDate = new Date(date.getTime() + offset);
    return kstDate.toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식 반환
  }

  export const toKSTISOStringFull = (date: Date): string  => {
    const offset = 9 * 60 * 60 * 1000; // KST는 UTC+9
    const kstDate = new Date(date.getTime() + offset);
    return kstDate.toISOString(); // 'YYYY-MM-DD' 형식 반환
  }