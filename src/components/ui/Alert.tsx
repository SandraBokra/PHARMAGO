import { AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AlertProps {
  type: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Alert = ({ title, message, action }: AlertProps) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-4 shadow-lg max-w-md w-full">
      <h3 className="font-semibold mb-2">{title}</h3>
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
