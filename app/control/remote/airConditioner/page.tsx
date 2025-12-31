"use client";

import { useEffect, useMemo, useState } from "react";
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
type WindStrength = "LOW" | "MID" | "HIGH";

type DeviceItem = {
  deviceId: string;
  deviceInfo: { alias: string; deviceType: string };
};

type SelectDevice = { deviceName: string; value: string | null };
type ControlMode = "power" | "temperature" | "mode" | "wind";

const windStrength = (value?: WindStrength | string): number => {
  switch (value) {
    case "LOW":
      return 1;
    case "MID":
      return 2;
    case "HIGH":
      return 3;
    default:
      return 1;
  }
};

const devicePowerState = (value?: string) => value === "POWER_ON";
const devicePowerControl = (value?: boolean) => (value ? "POWER_ON" : "POWER_OFF");

const normalizeTemperatureMode = (value?: string): TemperatureMode => {
  if (!value) return "COOL";
  if (value === "HEAT" || value === "난방") return "HEAT";
  if (value === "COOL" || value === "냉방") return "COOL";
  return "COOL";
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const safeNumber = (v: string, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const circleSize = 200;

const OmniAirConditionerControlPage = () => {
  const [deviceList, setDeviceList] = useState<DeviceItem[] | null>(null);
  const [selectDevice, setSelectDevice] = useState<SelectDevice>({ deviceName: "", value: null });

  const [powerOn, setPowerOn] = useState(false);
  const [temperature, setTemperature] = useState<number>(TEMP_CONFIG.COOL.min);
  const [mode, setMode] = useState<TemperatureMode>("COOL");
  const [wind, setWind] = useState<number>(1);

  const headers = useMemo(
    () => ({
      "x-message-id": "fNvdZ1brTn-wWKUlWGoSVw",
      "x-client-id": "test-client-123456",
      "x-api-key": "v6GFvkweNo7DK7yD3ylIZ9w52aKBU0eJ7wLXkSR3",
    }),
    []
  );

  const conf = TEMP_CONFIG[mode] ?? TEMP_CONFIG.COOL;

  const getDevicesList = async () => {
    try {
      const res = await fetch("/api/thinq/devices", { headers });
      const json = await res.json();

      const list: DeviceItem[] = json?.resultData?.response ?? [];
      const devices = list.filter((item) => item?.deviceInfo?.deviceType === "DEVICE_AIR_CONDITIONER");
      setDeviceList(devices);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void getDevicesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDeviceState = async (deviceId: string) => {
    if (!deviceId) return;

    try {
      const res = await fetch(`/api/thinq/devices/${deviceId}/state`, { headers });
      const json = await res.json();

      const response = json?.resultData?.response ?? {};

      const nextPower = devicePowerState(response?.operation?.airConOperationMode);
      const nextMode = normalizeTemperatureMode(response?.airConJobMode?.currentJobMode);
      const nextConf = TEMP_CONFIG[nextMode] ?? TEMP_CONFIG.COOL;

      const nextTempRaw = safeNumber(response?.temperature?.targetTemperature, nextConf.min);
      const nextTemp = clamp(nextTempRaw, nextConf.min, nextConf.max);

      const nextWind = windStrength(response?.airFlow?.windStrength);

      setPowerOn(nextPower);
      setMode(nextMode);
      setTemperature(nextTemp);
      setWind(nextWind);
    } catch (e) {
      console.error(e);
    }
  };

  const generatePayload = (controlMode: ControlMode) => {
    switch (controlMode) {
      case "power":
        return {
          operation: { airConOperationMode: devicePowerControl(powerOn) }, // "POWER_ON" | "POWER_OFF"
        };

      case "mode":
        return {
          airConJobMode: { currentJobMode: mode }, // "COOL" | "HEAT" | ...
        };

      case "temperature": {
        // ✅ 가장 안전: targetTemperature 하나만 보내기
        return {
          // airConJobMode: { currentJobMode: mode },
          temperature: { targetTemperature: temperature },
        };

        // 만약 "모드별 전용 키"를 꼭 쓰고 싶으면 아래처럼 (기기마다 다를 수 있음)
        // const key = mode === "HEAT" ? "heatTargetTemperature" : "coolTargetTemperature";
        // return { temperature: { [key]: temperature } };
      }

      case "wind":
        // wind가 1/2/3이면 enum(HIGH/MID/LOW)로 변환해서 보내는 게 스펙에 맞음
        // (프로필에 windStrength는 HIGH/LOW/MID)
        return {
          airFlow: {
            windStrength: wind === 3 ? "HIGH" : wind === 2 ? "MID" : "LOW",
          },
        };

      default:
        return {};
    }
  };

  const updateDeviceState = async (controlMode: ControlMode) => {
    if (!selectDevice.value) return;

    const payload = generatePayload(controlMode);

    // ✅ payload가 {}면 보내지 말기
    if (!payload || Object.keys(payload).length === 0) {
      console.warn("skip control: empty payload", controlMode);
      return;
    }

    try {
      const res = await fetch(`/api/thinq/devices/${selectDevice.value}/control`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "x-conditional-control": "true",
        },
        body: JSON.stringify(payload),
      });

      // ✅ HTTP 에러 처리
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`control failed: ${res.status} ${res.statusText} ${text}`);
      }

      const json = await res.json();
      console.log("control result:", json);

      // (선택) 성공 후 상태 다시 동기화하고 싶으면:
      // await getDeviceState(selectDevice.value);

      return json;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!selectDevice.value) return;
    void getDeviceState(selectDevice.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectDevice.value]);

  useEffect(() => {
    void updateDeviceState("wind");
  }, [wind]);

  useEffect(() => {
    void updateDeviceState("temperature");
  }, [temperature]);

  const handleChangeMode = (v: string) => {
    const nextMode = normalizeTemperatureMode(String(v));
    const nextConf = TEMP_CONFIG[nextMode] ?? TEMP_CONFIG.COOL;

    console.log("mode onChange:", v, "=>", nextMode);

    setMode(nextMode);
    setTemperature((t) => clamp(t, nextConf.min, nextConf.max));
  };

  const hasSelected = !!selectDevice.value;

  return (
    <div className="p-2 w-[480px]">
      <div className="mb-2 text-right">
        <select
          className="px-4 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-lg focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
          value={selectDevice.value ?? ""}
          onChange={(e) => {
            const el = e.currentTarget;
            const value = el.value || null;
            const deviceName = value ? el.selectedOptions[0]?.text ?? "" : "";
            setSelectDevice({ value, deviceName });
          }}
        >
          <option value="">선택</option>
          {deviceList?.map((item) => (
            <option key={item.deviceId} value={item.deviceId}>
              {item.deviceInfo.alias}
            </option>
          ))}
        </select>
      </div>

      {hasSelected ? (
        <section className="p-4 border border-gray-200">
          <h1>{selectDevice.deviceName} 운전현황</h1>

          <div className="flex gap-2 items-center justify-between">
            <div style={{ width: circleSize, height: circleSize }}>
              <CircularGauge value={temperature} size={circleSize} color={conf.color} max={conf.max} label={powerOn ? "작동 중" : "전원 꺼짐"} />
            </div>

            <div className="flex gap-2 flex-col items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <h4 className="mb-2 font-bold">전원</h4>
                  <ToggleSwitch
                    checked={powerOn}
                    size="md"
                    onChange={(checked) => {
                      setPowerOn(checked);
                      updateDeviceState("power");
                      if (!checked) {
                        setTemperature(TEMP_CONFIG.COOL.min);
                        setMode("COOL");
                        setWind(1);
                      }
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <h4 className="mb-2 font-bold">운전모드</h4>
                  <TemperatureModeSelect name="temperatureModeSelectButton" disabled={!powerOn} onChange={handleChangeMode} value={mode} />
                </div>
              </div>

              <div className="w-full">
                <h4 className="mb-2 font-bold">바람세기</h4>
                <WindControl value={wind} onChange={setWind} disabled={!powerOn} />
              </div>

              <div className="w-full">
                <div className="mb-2 flex justify-between items-center">
                  <h4 className="font-bold">희망온도</h4>
                  <h4 className="font-bold">{temperature} 도</h4>
                </div>
                <TemperatureSlider min={conf.min} max={conf.max} value={temperature} onChange={(v) => setTemperature(clamp(v, conf.min, conf.max))} disabled={!powerOn} />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="p-4 flex w-full h-[254px] items-center justify-center border border-gray-200">제어 대상을 선택하세요.</div>
      )}
    </div>
  );
};

export default OmniAirConditionerControlPage;
