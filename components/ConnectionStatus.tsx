interface ConnectionStatusProps {
  connected: boolean;
}

export default function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-3 h-3 rounded-full ${
          connected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm">
        {connected ? 'Подключено' : 'Отключено'}
      </span>
    </div>
  );
}
