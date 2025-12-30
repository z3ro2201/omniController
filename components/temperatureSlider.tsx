"use client";

import React from "react";
import { cn } from "@/lib/util";

type TemperatureSliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;

  disabled?: boolean;
  onChange?: (value: number) => void;

  className?: string;

  /** 트랙 높이(px 단위 문자열도 가능) */
  height?: number;
};

const TemperatureSlider: React.FC<TemperatureSliderProps> = ({ value, min, max, step = 1, disabled = false, onChange, className, height = 8 }) => {
  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className={cn("w-full appearance-none rounded-full cursor-pointer", disabled ? "opacity-50 cursor-not-allowed" : "", className)}
        style={{
          height,
          background: `linear-gradient(
          to right,
          #2563eb 0%,
          #2563eb ${((value - min) / (max - min)) * 100}%,
          #e5e7eb ${((value - min) / (max - min)) * 100}%,
          #e5e7eb 100%
        )`,
        }}
      />
    </>
  );
};

export default TemperatureSlider;
