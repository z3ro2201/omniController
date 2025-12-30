"use client";

import { useState } from "react";
import CircularGauge from "@/components/circularGuage";
import CheckRadio from "@/components/checkRadio";
import ToggleSwitch from "@/components/toggle";
import TemperatureSlider from "@/components/temperatureSlider";
import TemperatureModeSelect from "@/components/temperatureSelect";
import WindControl from "@/components/windControl";

const TEMP_CONFIG = {
  COOL: { min: 20, max: 24, color: "#2b7fff" },
  HOT: { min: 20, max: 24, color: "#df592a" },
} as const;

type TemperatureMode = keyof typeof TEMP_CONFIG;

const circleSize = 200;

const OmniAirConditionerControlPage = () => {
  const [officeTemperature, setOfficeTemperature] = useState<number>(TEMP_CONFIG.COOL.min);
  const [diningTemperature, setDiningTemperature] = useState<number>(TEMP_CONFIG.COOL.min);
  const [officeTemperatureMode, setOfficeTemperatureMode] = useState<TemperatureMode>("COOL");
  const [diningTemperatureMode, setDiningTemperatureMode] = useState<TemperatureMode>("COOL");

  const [officePowerOn, setOfficePowerOn] = useState(false);
  const [diningPowerOn, setDiningPowerOn] = useState(false);

  return (
    <>
      {/* 사무실 */}
      <section className="p-4">
        <h1>사무실 운전현황</h1>

        <div className="flex gap-2 items-center">
          <div style={{ width: circleSize, height: circleSize }}>
            <CircularGauge value={officeTemperature} size={circleSize} color={TEMP_CONFIG[officeTemperatureMode].color} max={TEMP_CONFIG[officeTemperatureMode].max} label={officePowerOn ? "작동 중" : "전원 꺼짐"} />
          </div>
          <div className="flex gap-2 flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <h4 className="mb-2 font-bold">전원</h4>
                <ToggleSwitch
                  checked={officePowerOn}
                  size="md"
                  onChange={(checked) => {
                    setOfficePowerOn(checked);
                    if (!checked) {
                      setOfficeTemperature(TEMP_CONFIG.COOL.min);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <h4 className="mb-2 font-bold">모드</h4>
                <TemperatureModeSelect name="officeTemperatureSelectButton" disabled={!officePowerOn} onChange={(v) => setOfficeTemperatureMode(v)} value={officeTemperatureMode} />
              </div>
            </div>
            <div className="w-full">
              <h4 className="mb-2 font-bold">바람세기</h4>
              <WindControl disabled={!officePowerOn} />
            </div>
            <div className="w-full">
              <h4 className="mb-2 font-bold">온도</h4>
              <TemperatureSlider min={TEMP_CONFIG.COOL.min} max={TEMP_CONFIG.COOL.max} value={officeTemperature} onChange={setOfficeTemperature} disabled={!officePowerOn} />
            </div>
          </div>
        </div>
      </section>

      {/* 홀 */}
      <section className="p-4">
        <h1>홀 운전현황</h1>

        <div className="flex gap-2 items-center">
          <div style={{ width: circleSize, height: circleSize }}>
            <CircularGauge value={diningTemperature} size={circleSize} color={TEMP_CONFIG[diningTemperatureMode].color} max={TEMP_CONFIG[diningTemperatureMode].max} label={diningPowerOn ? "작동 중" : "전원 꺼짐"} />
          </div>
          <div className="flex gap-2 flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <h4 className="mb-2 font-bold">전원</h4>
                <ToggleSwitch
                  checked={diningPowerOn}
                  size="md"
                  onChange={(checked) => {
                    setDiningPowerOn(checked);
                    if (!checked) {
                      setDiningTemperature(TEMP_CONFIG.COOL.min);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <h4 className="mb-2 font-bold">모드</h4>
                <TemperatureModeSelect name="diningTemperatureSelectButton" disabled={!diningPowerOn} onChange={(v) => setDiningTemperatureMode(v)} value={diningTemperatureMode} />
              </div>
            </div>
            <div className="w-full">
              <h4 className="mb-2 font-bold">바람세기</h4>
              <WindControl disabled={!diningPowerOn} />
            </div>
            <div className="w-full">
              <h4 className="mb-2 font-bold">온도</h4>
              <TemperatureSlider min={TEMP_CONFIG.COOL.min} max={TEMP_CONFIG.COOL.max} value={diningTemperature} onChange={setDiningTemperature} disabled={!diningPowerOn} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OmniAirConditionerControlPage;
