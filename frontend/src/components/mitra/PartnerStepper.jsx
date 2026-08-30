import React from "react";

const PartnerStepper = ({ currentStep, steps }) => {
  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="font-label-sm text-[12px] font-semibold tracking-wider text-[#444842]">
          Langkah {currentStep} dari {totalSteps}
        </span>
        <span className="font-label-sm text-[12px] font-bold tracking-wider text-[#50604d]">
          {steps[currentStep - 1]}
        </span>
      </div>
      <div className="h-2 w-full bg-[#e5e2dd] rounded-full overflow-hidden flex">
        {steps.map((_, idx) => {
          const stepProgress = idx + 1;
          let bgClass = "bg-[#e5e2dd]";
          if (stepProgress < currentStep) bgClass = "bg-[#baccb4]";
          if (stepProgress === currentStep) bgClass = "bg-[#50604d]";
          return (
            <div
              key={idx}
              className={`h-full flex-1 ${bgClass} ${
                idx + 1 === currentStep ? "rounded-r-full" : ""
              } ${idx === 0 && stepProgress <= currentStep ? "rounded-l-full" : ""}`}
              style={{ width: `${100 / totalSteps}%` }}
            />
          );
        })}
      </div>
      <div className="mt-4 hidden md:flex justify-between">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;
          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-label-sm text-[12px] font-bold border-2 transition-colors ${
                  isDone
                    ? "bg-[#50604d] border-[#50604d] text-white"
                    : isActive
                    ? "bg-[#50604d] border-[#50604d] text-white shadow-md"
                    : "bg-white border-[#c4c8bf] text-[#747871]"
                }`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`font-label-sm text-[10px] font-semibold tracking-wider uppercase text-center max-w-[100px] ${
                  isActive
                    ? "text-[#50604d]"
                    : isDone
                    ? "text-[#444842]"
                    : "text-[#747871]"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerStepper;
