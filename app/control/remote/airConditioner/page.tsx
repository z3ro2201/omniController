"use client";

import { useEffect, useState } from "react";
import CircularGauge from "@/components/circularGuage";
import ToggleSwitch from "@/components/toggle";
import TemperatureSlider from "@/components/temperatureSlider";
import TemperatureModeSelect from "@/components/temperatureSelect";
import WindControl from "@/components/windControl";

const TEMP_CONFIG = {
  COOL: { min: 20, max: 24, color: "#2b7fff" },
  HEAT: { min: 20, max: 24, color: "#df592a" },
} as const;

type TemperatureMode = keyof typeof TEMP_CONFIG;

const circleSize = 200;

const ALLOW_DEVICE_ALIAS = ["사무실", "홀"];

const OmniAirConditionerControlPage = () => {
  const [deviceList, setDeviceList] = useState<null | any>(null);
  const [officeTemperature, setOfficeTemperature] = useState<number>(TEMP_CONFIG.COOL.min);
  const [diningTemperature, setDiningTemperature] = useState<number>(TEMP_CONFIG.COOL.min);
  const [officeTemperatureMode, setOfficeTemperatureMode] = useState<TemperatureMode>("COOL");
  const [diningTemperatureMode, setDiningTemperatureMode] = useState<TemperatureMode>("COOL");

  const [officePowerOn, setOfficePowerOn] = useState(false);
  const [diningPowerOn, setDiningPowerOn] = useState(false);

  // 제품 목록 조회
  const getDevicesList = async () => {
    try {
      const res = await fetch("/api/thinq/devices", {
        headers: {
          "x-message-id": "fNvdZ1brTn-wWKUlWGoSVw",
          "x-client-id": "test-client-123456",
          "x-api-key": "v6GFvkweNo7DK7yD3ylIZ9w52aKBU0eJ7wLXkSR3",
        },
      });

      const json = await res.json();

      const device = json?.resultData?.response?.filter((item: any) => item?.deviceInfo?.deviceType === "DEVICE_AIR_CONDITIONER");

      setDeviceList(device);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDevicesList();
  }, []);

  // 제품 상태 조회
  const getDeviceState = async (deviceId: string, aliasName: string) => {
    if (!deviceId) return;
    try {
      const res = await fetch(`/api/thinq/devices/${deviceId}/state`, {
        headers: {
          "x-message-id": "fNvdZ1brTn-wWKUlWGoSVw",
          "x-client-id": "test-client-123456",
          "x-api-key": "v6GFvkweNo7DK7yD3ylIZ9w52aKBU0eJ7wLXkSR3",
        },
      });

      const json = await res.json();

      const { resultCode = 0, resultData = {}, resultMessage = null } = json;
      const { response = {} } = resultData;
      if (aliasName === "홀") {
        setDiningPowerOn(response?.powerSave?.powerSaveEnabled);
        setDiningTemperature(response?.temperature.targetTemperature);
        setDiningTemperatureMode(response?.airConJobMode?.currentJobMode);
      }
      if (aliasName === "사무실") {
        setOfficePowerOn(response?.powerSave?.powerSaveEnabled);
        setOfficeTemperature(response?.temperature.targetTemperature);
        setOfficeTemperatureMode(response?.airConJobMode?.currentJobMode);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!Array.isArray(deviceList) || deviceList.length === 0) return;
    deviceList.map((item: any) => getDeviceState(item?.deviceId, item?.deviceInfo?.alias));
  }, [deviceList]);

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
