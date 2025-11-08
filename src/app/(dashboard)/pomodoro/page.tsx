import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';

export default function PomodoroPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gold uppercase tracking-wider">
          Pomodoro Timer
        </h1>
        <p className="mt-2 text-gray-400">
          Mantén tu foco con sesiones de trabajo estructuradas
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <PomodoroTimer />
      </div>

      <div className="card-floating border-gold/30">
        <h3 className="text-sm font-semibold text-gold mb-3 uppercase tracking-wider">
          💡 Consejos para usar el Pomodoro
        </h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">•</span>
            <span>Trabaja en bloques de 25 minutos con foco total</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">•</span>
            <span>Toma descansos cortos de 5 minutos entre sesiones</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">•</span>
            <span>Después de 4 pomodoros, toma un descanso largo de 15 minutos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold mt-0.5">•</span>
            <span>Elimina todas las distracciones durante la sesión</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

