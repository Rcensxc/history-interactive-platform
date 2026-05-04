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
  simayi: "/assets/characters/standees/simayi.png",
  caocao: "/assets/characters/standees/caocao.png",
  liubei: "/assets/characters/standees/liubei.png",
  zhaokuangyin: "/assets/characters/standees/zhaokuangyin.png",
  jingke: "/assets/characters/standees/jingke.png",
  yingzheng: "/assets/characters/standees/yingzheng.png",
  tianji: "/assets/characters/standees/tianji.png",
  sunbin: "/assets/characters/standees/sunbin.png",
  guanyu: "/assets/characters/standees/guanyu.png",
  huatuo: "/assets/characters/standees/huatuo.png",
  caopi: "/assets/characters/standees/caopi.png",
  caozhi: "/assets/characters/standees/caozhi.png",
  linzexu: "/assets/characters/standees/linzexu.png",
  lianpo: "/assets/characters/standees/lianpo.png",
  linxiangru: "/assets/characters/standees/linxiangru.png",
  simaguang: "/assets/characters/standees/simaguang.png",
};//角色立绘资源的映射表，角色ID与对应的立绘图片路径。

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
  simayi: "/assets/characters/portraits/simayi.jpg",
  caocao: "/assets/characters/portraits/caocao.jpg",
  liubei: "/assets/characters/portraits/liubei.jpg",
  zhaokuangyin: "/assets/characters/portraits/zhaokuangyin.jpg",
  jingke: "/assets/characters/portraits/jingke.jpg",
  yingzheng: "/assets/characters/portraits/yingzheng.jpg",
  tianji: "/assets/characters/portraits/tianji.jpg",
  sunbin: "/assets/characters/portraits/sunbin.jpg",
  guanyu: "/assets/characters/portraits/guanyu.jpg",
  huatuo: "/assets/characters/portraits/huatuo.jpg",
  caopi: "/assets/characters/portraits/caopi.jpg",
  caozhi: "/assets/characters/portraits/caozhi.jpg",
  linzexu: "/assets/characters/portraits/linzexu.jpg",
  lianpo: "/assets/characters/portraits/lianpo.jpg",
  linxiangru: "/assets/characters/portraits/linxiangru.jpg",
  simaguang: "/assets/characters/portraits/simaguang.jpg",
};//角色头像资源的映射表，角色ID与对应的头像图片路径。

export function getCharacterStandeeImage(characterId?: string) {
  if (!characterId) {
    return undefined;
  }

  return characterStandeeImageMap[characterId];
}//根据角色ID获取对应的立绘图片路径

export function getCharacterPortraitImage(characterId?: string) {
  if (!characterId) {
    return undefined;
  }

  return characterPortraitImageMap[characterId];
}
