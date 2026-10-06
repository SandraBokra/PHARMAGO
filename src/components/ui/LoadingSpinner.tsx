interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner = ({ fullScreen = true }: LoadingSpinnerProps) => (
  <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : 'py-8'}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" />
  </div>
);

export default LoadingSpinner;
