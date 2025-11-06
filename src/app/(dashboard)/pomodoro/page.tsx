import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';

export default function PomodoroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pomodoro Timer</h1>
        <p className="mt-2 text-gray-600">
          Mantén tu foco con sesiones de trabajo estructuradas
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <PomodoroTimer />
      </div>

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          💡 Consejos para usar el Pomodoro
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Trabaja en bloques de 25 minutos con foco total</li>
          <li>• Toma descansos cortos de 5 minutos entre sesiones</li>
          <li>• Después de 4 pomodoros, toma un descanso largo de 15 minutos</li>
          <li>• Elimina todas las distracciones durante la sesión</li>
        </ul>
      </div>
    </div>
  );
}

