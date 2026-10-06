import { AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'warning' | 'success' | 'info' | string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const getIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <XCircle className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-6 h-6 text-amber-500 mr-2 flex-shrink-0" />;
    case 'success':
      return <CheckCircle className="w-6 h-6 text-emerald-500 mr-2 flex-shrink-0" />;
    default:
      return <AlertCircle className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" />;
  }
};

const Alert = ({ type, title, message, action }: AlertProps) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
      <div className="flex items-center mb-3">
        {getIcon(type)}
        <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-emerald-600 font-medium hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  </div>
);

export default Alert;
