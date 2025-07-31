export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Şifre en az 8 karakter olmalıdır.' };
  }
  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (name.trim().length < 2) {
    return { isValid: false, message: 'İsim en az 2 karakter olmalıdır.' };
  }
  return { isValid: true };
};

export const validateTaskTitle = (title: string): { isValid: boolean; message?: string } => {
  if (title.trim().length < 3) {
    return { isValid: false, message: 'Görev başlığı en az 3 karakter olmalıdır.' };
  }
  if (title.trim().length > 255) {
    return { isValid: false, message: 'Görev başlığı en fazla 255 karakter olabilir.' };
  }
  return { isValid: true };
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getRoleDisplayName = (role: 'manager' | 'employee'): string => {
  return role === 'manager' ? 'Yönetici' : 'Çalışan';
};