import { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    barColor: 'bg-green-500',
    textColor: 'text-green-800',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircle,
    barColor: 'bg-red-500',
    textColor: 'text-red-800',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  info: {
    icon: AlertCircle,
    barColor: 'bg-blue-500',
    textColor: 'text-blue-800',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
};

const Toast = ({ message, type, isVisible, onClose, duration = 4000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 transition-all duration-300 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`} style={{fontFamily: 'Poppins'}}>
      <div className={`relative flex items-center p-4 rounded-xl shadow-lg overflow-hidden ${config.bgColor}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${config.barColor}`}></div>
        <div className="flex-shrink-0 pl-2">
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <div className="flex-grow px-3">
          <p className={`font-semibold text-sm ${config.textColor}`}>{message}</p>
        </div>
        <div className="flex-shrink-0">
          <button onClick={onClose} className={`p-1.5 rounded-full transition-colors ${config.bgColor} hover:bg-gray-200`}>
            <X className={`w-4 h-4 ${config.textColor}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
