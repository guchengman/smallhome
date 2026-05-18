export interface RoomDimensions {
  length: number; // meters
  width: number;
  height: number;
}

export interface MaterialResult {
  type: string;
  labelZh: string;
  labelEn: string;
  quantity: number;
  unit: string;
  wasteRate: number;
}

const MATERIAL_CONFIGS = [
  { type: 'tile', labelZh: '瓷砖', labelEn: 'Tiles', unitZh: '片', unitEn: 'pcs', calcPerSqm: 6.25, wasteRate: 0.05 },
  { type: 'floor', labelZh: '地板', labelEn: 'Flooring', unitZh: '㎡', unitEn: 'sqm', calcPerSqm: 1, wasteRate: 0.08 },
  { type: 'paint', labelZh: '乳胶漆', labelEn: 'Paint', unitZh: '升', unitEn: 'L', calcPerSqm: 0.15, wasteRate: 0.10 },
  { type: 'wallpaper', labelZh: '墙纸', labelEn: 'Wallpaper', unitZh: '卷', unitEn: 'rolls', calcPerSqm: 0.2, wasteRate: 0.12 },
];

export function calculateMaterials(room: RoomDimensions, type?: string): MaterialResult[] {
  const floorArea = room.length * room.width;
  const wallArea = 2 * (room.length + room.width) * room.height;

  const configs = type ? MATERIAL_CONFIGS.filter((c) => c.type === type) : MATERIAL_CONFIGS;

  return configs.map((config) => {
    const baseArea = config.type === 'tile' || config.type === 'floor' ? floorArea : wallArea;
    const quantity = Math.ceil(baseArea * config.calcPerSqm * (1 + config.wasteRate));
    return {
      type: config.type,
      labelZh: config.labelZh,
      labelEn: config.labelEn,
      quantity,
      unit: config.unitZh,
      wasteRate: config.wasteRate,
    };
  });
}

export function calculateFloorArea(room: RoomDimensions): number {
  return room.length * room.width;
}

export function calculateWallArea(room: RoomDimensions): number {
  return 2 * (room.length + room.width) * room.height;
}

export { MATERIAL_CONFIGS };