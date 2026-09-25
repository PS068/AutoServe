import { Check, Car, Settings, Calendar, CheckCircle } from 'lucide-react';

const STEPS = [
  { label: 'Vehicle', icon: Car },
  { label: 'Service', icon: Settings },
  { label: 'Schedule', icon: Calendar },
  { label: 'Confirm', icon: CheckCircle }
];

export default function BookingStepper({ currentStep }) {
  return (
    <div className="w-full">
      {/* Mobile Step Counter & Label Header (< 640px) */}
      <div className="flex sm:hidden items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-accent text-[#050505] font-mono">
            Step {currentStep}/4
          </span>
          <span className="text-xs font-bold text-white">
            {STEPS[currentStep - 1]?.label} Details
          </span>
        </div>
        <span className="text-[11px] text-gray-400">
          Next: {currentStep < 4 ? STEPS[currentStep]?.label : 'Done'}
        </span>
      </div>

      {/* Stepper Circles & Connecting Lines */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex-1 flex items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-accent text-[#050505]'
                      : isCurrent
                      ? 'bg-accent/20 text-accent border-2 border-accent shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                      : 'bg-white/5 text-gray-600 border border-white/10'
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                </div>
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-medium text-center hidden sm:block ${
                    isCurrent ? 'text-accent font-bold' : isCompleted ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3">
                  <div
                    className={`h-0.5 sm:h-1 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-accent' : 'bg-white/10'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
