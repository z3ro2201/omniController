"use client";
import React from "react";
import { cn } from "@/lib/util";

type TemperatureMode = "COOL" | "HEAT";

type TemperatureModeSelectProps = {
  name: string;
  onChange?: (value: TemperatureMode) => void;
  disabled: boolean;
  value: TemperatureMode;
};

const TemperatureModeSelect: React.FC<TemperatureModeSelectProps> = ({ name, onChange, disabled, value }) => {
  const baseLabel = "cursor-pointer w-full px-5 py-3 text-sm text-center font-bold transition-colors select-none";

  // 선택 안됨 기본: 라이트는 연회색, 다크는 진회색
  const inactive = "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700";

  // disabled: hover 제거 + 더 흐리게 + 커서
  const disabledStyle = "cursor-not-allowed opacity-60 hover:bg-neutral-50 dark:hover:bg-neutral-800";

  return (
    <div
      className={cn(
        // ✅ gap-px 로 버튼 사이 "틈" 느낌
        "flex gap-px rounded-lg overflow-hidden",
        // ✅ gap 색상을 보더처럼 보이게
        "bg-neutral-300 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-700",
        disabled && "opacity-90"
      )}
    >
      {/* COOL */}
      <input type="radio" id={`${name}_COOL`} name={name} value="COOL" checked={value === "COOL"} onChange={(e) => onChange?.(e.target.value as TemperatureMode)} disabled={disabled} className="peer/cool sr-only" />
      <label htmlFor={`${name}_COOL`} className={cn(baseLabel, inactive, "peer-checked/cool:bg-[rgb(80,126,251)] peer-checked/cool:text-white peer-checked/cool:shadow-sm", disabled && disabledStyle)}>
        냉방
      </label>

      {/* HOT */}
      <input type="radio" id={`${name}_HEAT`} name={name} value="HEAT" checked={value === "HEAT"} onChange={(e) => onChange?.(e.target.value as TemperatureMode)} disabled={disabled} className="peer/hot sr-only" />
      <label htmlFor={`${name}_HEAT`} className={cn(baseLabel, inactive, "peer-checked/hot:bg-[rgb(221,81,17)] peer-checked/hot:text-white peer-checked/hot:shadow-sm", disabled && disabledStyle)}>
        난방
      </label>
    </div>
  );
};

export default TemperatureModeSelect;
