import type { ResponseType } from "./ResonseType";

type runStateProp = {
  currentState: string;
};

type airConJobModeProp = {
  currentJobMode: string;
};

type powerSaveProp = {
  powerSaveEnabled: boolean;
};

type temperatureProp = {
  currentTemperature: number;
  targetTemperature: number;
  unit: "C" | "F";
};

type airFlowProp = {
  windStrength: string;
};

type windDirectionProp = {
  rotateUpDown: boolean;
};

type operationProp = {
  airConOperationMode: "POWER_ON" | "POWER_OFF";
};

type timerProp = {
  absoluteStartTimer: string;
  absoluteStopTimer: string;
};

type sleepTimerProp = {
  relativeStopTimer: string;
};

type displayProp = {
  light: "ON" | "OFF";
};

export type responseProp = {
  runState: runStateProp;
  airConJobMode: airConJobModeProp;
  powerSave: powerSaveProp;
  temperature: temperatureProp;
  temperatureInUnits: temperatureProp[];
  airFlow: airFlowProp;
  windDirection: windDirectionProp;
  operation: operationProp;
  timer: timerProp;
  sleepTimer: sleepTimerProp;
  display: displayProp;
};

export type LgAirConditionerResponse = {
  messageId: string;
  timestamp: string;
  response: responseProp;
};

export const TEMP_CONFIG = {
  COOL: { min: 20, max: 24, color: "#2b7fff" },
  HEAT: { min: 20, max: 24, color: "#df592a" },
} as const;

export type TemperatureMode = keyof typeof TEMP_CONFIG;
export type WindStrength = "LOW" | "MID" | "HIGH";

export type DeviceItem = {
  deviceId: string;
  deviceInfo: { alias: string; deviceType: string };
};

export type SelectDevice = { deviceName: string; value: string | null };
export type ControlMode = "power" | "temperature" | "mode" | "wind" | "windDirection";
export type LgAirConditionerStateApiResponse = ResponseType<LgAirConditionerResponse>;
