interface ErrorAlertProps {
  error: string | null;
}

export default function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm font-medium">Ошибка: {error}</p>
        </div>
      </div>
    </div>
  );
}
