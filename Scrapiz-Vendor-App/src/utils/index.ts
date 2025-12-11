// Date utilities
export const formatDate = (date: Date) => {
  const today = new Date();
  const targetDate = new Date(date);
  
  if (targetDate.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (targetDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  return targetDate.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Phone number utilities
export const maskPhoneNumber = (phone: string) => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
};

// Currency utilities
export const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Validation utilities
export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};