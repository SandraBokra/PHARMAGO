import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: ReactNode;
}

const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm',
        {
          'bg-emerald-600 hover:bg-emerald-700 text-white': variant === 'primary',
          'bg-gray-100 hover:bg-gray-200 text-gray-800': variant === 'secondary',
          'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50': variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
