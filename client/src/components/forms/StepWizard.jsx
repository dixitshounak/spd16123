import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import Button from "../ui/Button";

const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center gap-0 mb-8">
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        <div className="flex flex-col items-center gap-1.5">
          <motion.div
            animate={{
              backgroundColor: index < currentStep ? "#0D9488" : index === currentStep ? "#0D9488" : "#e2e8f0",
              scale: index === currentStep ? 1.1 : 1,
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            style={{ color: index <= currentStep ? "white" : "#94a3b8" }}
          >
            {index < currentStep ? <Check size={16} /> : index + 1}
          </motion.div>
          <span className={`text-xs font-medium hidden sm:block whitespace-nowrap transition-colors ${
            index === currentStep ? "text-accent" : index < currentStep ? "text-success" : "text-muted"
          }`}>
            {step.title}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${index < currentStep ? "bg-accent" : "bg-border"}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const InterestPicker = ({ selected, onChange }) => {
  const interests = [
    { id: "adventure", label: "Adventure", emoji: "🏔️" },
    { id: "food", label: "Food & Cuisine", emoji: "🍜" },
    { id: "history", label: "History", emoji: "🏛️" },
    { id: "nature", label: "Nature", emoji: "🌿" },
    { id: "shopping", label: "Shopping", emoji: "🛍️" },
    { id: "nightlife", label: "Nightlife", emoji: "🎉" },
    { id: "wellness", label: "Wellness", emoji: "🧘" },
    { id: "photography", label: "Photography", emoji: "📸" },
    { id: "religious", label: "Religious Sites", emoji: "🕌" },
    { id: "art", label: "Art & Museums", emoji: "🎨" },
    { id: "beach", label: "Beach", emoji: "🏖️" },
    { id: "wildlife", label: "Wildlife", emoji: "🦁" },
  ];

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {interests.map((item) => (
        <motion.button
          key={item.id}
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => toggle(item.id)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left transition-all font-medium text-sm ${
            selected.includes(item.id)
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-white text-primary-lighter hover:border-accent/50 hover:bg-slate-50"
          }`}
        >
          <span className="text-xl flex-shrink-0">{item.emoji}</span>
          <span>{item.label}</span>
          {selected.includes(item.id) && (
            <Check size={14} className="ml-auto text-accent flex-shrink-0" />
          )}
        </motion.button>
      ))}
    </div>
  );
};

const StepWizard = ({ steps, currentStep, onNext, onPrev, onSubmit, loading }) => {
  const direction = useRef(1);
  const [slideDir, setSlideDir] = useState(1);

  const handleNext = () => {
    direction.current = 1;
    setSlideDir(1);
    onNext();
  };
  const handlePrev = () => {
    direction.current = -1;
    setSlideDir(-1);
    onPrev();
  };

  const isLast = currentStep === steps.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={currentStep}
            custom={slideDir}
            initial={{ x: slideDir * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDir * -60, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="card p-6 md:p-8">
              <h2 className="text-2xl font-bold text-primary mb-1">{steps[currentStep].title}</h2>
              {steps[currentStep].subtitle && (
                <p className="text-muted text-sm mb-6">{steps[currentStep].subtitle}</p>
              )}
              {steps[currentStep].component}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentStep === 0}
          leftIcon={<ChevronLeft size={16} />}
        >
          Back
        </Button>

        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep ? "w-6 bg-accent" : i < currentStep ? "w-3 bg-accent/40" : "w-3 bg-border"
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <Button
            variant="highlight"
            size="lg"
            onClick={onSubmit}
            loading={loading}
          >
            ✈️ Generate My Trip
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
            rightIcon={<ChevronRight size={16} />}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export { StepIndicator, InterestPicker };
export default StepWizard;
