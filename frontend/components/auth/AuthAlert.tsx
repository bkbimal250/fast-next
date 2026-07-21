'use client';

type AuthAlertProps = {
  type: 'error' | 'success';
  children: React.ReactNode;
};

export default function AuthAlert({ type, children }: AuthAlertProps) {
  const classes =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-green-200 bg-green-50 text-green-700';

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${classes}`}>
      {children}
    </div>
  );
}
