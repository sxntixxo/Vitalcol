import * as Battery from 'expo-battery';
import * as Brightness from 'expo-brightness';

const get_battery_level = async () => {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  return batteryLevel === -1 ? 'Error' : batteryLevel;
};

const change_brightness = ({ brightness }: { brightness: number }) => {
  Brightness.setSystemBrightnessAsync(brightness);
  return brightness;
};

const flash_screen = () => {
  Brightness.setSystemBrightnessAsync(1);
  setTimeout(() => Brightness.setSystemBrightnessAsync(0), 200);
  return 'Flashed';
};

const tools = { get_battery_level, change_brightness, flash_screen };
export default tools;
