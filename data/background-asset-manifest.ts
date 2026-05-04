import type { PlaceholderAsset } from "@/types/content";

const sharedBackgroundImageMap: Record<string, string> = {
  "banquet-hall-night": "/assets/backgrounds/shared/hongmenyan.jpg",
  "camp-night": "/assets/backgrounds/shared/songbie_hebian.jpg",
  "military-tent": "/assets/backgrounds/shared/hongmenyan.jpg",
  "council-chamber-night":
    "/assets/backgrounds/shared/council-chamber-night.jpg",
  "red-cliffs-river-night": "/assets/backgrounds/shared/songbie_hebian.jpg",
  "red-cliffs-command-tent": "/assets/backgrounds/shared/shanlin-yewai.jpg",
  "red-cliffs-strategy-table":
    "/assets/backgrounds/shared/shanlin-yewai.jpg",
  "red-cliffs-departure-dock": "/assets/backgrounds/shared/songbie_hebian.jpg",
  "red-cliffs-embers": "/assets/backgrounds/shared/shanlin-yewai.jpg",
  "palace-night-chamber": "/assets/backgrounds/shared/huanggong_diannei.jpg",
  "palace-inner-corridor": "/assets/backgrounds/shared/gongting_shinei1.jpg",
  "palace-gate-dawn": "/assets/backgrounds/shared/huanggong_dianqian.jpg",
  "palace-hall-threshold":
    "/assets/backgrounds/shared/gongting_shinei2.jpg",
  "qin-palace-antehall": "/assets/backgrounds/shared/huanggong_dianqian.jpg",
  "qin-throne-hall": "/assets/backgrounds/shared/huanggong_diannei.jpg",
  "qin-chaos-hall": "/assets/backgrounds/shared/huanggong_diannei.jpg",
  "heroes-rain-pavilion": "/assets/backgrounds/shared/jingmi_tingyuan.jpg",
  "heroes-banquet-hall": "/assets/backgrounds/shared/gongting_shinei1.jpg",
  "heroes-courtyard-after-rain":
    "/assets/backgrounds/shared/jingmi_tingyuan.jpg",
  "empty-city-watchtower": "/assets/backgrounds/shared/kongchengji.jpg",
  "empty-city-gate": "/assets/backgrounds/shared/chengnei.jpg",
  "empty-city-below": "/assets/backgrounds/shared/cheng-lou.jpg",
  "battle-riverbank-crossing": "/assets/backgrounds/shared/pofuchenzhou.jpg",
  "battle-retreat-cut": "/assets/backgrounds/shared/pofuchenzhou.jpg",
  "battle-frontline-muster": "/assets/backgrounds/shared/pofuchenzhou.jpg",
  "battle-before-clash": "/assets/backgrounds/shared/pofuchenzhou.jpg",
  "zhao-manor-courtyard": "/assets/backgrounds/shared/jingmi_tingyuan.jpg",
  "zhao-manor-gate": "/assets/backgrounds/shared/jiedao.jpg",
  "zhao-manor-hall": "/assets/backgrounds/shared/gongting_shinei1.jpg",
  "song-banquet-hall": "/assets/backgrounds/shared/gongting_shinei1.jpg",
  "song-palace-interior": "/assets/backgrounds/shared/gongting_shinei2.jpg",
  "song-palace-gate-night": "/assets/backgrounds/shared/huanggong_dianqian.jpg",
  "horse-race-course": "/assets/backgrounds/shared/saimachang_1.jpg",
  "horse-race-viewing-stand":
    "/assets/backgrounds/shared/saimachang_shinei.jpg",
  "horse-race-finish-lane": "/assets/backgrounds/shared/saimachang_1.jpg",
  "wei-palace-hall": "/assets/backgrounds/shared/huanggong_diannei.jpg",
  "wei-palace-dais": "/assets/backgrounds/shared/huanggong_diannei.jpg",
  "wei-palace-after-audience": "/assets/backgrounds/shared/gongting_shinei1.jpg",
  "war-tent-healing": "/assets/backgrounds/shared/yizhang_guaguliaodu.jpg",
  "war-tent-surgery": "/assets/backgrounds/shared/yizhang_guaguliaodu.jpg",
  "war-tent-recovery": "/assets/backgrounds/shared/yizhang_guaguliaodu.jpg",
  "courtyard-children-play": "/assets/backgrounds/shared/jingmi_tingyuan.jpg",
  "courtyard-water-jar": "/assets/backgrounds/shared/jingmi_tingyuan.jpg",
  "courtyard-after-rescue": "/assets/backgrounds/shared/jingmi_tingyuan.jpg",
  "humen-seaside-morning": "/assets/backgrounds/shared/songbie_hebian.jpg",
  "humen-opium-yard": "/assets/backgrounds/shared/jiedao.jpg",
  "humen-destruction-pit": "/assets/backgrounds/shared/jiedao.jpg",
  "humen-crowd-edge": "/assets/backgrounds/shared/jiedao.jpg",
  "wu-court-approach": "/assets/backgrounds/shared/huanggong_dianqian.jpg",
  "wu-court-hall": "/assets/backgrounds/shared/gongting_shinei2.jpg",
  "wu-court-dais": "/assets/backgrounds/shared/gongting_shinei1.jpg",
  "wu-court-after": "/assets/backgrounds/shared/gongting_shinei2.jpg",
};

export function getSharedBackgroundImage(backgroundKey?: string) {
  if (!backgroundKey) {
    return undefined;
  }

  return sharedBackgroundImageMap[backgroundKey];
}

export function enrichSharedBackgroundAsset(
  background: PlaceholderAsset,
): PlaceholderAsset {
  const mappedImage = getSharedBackgroundImage(background.backgroundKey);
  if (!mappedImage) {
    return background;
  }

  return {
    ...background,
    image: mappedImage,
  };
}
