"use client";

import React, { useId, useMemo, useState } from "react";
import { cn } from "@/lib/util";

type CheckRadioProps = {
  id?: string;
  name?: string;
  label?: React.ReactNode;
  value?: string;
  type?: "radio" | "checkbox";
  disabled?: boolean;

  /** controlled */
  checked?: boolean;

  /** uncontrolled */
  defaultChecked?: boolean;

  onChange?: (value: string | null, checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  boxClassName?: string;
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="none">
    <path d="M13.2 4.8L6.7 11.3 3 7.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckRadio: React.FC<CheckRadioProps> = ({ id, name, label, value = "", type = "radio", disabled = false, checked, defaultChecked = false, onChange, className, boxClassName }) => {
  const autoId = useId();
  const inputId = id ?? `cr-${autoId}`;

  const isControlled = typeof checked === "boolean";
  const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(defaultChecked);

  const isOn = useMemo(() => (isControlled ? (checked as boolean) : uncontrolledChecked), [isControlled, checked, uncontrolledChecked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;

    // radio는 체크될 때만 의미 있음 (해제 이벤트 무시)
    if (type === "radio" && !next) return;

    if (!isControlled) setUncontrolledChecked(next);
    onChange?.(next ? value : null, next, e);
  };

  return (
    <label htmlFor={inputId} className={cn("inline-flex items-center gap-2 select-none", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer", className)}>
      <input id={inputId} type={type} name={name} value={value} disabled={disabled} checked={isControlled ? checked : undefined} defaultChecked={!isControlled ? defaultChecked : undefined} onChange={handleChange} className="absolute opacity-0 w-0 h-0" />

      {/* 표시 박스 */}
      <span
        aria-hidden="true"
        className={cn(
          "relative flex items-center justify-center w-4 h-4 border rounded-xs",
          // ✅ 토큰 + fallback
          isOn ? "bg-brand-primary bg-blue-600 border-brand-primary border-blue-600" : "bg-neutral-secondary-medium bg-gray-200 border-default-medium border-gray-400",
          "transition-colors duration-150 ease-out",
          boxClassName
        )}
      >
        {/* ✅ 아이콘은 항상 렌더링(꿀렁 없음), opacity만 state로 토글 */}
        <CheckIcon className={cn("w-3.5 h-3.5 text-white", "transition-opacity duration-100 ease-out", isOn ? "opacity-100" : "opacity-0")} />
      </span>

      {label != null && <span className="text-sm font-medium text-heading">{label}</span>}
    </label>
  );
};

export default CheckRadio;
