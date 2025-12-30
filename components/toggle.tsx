"use client";

import React, { useId, useState } from "react";
import { cn } from "@/lib/util";

type ToggleSize = "sm" | "md" | "lg";

type ToggleSwitchProps = {
  id?: string;
  label?: React.ReactNode;

  /** controlled */
  checked?: boolean;
  defaultChecked?: boolean;

  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;

  size?: ToggleSize;
};

/**
 * 기준:
 * - lg: height ≈ 100px (터치/IoT 전원용)
 * - md/sm: lg 기준 비율로 자동 축소
 */
const SIZE_MAP = {
  lg: { trackH: 94 },
  md: { trackH: 42 },
  sm: { trackH: 26 },
} as const;

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, label, checked, defaultChecked = false, disabled = false, onChange, className, size = "md" }) => {
  const autoId = useId();
  const inputId = id ?? `toggle-${autoId}`;

  const isControlled = typeof checked === "boolean";
  const [inner, setInner] = useState(defaultChecked);
  const isOn = isControlled ? checked! : inner;

  const trackH = SIZE_MAP[size].trackH;
  const trackW = Math.round(trackH * 1.9); // 가로 비율 (iOS 스타일)
  const padding = Math.max(4, Math.round(trackH * 0.04));
  const thumb = trackH - padding * 2;

  const leftOff = padding;
  const leftOn = trackW - thumb - padding;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    if (!isControlled) setInner(next);
    onChange?.(next);
  };

  return (
    <label htmlFor={inputId} className={cn("inline-flex items-center gap-4 select-none", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer", className)}>
      <input id={inputId} type="checkbox" disabled={disabled} checked={isControlled ? checked : undefined} defaultChecked={!isControlled ? defaultChecked : undefined} onChange={handleChange} className="sr-only" />

      {/* Track */}
      <span
        aria-hidden="true"
        className="relative rounded-full transition-colors duration-200"
        style={{
          width: trackW,
          height: trackH,
          backgroundColor: isOn ? "#2563eb" : "#e5e7eb", // blue-600 / gray-200
        }}
      >
        {/* Thumb */}
        <span
          className="absolute rounded-full bg-white shadow-md transition-transform duration-200 ease-out"
          style={{
            top: padding,
            width: thumb,
            height: thumb,
            transform: `translateX(${isOn ? leftOn : leftOff}px)`,
          }}
        />
      </span>

      {label && (
        <span className="font-medium text-gray-900" style={{ fontSize: Math.max(14, trackH * 0.18) }}>
          {label}
        </span>
      )}
    </label>
  );
};

export default ToggleSwitch;
