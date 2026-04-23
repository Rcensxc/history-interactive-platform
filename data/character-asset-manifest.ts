const characterStandeeImageMap: Partial<Record<string, string>> = {
  xiangyu: "/assets/characters/standees/xiangyu.png",
  liubang: "/assets/characters/standees/liubang.png",
  zhugeliang: "/assets/characters/standees/zhugeliang.png",
  "zhuge-liang": "/assets/characters/standees/zhugeliang.png",
  zhouyu: "/assets/characters/standees/zhouyu.png",
  "huang-gai": "/assets/characters/standees/huanggai.png",
  wuzetian: "/assets/characters/standees/wuzetian.png",
  liqingzhao: "/assets/characters/standees/liqingzhao.png",
  wangyangming: "/assets/characters/standees/wangyangming.png",
};

const characterPortraitImageMap: Partial<Record<string, string>> = {
  xiangyu: "/assets/characters/portraits/xiangyu.jpg",
  liubang: "/assets/characters/portraits/liubang.jpg",
  zhugeliang: "/assets/characters/portraits/zhugeliang.jpg",
  "zhuge-liang": "/assets/characters/portraits/zhugeliang.jpg",
  zhouyu: "/assets/characters/portraits/zhouyu.jpg",
  "huang-gai": "/assets/characters/portraits/huanggai.jpg",
  wuzetian: "/assets/characters/portraits/wuzetian.jpg",
  liqingzhao: "/assets/characters/portraits/liqingzhao.jpg",
  wangyangming: "/assets/characters/portraits/wangyangming.jpg",
};

export function getCharacterStandeeImage(characterId?: string) {
  if (!characterId) {
    return undefined;
  }

  return characterStandeeImageMap[characterId];
}

export function getCharacterPortraitImage(characterId?: string) {
  if (!characterId) {
    return undefined;
  }

  return characterPortraitImageMap[characterId];
}
