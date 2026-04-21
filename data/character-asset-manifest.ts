const characterStandeeImageMap: Record<string, string> = {
  xiangyu: "/assets/characters/standees/xiangyu.png",
  liubang: "/assets/characters/standees/liubang.png"
};

const characterPortraitImageMap: Record<string, string> = {
  xiangyu: "/assets/characters/portraits/xiangyu.jpg",
  liubang: "/assets/characters/portraits/liubang.jpg"
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
