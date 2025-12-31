"use client";
import React from "react";
import { cn } from "@/lib/util";

type WindControlProps = {
  value: number; // 부모 상태
  onChange?: (value: number) => void;
  disabled: boolean;
};

const MIN = 1;
const MAX = 3;

const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));

const WindControl: React.FC<WindControlProps> = ({ value, onChange, disabled }) => {
  const updateWind = (next: number) => {
    if (disabled) return;
    onChange?.(clamp(next));
  };

  return (
    <div
      className={cn(
        `
        flex items-center gap-3 rounded-lg px-3 py-2
        bg-neutral-50 border border-neutral-300
        dark:bg-neutral-900 dark:border-neutral-700 justify-center
        `,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <button
        type="button"
        onClick={() => updateWind(value - 1)}
        disabled={disabled || value === MIN}
        className="
          w-8 h-8 rounded-md font-bold
          bg-white text-neutral-700 border border-neutral-300
          hover:bg-neutral-100
          disabled:opacity-40 disabled:cursor-not-allowed
          dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700
          dark:hover:bg-neutral-700
        "
      >
        −
      </button>

      <span className="w-6 text-center font-bold text-neutral-800 dark:text-neutral-100">{value}</span>

      <button
        type="button"
        onClick={() => updateWind(value + 1)}
        disabled={disabled || value === MAX}
        className="
          w-8 h-8 rounded-md font-bold
          bg-white text-neutral-700 border border-neutral-300
          hover:bg-neutral-100
          disabled:opacity-40 disabled:cursor-not-allowed
          dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700
          dark:hover:bg-neutral-700
        "
      >
        +
      </button>
    </div>
  );
};

export default WindControl;
