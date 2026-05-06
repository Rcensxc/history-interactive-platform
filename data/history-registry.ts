import type {
  AiStructuredStoryOutput,
  EventPlayableContent,
  EventPreparationData,
  EventSpeakerVisual,
  EventViewpoint,
  FigureEventRelation,
  FigureExperienceOption,
  HistoricalEvent,
  HistoricalFigure,
  PlaceholderAsset,
} from "@/types/content";
import { createEventPlayableContent } from "@/lib/event-story-runtime";

const historicalFigureCatalog: Array<Omit<HistoricalFigure, "experienceOptions">> = [
  {
    id: "liubang",
    name: "刘邦",
    title: "汉高祖",
    dynasty: "西汉",
    role: "君主",
    introduction:
      "刘邦（前256年/前247年—前195年6月1日），字季，‌汉朝开国皇帝‌，沛丰邑中阳里（今江苏省徐州市丰县）人 。他是中国历史上杰出的政治家、战略家和军事家，对汉族发展及国家统一有突出贡献 。‌",
    signatureEvent: "楚汉相争、建立汉朝",
    keywords: ["谋局", "用人", "逆转局势"],
    portraitLabel: "汉",
    portraitTone: "bronze",
    relatedEventIds: ["hongmen-banquet"],
    canJoinTimeTheater: true,
  },
  {
    id: "xiangyu",
    name: "项羽",
    title: "西楚霸王",
    dynasty: "秦",
    role: "统帅",
    introduction:
      "项羽（前232年―前202年），名籍，字羽，泗水郡下相县（今江苏宿迁）人，祖籍项国 （今河南沈丘与项城 ）。 秦朝末年政治家、军事家，楚国名将项燕的孙子。作为中国军事思想“兵形势”的代表人物，项羽以武力出众而闻名。李晚芳评价“羽之神勇，千古无二”。",
    signatureEvent: "巨鹿之战、鸿门宴",
    keywords: ["强攻", "威势", "抉择压力"],
    portraitLabel: "楚",
    portraitTone: "crimson",
    relatedEventIds: ["hongmen-banquet", "break-cauldrons-sink-boats"],
    canJoinTimeTheater: true,
  },
  {
    id: "zhuge-liang",
    name: "诸葛亮",
    title: "蜀汉丞相",
    dynasty: "三国",
    role: "谋臣",
    introduction:
      "诸葛亮（181年—234年10月8日），字孔明，号卧龙，汉族，琅琊阳都（今山东省沂南县）人 ，三国时期蜀汉丞相，中国古代杰出的政治家、军事家、战略家 、发明家、文学家。曾发明木牛流马、孔明灯等，并改造连弩，叫作诸葛连弩，可一弩十矢俱发。 诸葛亮一生“鞠躬尽瘁，死而后已”，是中国传统文化中“忠臣”与“智者”的代表人物。",
    signatureEvent: "隆中对、赤壁之战、北伐",
    keywords: ["全局", "筹谋", "稳定节奏"],
    portraitLabel: "蜀",
    portraitTone: "ink",
    relatedEventIds: [
      "battle-of-red-cliffs",
      "longzhong-plan",
      "northern-expeditions",
      "empty-city-stratagem",
      "debate-with-wu-scholars",
    ],
    canJoinTimeTheater: true,
  },
  {
    id: "zhouyu",
    name: "周瑜",
    title: "东吴都督",
    dynasty: "三国",
    role: "统帅",
    introduction:
      "周瑜(175年-210年)，字公瑾，庐江郡舒县(一说今安徽省庐江县、一说今安徽省舒城县)人。东汉末年军事家、政治家、谋略家、音乐家、东吴名将。  洛阳令周异之子，从祖周景、从父周忠都官至太尉，位列三公。周瑜长壮有姿貌,精通音律 ，当时有“曲有误周郎顾”之语。",
    signatureEvent: "赤壁之战、联刘抗曹",
    keywords: ["统筹", "时机", "主导战局"],
    portraitLabel: "吴",
    portraitTone: "jade",
    relatedEventIds: ["battle-of-red-cliffs"],
    canJoinTimeTheater: true,
  },
  {
    id: "huang-gai",
    name: "黄盖",
    title: "东吴老将",
    dynasty: "三国",
    role: "将领",
    introduction:
      "黄盖（生卒年不详），字公覆，零陵郡泉陵县（今湖南省永州市）人。汉末三国时期孙吴将领。",
    signatureEvent: "苦肉计、赤壁之战",
    keywords: ["执行", "冒险", "火攻"],
    portraitLabel: "吴",
    portraitTone: "crimson",
    relatedEventIds: ["battle-of-red-cliffs"],
    canJoinTimeTheater: true,
  },
  {
    id: "wuzetian",
    name: "武则天",
    title: "大周皇帝",
    dynasty: "唐周",
    role: "君主",
    introduction:
      "武曌[zhào]（624年―705年12月16日），别名武则天，并州文水（今山西省文水县）人。唐朝至武周时期政治家，武周开国君主（690年10月16日—705年2月23日在位 ）。荆州都督武士彟次女。武则天前后当政四十余年，是中国历史上唯一的正统女皇帝 。她开创的时代，上承贞观之治，下启开元盛世，被认为是走向盛唐的重要环节 。她多智略，兼涉文史，颇有诗才。著有《垂拱集》《金轮集》等，今已佚",
    signatureEvent: "临朝称制、建立武周",
    keywords: ["权力", "秩序", "执行力"],
    portraitLabel: "周",
    portraitTone: "jade",
    relatedEventIds: [
      "shenlong-coup-eve",
      "establish-zhou",
      "imperial-court-reform",
    ],
    canJoinTimeTheater: true,
  },
  {
    id: "liqingzhao",
    name: "李清照",
    title: "词人",
    dynasty: "宋",
    role: "文人",
    introduction:
      "李清照（1084年3月13日—1155年），女，别名李易安，号易安居士，齐州章丘（今山东省济南市章丘区）人。宋代婉约派代表词人。李清照所作词前期多写悠闲生活，后期悲叹身世，善用白描手法，语言清丽，反对以作诗文之法作词。其词自成“易安体”，被宋代词人效仿。 能诗文，部分篇章感时咏史，情辞慷慨。",
    signatureEvent: "南渡词作、金石收藏",
    keywords: ["表达", "观察", "时代感"],
    portraitLabel: "宋",
    portraitTone: "amber",
    relatedEventIds: ["southern-song-migration", "jinshi-legacy"],
    canJoinTimeTheater: true,
  },
  {
    id: "wangyangming",
    name: "王阳明",
    title: "思想家",
    dynasty: "明",
    role: "思想家",
    introduction:
      "王守仁（1472年10月31日－1529年1月9日），字伯安，幼名云，5岁时改名守仁 ，号阳明先生 ，又号乐山居士 。浙江余姚人，出生于余姚北城（今浙江省宁波市余姚市阳明街道） 。是南京吏部尚书王华之子、主观唯心主义宗师陆九渊的继承人，明代著名哲学家、思想家、教育家和军事家 ，心学集大成者 。与儒学创始人孔子、儒学集大成者孟子、理学集大成者朱熹 并称为“孔孟朱王”",
    signatureEvent: "龙场悟道、平定宁王之乱",
    keywords: ["行动", "判断", "心学"],
    portraitLabel: "明",
    portraitTone: "ink",
    relatedEventIds: ["longchang-enlightenment", "prince-ning-rebellion"],
    canJoinTimeTheater: true,
  },
  {
    id: "simayi",
    name: "司马懿",
    title: "魏国重臣",
    dynasty: "三国",
    role: "统帅",
    introduction:
      "司马懿（179年—251年9月7日），字仲达，河内郡温县孝敬里（今河南焦作温县）人，汉末三国曹魏政治家、权臣、军事家、战略家，西晋王朝奠基人。",
    signatureEvent: "空城计、高平陵政变",
    keywords: ["判断", "试探", "压迫感"],
    portraitLabel: "魏",
    portraitTone: "ink",
    relatedEventIds: ["empty-city-stratagem"],
    canJoinTimeTheater: true,
  },
  {
    id: "caocao",
    name: "曹操",
    title: "魏武帝",
    dynasty: "东汉末",
    role: "权臣",
    introduction:
      "曹操（155年 [1]—220年3月15日 ），一名吉利，字孟德，小字阿瞒，一说本姓夏侯 。沛国谯县（今安徽亳州）人。东汉末年权臣、丞相、魏王，政治家、军事家、文学家、诗人、书法家，曹魏政权奠基者，太尉曹嵩之子",
    signatureEvent: "官渡之战、煮酒论英雄",
    keywords: ["试探", "威压", "权谋"],
    portraitLabel: "魏",
    portraitTone: "ink",
    relatedEventIds: ["heroes-over-wine"],
    canJoinTimeTheater: true,
  },
  {
    id: "liubei",
    name: "刘备",
    title: "蜀汉先主",
    dynasty: "东汉末",
    role: "君主",
    introduction:
      "汉昭烈帝刘备（161年—223年6月10日），字玄德，汉族，涿郡涿县（今河北涿州大树楼桑村）人， 东汉末年政治家，三国蜀汉开国皇帝（221年5月15日—223年6月10日在位）。史家多称其为先主。",
    signatureEvent: "三顾茅庐、煮酒论英雄",
    keywords: ["隐忍", "应对", "分寸"],
    portraitLabel: "蜀",
    portraitTone: "bronze",
    relatedEventIds: ["heroes-over-wine"],
    canJoinTimeTheater: true,
  },
  {
    id: "zhaokuangyin",
    name: "赵匡胤",
    title: "宋太祖",
    dynasty: "北宋",
    role: "君主",
    introduction:
      "宋太祖赵匡胤（927年3月21日—976年11月14日），小名香孩儿。涿郡人（一说保州 [185]），生于洛阳夹马营（今河南省洛阳市瀍河回族区东关）。五代至北宋初年军事家、政治家、战略家，宋朝开国皇帝（960年2月4日－976年11月14日在位）。后周护圣都指挥使赵弘殷（宋宣祖）次子，母为杜氏（昭宪太后）",
    signatureEvent: "陈桥兵变、杯酒释兵权",
    keywords: ["收权", "布局", "稳场"],
    portraitLabel: "宋",
    portraitTone: "amber",
    relatedEventIds: ["cup-wine-release-power"],
    canJoinTimeTheater: true,
  },
  {
    id: "jingke",
    name: "荆轲",
    title: "燕国刺客",
    dynasty: "战国",
    role: "刺客",
    introduction:
      "荆轲（？—前227年），姜姓，庆氏（古时“荆”、“庆”音近），字次非，也称庆卿、荆卿、庆轲。战国末期卫国人，春秋时期齐国大夫庆封的后代，战国时期刺客。",
    signatureEvent: "荆轲刺秦",
    keywords: ["逼近", "决绝", "生死一线"],
    portraitLabel: "燕",
    portraitTone: "crimson",
    relatedEventIds: ["jingke-assassinates-qin"],
    canJoinTimeTheater: true,
  },
  {
    id: "yingzheng",
    name: "嬴政",
    title: "秦王",
    dynasty: "战国",
    role: "君主",
    introduction:
      "秦始皇嬴政（前259年—前210年），嬴姓，赵氏（一说秦氏），名政（一说正） ，也有祖龙、吕政等别称（详见“人物争议-姓名之争”）。中国古代杰出的政治家、战略家、改革家，中国历史上第一个专制主义中央集权国家——秦朝的建立者，中国第一位称皇帝的君主。",
    signatureEvent: "荆轲刺秦、统一六国",
    keywords: ["警觉", "权威", "高压"],
    portraitLabel: "秦",
    portraitTone: "ink",
    relatedEventIds: ["jingke-assassinates-qin"],
    canJoinTimeTheater: true,
  },
  {
    id: "tianji",
    name: "田忌",
    title: "齐国将领",
    dynasty: "战国",
    role: "将领",
    introduction:
      "田忌，妫姓，田氏，名忌，字子期，又曰期思。战国时期齐国名将，封地于徐州（今山东滕州市），故又称徐州子期。",
    signatureEvent: "田忌赛马",
    keywords: ["博弈", "顺序", "逆转"],
    portraitLabel: "齐",
    portraitTone: "jade",
    relatedEventIds: ["tianji-horse-race"],
    canJoinTimeTheater: true,
  },
  {
    id: "sunbin",
    name: "孙膑",
    title: "齐国谋士",
    dynasty: "战国",
    role: "谋臣",
    introduction:
      "孙膑（生卒年不详），字伯灵，华夏族，孙武后裔，齐国阿（今山东阳谷东北）、鄄（今菏泽市鄄城北）一带人。中国战国时期军事家，唐德宗时位列武成王庙64将之一，宋徽宗时位列宋武庙72将之一。",
    signatureEvent: "田忌赛马、马陵之战",
    keywords: ["谋算", "顺势", "结构判断"],
    portraitLabel: "齐",
    portraitTone: "ink",
    relatedEventIds: ["tianji-horse-race"],
    canJoinTimeTheater: true,
  },
  {
    id: "guanyu",
    name: "关羽",
    title: "蜀汉名将",
    dynasty: "三国",
    role: "将领",
    introduction:
      "关羽（?—220年），字云长，本字长生，汉族，河东郡解县（今山西运城盐湖区解州镇）人。东汉末年名将，刘备阵营将军。",
    signatureEvent: "温酒斩华雄、刮骨疗毒",
    keywords: ["胆魄", "定力", "强撑"],
    portraitLabel: "蜀",
    portraitTone: "jade",
    relatedEventIds: ["scrape-bone-healing"],
    canJoinTimeTheater: true,
  },
  {
    id: "huatuo",
    name: "华佗",
    title: "名医",
    dynasty: "东汉末",
    role: "医者",
    introduction:
      "华佗（约145年－208年），字元化，一名旉，沛国谯县（今安徽省亳州市）人。东汉末年著名医学家。",
    signatureEvent: "刮骨疗毒、五禽戏",
    keywords: ["冷静", "医术", "判断"],
    portraitLabel: "医",
    portraitTone: "amber",
    relatedEventIds: ["scrape-bone-healing"],
    canJoinTimeTheater: true,
  },
  {
    id: "caopi",
    name: "曹丕",
    title: "魏文帝",
    dynasty: "三国",
    role: "君主",
    introduction:
      "魏文帝曹丕（187年—226年6月29日），字子桓，沛国谯县（今安徽省亳州市）人。三国时期政治家、文学家，曹魏开国皇帝（220年12月11日—226年6月29日在位）。魏武帝曹操之子，母为武宣皇后卞夫人。",
    signatureEvent: "代汉称帝、煮豆燃萁",
    keywords: ["压迫", "兄弟猜忌", "试探"],
    portraitLabel: "魏",
    portraitTone: "ink",
    relatedEventIds: ["boil-beans-burn-stalks"],
    canJoinTimeTheater: true,
  },
  {
    id: "caozhi",
    name: "曹植",
    title: "建安才子",
    dynasty: "三国",
    role: "文人",
    introduction:
      "曹植（192年—232年12月27日），字子建，沛国谯（今安徽省亳州市）人，出生于东武阳（莘县朝城；一说生于山东省菏泽市鄄城），是曹操与武宣卞皇后所生第三子，生前曾为陈王，去世后谥号“思”，因此又称陈思王。 魏文帝曹丕之弟。中国三国时期文学家，诗人，音乐家。",
    signatureEvent: "洛神赋、煮豆燃萁",
    keywords: ["才情", "急智", "自救"],
    portraitLabel: "魏",
    portraitTone: "amber",
    relatedEventIds: ["boil-beans-burn-stalks"],
    canJoinTimeTheater: true,
  },
  {
    id: "linzexu",
    name: "林则徐",
    title: "禁烟大臣",
    dynasty: "清",
    role: "大臣",
    introduction:
      "林则徐（1785年8月30日—1850年11月22日），字元抚，又字少穆、石麟，晚号俟村老人、俟村退叟、七十二峰退叟、瓶泉居士、栎社散人等，福建侯官县人，中国清代后期政治家、思想家、诗人，民族英雄。",
    signatureEvent: "虎门销烟",
    keywords: ["执行", "决心", "公开行动"],
    portraitLabel: "清",
    portraitTone: "jade",
    relatedEventIds: ["humen-destroy-opium"],
    canJoinTimeTheater: true,
  },
  {
    id: "lianpo",
    name: "廉颇",
    title: "赵国名将",
    dynasty: "战国",
    role: "将领",
    introduction:
      "廉颇（生卒年不详），嬴姓，廉氏，名颇，战国末期赵国的名将。",
    signatureEvent: "长平前后、负荆请罪",
    keywords: ["刚强", "羞愧", "认错"],
    portraitLabel: "赵",
    portraitTone: "crimson",
    relatedEventIds: ["bearing-thorns-apology"],
    canJoinTimeTheater: true,
  },
  {
    id: "linxiangru",
    name: "蔺相如",
    title: "赵国上卿",
    dynasty: "战国",
    role: "大臣",
    introduction:
      "蔺相如（生卒年不详），战国时期赵国上卿，外交家。",
    signatureEvent: "完璧归赵、负荆请罪",
    keywords: ["克制", "器量", "稳局"],
    portraitLabel: "赵",
    portraitTone: "jade",
    relatedEventIds: ["bearing-thorns-apology"],
    canJoinTimeTheater: true,
  },
  {
    id: "simaguang",
    name: "司马光",
    title: "北宋史臣",
    dynasty: "北宋",
    role: "文臣",
    introduction:
      "司马光（1019年11月17日—1086年10月11日），字君实，号迂叟，世称涑水先生。陕州夏县涑水乡（今山西省夏县）人，生于光州光山（今河南省光山县）。北宋时期政治家、史学家、文学家，自称晋安平王司马孚后代。",
    signatureEvent: "司马光砸缸、资治通鉴",
    keywords: ["果断", "应变", "救人优先"],
    portraitLabel: "宋",
    portraitTone: "bronze",
    relatedEventIds: ["smash-water-jar"],
    canJoinTimeTheater: true,
  },
];
//此处为历史人物结构补充处
const historicalEventCatalog: HistoricalEvent[] = [
  {
    id: "hongmen-banquet",
    title: "鸿门宴",
    era: "秦",
    category: "权谋博弈",
    summary: "这是一场看似满含礼数的谋略试探，且看双方如何在明面和暗地里交锋。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "公元前206年刘邦攻占秦都咸阳，派兵守函谷关。不久项羽率四十万大军攻入，进驻鸿门（今陕西临潼东），准备进攻刘邦。刘邦到鸿门跟项羽会见。酒宴中，项羽的谋士范增让项庄舞剑，想乘机杀死刘邦。刘邦在项伯、樊哙等人的护卫下乘隙脱逃（见于《史记·项羽本纪》）",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["liubang", "xiangyu"],
    recommendedViewpointIds: ["liubang"],
    hasPlayableStory: true,
    backdropTone: "crimson",
  },
  {
    id: "battle-of-red-cliffs",
    title: "赤壁之战",
    era: "三国",
    category: "战场军略",
    summary: "体验联盟、判断与时机交织在一起的一场大战。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "‌赤壁之战‌是东汉末年孙权、刘备联军于‌208年‌在长江赤壁一带大破曹操大军的战役，此战奠定了‌三国鼎立‌的基础。曹操在统一北方后，于建安十三年（208年）率军南下，意图吞并荆州与江东。时值刘表病逝，其子刘琮投降，刘备被迫南撤。孙权在鲁肃、周瑜等人劝说下，决定联合刘备共同抗曹。联军兵力约5万，面对曹操号称80万（实际约20余万）的大军，利用曹军不习水战、瘟疫流行的弱点，由黄盖献计火攻。黄盖诈降，驾载易燃物的战船冲入曹军水寨，借东风点燃敌船，火势蔓延至岸上营寨，曹军大乱，最终溃败。此战之后，曹操退回北方，孙权巩固江东，刘备趁机夺取荆州南部，三方势力趋于平衡，‌三国鼎立局面正式形成‌。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["zhouyu", "zhuge-liang", "huang-gai"],
    recommendedViewpointIds: ["zhuge-liang"],
    hasPlayableStory: true,
    backdropTone: "ink",
  },
  {
    id: "shenlong-coup-eve",
    title: "神龙政变前夜",
    era: "唐周",
    category: "宫廷朝堂",
    summary: "病中的一夜里，奏报、守卫将政变的脚步逼近眼前。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "‌神龙政变‌是公元705年发生的一场宫廷政变，以宰相张柬之为首的朝臣联合太子李显，诛杀武则天宠臣张易之、张昌宗兄弟，逼迫病重的武则天退位，最终恢复李唐王朝的统治。这场政变发生在武则天晚年，当时她已82岁，长期沉湎享乐，宠信“二张”兄弟，导致朝政被其干预，甚至威胁到太子李显的地位。张易之、张昌宗倚仗女皇宠信，专权跋扈，连武则天的子侄都争相巴结，称张易之为“五郎”而不敢直呼其名。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["wuzetian"],
    recommendedViewpointIds: ["wuzetian"],
    hasPlayableStory: true,
    backdropTone: "jade",
  },
  {
    id: "reform-of-shang-yang",
    title: "商鞅变法",
    era: "战国",
    category: "权谋博弈",
    summary: "暂未推出",
    status: "planned",
    statusLabel: "计划中",
    description:
      "暂未推出",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: [],
    recommendedViewpointIds: [],
    hasPlayableStory: true,
    backdropTone: "ink",
  },
  {
    id: "empty-city-stratagem",
    title: "空城计",
    era: "三国",
    category: "战场军略",
    summary: "城门大开、琴声不乱，诸葛亮究竟采取何策？。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "空城计是三国时期蜀汉丞相诸葛亮智退曹魏军队的著名策略事件。公元228年，诸葛亮北伐时，司马懿率领魏军大举进攻，蜀军主力尚未到位，城内兵力极为薄弱。面对数万魏军压境，诸葛亮镇定自若，他命令关闭城门，撤去守卫，大量士兵隐藏不见，并自己身着文官服饰，坐于城楼上弹琴，神态悠闲，表情从容。司马懿察觉城中无明显防御，起初怀疑有伏兵，但诸葛亮从容自信的气度令他犹豫不决。经过一番权衡，司马懿最终认定此城可能有埋伏，为避免损失而撤兵，空城得以保全。此计充分展示了诸葛亮的心理战术和谋略才能，也体现了兵法中“虚实结合”的智慧。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["zhuge-liang", "simayi"],
    recommendedViewpointIds: ["zhuge-liang"],
    hasPlayableStory: true,
    backdropTone: "ink",
  },
  {
    id: "heroes-over-wine",
    title: "煮酒论英雄",
    era: "东汉末",
    category: "权谋博弈",
    summary: "这场看似是闲谈的酒局，却暗藏玄机。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "“煮酒论英雄”是东汉末年曹操与刘备之间的一次著名对话事件，记载于《三国演义》中，并有历史记载的影子。公元199年，曹操权势渐盛，控制了北方大部分地区，而刘备在袁绍势力衰落后辗转归附曹操。某日，曹操设宴请刘备，二人共饮煮酒，席间谈及天下英雄人物。曹操指出天下英雄各有不同之处，并暗示刘备的雄才大略，但刘备保持谦逊，从容应对。席间气氛表面平和，但实际上曹操心中试探刘备的意图与威胁。刘备则巧妙应对，既不显锋芒，又表现出自己的抱负和德行。此对话被后世文学作品加工为智慧与政治谋略的象征，反映了权力斗争中的试探与心理博弈。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["liubei", "caocao"],
    recommendedViewpointIds: ["liubei"],
    hasPlayableStory: true,
    backdropTone: "amber",
  },
  {
    id: "cup-wine-release-power",
    title: "杯酒释兵权",
    era: "北宋",
    category: "宫廷朝堂",
    summary: "一场酒宴，将最重要的兵权悄悄收回了皇帝手里。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "“杯酒释兵权”是北宋时期宋神宗时期发生的一起著名政治事件，标志着文官对武将的掌控巩固。公元1086年，权臣王安石推行新法，宋神宗支持改革，但地方武将手握兵权，可能对中央政令构成威胁。为避免军权过度集中，宋神宗采取“杯酒释兵权”的策略，即以宴会之名，邀功勋武将入宫饮酒，通过温和且礼仪化的方式劝其交出兵权。王安石及宰相团队配合，策划了整个过程，使武将不至于起疑或反感。通过此策略，宋神宗成功解除部分武将的实权，将军事权力集中于文官系统，强化了中央集权，减少了地方割据风险。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["zhaokuangyin"],
    recommendedViewpointIds: ["zhaokuangyin"],
    hasPlayableStory: true,
    backdropTone: "amber",
  },
  {
    id: "jingke-assassinates-qin",
    title: "荆轲刺秦",
    era: "战国",
    category: "现场行动",
    summary: "图穷匕见的那一刻，生死一线。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "荆轲刺秦是战国末期燕国为阻止秦国吞并六国而策划的一起著名刺杀事件。当时，秦王政雄心勃勃，秦国迅速崛起，燕国为自保，燕太子丹密谋刺杀秦王。荆轲，燕国勇士，被选中为刺客。他与助手携带燕国叛将樊於期的首级和一幅献给秦王的地图作为“礼物”，前往咸阳进行行刺。荆轲初见秦王时，表面镇定，但内心紧张，他等待接近秦王的最佳时机。在接近秦王后，荆轲拔剑刺向秦王，但因动作稍慢且秦王躲闪，未能成功刺中要害。秦王大喊求救，侍从反应迅速将荆轲制服。荆轲最终被杀，刺杀行动以失败告终。整个事件过程惊心动魄，展现了荆轲的勇气与决心，同时也暴露了秦王的警觉与强权。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["jingke", "yingzheng"],
    recommendedViewpointIds: ["jingke"],
    hasPlayableStory: true,
    backdropTone: "crimson",
  },
  {
    id: "tianji-horse-race",
    title: "田忌赛马",
    era: "战国",
    category: "权谋博弈",
    summary: "或许策略胜过实力，赛马的出场顺序也能改变胜负。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "田忌赛马是战国时期齐国著名的智谋故事，记载于《史记·孙子吴起列传》中。田忌是齐国的一位将领，他与齐国的国君齐威王经常赛马，但由于其上、中、下等马匹实力不如国君，屡屡落败。著名军事家孙膑见状，为田忌设计策略。孙膑建议田忌将自己的下等马与国君的上等马对阵，中等马对中等马，上等马对下等马。比赛时，田忌按此策略安排赛马，虽然下等马败给了国君的上等马，但上等马战胜了国君的下等马，中等马战胜中等马，最终田忌以二胜一负的总成绩获胜。此计充分体现了策略运用、因势利导和灵活排兵布阵的智慧。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["tianji", "sunbin"],
    recommendedViewpointIds: ["tianji"],
    hasPlayableStory: true,
    backdropTone: "jade",
  },
  {
    id: "break-cauldrons-sink-boats",
    title: "破釜沉舟",
    era: "秦末",
    category: "战场军略",
    summary: "锅被砸碎、船被烧断之后，士兵们只能奋力向前了。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "项羽率军渡过长江，进入秦军控制的关中地区。当时楚军人数有限，后路被秦军重重包围，面临极大压力。为了激励士兵、消除退路，项羽下令将军队所用的锅釜砸毁、船只沉入江中，使军队无法退却，只能向前作战。士兵面对生死局势，士气被彻底激发，奋力迎敌。在随后的战斗中，楚军以必死之心攻势猛烈，最终成功击败秦军，取得关键性胜利，为楚汉争霸奠定基础。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["xiangyu"],
    recommendedViewpointIds: ["xiangyu"],
    hasPlayableStory: true,
    backdropTone: "crimson",
  },
  {
    id: "debate-with-wu-scholars",
    title: "舌战群儒",
    era: "三国",
    category: "宫廷朝堂",
    summary: "朝堂上的战场，看诸葛亮如何用口才和智慧赢得尊重。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "“舌战群儒”是三国时期蜀汉丞相诸葛亮在隆中时期与曹魏学者辩论的著名故事。《三国演义》中描写，诸葛亮在刘备入川之前，为巩固地位和争取人才，曾在东吴与刘备的谋士及地方儒生进行辩论。当时，一群自称学识渊博的儒士对刘备集团的政治和军事策略提出质疑，试图挑战诸葛亮的见解。诸葛亮以条理清晰、逻辑严密、口才卓越的方式回应，逐一反驳对方的观点，展示了自己的智慧与政治远见。通过辩论，诸葛亮不仅赢得了在场文士的尊重，也强化了刘备集团在民间和士人中的威望，为后续联合抗魏、稳固蜀汉政权奠定了舆论基础。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["zhuge-liang"],
    recommendedViewpointIds: ["zhuge-liang"],
    hasPlayableStory: true,
    backdropTone: "ink",
  },
  {
    id: "scrape-bone-healing",
    title: "刮骨疗毒",
    era: "三国",
    category: "现场行动",
    summary: "刀已经架在身上了，关羽还能保持镇定吗？",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "‌关羽刮骨疗毒‌发生于‌建安二十四年‌（公元219年）左右，是关羽在攻打樊城时，被曹军弓弩手射中右臂，箭头有毒，毒入骨髓。伤后每逢阴雨，骨痛难忍，医生建议需剖开手臂、刮骨去毒。关羽当即伸臂让医者施术，‌手术过程中饮酒食肉、谈笑自若‌，全无痛苦之色，展现了其超凡的意志力。此事在《三国志·关羽传》中有明确记载，原文为：“羽尝为流矢所中，贯其左臂，后创虽愈，每至阴雨，骨常疼痛……羽便伸臂令医劈之。”值得注意的是，虽然《三国演义》将为关羽疗伤的医生描绘为神医‌华佗‌，但根据史料考证，‌华佗早在公元208年左右已被曹操杀害‌，而关羽中箭是在公元219年，时间上无法吻合，因此为关羽刮骨的医生并非华佗，而是‌一位无名医者‌。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["guanyu", "huatuo"],
    recommendedViewpointIds: ["guanyu"],
    hasPlayableStory: true,
    backdropTone: "jade",
  },
  {
    id: "boil-beans-burn-stalks",
    title: "煮豆燃萁",
    era: "三国",
    category: "宫廷朝堂",
    summary: "殿中只给七步，曹植正用诗给自己谋求一条活路。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "“煮豆燃萁”原本出自曹植的诗作《七步诗》，描述了兄弟之间的矛盾与互相残害的悲剧。曹植与曹丕为曹操之子，兄弟间因继承权发生争斗。曹丕掌权后，怀疑曹植谋权篡位，多次对其进行打压。传说曹丕曾要求曹植在七步之内作诗，曹植当场作出《七步诗》，其中以“煮豆燃萁，豆在釜中泣”喻兄弟相残，如同豆在锅中，燃萁作柴，豆因萁而被煮，表达了曹植对家族内部争斗的哀叹。诗中语言简练却寓意深刻，暗含对兄弟反目、权力争夺及人情冷暖的感慨。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["caozhi", "caopi"],
    recommendedViewpointIds: ["caozhi"],
    hasPlayableStory: true,
    backdropTone: "amber",
  },
  {
    id: "humen-destroy-opium",
    title: "虎门销烟",
    era: "清",
    category: "现场行动",
    summary: "面对鸦片泛滥，林则徐采取了公开销毁的强硬措施，展示了决心和行动力。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "林则徐奉命到广东禁烟，面对鸦片泛滥，民生受害严重。他严查鸦片贸易，将缴获的鸦片集中于虎门海滩，并组织公开焚毁。烈火熊熊，烟雾弥漫，展示了政府打击鸦片的决心。此举既威慑了鸦片商，也表达了保护民众、维护国法的态度。事件引发国内外关注，为中英关系带来紧张，成为导致第一次鸦片战争的直接导火索。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["linzexu"],
    recommendedViewpointIds: ["linzexu"],
    hasPlayableStory: true,
    backdropTone: "jade",
  },
  {
    id: "bearing-thorns-apology",
    title: "负荆请罪",
    era: "战国",
    category: "情感和解",
    summary: "门外的人背着荆条而来，门内的人却能放下成见，这样的和解令人动容。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "赵国将军廉颇与宰相蔺相如因误会产生隔阂，双方互不相让，士兵和民众也对其争执关注。后来廉颇意识到自己错在先，决定主动求和。他背负荆条，步行至蔺相如府前请罪，表示愿受责罚。蔺相如宽容接纳，不计前嫌，两人冰释前嫌，再度携手合作。事件不仅化解了个人恩怨，也保证了赵国内部团结，为国家安全和政治稳定创造了条件。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["linxiangru", "lianpo"],
    recommendedViewpointIds: ["linxiangru"],
    hasPlayableStory: true,
    backdropTone: "bronze",
  },
  {
    id: "smash-water-jar",
    title: "司马光砸缸",
    era: "北宋",
    category: "现场行动",
    summary: "司马光在危急时刻展现了果断和应变能力，成功救出溺水的孩童，这一事件成为他机智勇敢的象征。",
    status: "playable",
    statusLabel: "已开放试玩",
    description:
      "少年司马光与同伴在家中玩耍时，一名孩童不慎掉入大水缸，情况危急。司马光迅速反应，意识到普通救援工具不足，立即用石头砸破水缸，使水倒出，溺水孩童得以脱险。在这一过程中，司马光镇定果断、临危不乱，展示了敏捷的思维和果敢行动能力。此事充分体现了其机智、勇敢以及临场应变能力，为后世赞颂。",
    backdropLabel: "",
    backdropDescription:
      "",
    availableViewpointIds: ["simaguang"],
    recommendedViewpointIds: ["simaguang"],
    hasPlayableStory: true,
    backdropTone: "bronze",
  },
];
//此处为历史事件结构补充处
const figureEventRelations: FigureEventRelation[] = [
  {
    id: "liubang-hongmen-banquet",
    figureId: "liubang",
    eventId: "hongmen-banquet",
    eventTitle: "鸿门宴",
    summary:
      "从鸿门宴进入刘邦的一次险局。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "xiangyu-hongmen-banquet",
    figureId: "xiangyu",
    eventId: "hongmen-banquet",
    eventTitle: "鸿门宴",
    summary:
      "从鸿门宴进入项羽所处的决断现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "zhuge-liang-red-cliffs",
    figureId: "zhuge-liang",
    eventId: "battle-of-red-cliffs",
    eventTitle: "赤壁之战",
    summary:
      "从赤壁之战进入联盟成形后的现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "zhouyu-red-cliffs",
    figureId: "zhouyu",
    eventId: "battle-of-red-cliffs",
    eventTitle: "赤壁之战",
    summary:
      "从赤壁之战进入联军主导者的调度现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "zhouyu-alliance-command",
    figureId: "zhouyu",
    eventTitle: "联吴抗曹与火攻主导",
    summary:
      "从联军主导者的调度现场进入火攻主导者的调度现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "huang-gai-red-cliffs",
    figureId: "huang-gai",
    eventId: "battle-of-red-cliffs",
    eventTitle: "赤壁之战",
    summary:
      "从赤壁之战进入最危险的一环执行现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "huang-gai-risk-commitment",
    figureId: "huang-gai",
    eventTitle: "苦肉计与火攻执行",
    summary:
      "从赤壁之战进入最危险的一环执行现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "zhuge-liang-longzhong",
    figureId: "zhuge-liang",
    eventTitle: "隆中对与北伐",
    summary:
      "隆中对与北伐。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "wuzetian-shenlong-coup-eve",
    figureId: "wuzetian",
    eventId: "shenlong-coup-eve",
    eventTitle: "神龙政变前夜",
    summary:
      "从神龙政变前夜进入武则天病中的一夜。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "wuzetian-establish-zhou",
    figureId: "wuzetian",
    eventTitle: "临朝称制与武周建立",
    summary:
      "临朝称制与武周建立。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "wuzetian-court-reform",
    figureId: "wuzetian",
    eventTitle: "用人与秩序重建",
    summary:
      "人用与秩序重建。",
    canBeViewpoint: false,
    isRecommendedViewpoint: false,
  },
  {
    id: "liqingzhao-southern-song-migration",
    figureId: "liqingzhao",
    eventTitle: "南渡词作与时代失序",
    summary:
      "南渡词作与时代失序。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "liqingzhao-jinshi-legacy",
    figureId: "liqingzhao",
    eventTitle: "金石收藏与记忆保存",
    summary:
      "金石收藏与记忆保存。",
    canBeViewpoint: false,
    isRecommendedViewpoint: false,
  },
  {
    id: "wangyangming-longchang-enlightenment",
    figureId: "wangyangming",
    eventTitle: "龙场悟道",
    summary:
      "从龙场悟道进入王阳明的顿悟现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "wangyangming-prince-ning-rebellion",
    figureId: "wangyangming",
    eventTitle: "平定宁王之乱",
    summary:
      "从平定宁王之乱进入王阳明的军事指挥现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "zhuge-liang-empty-city",
    figureId: "zhuge-liang",
    eventId: "empty-city-stratagem",
    eventTitle: "空城计",
    summary:
      "从空城计进入城楼上的判断现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "simayi-empty-city",
    figureId: "simayi",
    eventId: "empty-city-stratagem",
    eventTitle: "空城计",
    summary:
      "从空城计进入司马懿的犹豫现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "liubei-heroes-over-wine",
    figureId: "liubei",
    eventId: "heroes-over-wine",
    eventTitle: "煮酒论英雄",
    summary:
      "从煮酒论英雄进入一场高压酒局。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "caocao-heroes-over-wine",
    figureId: "caocao",
    eventId: "heroes-over-wine",
    eventTitle: "煮酒论英雄",
    summary:
      "从煮酒论英雄进入主导试探的一侧。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "zhaokuangyin-cup-wine",
    figureId: "zhaokuangyin",
    eventId: "cup-wine-release-power",
    eventTitle: "杯酒释兵权",
    summary:
      "从杯酒释兵权进入一场不动刀兵的收权酒宴。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "jingke-assassinate-qin",
    figureId: "jingke",
    eventId: "jingke-assassinates-qin",
    eventTitle: "荆轲刺秦",
    summary:
      "从荆轲刺秦进入图穷匕见前后的极限现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "yingzheng-assassinate-qin",
    figureId: "yingzheng",
    eventId: "jingke-assassinates-qin",
    eventTitle: "荆轲刺秦",
    summary:
      "从荆轲刺秦进入秦王朝见的一侧。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "tianji-horse-race-main",
    figureId: "tianji",
    eventId: "tianji-horse-race",
    eventTitle: "田忌赛马",
    summary:
      "从田忌赛马进入赛场上的回合判断。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "sunbin-horse-race",
    figureId: "sunbin",
    eventId: "tianji-horse-race",
    eventTitle: "田忌赛马",
    summary:
      "从田忌赛马进入谋划的一侧。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "xiangyu-break-cauldrons",
    figureId: "xiangyu",
    eventId: "break-cauldrons-sink-boats",
    eventTitle: "破釜沉舟",
    summary:
      "从破釜沉舟进入楚军决战前夜。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "zhuge-liang-debate-wu",
    figureId: "zhuge-liang",
    eventId: "debate-with-wu-scholars",
    eventTitle: "舌战群儒",
    summary:
      "从舌战群儒进入东吴朝堂的连续交锋。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "guanyu-scrape-bone",
    figureId: "guanyu",
    eventId: "scrape-bone-healing",
    eventTitle: "刮骨疗毒",
    summary:
      "从刮骨疗毒进入军帐里的极近距离现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "huatuo-scrape-bone",
    figureId: "huatuo",
    eventId: "scrape-bone-healing",
    eventTitle: "刮骨疗毒",
    summary:
      "从刮骨疗毒进入华佗的医案现场。",
    canBeViewpoint: false,
    isRecommendedViewpoint: false,
  },
  {
    id: "caozhi-boil-beans",
    figureId: "caozhi",
    eventId: "boil-beans-burn-stalks",
    eventTitle: "煮豆燃萁",
    summary:
      "从煮豆燃萁进入七步之内必须开口的殿中现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "caopi-boil-beans",
    figureId: "caopi",
    eventId: "boil-beans-burn-stalks",
    eventTitle: "煮豆燃萁",
    summary:
      "从煮豆燃萁进入曹丕施压的一侧。",
    canBeViewpoint: false,
    isRecommendedViewpoint: false,
  },
  {
    id: "linzexu-humen",
    figureId: "linzexu",
    eventId: "humen-destroy-opium",
    eventTitle: "虎门销烟",
    summary:
      "从虎门销烟进入公开行动的现场。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "linxiangru-bearing-thorns",
    figureId: "linxiangru",
    eventId: "bearing-thorns-apology",
    eventTitle: "负荆请罪",
    summary:
      "从负荆请罪进入府门前的迎与不迎。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
  {
    id: "lianpo-bearing-thorns",
    figureId: "lianpo",
    eventId: "bearing-thorns-apology",
    eventTitle: "负荆请罪",
    summary:
      "从负荆请罪进入廉颇亲自登门的一侧。",
    canBeViewpoint: true,
    isRecommendedViewpoint: false,
  },
  {
    id: "simaguang-smash-water-jar",
    figureId: "simaguang",
    eventId: "smash-water-jar",
    eventTitle: "司马光砸缸",
    summary:
      "从司马光砸缸进入庭院里的短瞬间险情。",
    canBeViewpoint: true,
    isRecommendedViewpoint: true,
  },
];

const hongmenViewpoints: EventViewpoint[] = [
  {
    id: "liubang",
    figureId: "liubang",
    name: "刘邦",
    title: "主角视角",
    summary: "你刚入关中，声势渐起，但真正危险的并不是战场，而是宴席之上的分寸与眼色。",
    perspective: "你要在示弱、观察和保命之间找到平衡，不能让任何一句话暴露真实意图。",
    pressure: "席上每一次停顿都可能被放大，你得一边稳住气息，一边判断谁真正站在你这边。",
    portraitLabel: "汉",
    portraitTone: "bronze",
    isRecommended: true,
  },
  {
    id: "xiangyu",
    figureId: "xiangyu",
    name: "项羽",
    title: "宴席主人视角",
    summary: "你手握军势与主动，但真正考验你的不是兵锋，而是这场宴席里每个人的态度与分量。",
    perspective: "你要在威压、试探和顾全名望之间拿捏分寸，判断刘邦到底该留、该压，还是该放。",
    pressure: "帐中众人的每一句劝说都在推着局势变化，你既不能显得迟疑，也不能让场面失去控制。",
    portraitLabel: "楚",
    portraitTone: "crimson",
  },
];

const redCliffsViewpoints: EventViewpoint[] = [
  {
    id: "zhouyu",
    figureId: "zhouyu",
    name: "周瑜",
    title: "统帅视角",
    summary: "你要把联盟、军心和战术压到同一个时间点上，任何一步失衡都会让整场布局失去意义。",
    perspective: "你关心的不是单一奇谋，而是如何让每个环节在同一刻成立。",
    pressure: "风向、军心和对手的误判都必须同时落位，你还得稳住全军对你的信任。",
    portraitLabel: "吴",
    portraitTone: "jade",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "zhuge-liang",
    figureId: "zhuge-liang",
    name: "诸葛亮",
    title: "联盟谋臣视角",
    summary: "你站在联盟一侧，更在意的是如何稳住合作关系，并让关键判断在正确的时机被接受。",
    perspective: "你要让布局显得自然，又不能让任何一步暴露得太早。",
    pressure: "若判断太慢，战机会消失；若判断太快，也可能让联盟先起疑心。",
    portraitLabel: "蜀",
    portraitTone: "ink",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "huang-gai",
    figureId: "huang-gai",
    name: "黄盖",
    title: "执行者视角",
    summary: "你知道这场胜负最后会落到执行上，真正危险的不是计谋本身，而是自己能否撑到最后一步。",
    perspective: "你的任务是把最危险的一步做成最像真的一幕。",
    pressure: "只要你露出一点破绽，整场火攻都会提前崩掉，你自己也未必还能全身而退。",
    portraitLabel: "火",
    portraitTone: "crimson",
    isPlayable: true,
  },
];

const emptyCityViewpoints: EventViewpoint[] = [
  {
    id: "zhuge-liang",
    figureId: "zhuge-liang",
    name: "诸葛亮",
    title: "城楼主事视角",
    summary:
      "你手里几乎没有可用之兵，真正能守住这座城的，不是兵力，而是你能不能先守住所有人的心。",
    perspective:
      "你得在最短时间里判断局势、稳住城中惊慌，再把从容做给司马懿看。",
    pressure:
      "真正危险的不是敌军已经到城下，而是只要城楼上先乱一步，这座空城就会立刻露出空心。",
    portraitLabel: "蜀",
    portraitTone: "ink",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "simayi",
    figureId: "simayi",
    name: "司马懿",
    title: "城下统帅视角",
    summary:
      "你远望城门洞开、城楼琴声未乱，更在意的不是眼前有没有伏兵，而是诸葛亮为什么敢让你看见这副从容。",
    perspective:
      "后续这条视角适合扩成司马懿在疑与不疑之间如何作判断。",
    pressure:
      "当前第一版先完整支持诸葛亮视角，司马懿视角已纳入准备页与人物关系，但暂不承诺正式游玩。",
    portraitLabel: "魏",
    portraitTone: "ink",
    availabilityLabel: "当前仅开放预览视角",
    availabilityNote:
      "司马懿视角已经纳入这条事件的统一结构，但本轮只先完整支持诸葛亮正式游玩。",
    isPlayable: false,
  },
];

const heroesOverWineViewpoints: EventViewpoint[] = [
  {
    id: "liubei",
    figureId: "liubei",
    name: "刘备",
    title: "隐忍赴席视角",
    summary:
      "你被请来饮酒，桌上是青梅和温酒，真正压人的却不是酒味，而是曹操一句比一句更近的试探。",
    perspective:
      "你得在表面谦退里飞快判断每句话该怎么接，既不能显得迟钝，也不能让人看见你真正的志向。",
    pressure:
      "危险不在拔刀相向，而在一句失言就可能让对方确认你并非安分的客人。",
    portraitLabel: "蜀",
    portraitTone: "bronze",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "caocao",
    figureId: "caocao",
    name: "曹操",
    title: "酒局主导视角",
    summary:
      "你是这一桌酒局的主人，更清楚哪一句看似随口的闲谈，足够把刘备心里的真实分量逼出来。",
    perspective:
      "后续这条视角适合扩成曹操怎样在轻松笑谈里把危险压到对方面前。",
    pressure:
      "当前第一版先完整支持刘备视角，曹操视角已纳入准备页与人物关系，但暂不承诺正式游玩。",
    portraitLabel: "魏",
    portraitTone: "ink",
    availabilityLabel: "当前仅开放预览视角",
    availabilityNote:
      "曹操视角已经纳入这条事件的统一结构，但本轮只先完整支持刘备正式游玩。",
    isPlayable: false,
  },
];

const breakCauldronsViewpoints: EventViewpoint[] = [
  {
    id: "xiangyu",
    figureId: "xiangyu",
    name: "项羽",
    title: "军前主将视角",
    summary:
      "你站在楚军军前，真正要压下去的不是敌军，而是眼前这支军队看见船毁锅碎后那一瞬间可能先散掉的心。",
    perspective:
      "你必须把命令压得又短又重，让所有人知道今天已经没有退路，只有往前。",
    pressure:
      "你越是显出迟疑，军中越会先乱；可若只是高喊决战，却稳不住眼前的惊惧，这场死战还没开始就会先垮。",
    portraitLabel: "楚",
    portraitTone: "crimson",
    isRecommended: true,
    isPlayable: true,
  },
];

const bearingThornsViewpoints: EventViewpoint[] = [
  {
    id: "linxiangru",
    figureId: "linxiangru",
    name: "蔺相如",
    title: "府中主事视角",
    summary:
      "你在府中先听见的不是和解，而是一句异样的通报：廉颇背着荆条站在门外。真正难接的，不是见不见，而是怎样把这口气接稳。",
    perspective:
      "你要从门客的反应、廉颇的神色和堂前的沉默里判断，这次登门到底是作势，还是终于把那口硬气放下来了。",
    pressure:
      "若你一味责备，旧怨会重新挑起；若你轻轻带过，又接不住廉颇这一趟真正低头的重量。",
    portraitLabel: "赵",
    portraitTone: "jade",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "lianpo",
    figureId: "lianpo",
    name: "廉颇",
    title: "登门请罪视角",
    summary:
      "你站在蔺相如府门前，背上荆条压得比甲胄更沉。若这一步不能真低下头，前面的倔强就全变成笑话。",
    perspective:
      "后续这条视角适合扩成廉颇从门外走进堂前、一步步把羞愧说出口的另一侧体验。",
    pressure:
      "当前第一版先完整支持蔺相如视角，廉颇视角已纳入准备页与人物关系，但暂不承诺正式游玩。",
    portraitLabel: "赵",
    portraitTone: "crimson",
    availabilityLabel: "当前仅开放预览视角",
    availabilityNote:
      "廉颇视角已经纳入这条事件的统一结构，但本轮只先完整支持蔺相如正式游玩。",
    isPlayable: false,
  },
];

const cupWineViewpoints: EventViewpoint[] = [
  {
    id: "zhaokuangyin",
    figureId: "zhaokuangyin",
    name: "赵匡胤",
    title: "设宴收权视角",
    summary:
      "你坐在上首，举杯说的每一句都不高声，却要让功臣们自己一步步听明白：这场酒宴之后，兵权不能再留在他们手里。",
    perspective:
      "你必须一边观察旧部神色，一边把话锋从饮酒引到兵权与后患上，既不能失掉旧情，也不能把局面留给将来。",
    pressure:
      "今夜若把话说得太硬，旧部会寒心；说得太软，这场酒就白设了。真正的分寸，全压在你每一句看似轻松的话里。",
    portraitLabel: "宋",
    portraitTone: "amber",
    isRecommended: true,
    isPlayable: true,
  },
];

const tianjiHorseRaceViewpoints: EventViewpoint[] = [
  {
    id: "tianji",
    figureId: "tianji",
    name: "田忌",
    title: "赛场主位视角",
    summary:
      "你站在赛马场边，先看到的不是自己的马，而是齐王一方那种稳得像已经赢下来的气势。真正压人的，是明知不占上风还得当场决定怎么排这一场。",
    perspective:
      "你要在众目之下压住不安，听懂孙膑那句“先让一局”真正赌的是什么，再亲眼看着顺序把整场胜负一点点翻过来。",
    pressure:
      "若你不信孙膑，第一轮一输就会乱；若你信了，却撑不到后两轮，场边那些笑声也足够先把你的心压垮。",
    portraitLabel: "齐",
    portraitTone: "jade",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "sunbin",
    figureId: "sunbin",
    name: "孙膑",
    title: "谋划者视角",
    summary:
      "你看到的不是单匹马快慢，而是三轮次序里那道别人还没看见的破口。真正难的不是想出办法，而是让田忌在众人发笑前愿意照你的排法来。",
    perspective:
      "后续这条视角适合扩成孙膑如何在赛场边看穿强弱顺序，再把这一层判断稳稳推给田忌。",
    pressure:
      "当前第一版先完整支持田忌视角，孙膑视角已纳入准备页与人物关系，但暂不承诺正式游玩。",
    portraitLabel: "谋",
    portraitTone: "ink",
    availabilityLabel: "当前仅开放预览视角",
    availabilityNote:
      "孙膑视角已经纳入这条事件的统一结构，但本轮只先完整支持田忌正式游玩。",
    isPlayable: false,
  },
];

const scrapeBoneViewpoints: EventViewpoint[] = [
  {
    id: "guanyu",
    figureId: "guanyu",
    name: "关羽",
    title: "军帐主视角",
    summary:
      "你坐在军帐里，伤口已黑到骨边。帐中人都在等华佗开口，可真正要先稳住的，不只是手臂上的痛，还有所有人看向你的那口气。",
    perspective:
      "你不能在众人面前露怯，只能一边让华佗动手，一边把痛楚压进谈笑和动作里，让这场疗伤先稳过眼前。",
    pressure:
      "真正难的不是挨这一刀，而是刀一层层逼近时，你既不能让军心先乱，也不能让自己的威仪先碎。",
    portraitLabel: "蜀",
    portraitTone: "jade",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "huatuo",
    figureId: "huatuo",
    name: "华佗",
    title: "医者视角",
    summary:
      "你面对的不是普通刀伤，而是一位不能倒、也不肯失态的名将。真正难的不是下刀，而是在众目之下把最危险的一步稳稳做完。",
    perspective:
      "后续这条视角适合扩成华佗如何在军帐里判断风险、安置众人，再把刀真正落下去的另一侧体验。",
    pressure:
      "当前第一版先完整支持关羽视角，华佗视角已纳入准备页与人物关系，但暂不承诺正式游玩。",
    portraitLabel: "医",
    portraitTone: "amber",
    availabilityLabel: "当前仅开放预览视角",
    availabilityNote:
      "华佗视角已经纳入这条事件的统一结构，但本轮只先完整支持关羽正式游玩。",
    isPlayable: false,
  },
];

const smashWaterJarViewpoints: EventViewpoint[] = [
  {
    id: "simaguang",
    figureId: "simaguang",
    name: "司马光",
    title: "庭院主视角",
    summary:
      "你和几个孩子原本只是在院里玩耍，真正压到眼前的危险却只用了一声落水。别人还在惊叫时，你已经被迫去看缸口有多高、水有多深，还有什么东西能立刻砸开它。",
    perspective:
      "你来不及讲道理，也来不及等大人赶到，只能在几步之内把目光从落水的孩子、缸沿和地上的硬石之间连成一条最快的路。",
    pressure:
      "若你也跟着慌，时间就会被白白浪费；可若这一下判断错了，缸里的人也许根本等不到第二个办法。",
    portraitLabel: "宋",
    portraitTone: "jade",
    isRecommended: true,
    isPlayable: true,
  },
];

const shenlongViewpoints: EventViewpoint[] = [
  {
    id: "wuzetian",
    figureId: "wuzetian",
    name: "武则天",
    title: "病中女皇视角",
    summary:
      "你躺在病榻之间，却依然能从灯色、脚步和一句含糊的回话里听出宫中的气息变了。",
    perspective:
      "你要在疲惫中保持清醒，分辨谁还在说真话，谁已经开始替新的局势留退路。",
    pressure:
      "真正逼近你的不是一纸大义名分，而是这座宫殿里每一道门、每一次传报、每一个名字都在慢慢倒向另一边。",
    portraitLabel: "周",
    portraitTone: "jade",
    isRecommended: true,
    isPlayable: true,
  },
];

const humenViewpoints: EventViewpoint[] = [
  {
    id: "linzexu",
    figureId: "linzexu",
    name: "林则徐",
    title: "督办者视角",
    summary:
      "你站在虎门现场，不是在讲一场近代史，而是在盯着箱数、封条、销烟池和围观人群，确保这一天真的按规程落下去。",
    perspective:
      "你要一边压住现场的杂音，一边让每一步查验、登记、倾倒都稳稳推进。真正沉重的不是一句口号，而是海风里每一箱鸦片都在众目睽睽之下被推进池中。",
    pressure:
      "四周有清军、官员、百姓，也有并不欢迎这场公开行动的人在远处盯着。你不能乱，也不能让手底下的人出错，因为这一天本身就会被所有人记住。",
    portraitLabel: "清",
    portraitTone: "jade",
    isRecommended: true,
    isPlayable: true,
  },
];

const debateWithWuViewpoints: EventViewpoint[] = [
  {
    id: "zhuge-liang",
    figureId: "zhuge-liang",
    name: "诸葛亮",
    title: "朝堂使者视角",
    summary:
      "你被引入东吴议事堂时就知道，这不是普通会见。堂上群臣不是等你陈情，而是等着看你能不能在一轮轮质疑里站稳。",
    perspective:
      "你要一边接住张昭和群臣的尖锐发问，一边把话题从刘备兵少势弱，慢慢扳到东吴自己敢不敢守、能不能守。",
    pressure:
      "真正的分量不只在你说什么，更在你每回一句之后，孙权有没有更认真听、堂上的反对声有没有被你撬开一道缝。",
    portraitLabel: "蜀",
    portraitTone: "ink",
    isRecommended: true,
    isPlayable: true,
  },
];

const jingkeViewpoints: EventViewpoint[] = [
  {
    id: "jingke",
    figureId: "jingke",
    name: "荆轲",
    title: "刺客视角",
    summary:
      "你带着地图和匕首站在秦宫礼仪之内，越是靠近秦王，越要把手上的每个动作做得像寻常进献。",
    perspective:
      "你得在克制、决绝和压住心跳之间走完这段朝见，连同伴失态都不能让你慢半步。",
    pressure:
      "真正危险的不是拔出匕首那一刻，而是匕首露出之前的每一步都不能露馅。",
    portraitLabel: "燕",
    portraitTone: "crimson",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "yingzheng",
    figureId: "yingzheng",
    name: "嬴政",
    title: "秦王视角",
    summary:
      "你坐在大殿之上，先看到的是一场礼数周全的进献，直到有人失态，危险才像裂缝一样突然显形。",
    perspective:
      "你更关心的是谁在殿中先露出不对劲，以及自己还能不能在最短时间内把局势重新夺回手里。",
    pressure:
      "这条视角后续适合做成高压警觉的宫廷现场，但当前第一版还没有完整正式游玩支持。",
    portraitLabel: "秦",
    portraitTone: "ink",
    availabilityLabel: "当前仅开放预览视角",
    availabilityNote:
      "嬴政视角已经纳入准备页与人物关系，但本轮只先完整支持荆轲正式游玩。",
    isPlayable: false,
  },
];

const boilBeansViewpoints: EventViewpoint[] = [
  {
    id: "caozhi",
    figureId: "caozhi",
    name: "曹植",
    title: "七步应命视角",
    summary:
      "你被召入殿中时就知道这不是寻常考问。曹丕给你的，不是展示才华的机会，而是七步之内必须开口自救的逼视。",
    perspective:
      "你要一边稳住神色，一边在每一步里把最不敢直说的话藏进诗里。殿中的沉默、曹丕的目光和自己的心跳，都会比脚步更快地把你推向句子的尽头。",
    pressure:
      "真正可怕的不是作不出诗，而是诗若不够深，便救不了命；若说得太直，又会在满殿目光前把自己逼进更窄的角落。",
    portraitLabel: "魏",
    portraitTone: "amber",
    isRecommended: true,
    isPlayable: true,
  },
  {
    id: "caopi",
    figureId: "caopi",
    name: "曹丕",
    title: "施压者视角",
    summary:
      "你坐在上首，给出的不是一纸判决，而是一道逼人当场作答的试题。你想看的不是诗才本身，而是曹植敢把话说到哪一步。",
    perspective:
      "后续这条视角适合扩成更冷、更近的宫廷压迫现场，但当前第一版仍以曹植求生视角为完整主路径。",
    pressure:
      "这条视角已经纳入事件结构与人物关系，但本轮先只完整支持曹植正式游玩。",
    portraitLabel: "魏",
    portraitTone: "ink",
    availabilityLabel: "当前仅开放预览视角",
    availabilityNote:
      "曹丕视角已纳入准备页与人物关系，但当前只开放曹植的完整正式游玩体验。",
    isPlayable: false,
  },
];

const hongmenSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "夜",
    tone: "ink",
    subtitle: "旁白视角",
    alignment: "center",
  },
  xiangyu: {
    label: "楚",
    tone: "crimson",
    subtitle: "宴席主人",
    alignment: "right",
  },
  "fan-kuai": {
    label: "卫",
    tone: "crimson",
    subtitle: "强势闯入",
    alignment: "left",
  },
  decision: {
    label: "择",
    tone: "amber",
    subtitle: "关键节点",
    alignment: "center",
  },
  ending: {
    label: "局",
    tone: "jade",
    subtitle: "阶段收束",
    alignment: "center",
  },
  liubang: {
    label: "汉",
    tone: "bronze",
    subtitle: "第一视角",
    alignment: "left",
  },
  xiangbo: {
    label: "项",
    tone: "jade",
    subtitle: "中间协调者",
    alignment: "left",
  },
};

const redCliffsSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "夜",
    tone: "ink",
    subtitle: "江面旁白",
    alignment: "center",
  },
  zhouyu: {
    label: "吴",
    tone: "jade",
    subtitle: "联军主将",
    alignment: "right",
  },
  "zhuge-liang": {
    label: "蜀",
    tone: "ink",
    subtitle: "联盟谋臣",
    alignment: "left",
  },
  "huang-gai": {
    label: "吴",
    tone: "crimson",
    subtitle: "火攻执行者",
    alignment: "center",
  },
  decision: {
    label: "择",
    tone: "amber",
    subtitle: "关键节点",
    alignment: "center",
  },
  ending: {
    label: "焰",
    tone: "amber",
    subtitle: "阶段收束",
    alignment: "center",
  },
};

const shenlongSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "夜",
    tone: "ink",
    subtitle: "病中旁白",
    alignment: "center",
  },
  wuzetian: {
    label: "周",
    tone: "jade",
    subtitle: "病中女皇",
    alignment: "center",
  },
  "shangguan-waner": {
    label: "诏",
    tone: "amber",
    subtitle: "上官婉儿",
    alignment: "left",
  },
  attendant: {
    label: "侍",
    tone: "ink",
    subtitle: "近侍",
    alignment: "left",
  },
  messenger: {
    label: "报",
    tone: "amber",
    subtitle: "宫人传报",
    alignment: "left",
  },
  visitor: {
    label: "门",
    tone: "crimson",
    subtitle: "殿外来人",
    alignment: "center",
  },
  ending: {
    label: "晓",
    tone: "amber",
    subtitle: "余声收束",
    alignment: "center",
  },
};

const jingkeSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "殿",
    tone: "ink",
    subtitle: "刺客旁白",
    alignment: "center",
  },
  jingke: {
    label: "燕",
    tone: "crimson",
    subtitle: "刺客荆轲",
    alignment: "center",
  },
  qinwuyang: {
    label: "随",
    tone: "amber",
    subtitle: "秦舞阳",
    alignment: "left",
  },
  yingzheng: {
    label: "秦",
    tone: "ink",
    subtitle: "秦王",
    alignment: "right",
  },
  courtier: {
    label: "臣",
    tone: "ink",
    subtitle: "秦廷群臣",
    alignment: "left",
  },
  guard: {
    label: "卫",
    tone: "bronze",
    subtitle: "殿中侍卫",
    alignment: "left",
  },
  ending: {
    label: "尽",
    tone: "crimson",
    subtitle: "余声收束",
    alignment: "center",
  },
};

const jingkeAiBackdropMap = {
  "palace-outer-waiting": {
    label: "殿外",
    tone: "ink",
    description:
      "背景占位图：秦宫殿外的候见之地，靴底踏过石阶，殿门后的礼制与杀机都还被按在门内。",
    backgroundKey: "qin-palace-antehall",
  },
  "throne-court": {
    label: "朝堂",
    tone: "ink",
    description:
      "背景占位图：高阔朝堂、秦王座前的距离和礼数，把危险暂时藏在规矩里面。",
    backgroundKey: "qin-throne-hall",
  },
  "hall-chaos": {
    label: "乱局",
    tone: "crimson",
    description:
      "背景占位图：图穷匕见后的殿中混乱，脚步、喝止和兵刃声把原本整齐的秩序全部掀开。",
    backgroundKey: "qin-chaos-hall",
  },
} as const;

const emptyCitySpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "城",
    tone: "ink",
    subtitle: "楼上对峙",
    alignment: "center",
  },
  "zhuge-liang": {
    label: "蜀",
    tone: "ink",
    subtitle: "抚琴守城",
    alignment: "center",
  },
  simayi: {
    label: "魏",
    tone: "ink",
    subtitle: "城下观望",
    alignment: "center",
  },
  guard: {
    label: "城",
    tone: "amber",
    subtitle: "守城急报",
    alignment: "center",
  },
  attendant: {
    label: "楼",
    tone: "amber",
    subtitle: "随从传令",
    alignment: "center",
  },
  ending: {
    label: "静",
    tone: "amber",
    subtitle: "余惊未散",
    alignment: "center",
  },
};

const emptyCityAiBackdropMap = {
  "city-gate": {
    label: "城门",
    tone: "ink",
    description:
      "背景占位图：古城门、急报与城下将近的敌军，把整座城的呼吸都压得更急。",
    backgroundKey: "empty-city-gate",
  },
  "watchtower": {
    label: "城楼",
    tone: "ink",
    description:
      "背景占位图：城楼高处风更冷，香烟与琴声都被拉得很细，越从容越危险。",
    backgroundKey: "empty-city-watchtower",
  },
  "army-below": {
    label: "城下",
    tone: "amber",
    description:
      "背景占位图：魏军压到城下，旌旗、马蹄和观望都停在城外，所有人都在等主将那一刻判断。",
    backgroundKey: "empty-city-below",
  },
} as const;

const heroesOverWineSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "席",
    tone: "amber",
    subtitle: "杯中试探",
    alignment: "center",
  },
  liubei: {
    label: "蜀",
    tone: "bronze",
    subtitle: "隐忍赴席",
    alignment: "center",
  },
  caocao: {
    label: "魏",
    tone: "ink",
    subtitle: "笑谈设问",
    alignment: "center",
  },
  attendant: {
    label: "席",
    tone: "ink",
    subtitle: "侍从传话",
    alignment: "center",
  },
  ending: {
    label: "雷",
    tone: "amber",
    subtitle: "席后余惊",
    alignment: "center",
  },
};

const heroesOverWineAiBackdropMap = {
  "pavilion-waiting": {
    label: "亭下",
    tone: "amber",
    description:
      "背景占位图：雨气压在亭外，青梅和温酒都已备好，真正先到桌边的是无声的试探。",
    backgroundKey: "heroes-rain-pavilion",
  },
  "banquet-hall": {
    label: "酒席",
    tone: "amber",
    description:
      "背景占位图：室内酒席、青梅与温酒并排摆着，闲谈和试探一起落在席间。",
    backgroundKey: "heroes-banquet-hall",
  },
  "after-rain-courtyard": {
    label: "席后",
    tone: "ink",
    description:
      "背景占位图：雨声压低后，庭院和回廊都显得更安静，刚才酒席上的话却还在心里发响。",
    backgroundKey: "heroes-courtyard-after-rain",
  },
} as const;

const breakCauldronsSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "楚",
    tone: "crimson",
    subtitle: "军前旁白",
    alignment: "center",
  },
  xiangyu: {
    label: "楚",
    tone: "crimson",
    subtitle: "军前主将",
    alignment: "center",
  },
  soldier: {
    label: "卒",
    tone: "bronze",
    subtitle: "楚军士卒",
    alignment: "left",
  },
  officer: {
    label: "军",
    tone: "amber",
    subtitle: "军中传令",
    alignment: "left",
  },
  drummer: {
    label: "鼓",
    tone: "amber",
    subtitle: "战鼓号令",
    alignment: "left",
  },
  ending: {
    label: "战",
    tone: "crimson",
    subtitle: "军前收束",
    alignment: "center",
  },
};

const breakCauldronsAiBackdropMap = {
  "riverbank-after-crossing": {
    label: "河岸",
    tone: "ink",
    description:
      "背景占位图：楚军刚渡河后的河岸，水汽未散，兵甲和脚步都带着仓促与不安。",
    backgroundKey: "battle-riverbank-crossing",
  },
  "wrecked-retreat-line": {
    label: "断后",
    tone: "crimson",
    description:
      "背景占位图：后方断船、碎釜和火光并在一起，退路正被当着所有人的面一点点毁掉。",
    backgroundKey: "battle-retreat-cut",
  },
  "frontline-muster": {
    label: "军前",
    tone: "crimson",
    description:
      "背景占位图：军阵集结、战鼓待起，所有人的目光都压在军前那一道命令上。",
    backgroundKey: "battle-frontline-muster",
  },
  "dust-before-clash": {
    label: "阵前",
    tone: "amber",
    description:
      "背景占位图：远处尘土与旗影逼近，战鼓和甲叶声把人往前推，没人还能给自己找退路。",
    backgroundKey: "battle-before-clash",
  },
} as const;

const bearingThornsSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "赵",
    tone: "bronze",
    subtitle: "府中旁白",
    alignment: "center",
  },
  linxiangru: {
    label: "赵",
    tone: "jade",
    subtitle: "蔺相如",
    alignment: "center",
  },
  lianpo: {
    label: "赵",
    tone: "crimson",
    subtitle: "廉颇",
    alignment: "center",
  },
  retainer: {
    label: "门",
    tone: "amber",
    subtitle: "府中门客",
    alignment: "left",
  },
  servant: {
    label: "侍",
    tone: "amber",
    subtitle: "家臣通报",
    alignment: "left",
  },
  ending: {
    label: "和",
    tone: "amber",
    subtitle: "余声收束",
    alignment: "center",
  },
};

const bearingThornsAiBackdropMap = {
  "manor-courtyard": {
    label: "府中",
    tone: "bronze",
    description:
      "背景占位图：赵国上卿府中原本平静，风声过廊，门外却忽然传来不寻常的脚步与通报。",
    backgroundKey: "zhao-manor-courtyard",
  },
  "gate-steps": {
    label: "府门",
    tone: "crimson",
    description:
      "背景占位图：府门前石阶下，有人背着荆条停在那里，所有人的目光都先落在那副姿态上。",
    backgroundKey: "zhao-manor-gate",
  },
  "reception-hall": {
    label: "堂前",
    tone: "jade",
    description:
      "背景占位图：会客堂前气息压得很低，真正变化的不是礼节，而是两个人之间那一步步松动的防备。",
    backgroundKey: "zhao-manor-hall",
  },
} as const;

const cupWineSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "宋",
    tone: "amber",
    subtitle: "席间旁白",
    alignment: "center",
  },
  zhaokuangyin: {
    label: "宋",
    tone: "amber",
    subtitle: "赵匡胤",
    alignment: "center",
  },
  general: {
    label: "将",
    tone: "jade",
    subtitle: "席间将领",
    alignment: "left",
  },
  attendant: {
    label: "侍",
    tone: "amber",
    subtitle: "殿中内侍",
    alignment: "left",
  },
  ending: {
    label: "宴",
    tone: "amber",
    subtitle: "席后收束",
    alignment: "center",
  },
};

const cupWineAiBackdropMap = {
  "palace-banquet": {
    label: "酒宴",
    tone: "amber",
    description:
      "背景占位图：宫中夜宴灯火温稳，杯盏与菜肴都摆得亲近，真正渐渐变冷的是席间每个人听话的神色。",
    backgroundKey: "song-banquet-hall",
  },
  "hall-interior": {
    label: "殿内",
    tone: "amber",
    description:
      "背景占位图：殿内坐席不远，话声并不高，可每一句都能让在场的人意识到皇帝正在把退路说成恩典。",
    backgroundKey: "song-palace-interior",
  },
  "night-gate": {
    label: "宫门",
    tone: "ink",
    description:
      "背景占位图：夜色压在宫门外，酒席散去之后，真正留在心上的不是酒气，而是那几句已经无法装作没听懂的话。",
    backgroundKey: "song-palace-gate-night",
  },
} as const;

const tianjiHorseRaceSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "赛",
    tone: "jade",
    subtitle: "赛场旁白",
    alignment: "center",
  },
  tianji: {
    label: "齐",
    tone: "jade",
    subtitle: "田忌",
    alignment: "left",
  },
  sunbin: {
    label: "谋",
    tone: "ink",
    subtitle: "孙膑",
    alignment: "right",
  },
  qiwang: {
    label: "王",
    tone: "amber",
    subtitle: "齐王",
    alignment: "center",
  },
  crowd: {
    label: "众",
    tone: "bronze",
    subtitle: "场边反应",
    alignment: "left",
  },
  ending: {
    label: "局",
    tone: "amber",
    subtitle: "赛后收束",
    alignment: "center",
  },
};

const tianjiHorseRaceAiBackdropMap = {
  "racecourse-side": {
    label: "赛场",
    tone: "jade",
    description:
      "背景占位图：赛马场边旗影与尘土并起，齐王一方人马声势很足，真正压人的却是田忌看得出自己并不占上风。",
    backgroundKey: "horse-race-course",
  },
  "viewing-stand": {
    label: "看台",
    tone: "ink",
    description:
      "背景占位图：观赛台上视线压得很近，孙膑低声说顺序，旁人的笑和议论都能直接落到田忌耳边。",
    backgroundKey: "horse-race-viewing-stand",
  },
  "finish-lane": {
    label: "终点",
    tone: "amber",
    description:
      "背景占位图：终点扬尘渐散，齐王和场边众人的反应终于追上了胜负变化，田忌也在这里真正明白顺序翻局的分量。",
    backgroundKey: "horse-race-finish-lane",
  },
} as const;

const boilBeansSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "殿",
    tone: "ink",
    subtitle: "七步旁白",
    alignment: "center",
  },
  caozhi: {
    label: "诗",
    tone: "amber",
    subtitle: "曹植",
    alignment: "center",
  },
  caopi: {
    label: "魏",
    tone: "ink",
    subtitle: "曹丕",
    alignment: "right",
  },
  attendant: {
    label: "侍",
    tone: "bronze",
    subtitle: "殿中侍从",
    alignment: "left",
  },
  courtier: {
    label: "臣",
    tone: "ink",
    subtitle: "殿中群臣",
    alignment: "left",
  },
  ending: {
    label: "寒",
    tone: "amber",
    subtitle: "余声收束",
    alignment: "center",
  },
};

const boilBeansAiBackdropMap = {
  "hall-summons": {
    label: "召入",
    tone: "ink",
    description:
      "背景占位图：魏宫大殿冷而安静，殿门一合上，脚步与目光都像被压进同一条线里。",
    backgroundKey: "wei-palace-hall",
  },
  "counting-steps": {
    label: "七步",
    tone: "amber",
    description:
      "背景占位图：殿中地面、衣摆与落步之间的空隙都被数得很清楚，越往前走，越没有回头的余地。",
    backgroundKey: "wei-palace-dais",
  },
  "after-poem": {
    label: "余寒",
    tone: "ink",
    description:
      "背景占位图：诗成之后，殿内比先前更静，连灯影都像在等上首那个人先开口。",
    backgroundKey: "wei-palace-after-audience",
  },
} as const;

const scrapeBoneSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "帐",
    tone: "jade",
    subtitle: "军帐旁白",
    alignment: "center",
  },
  guanyu: {
    label: "蜀",
    tone: "jade",
    subtitle: "关羽",
    alignment: "center",
  },
  huatuo: {
    label: "医",
    tone: "amber",
    subtitle: "华佗",
    alignment: "left",
  },
  assistant: {
    label: "佐",
    tone: "amber",
    subtitle: "军医助手",
    alignment: "left",
  },
  soldier: {
    label: "军",
    tone: "ink",
    subtitle: "帐中将士",
    alignment: "right",
  },
  ending: {
    label: "余",
    tone: "amber",
    subtitle: "余声收束",
    alignment: "center",
  },
};

const scrapeBoneAiBackdropMap = {
  "healing-tent": {
    label: "军帐",
    tone: "jade",
    description:
      "背景占位图：帐中灯火偏低，药气压着布帛与兵甲的气味，几乎所有人都把呼吸放轻了。",
    backgroundKey: "war-tent-healing",
  },
  "surgery-table": {
    label: "疗伤",
    tone: "amber",
    description:
      "背景占位图：刀具、药物和布帛都摆在近处，真正压人的不是兵刃，而是所有人都知道那一刀很快就会落下。",
    backgroundKey: "war-tent-surgery",
  },
  "after-bandage": {
    label: "收束",
    tone: "amber",
    description:
      "背景占位图：包扎已成，帐中的压迫感慢慢松开，灯影、药气和人声都像刚从紧绷里退出来。",
    backgroundKey: "war-tent-recovery",
  },
} as const;

const smashWaterJarSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "院",
    tone: "jade",
    subtitle: "庭院旁白",
    alignment: "center",
  },
  simaguang: {
    label: "司",
    tone: "jade",
    subtitle: "司马光",
    alignment: "center",
  },
  child: {
    label: "童",
    tone: "amber",
    subtitle: "庭院玩伴",
    alignment: "left",
  },
  rescued: {
    label: "缸",
    tone: "bronze",
    subtitle: "落水孩童",
    alignment: "left",
  },
  adult: {
    label: "呼",
    tone: "amber",
    subtitle: "赶来的大人",
    alignment: "left",
  },
  ending: {
    label: "静",
    tone: "amber",
    subtitle: "余声收束",
    alignment: "center",
  },
};

const humenSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "潮",
    tone: "jade",
    subtitle: "现场旁白",
    alignment: "center",
  },
  linzexu: {
    label: "清",
    tone: "jade",
    subtitle: "林则徐",
    alignment: "center",
  },
  clerk: {
    label: "记",
    tone: "amber",
    subtitle: "现场小吏",
    alignment: "left",
  },
  officer: {
    label: "令",
    tone: "ink",
    subtitle: "督办官员",
    alignment: "right",
  },
  soldier: {
    label: "营",
    tone: "bronze",
    subtitle: "现场清军",
    alignment: "left",
  },
  citizen: {
    label: "众",
    tone: "amber",
    subtitle: "围观百姓",
    alignment: "left",
  },
  "foreign-observer": {
    label: "望",
    tone: "ink",
    subtitle: "远处旁观者",
    alignment: "right",
  },
  ending: {
    label: "海",
    tone: "jade",
    subtitle: "余声收束",
    alignment: "center",
  },
};

const debateWithWuSpeakerVisualMap: Record<string, EventSpeakerVisual> = {
  narration: {
    label: "吴",
    tone: "ink",
    subtitle: "堂上旁白",
    alignment: "center",
  },
  "zhuge-liang": {
    label: "蜀",
    tone: "ink",
    subtitle: "诸葛亮",
    alignment: "center",
  },
  zhangzhao: {
    label: "吴",
    tone: "amber",
    subtitle: "张昭",
    alignment: "left",
  },
  sunquan: {
    label: "吴",
    tone: "jade",
    subtitle: "孙权",
    alignment: "right",
  },
  courtier: {
    label: "臣",
    tone: "bronze",
    subtitle: "东吴群臣",
    alignment: "left",
  },
  usher: {
    label: "引",
    tone: "amber",
    subtitle: "引路内侍",
    alignment: "left",
  },
  ending: {
    label: "堂",
    tone: "amber",
    subtitle: "余声收束",
    alignment: "center",
  },
};

const smashWaterJarAiBackdropMap = {
  "courtyard-play": {
    label: "庭院",
    tone: "jade",
    description:
      "背景占位图：日间庭院里本来只有孩子们的嬉闹声，靠墙的大水缸安静立着，危险还没被谁真正当回事。",
    backgroundKey: "courtyard-children-play",
  },
  "water-jar-side": {
    label: "缸边",
    tone: "amber",
    description:
      "背景占位图：高缸、深水和缸口的高度一下把院中的惊慌全拢到同一个地方，所有目光都被迫贴到缸边。",
    backgroundKey: "courtyard-water-jar",
  },
  "after-rescue": {
    label: "得救",
    tone: "jade",
    description:
      "背景占位图：缸壁已裂，水沿着地面漫开，院中惊叫慢慢退下去，剩下的是刚逃过一劫后的余悸。",
    backgroundKey: "courtyard-after-rescue",
  },
} as const;

const humenAiBackdropMap = {
  "seaside-morning": {
    label: "虎门",
    tone: "jade",
    description:
      "背景占位图：海风很重，潮气裹着晨色压在现场，箱子、清军和围观的人都还没完全动起来。",
    backgroundKey: "humen-seaside-morning",
  },
  "opium-yard": {
    label: "查验",
    tone: "amber",
    description:
      "背景占位图：箱子一列列排开，封条、登记册和催促声把这里变成一处必须照规程推进的公开现场。",
    backgroundKey: "humen-opium-yard",
  },
  "destruction-pit": {
    label: "销烟池",
    tone: "ink",
    description:
      "背景占位图：石灰、海水和烟土混在一起，气味和声响让每一次倾倒都显得格外沉重。",
    backgroundKey: "humen-destruction-pit",
  },
  "crowd-edge": {
    label: "围观",
    tone: "amber",
    description:
      "背景占位图：远处有人议论、有人沉默，也有人只是盯着这场公开行动，等着看它会留下什么回声。",
    backgroundKey: "humen-crowd-edge",
  },
} as const;

const debateWithWuAiBackdropMap = {
  "court-approach": {
    label: "堂前",
    tone: "ink",
    description:
      "背景占位图：入吴堂前的长阶与门影，把还未开口的议论先压成了一股不太欢迎来客的气息。",
    backgroundKey: "wu-court-approach",
  },
  "debate-hall": {
    label: "朝堂",
    tone: "ink",
    description:
      "背景占位图：东吴议事堂上臣列分坐，真正紧的不是兵刃，而是一句句发问落到堂中时那种没法后退的压迫。",
    backgroundKey: "wu-court-hall",
  },
  dais: {
    label: "主位",
    tone: "jade",
    description:
      "背景占位图：主位与堂前之间隔着并不算远的距离，孙权的沉默和诸葛亮的应对都在这里被看得格外清楚。",
    backgroundKey: "wu-court-dais",
  },
  "after-debate": {
    label: "余声",
    tone: "amber",
    description:
      "背景占位图：辩论暂歇之后，堂上没有立刻散去，低声交换的目光和未说出口的判断还悬在空气里。",
    backgroundKey: "wu-court-after",
  },
} as const;

const redCliffsAiBackdropMap = {
  "river-night": {
    label: "赤壁",
    tone: "ink",
    description:
      "背景占位图：江面夜色、联军战船与风向未定时的压迫感。",
  },
  "command-tent": {
    label: "联营",
    tone: "ink",
    description:
      "背景占位图：江边军帐、沙盘和烛火下不断调整的布局。",
  },
  "strategy-table": {
    label: "谋局",
    tone: "amber",
    description:
      "背景占位图：军图、风向、联盟信任与执行时机同时被摆在案上。",
  },
  "departure-dock": {
    label: "出发",
    tone: "crimson",
    description:
      "背景占位图：江边登船点、暗处待发的战船，以及行动前的短暂压抑。",
  },
  "embers-aftermath": {
    label: "火光",
    tone: "amber",
    description:
      "背景占位图：火光后的江面余温，大局已成，但真正决定胜负的是更前面的判断。",
  },
} as const;

const eventStoryCatalog: Record<string, EventPlayableContent> = {
  "hongmen-banquet": createEventPlayableContent({
    eventId: "hongmen-banquet",
    initialSceneId: "arrival",
    defaultBackdrop: {
      label: "鸿门",
      tone: "crimson",
      description:
        "",
    },
    viewpoints: hongmenViewpoints,
    speakerVisuals: hongmenSpeakerVisualMap,
    scenes: [
      {
        id: "arrival",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "鸿门",
          tone: "crimson",
          description:
            "",
        },
        text:
          "夜色压在营地上，火光映着酒器和兵刃。你知道这不是普通宴席，而是一场带着试探意味的会面。",
        note: "先用低风险的方式进入剧情，让试玩节奏明确。",
        nextSceneId: "opening-dialogue",
      },
      {
        id: "opening-dialogue",
        type: "dialogue",
        speaker: "项羽",
        speakerId: "xiangyu",
        visualKey: "xiangyu",
        text: "沛公远来，不必拘束。今夜只当叙旧。",
        nextSceneId: "decision-one",
      },
      {
        id: "decision-one",
        type: "decision",
        speaker: "关键抉择",
        speakerId: "decision",
        visualKey: "decision",
        text: "宴席刚开，你要先把自己的姿态放在哪一边？",
        choices: [
          {
            id: "historic-humble",
            label: "主动示弱，把入关经过解释清楚",
            outcome: "你先把锋芒收住，给自己争取到继续留在席间观察的空间。",
            isHistorical: true,
            nextSceneId: "fan-kuai-entry",
          },
          {
            id: "assertive",
            label: "直接强调自己的战功，抢先占住气势",
            outcome: "气氛立刻变紧，周围人的目光都更警惕了。",
            nextSceneId: "fan-kuai-entry",
          },
          {
            id: "silent",
            label: "尽量少说，让其他人替你周旋",
            outcome: "你保住了谨慎，但也让自己显得更难被判断。",
            nextSceneId: "fan-kuai-entry",
          },
        ],
      },
      {
        id: "fan-kuai-entry",
        type: "dialogue",
        speaker: "樊哙",
        speakerId: "fan-kuai",
        visualKey: "fan-kuai",
        text: "主上身在险地，不能只等别人发话。若局势再压下去，总要有人出来把桌面掀开一点。",
        nextSceneId: "decision-two",
      },
      {
        id: "decision-two",
        type: "decision",
        speaker: "关键抉择",
        speakerId: "decision",
        visualKey: "decision",
        text: "席间暗流越来越重，这时你会怎么做？",
        choices: [
          {
            id: "historic-exit",
            label: "借上厕所离席，抓住空档撤出营地",
            outcome: "这是最稳妥的保命路线，也是历史走向里最关键的一步。",
            isHistorical: true,
            nextSceneId: "ending",
          },
          {
            id: "stay",
            label: "继续留在席上，试着把气氛圆过去",
            outcome: "你赢得了一点表面体面，但风险还在持续积累。",
            nextSceneId: "ending",
          },
          {
            id: "confront",
            label: "直接把暗示揭开，逼对方表态",
            outcome: "局面会迅速失控，宴席有可能立刻变成冲突现场。",
            nextSceneId: "ending",
          },
        ],
      },
      {
        id: "ending",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        text:
          "鸿门宴真正迷人的地方，不在刀剑有没有出鞘，而在所有人都知道危险存在，却只能用礼数和话语一点点试探彼此的底线。",
        note: "下一阶段可以在这里接入更多分支和 AI 生成对话。",
      },
    ],
  }),
  "empty-city-stratagem": createEventPlayableContent({
    eventId: "empty-city-stratagem",
    initialSceneId: "urgent-report",
    defaultBackdrop: {
      label: "空城",
      tone: "ink",
      description:
        "背景占位图：城门洞开、城楼高处与城下逼近的大军，把整座城都压进一场不敢先乱的对峙里。",
      backgroundKey: "empty-city-watchtower",
    },
    viewpoints: emptyCityViewpoints,
    speakerVisuals: emptyCitySpeakerVisualMap,
    scenes: [
      {
        id: "urgent-report",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: emptyCityAiBackdropMap["city-gate"],
        text:
          "急报送上城楼时，你先听见的是马蹄越来越近。城中可调的人已所剩无几，而司马懿的大军正在往这边压来，你没有多余时间把这座城慢慢守成样子。",
        nextSceneId: "city-panics",
      },
      {
        id: "city-panics",
        type: "dialogue",
        speaker: "守军",
        speakerId: "guard",
        visualKey: "guard",
        background: emptyCityAiBackdropMap["city-gate"],
        text: "丞相，城里能上墙的兵不多了。若此时关门固守，未必守得住；若弃城而走，现在也已经来不及。",
        nextSceneId: "open-the-gates",
      },
      {
        id: "open-the-gates",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: emptyCityAiBackdropMap["city-gate"],
        text:
          "你没有下令闭门，反而叫人把城门打开，让老卒去街上洒扫。命令一出口，城中惊意更重，可真正能守住空城的，偏偏只能是这一份看上去像毫无防备的从容。",
        nextSceneId: "ascend-the-tower",
      },
      {
        id: "ascend-the-tower",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: emptyCityAiBackdropMap["watchtower"],
        text:
          "你登上城楼，命人焚香、摆琴。风从楼边擦过去，衣袖和琴弦都很轻，可你知道，城下越来越近的那支军队，正要把每一分镇定都拿来反复掂量。",
        nextSceneId: "wei-army-arrives",
      },
      {
        id: "wei-army-arrives",
        type: "dialogue",
        speaker: "司马懿",
        speakerId: "simayi",
        visualKey: "simayi",
        background: emptyCityAiBackdropMap["army-below"],
        text: "城门大开，街上却只见洒扫，不见慌乱。诸葛亮若不是另有布置，绝不会把一座城摆成这样给我看。",
        nextSceneId: "tower-stillness",
      },
      {
        id: "tower-stillness",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: emptyCityAiBackdropMap["watchtower"],
        text:
          "你继续按着琴弦，不催身边人，也不往城下多看一眼。楼上的安静比城下兵马更难熬，因为只要谁先乱了气息，这座城立刻就会从“有伏”变成“无守”。",
        nextSceneId: "simayi-hesitates",
      },
      {
        id: "simayi-hesitates",
        type: "dialogue",
        speaker: "司马懿",
        speakerId: "simayi",
        visualKey: "simayi",
        background: emptyCityAiBackdropMap["army-below"],
        text: "诸葛亮平生谨慎，从不肯把险赌在无凭无据上。今日如此开门示静，越像无备，越像是在等我自己撞进去。",
        nextSceneId: "wei-army-withdraws",
      },
      {
        id: "wei-army-withdraws",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: emptyCityAiBackdropMap["city-gate"],
        text:
          "退兵的号令传下时，城中没有人敢立刻松气。你仍让琴声和洒扫照旧，只等马蹄声一点点退远，等城下那些旗影终于不再压着城门。",
        nextSceneId: "aftermath-breath",
      },
      {
        id: "aftermath-breath",
        type: "dialogue",
        speaker: "诸葛亮",
        speakerId: "zhuge-liang",
        visualKey: "zhuge-liang",
        background: emptyCityAiBackdropMap["watchtower"],
        text: "人心若先乱，城门关得再紧也守不住。今日能退他的，不是这座城，而是他对我不敢轻信的那一点疑心。",
      },
    ],
  }),
  "heroes-over-wine": createEventPlayableContent({
    eventId: "heroes-over-wine",
    initialSceneId: "invited-to-seat",
    defaultBackdrop: {
      label: "煮酒",
      tone: "amber",
      description:
        "背景占位图：亭外雨意将落未落，席上青梅与温酒并排摆着，真正压人的却是闲谈里越靠越近的话锋。",
      backgroundKey: "heroes-banquet-hall",
    },
    viewpoints: heroesOverWineViewpoints,
    speakerVisuals: heroesOverWineSpeakerVisualMap,
    scenes: [
      {
        id: "invited-to-seat",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: heroesOverWineAiBackdropMap["pavilion-waiting"],
        text:
          "曹操命人请你入席时，青梅已经摆在案上，温酒正冒着热气。桌上看着只是闲宴，可你从落座前那点安静里就知道，这一席绝不只是叙旧。",
        nextSceneId: "cao-opens-topic",
      },
      {
        id: "cao-opens-topic",
        type: "dialogue",
        speaker: "曹操",
        speakerId: "caocao",
        visualKey: "caocao",
        background: heroesOverWineAiBackdropMap["banquet-hall"],
        text: "这酒配青梅，最适合趁阴雨未落时说几句闲话。玄德，你我不妨借今日轻松片刻，谈谈天下人。",
        nextSceneId: "ask-for-heroes",
      },
      {
        id: "ask-for-heroes",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: heroesOverWineAiBackdropMap["banquet-hall"],
        text:
          "他先说酒、说天色、说世道人心，话锋却慢慢收到了人物身上。你听得出来，这不是普通的闲聊，他真正想掂量的，是你会把谁放进“英雄”两个字里。",
        nextSceneId: "cao-rejects-names",
      },
      {
        id: "cao-rejects-names",
        type: "dialogue",
        speaker: "曹操",
        speakerId: "caocao",
        visualKey: "caocao",
        background: heroesOverWineAiBackdropMap["banquet-hall"],
        text: "袁绍色厉胆薄，袁术不过冢中枯骨，刘表徒守一隅。玄德提这些人，像是在替天下找英雄，倒更像是在替自己先避锋芒。",
        nextSceneId: "line-turns-to-liubei",
      },
      {
        id: "line-turns-to-liubei",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: heroesOverWineAiBackdropMap["banquet-hall"],
        text:
          "你才发觉他否掉的从来不是那些名字，而是一步步把话收回到这张席上。等那句“今天下英雄，唯使君与操耳”落下来，酒气还在，席上的轻松却一下子全没了。",
        nextSceneId: "thunder-and-dropped-chopsticks",
      },
      {
        id: "thunder-and-dropped-chopsticks",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: heroesOverWineAiBackdropMap["pavilion-waiting"],
        text:
          "恰在那一瞬，亭外惊雷炸开。你手中的箸滑落到案上，脆响不大，却足够让你自己先听见心口那一下收紧。比雷更危险的，是曹操正看着你会怎样把这一刻接过去。",
        nextSceneId: "liubei-covers",
      },
      {
        id: "liubei-covers",
        type: "dialogue",
        speaker: "刘备",
        speakerId: "liubei",
        visualKey: "liubei",
        background: heroesOverWineAiBackdropMap["banquet-hall"],
        text: "备素来胆薄，骤闻雷声便失了手。让明公见笑了。天下英雄岂敢当此评语，备只求乱世里先把眼前路走稳罢了。",
        nextSceneId: "after-seat",
      },
      {
        id: "after-seat",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: heroesOverWineAiBackdropMap["after-rain-courtyard"],
        text:
          "席散后，雨声像把刚才的话都压回了回廊里。你知道自己暂时把那一瞬遮过去了，可也更清楚，曹操今日既然把话点到你身上，就说明他早已不把你当成只会退让的人。",
      },
    ],
  }),
  "break-cauldrons-sink-boats": createEventPlayableContent({
    eventId: "break-cauldrons-sink-boats",
    initialSceneId: "after-crossing",
    defaultBackdrop: {
      label: "河岸",
      tone: "crimson",
      description:
        "背景占位图：刚渡河的楚军还在整兵，水汽、泥土和未散的喘息都压在岸边。",
      backgroundKey: "battle-riverbank-crossing",
    },
    viewpoints: breakCauldronsViewpoints,
    speakerVisuals: breakCauldronsSpeakerVisualMap,
    scenes: [
      {
        id: "after-crossing",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: breakCauldronsAiBackdropMap["riverbank-after-crossing"],
        text:
          "你刚带着人渡过河，甲片还沾着水气，兵器和脚步声都乱在一处。远处秦军的压力已经压过来，可眼前这支队伍还没完全从渡河的仓促里缓过气。",
        nextSceneId: "boats-destroyed",
      },
      {
        id: "boats-destroyed",
        type: "dialogue",
        speaker: "军士",
        speakerId: "soldier",
        visualKey: "soldier",
        background: breakCauldronsAiBackdropMap["wrecked-retreat-line"],
        text:
          "将军，后头的船……都给毁了！有人已经点火，有人正拿斧子砍断船板！",
        nextSceneId: "cauldrons-broken",
      },
      {
        id: "cauldrons-broken",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: breakCauldronsAiBackdropMap["wrecked-retreat-line"],
        text:
          "还没等队伍把骚动压下去，军中的大釜又在后方碎开。锅沿砸裂的声音一阵接一阵，像把每个人心里那点“也许还能退”的念头也一起敲碎了。",
        nextSceneId: "xiangyu-appears",
      },
      {
        id: "xiangyu-appears",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: breakCauldronsAiBackdropMap["frontline-muster"],
        text:
          "你走到军前时，队伍里的低声议论一下子收紧了。所有人都在看你，也都在等你开口，仿佛只要你先露出半分迟疑，这股惊惶就会立刻顺着军阵散开。",
        nextSceneId: "no-retreat-order",
      },
      {
        id: "no-retreat-order",
        type: "dialogue",
        speaker: "项羽",
        speakerId: "xiangyu",
        visualKey: "xiangyu",
        background: breakCauldronsAiBackdropMap["frontline-muster"],
        text:
          "船已断，釜已碎。今日谁都别再回头看河那边。前面是秦军，后面已不是路，能活下来，只能靠把这一仗先打出去。",
        nextSceneId: "ranks-react",
      },
      {
        id: "ranks-react",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: breakCauldronsAiBackdropMap["frontline-muster"],
        text:
          "你看见有人脸色发白，也看见有人把手里的兵器握得更紧。恐惧并没有消失，只是忽然找不到退开的地方，于是只能一点点往前挤，挤成硬撑着不退的样子。",
        nextSceneId: "war-drums-sound",
      },
      {
        id: "war-drums-sound",
        type: "dialogue",
        speaker: "鼓手",
        speakerId: "drummer",
        visualKey: "drummer",
        background: breakCauldronsAiBackdropMap["frontline-muster"],
        text: "战鼓起！整队向前！",
        nextSceneId: "dust-of-qin-army",
      },
      {
        id: "dust-of-qin-army",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: breakCauldronsAiBackdropMap["dust-before-clash"],
        text:
          "前方尘土和旗影正一点点压近，号令声已经不再只是命令，而成了把每个人往前推的力道。你知道从这一刻开始，破釜沉舟不再是口号，它已经变成脚下只能往前的路。",
        nextSceneId: "forward-without-return",
      },
      {
        id: "forward-without-return",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: breakCauldronsAiBackdropMap["dust-before-clash"],
        text:
          "退路被毁之后，军中的人并没有忽然变得无所畏惧。只是每个人都被逼着明白，命已经不能再押在身后，只能押在前面那一场还没真正撞上的决战里。",
      },
    ],
  }),
  "battle-of-red-cliffs": createEventPlayableContent({
    eventId: "battle-of-red-cliffs",
    initialSceneId: "river-night",
    defaultBackdrop: {
      label: "赤壁",
      tone: "ink",
      description: "背景占位图：江面夜色、联军战船与风向未定时的压迫感。",
    },
    viewpoints: redCliffsViewpoints,
    speakerVisuals: redCliffsSpeakerVisualMap,
    scenes: [
      {
        id: "river-night",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "赤壁",
          tone: "ink",
          description: "背景占位图：江面夜色、联军战船与风向未定时的压迫感。",
        },
        text:
          "江面一时还很安静，可真正让人无法松气的，不是明天会不会开战，而是今夜每一步安排有没有真的落稳。",
        nextSceneId: "zhouyu-briefing",
      },
      {
        id: "zhouyu-briefing",
        type: "dialogue",
        speaker: "周瑜",
        speakerId: "zhouyu",
        visualKey: "zhouyu",
        background: redCliffsAiBackdropMap["command-tent"],
        text:
          "曹军越觉得自己必胜，我们越不能急。真正要抓的是他们最松、却还没意识到危险已近的那一刻。",
        nextSceneId: "zhuge-liang-response",
      },
      {
        id: "zhuge-liang-response",
        type: "dialogue",
        speaker: "诸葛亮",
        speakerId: "zhuge-liang",
        visualKey: "zhuge-liang",
        background: redCliffsAiBackdropMap["strategy-table"],
        text:
          "真正要对齐的，不只是风向，还有军心、联盟默契和执行时机。只要其中一步慢半拍，火就起不成势。",
        nextSceneId: "pressure-window",
      },
      {
        id: "pressure-window",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: redCliffsAiBackdropMap["strategy-table"],
        text:
          "帐中灯火压得很低。你知道眼下最危险的不是没有计策，而是所有人都得在同一瞬间相信，这一步真的值得赌。",
        nextSceneId: "huang-gai-execution",
      },
      {
        id: "huang-gai-execution",
        type: "dialogue",
        speaker: "黄盖",
        speakerId: "huang-gai",
        visualKey: "huang-gai",
        background: redCliffsAiBackdropMap["departure-dock"],
        text:
          "到最后，总得有人把最险的一步真的走出去。若我不像真的要去送命，曹军就不会真把门打开。",
        nextSceneId: "launch-window",
      },
      {
        id: "launch-window",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: redCliffsAiBackdropMap["departure-dock"],
        text:
          "江风终于转了。那一刻你没有多说，只把之前所有分散的判断重新压成同一个答案：现在，必须动。",
        nextSceneId: "red-cliffs-ending",
      },
      {
        id: "red-cliffs-ending",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: redCliffsAiBackdropMap["embers-aftermath"],
        text:
          "赤壁真正惊险的地方，不只是火光照亮江面的那一瞬，而是在那之前，所有人都必须先把看不见的那段时间算准。",
      },
    ],
  }),
  "shenlong-coup-eve": createEventPlayableContent({
    eventId: "shenlong-coup-eve",
    initialSceneId: "sickbed-night",
    defaultBackdrop: {
      label: "夜殿",
      tone: "jade",
      description: "背景占位图：病榻边的低灯、药气与夜里安静得过分的宫殿。",
      backgroundKey: "palace-night-chamber",
    },
    viewpoints: shenlongViewpoints,
    speakerVisuals: shenlongSpeakerVisualMap,
    scenes: [
      {
        id: "sickbed-night",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "夜殿",
          tone: "jade",
          description: "背景占位图：病榻边的低灯、药气与夜里安静得过分的宫殿。",
          backgroundKey: "palace-night-chamber",
        },
        text:
          "夜灯压得很低，药气还浮在帷帐里。你原本以为自己只是病得难眠，可越到深夜，越觉得这宫里安静得不合时宜。",
        nextSceneId: "strange-report",
      },
      {
        id: "strange-report",
        type: "dialogue",
        speaker: "宫人",
        speakerId: "messenger",
        visualKey: "messenger",
        background: {
          label: "夜殿",
          tone: "jade",
          description: "背景占位图：帷帐未掀尽，宫人压低声音入殿回话。",
          backgroundKey: "palace-night-chamber",
        },
        text: "陛下，外头换值比平时迟了些，奴婢听见殿外几次传令，却没人敢高声说清。",
        nextSceneId: "guard-question",
      },
      {
        id: "guard-question",
        type: "dialogue",
        speaker: "武则天",
        speakerId: "wuzetian",
        visualKey: "wuzetian",
        background: {
          label: "廊下",
          tone: "ink",
          description: "背景占位图：殿门外的回廊被夜色压住，脚步声隔着门板忽远忽近。",
          backgroundKey: "palace-inner-corridor",
        },
        text: "谁调了守卫？朕病在这里，门外的人换了几拨，竟没人先来回朕一句明白话。",
        nextSceneId: "waner-enters",
      },
      {
        id: "waner-enters",
        type: "dialogue",
        speaker: "上官婉儿",
        speakerId: "shangguan-waner",
        visualKey: "shangguan-waner",
        background: {
          label: "夜殿",
          tone: "jade",
          description: "背景占位图：上官婉儿入殿时步子放得极轻，像先在门外斟酌过要怎么开口。",
          backgroundKey: "palace-night-chamber",
        },
        text: "今夜外头递进来的不是常例奏报，臣不敢先替陛下断，只能先送到榻前，请陛下亲自过目。",
        nextSceneId: "report-names",
      },
      {
        id: "report-names",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "奏报",
          tone: "amber",
          description: "背景占位图：烛光压在奏报边缘，几个名字比别的字更像自己浮出来。",
          backgroundKey: "palace-night-chamber",
        },
        text:
          "你把纸页按在指间，张柬之、崔玄暐几个名字一并落进眼里。那不是普通政务会碰在一起的名单，它们像是从不同处同时朝一处聚拢了。",
        nextSceneId: "midnight-footsteps",
      },
      {
        id: "midnight-footsteps",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "夜半",
          tone: "ink",
          description: "背景占位图：更深的夜里，甲叶和脚步压在石阶上，不再像寻常巡更那样松散。",
          backgroundKey: "palace-inner-corridor",
        },
        text:
          "夜又深了一层，殿外却不像要静下去。脚步声里开始夹进甲叶轻碰的动静，像有人不愿惊动内廷，却也不再掩饰他们已经靠得很近。",
        nextSceneId: "attendant-talk",
      },
      {
        id: "attendant-talk",
        type: "dialogue",
        speaker: "近侍",
        speakerId: "attendant",
        visualKey: "attendant",
        background: {
          label: "近侍",
          tone: "ink",
          description: "背景占位图：近侍跪得极低，答话比往常更谨慎，像在衡量哪一句还能说，哪一句已经不能说。",
          backgroundKey: "palace-night-chamber",
        },
        text: "宫中人心还在，只是今夜殿外传令太密，奴婢不敢替谁担保到底还肯不肯照旧听命。",
        nextSceneId: "next-morning-sound",
      },
      {
        id: "next-morning-sound",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "清晨",
          tone: "amber",
          description: "背景占位图：第二天清晨，宫门外的传令与队伍声不再遮掩，冷亮的天色把夜里的猜测都照实了几分。",
          backgroundKey: "palace-gate-dawn",
        },
        text:
          "第二天清晨，你还没真正睡过去，殿外的动静已经变了。传令声、整队声、靴底压过石地的声音，一层层从宫门那边推了过来，再也不像夜里那样只肯在暗处试探。",
        nextSceneId: "request-for-audience",
      },
      {
        id: "request-for-audience",
        type: "dialogue",
        speaker: "来人",
        speakerId: "visitor",
        visualKey: "visitor",
        background: {
          label: "宫门",
          tone: "amber",
          description: "背景占位图：殿门外的人仍用恭敬口气请求入见，可那份恭敬里已经多了不容回避的硬度。",
          backgroundKey: "palace-gate-dawn",
        },
        text: "陛下，外臣奉名请入殿面奏。所陈之事关系重大，不敢再候，请陛下准许。 ",
        nextSceneId: "dress-and-rise",
      },
      {
        id: "dress-and-rise",
        type: "dialogue",
        speaker: "武则天",
        speakerId: "wuzetian",
        visualKey: "wuzetian",
        background: {
          label: "整衣",
          tone: "jade",
          description: "背景占位图：病榻边的人开始扶她起身，衣冠还未整好，局势已经先一步来到眼前。",
          backgroundKey: "palace-night-chamber",
        },
        text: "扶朕起来，整衣冠。昨夜那些不肯说透的话，到此刻已经不用再等别人替朕解释了。",
        nextSceneId: "doors-open",
      },
      {
        id: "doors-open",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: {
          label: "启门",
          tone: "crimson",
          description: "背景占位图：殿门被推开时，晨光和来人的身影一起落进来，局势已经不再停在门外。",
          backgroundKey: "palace-hall-threshold",
        },
        text:
          "门被推开的那一下，昨夜零碎的异常终于全都接上了。守卫为什么换，名字为什么同时出现，脚步为什么一路逼到清晨，此刻都不再只是猜测。",
        nextSceneId: "aftermath-whisper",
      },
      {
        id: "aftermath-whisper",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: {
          label: "余声",
          tone: "amber",
          description: "背景占位图：门已开，话还未说完，昨夜所有细小异样却已经在心里连成了一条线。",
          backgroundKey: "palace-hall-threshold",
        },
        text:
          "你很清楚，真正改变局势的从来不是某一句宣告，而是昨夜那些本该细小的异样一件件落在一起。等门被推开时，一切已经从风声变成了眼前。",
      },
    ],
  }),
  "boil-beans-burn-stalks": createEventPlayableContent({
    eventId: "boil-beans-burn-stalks",
    initialSceneId: "summoned-into-hall",
    defaultBackdrop: {
      label: "七步",
      tone: "amber",
      description:
        "背景占位图：魏宫大殿里每一步都在倒数，诗还没出口，兄弟之间的逼视已经先把空气压冷了。",
      backgroundKey: "wei-palace-hall",
    },
    viewpoints: boilBeansViewpoints,
    speakerVisuals: boilBeansSpeakerVisualMap,
    scenes: [
      {
        id: "summoned-into-hall",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: boilBeansAiBackdropMap["hall-summons"],
        text:
          "你被召入殿中时，最先觉出的不是威喝，而是安静。曹丕坐在上首，殿中侍从和群臣都把目光收得很紧，像是早知道今夜不会只是一次寻常召见。",
        nextSceneId: "seven-step-decree",
      },
      {
        id: "seven-step-decree",
        type: "dialogue",
        speaker: "曹丕",
        speakerId: "caopi",
        visualKey: "caopi",
        background: boilBeansAiBackdropMap["hall-summons"],
        text:
          "既然你素来以才思自负，今日便不妨当着众人证明一次。七步之内成诗，若言不能达意，便别怪朕把这场兄弟旧情当作空谈。",
        nextSceneId: "first-step-silence",
      },
      {
        id: "first-step-silence",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: boilBeansAiBackdropMap["counting-steps"],
        text:
          "你迈出第一步，殿中没有人敢出声。脚底落在砖面上的声响比平日更清楚，像有人把时间一寸寸压短，逼你在众目之下把活路从字句里抠出来。",
        nextSceneId: "second-third-steps",
      },
      {
        id: "second-third-steps",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: boilBeansAiBackdropMap["counting-steps"],
        text:
          "第二步、第三步接着落下，你不敢直看上首，只让心念顺着锅中翻滚的影子去找一句能借物说人的话。殿里越静，你越知道这首诗不能只求工稳，还得把最痛的那层意压进去。",
        nextSceneId: "first-couplet",
      },
      {
        id: "first-couplet",
        type: "dialogue",
        speaker: "曹植",
        speakerId: "caozhi",
        visualKey: "caozhi",
        background: boilBeansAiBackdropMap["counting-steps"],
        text: "煮豆持作羹，\n漉菽以为汁。",
        nextSceneId: "fourth-fifth-steps",
      },
      {
        id: "fourth-fifth-steps",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: boilBeansAiBackdropMap["counting-steps"],
        text:
          "你继续向前，第四步、第五步把气息顶得更紧。锅下的火、釜中的豆忽然都带上了人心的颜色，殿中那些不敢抬头的人也像顺着你的句子，听见了还没说破的疼。",
        nextSceneId: "middle-couplet",
      },
      {
        id: "middle-couplet",
        type: "dialogue",
        speaker: "曹植",
        speakerId: "caozhi",
        visualKey: "caozhi",
        background: boilBeansAiBackdropMap["counting-steps"],
        text: "萁在釜下燃，\n豆在釜中泣。",
        nextSceneId: "sixth-seventh-steps",
      },
      {
        id: "sixth-seventh-steps",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: boilBeansAiBackdropMap["counting-steps"],
        text:
          "第六步时，你已经知道最后两句该落到哪里；第七步将尽，真正不能回避的已不是诗，而是兄弟二字。再往前一步，你就得把这层意思当着满殿的人亲手掀开。",
        nextSceneId: "final-couplet",
      },
      {
        id: "final-couplet",
        type: "dialogue",
        speaker: "曹植",
        speakerId: "caozhi",
        visualKey: "caozhi",
        background: boilBeansAiBackdropMap["counting-steps"],
        text: "本自同根生，\n相煎何太急？",
        nextSceneId: "hall-falls-silent",
      },
      {
        id: "hall-falls-silent",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: boilBeansAiBackdropMap["after-poem"],
        text:
          "诗落下后，殿中一时比方才更静。连原本只敢低头的侍从都不敢随意换气，你能感觉到曹丕没有立刻开口，那片沉默本身就像在衡量你刚才到底把话说到了多深。",
        nextSceneId: "pressure-eases",
      },
      {
        id: "pressure-eases",
        type: "dialogue",
        speaker: "曹丕",
        speakerId: "caopi",
        visualKey: "caopi",
        background: boilBeansAiBackdropMap["after-poem"],
        text:
          "才思果然未尽。既然能在七步之内把话说到这一步，朕今日便不再追逼，只望你往后也记得，什么话该藏，什么话该留在诗里。",
        nextSceneId: "cold-aftertaste",
      },
      {
        id: "cold-aftertaste",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: boilBeansAiBackdropMap["after-poem"],
        text:
          "你知道自己暂时活了下来，可殿中的余寒并没有散。刚才那七步留下的不只是诗，还有兄弟之间再也说不回从前的一道裂口。",
      },
    ],
  }),
  "scrape-bone-healing": createEventPlayableContent({
    eventId: "scrape-bone-healing",
    initialSceneId: "injury-in-tent",
    defaultBackdrop: {
      label: "军帐",
      tone: "jade",
      description:
        "背景占位图：军帐低灯、药气与压低的呼吸聚在一起，所有人都知道刀很快就要落下。",
      backgroundKey: "war-tent-healing",
    },
    viewpoints: scrapeBoneViewpoints,
    speakerVisuals: scrapeBoneSpeakerVisualMap,
    scenes: [
      {
        id: "injury-in-tent",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: scrapeBoneAiBackdropMap["healing-tent"],
        text:
          "你坐在军帐里，左臂伤口已经乌黑发胀。帐中灯火压得低，药气和汗味拧在一起，几名将士站得很近，却谁也不敢先把目光长久落到那条手臂上。",
        nextSceneId: "huatuo-examines",
      },
      {
        id: "huatuo-examines",
        type: "dialogue",
        speaker: "华佗",
        speakerId: "huatuo",
        visualKey: "huatuo",
        background: scrapeBoneAiBackdropMap["healing-tent"],
        text:
          "毒气已经入骨，再拖下去，手臂未必保得住。今日若要治，便得割开伤处，刮骨去毒。疼是一定疼的，但此时不能再犹豫了。",
        nextSceneId: "guanyu-accepts",
      },
      {
        id: "guanyu-accepts",
        type: "dialogue",
        speaker: "关羽",
        speakerId: "guanyu",
        visualKey: "guanyu",
        background: scrapeBoneAiBackdropMap["healing-tent"],
        text:
          "既然要治，就立刻动手。摆棋，备酒，都照常来。帐里的人谁也不必躲，今日这一刀若都看不住，往后还谈什么上阵。",
        nextSceneId: "tools-prepared",
      },
      {
        id: "tools-prepared",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: scrapeBoneAiBackdropMap["surgery-table"],
        text:
          "布帛、药物和刀具被一一摆开，帐里随之安静下来。有人悄悄退了半步，也有人把呼吸越放越轻，像生怕自己先出一点乱响，就会把这份强撑着的镇定碰碎。",
        nextSceneId: "first-cut",
      },
      {
        id: "first-cut",
        type: "dialogue",
        speaker: "军医助手",
        speakerId: "assistant",
        visualKey: "assistant",
        background: scrapeBoneAiBackdropMap["surgery-table"],
        text:
          "布帛在此，热酒也在。将军若觉得撑不住，随时言语一声。帐中诸位都已退开，只等先生下刀。",
        nextSceneId: "scraping-bone",
      },
      {
        id: "scraping-bone",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: scrapeBoneAiBackdropMap["surgery-table"],
        text:
          "刀锋割开伤处时，帐中的人齐齐收了声。再往里，刃口触到骨面，细而发紧的摩擦声一点点传出来，比呼喝更能让人后背发凉，连盯着棋盘的手都不由得更稳了几分。",
        nextSceneId: "guanyu-keeps-composure",
      },
      {
        id: "guanyu-keeps-composure",
        type: "dialogue",
        speaker: "关羽",
        speakerId: "guanyu",
        visualKey: "guanyu",
        background: scrapeBoneAiBackdropMap["surgery-table"],
        text:
          "这一局还没分出高下，谁先乱了手，谁便输得更快。先生只管动手，不必因我缓刀。旁人若不敢看，也不用勉强在帐里硬撑。",
        nextSceneId: "huatuo-continues",
      },
      {
        id: "huatuo-continues",
        type: "dialogue",
        speaker: "华佗",
        speakerId: "huatuo",
        visualKey: "huatuo",
        background: scrapeBoneAiBackdropMap["surgery-table"],
        text:
          "再忍片刻，毒血还没清尽。将军能坐得住，我这里便能做得更准。你既不乱，我也不必分神，这条手臂就还有稳稳保下来的机会。",
        nextSceneId: "bandage-wrapped",
      },
      {
        id: "bandage-wrapped",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: scrapeBoneAiBackdropMap["after-bandage"],
        text:
          "帐中的压迫感终于开始松动。毒血清出，药敷上去，布帛一圈圈缠回手臂，方才不敢直视的人这才敢把目光慢慢挪回来，像刚从一场更凶的静默里逃开。",
        nextSceneId: "treatment-complete",
      },
      {
        id: "treatment-complete",
        type: "dialogue",
        speaker: "华佗",
        speakerId: "huatuo",
        visualKey: "huatuo",
        background: scrapeBoneAiBackdropMap["after-bandage"],
        text:
          "毒已去得差不多了，静养些时日，手臂尚可如常。今日这一关算是过去了，只是往后再遇旧伤，也不可再拖到这等地步。",
        nextSceneId: "aftertaste-in-tent",
      },
      {
        id: "aftertaste-in-tent",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: scrapeBoneAiBackdropMap["after-bandage"],
        text:
          "你收回手臂时，帐中终于有人敢出声了。刀声已经停下，可那份震动还留在每个人脸上。真正让人记住的，从来不只是伤口，而是疼痛压到骨头时，你仍得把自己先坐稳。 ",
      },
    ],
  }),
  "smash-water-jar": createEventPlayableContent({
    eventId: "smash-water-jar",
    initialSceneId: "courtyard-play",
    defaultBackdrop: {
      label: "庭院",
      tone: "jade",
      description:
        "背景占位图：庭院里孩子们原本只是嬉闹，真正压下来的危险却只用了一声落水就把所有人都推到缸边。",
      backgroundKey: "courtyard-children-play",
    },
    viewpoints: smashWaterJarViewpoints,
    speakerVisuals: smashWaterJarSpeakerVisualMap,
    scenes: [
      {
        id: "courtyard-play",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: smashWaterJarAiBackdropMap["courtyard-play"],
        text:
          "院子里原本全是孩子们跑闹的声音。你抬眼时，只看见靠墙那口大水缸安安静静立着，谁也没把它当成真正的麻烦。",
        nextSceneId: "child-climbs-jar",
      },
      {
        id: "child-climbs-jar",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: smashWaterJarAiBackdropMap["water-jar-side"],
        text:
          "一个孩子踩着缸边往上探，旁边的人还在笑闹。你先注意到的不是他胆大，而是缸口太高，缸里那片水黑得很深。",
        nextSceneId: "sudden-splash",
      },
      {
        id: "sudden-splash",
        type: "dialogue",
        speaker: "庭院玩伴",
        speakerId: "child",
        visualKey: "child",
        background: smashWaterJarAiBackdropMap["water-jar-side"],
        text: "啊！他掉进去了！快看缸里！",
        nextSceneId: "children-panic",
      },
      {
        id: "children-panic",
        type: "dialogue",
        speaker: "庭院玩伴",
        speakerId: "child",
        visualKey: "child",
        background: smashWaterJarAiBackdropMap["water-jar-side"],
        text: "快去叫大人！不对，先把他拉出来！哎，不够、够不到！",
        nextSceneId: "simaguang-observes",
      },
      {
        id: "simaguang-observes",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: smashWaterJarAiBackdropMap["water-jar-side"],
        text:
          "你凑到缸边时，先看见的是缸口离地太高，孩子在里面乱抓，却怎么都够不到外沿。若只想着把人从上面拽出来，时间根本不够。",
        nextSceneId: "spots-the-stone",
      },
      {
        id: "spots-the-stone",
        type: "dialogue",
        speaker: "司马光",
        speakerId: "simaguang",
        visualKey: "simaguang",
        background: smashWaterJarAiBackdropMap["water-jar-side"],
        text: "别都挤在缸口！人出不来，就让水先出来。把那边的石头给我！",
        nextSceneId: "smash-the-jar",
      },
      {
        id: "smash-the-jar",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: smashWaterJarAiBackdropMap["water-jar-side"],
        text:
          "你抄起硬石，对准缸壁狠狠砸下。那一下并不花哨，只是又快又准，缸壁先裂，紧接着一股水声猛地冲出来。",
        nextSceneId: "water-rushes-out",
      },
      {
        id: "water-rushes-out",
        type: "dialogue",
        speaker: "庭院玩伴",
        speakerId: "child",
        visualKey: "child",
        background: smashWaterJarAiBackdropMap["after-rescue"],
        text: "水出来了！快扶他！别让他再滑回去！",
        nextSceneId: "child-saved",
      },
      {
        id: "child-saved",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: smashWaterJarAiBackdropMap["after-rescue"],
        text:
          "缸里的水位一下降下去，落水的孩子被人连拖带扶拽了出来。有人咳着水，有人还在哭，院子里方才那种只会乱喊的慌张，终于开始有了落点。",
        nextSceneId: "aftertaste-courtyard",
      },
      {
        id: "aftertaste-courtyard",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: smashWaterJarAiBackdropMap["after-rescue"],
        text:
          "等脚边的水慢慢散开，你才觉得心跳重新回到胸口。刚才那几步里来不及讲什么道理，真正有用的只是一眼看清：人拉不出来，就先把缸打开。 ",
      },
    ],
  }),
  "jingke-assassinates-qin": createEventPlayableContent({
    eventId: "jingke-assassinates-qin",
    initialSceneId: "palace-waiting",
    defaultBackdrop: {
      label: "秦宫",
      tone: "ink",
      description: "背景占位图：秦宫殿外候见的石阶与门内压着礼制的肃静。",
      backgroundKey: "qin-palace-antehall",
    },
    viewpoints: jingkeViewpoints,
    speakerVisuals: jingkeSpeakerVisualMap,
    scenes: [
      {
        id: "palace-waiting",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: jingkeAiBackdropMap["palace-outer-waiting"],
        text:
          "殿门还没开，你握着地图外卷，袖中藏着匕首。石阶尽头一点风都没有，秦舞阳站在身边，呼吸却比你更乱。",
        nextSceneId: "qinwuyang-falters",
      },
      {
        id: "qinwuyang-falters",
        type: "dialogue",
        speaker: "荆轲",
        speakerId: "jingke",
        visualKey: "jingke",
        background: jingkeAiBackdropMap["palace-outer-waiting"],
        text: "站稳。到这里再露怯，只会让人先看出我们不是来献图的。",
        nextSceneId: "offer-map",
      },
      {
        id: "offer-map",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: jingkeAiBackdropMap["throne-court"],
        text:
          "你被引到秦王座前，礼数还一层层压在每个动作上。地图捧在手里时像寻常进献，可你知道，真正危险的不是拔刀，而是靠近之前不能让一步露馅。",
        nextSceneId: "map-unfolds",
      },
      {
        id: "map-unfolds",
        type: "dialogue",
        speaker: "嬴政",
        speakerId: "yingzheng",
        visualKey: "yingzheng",
        background: jingkeAiBackdropMap["throne-court"],
        text: "把图展开。寡人倒要看看，燕地献来的究竟是什么分量。",
        nextSceneId: "dagger-revealed",
      },
      {
        id: "dagger-revealed",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: jingkeAiBackdropMap["throne-court"],
        text:
          "图卷一点点摊开，你和秦王之间那点礼制维持出的安全距离也跟着缩短。卷尾刚露出硬冷的边，你的手已经先一步抓住了匕首。",
        nextSceneId: "king-rises",
      },
      {
        id: "king-rises",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: jingkeAiBackdropMap["hall-chaos"],
        text:
          "秦王惊起得比你预想更快。殿里原本整齐的目光一下散掉，群臣被礼制和距离拦在原地，真正来得及动的，反而只有你和那张突然翻开的图。",
        nextSceneId: "pillar-chase",
      },
      {
        id: "pillar-chase",
        type: "dialogue",
        speaker: "秦廷群臣",
        speakerId: "courtier",
        visualKey: "courtier",
        background: jingkeAiBackdropMap["hall-chaos"],
        text: "护驾！拦住他！别让他再逼近王前！",
        nextSceneId: "dagger-thrown",
      },
      {
        id: "dagger-thrown",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: jingkeAiBackdropMap["hall-chaos"],
        text:
          "你追着秦王绕柱而动，脚步已经快到顾不上呼吸。匕首脱手掷出的那一下，你知道最后一线也已经押上去了，可它终究没能替你把局势钉死。",
        nextSceneId: "jingke-seized",
      },
      {
        id: "jingke-seized",
        type: "dialogue",
        speaker: "殿中侍卫",
        speakerId: "guard",
        visualKey: "guard",
        background: jingkeAiBackdropMap["hall-chaos"],
        text: "拿下！他已无退路，别让他再近一步！",
        nextSceneId: "failed-coda",
      },
      {
        id: "failed-coda",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: jingkeAiBackdropMap["hall-chaos"],
        text:
          "到这一步，你已经知道刺杀失败。昨夜预备的一切、殿外压住的呼吸、图卷尽头那一寸寒光，都在这一刻收成同一个结果：门开得太晚，刀也只差了一线。",
      },
    ],
  }),
  "bearing-thorns-apology": createEventPlayableContent({
    eventId: "bearing-thorns-apology",
    initialSceneId: "courtyard-interrupted",
    defaultBackdrop: {
      label: "负荆",
      tone: "bronze",
      description:
        "背景占位图：赵国上卿府中原本安静，门外忽然传来的通报把所有人都推向同一件事：该不该把背着荆条的廉颇请进来。",
      backgroundKey: "zhao-manor-courtyard",
    },
    viewpoints: bearingThornsViewpoints,
    speakerVisuals: bearingThornsSpeakerVisualMap,
    scenes: [
      {
        id: "courtyard-interrupted",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: bearingThornsAiBackdropMap["manor-courtyard"],
        text:
          "府中原本安静，只有檐下风声和廊间脚步。可这一阵匆匆闯进来的通报，把堂前的平稳一下拧紧了。",
        nextSceneId: "retainer-reports-lianpo",
      },
      {
        id: "retainer-reports-lianpo",
        type: "dialogue",
        speaker: "门客",
        speakerId: "retainer",
        visualKey: "retainer",
        background: bearingThornsAiBackdropMap["gate-steps"],
        text: "上卿，廉将军就在府门外。他没有带兵，也没有乘车，只背着荆条站在石阶前。",
        nextSceneId: "ask-about-posture",
      },
      {
        id: "ask-about-posture",
        type: "dialogue",
        speaker: "蔺相如",
        speakerId: "linxiangru",
        visualKey: "linxiangru",
        background: bearingThornsAiBackdropMap["manor-courtyard"],
        text: "他带了几个人来？神色如何？站在那里，是怒，是急，还是已经把气压下去了？",
        nextSceneId: "whether-to-admit",
      },
      {
        id: "whether-to-admit",
        type: "dialogue",
        speaker: "家臣",
        speakerId: "servant",
        visualKey: "servant",
        background: bearingThornsAiBackdropMap["manor-courtyard"],
        text: "府中有人担心他仍旧放不下旧怨。若此刻请入，万一当面翻转，堂前就不好收拾了。",
        nextSceneId: "lianpo-enters",
      },
      {
        id: "lianpo-enters",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: bearingThornsAiBackdropMap["gate-steps"],
        text:
          "府门一开，廉颇背着荆条走了进来。那副压在背上的样子，比甲胄更显沉重，府中原本绷着的人也都不自觉把声音压低了。",
        nextSceneId: "lianpo-apologizes",
      },
      {
        id: "lianpo-apologizes",
        type: "dialogue",
        speaker: "廉颇",
        speakerId: "lianpo",
        visualKey: "lianpo",
        background: bearingThornsAiBackdropMap["reception-hall"],
        text: "相如，我先前只盯着自己那点名位，话说得重，气也用错了地方。今日背荆而来，不是做样子，是来向你认这一身的短。",
        nextSceneId: "linxiangru-responds",
      },
      {
        id: "linxiangru-responds",
        type: "dialogue",
        speaker: "蔺相如",
        speakerId: "linxiangru",
        visualKey: "linxiangru",
        background: bearingThornsAiBackdropMap["reception-hall"],
        text: "将军不必只向我认错。我先前一再退让，也不是怕你锋芒太盛，而是赵国外有强敌，若将相先裂，旁人求之不得。",
        nextSceneId: "lianpo-bows-lower",
      },
      {
        id: "lianpo-bows-lower",
        type: "dialogue",
        speaker: "廉颇",
        speakerId: "lianpo",
        visualKey: "lianpo",
        background: bearingThornsAiBackdropMap["reception-hall"],
        text: "我直到今日站在你门前，才真明白自己过去只看见了争一口气，没看见赵国需要的是同一条心。若你不收这荆条，我这张脸也抬不起来。",
        nextSceneId: "step-forward-and-lift",
      },
      {
        id: "step-forward-and-lift",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: bearingThornsAiBackdropMap["reception-hall"],
        text:
          "你上前一步，不再让这场请罪停在远远相对的姿态里。堂前那股防备的硬气开始松动，连门外的风声都像比刚才轻了一层。",
        nextSceneId: "reconciliation-in-hall",
      },
      {
        id: "reconciliation-in-hall",
        type: "dialogue",
        speaker: "蔺相如",
        speakerId: "linxiangru",
        visualKey: "linxiangru",
        background: bearingThornsAiBackdropMap["reception-hall"],
        text: "将军既肯亲自来，我又何必守着旧话不放。把荆条放下吧，往后你我若都还把赵国放在前头，这一场就不该只停在请罪二字上。",
        nextSceneId: "courtyard-after-silence",
      },
      {
        id: "courtyard-after-silence",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: bearingThornsAiBackdropMap["manor-courtyard"],
        text:
          "堂前重新安静下来时，府中人先松开的不是嘴，而是肩膀。你知道刚才见到的并不只是一次礼节上的低头，而是两个人终于把同一件事看在了比脸面更前的位置。",
      },
    ],
  }),
  "cup-wine-release-power": createEventPlayableContent({
    eventId: "cup-wine-release-power",
    initialSceneId: "banquet-begins",
    defaultBackdrop: {
      label: "酒宴",
      tone: "amber",
      description:
        "背景占位图：宫中夜宴灯火稳稳压着堂前，一桌酒菜看似亲近，真正让人坐不安的是话锋一点点变沉。",
      backgroundKey: "song-banquet-hall",
    },
    viewpoints: cupWineViewpoints,
    speakerVisuals: cupWineSpeakerVisualMap,
    scenes: [
      {
        id: "banquet-begins",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: cupWineAiBackdropMap["palace-banquet"],
        text:
          "今夜这场酒宴摆得很稳，灯火、酒器和菜肴都挑不出半点怠慢。你看着几位宿将依次入席，心里却很清楚，若只为叙旧，不必把这些旧部都请到同一桌前。",
        nextSceneId: "wine-rounds",
      },
      {
        id: "wine-rounds",
        type: "dialogue",
        speaker: "赵匡胤",
        speakerId: "zhaokuangyin",
        visualKey: "zhaokuangyin",
        background: cupWineAiBackdropMap["palace-banquet"],
        text: "今夜只当旧日兄弟同席。大家随意饮酒，不必拘礼，若连一杯都喝得太谨慎，这桌菜可就白备了。",
        nextSceneId: "emperor-sighs",
      },
      {
        id: "emperor-sighs",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: cupWineAiBackdropMap["hall-interior"],
        text:
          "酒过几巡，你放下酒杯，先叹了一口并不重的气。席上原本松开的肩背果然又一点点收回去，因为你知道，那口气不是为酒，也不是为旧事。",
        nextSceneId: "testing-the-mood",
      },
      {
        id: "testing-the-mood",
        type: "dialogue",
        speaker: "石守信",
        speakerId: "general",
        visualKey: "general",
        background: cupWineAiBackdropMap["hall-interior"],
        text: "陛下若有心事，不妨直言。臣等昔日同起行伍，今日能陪坐殿前，本就该替陛下分忧，不敢只顾饮酒。",
        nextSceneId: "hidden-concern",
      },
      {
        id: "hidden-concern",
        type: "dialogue",
        speaker: "赵匡胤",
        speakerId: "zhaokuangyin",
        visualKey: "zhaokuangyin",
        background: cupWineAiBackdropMap["hall-interior"],
        text: "你们自然没有异心，这一点朕从不疑。可人在高位，睡得不安的，未必是眼前的人，而是底下人哪天忽然替你把黄袍披上来，那时又该如何收拾？",
        nextSceneId: "silence-around-cups",
      },
      {
        id: "silence-around-cups",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: cupWineAiBackdropMap["hall-interior"],
        text:
          "酒杯还在手里，席上的人却都像忽然不会再举杯了。你看见几位将领互相递了一眼，又都先把目光收回去，谁也不敢把那句话接得太快。",
        nextSceneId: "retreat-offered",
      },
      {
        id: "retreat-offered",
        type: "dialogue",
        speaker: "赵匡胤",
        speakerId: "zhaokuangyin",
        visualKey: "zhaokuangyin",
        background: cupWineAiBackdropMap["hall-interior"],
        text: "与其让你们终日提心吊胆，不如趁如今功名富贵都在，交兵权、置良田、美宅自乐。朕保你们富贵终身，这条路，比握着兵柄更安稳。",
        nextSceneId: "generals-respond",
      },
      {
        id: "generals-respond",
        type: "dialogue",
        speaker: "席间将领",
        speakerId: "general",
        visualKey: "general",
        background: cupWineAiBackdropMap["hall-interior"],
        text: "陛下既把话说到这里，臣等岂敢不知轻重。今日所受的恩，不该再拿兵权去换疑心；若能解甲归家，反倒是陛下给我们留了生路。",
        nextSceneId: "generals-bow",
      },
      {
        id: "generals-bow",
        type: "dialogue",
        speaker: "石守信",
        speakerId: "general",
        visualKey: "general",
        background: cupWineAiBackdropMap["hall-interior"],
        text: "臣明白了。陛下今日不是在逼臣等丢脸，而是在替臣等把后半生的路先铺出来。兵权既该归朝廷，臣等便不敢再握着不放。",
        nextSceneId: "toast-returns",
      },
      {
        id: "toast-returns",
        type: "dialogue",
        speaker: "赵匡胤",
        speakerId: "zhaokuangyin",
        visualKey: "zhaokuangyin",
        background: cupWineAiBackdropMap["palace-banquet"],
        text: "既然话都说开了，今晚便还是旧友饮酒。来，再满一杯，往后大家各守安稳，这才算把这场酒真正喝圆了。",
        nextSceneId: "night-gate-after",
      },
      {
        id: "night-gate-after",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: cupWineAiBackdropMap["night-gate"],
        text:
          "离席时，宫门外的夜色比开席前更静。你知道刚才桌上的笑语并没有真的散掉，只是从今夜起，兵权不再该留在席间，而是已经被你在酒杯之间稳稳收了回来。",
      },
    ],
  }),
  "tianji-horse-race": createEventPlayableContent({
    eventId: "tianji-horse-race",
    initialSceneId: "racecourse-side",
    defaultBackdrop: {
      label: "赛场",
      tone: "jade",
      description:
        "背景占位图：赛马场边尘土、看台与终点线都压着同一个问题：明明马更弱，这一场还能不能靠顺序翻过来。",
      backgroundKey: "horse-race-course",
    },
    viewpoints: tianjiHorseRaceViewpoints,
    speakerVisuals: tianjiHorseRaceSpeakerVisualMap,
    scenes: [
      {
        id: "racecourse-side",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: tianjiHorseRaceAiBackdropMap["racecourse-side"],
        text:
          "你站在赛马场边，还没听见开锣，就先看见齐王一方那股稳得像已经赢下来的气势。自己这边的马并不差，可真摆在对面一比，谁都知道没有轻松取胜的把握。",
        nextSceneId: "sunbin-observes",
      },
      {
        id: "sunbin-observes",
        type: "dialogue",
        speaker: "孙膑",
        speakerId: "sunbin",
        visualKey: "sunbin",
        background: tianjiHorseRaceAiBackdropMap["viewing-stand"],
        text:
          "先别只盯着谁更快。你看他们的上、中、下三等马，强弱不是一线压到底，而是每一层都刚好错开一点。胜负不在马本身，先看顺序。",
        nextSceneId: "switch-order",
      },
      {
        id: "switch-order",
        type: "dialogue",
        speaker: "田忌",
        speakerId: "tianji",
        visualKey: "tianji",
        background: tianjiHorseRaceAiBackdropMap["viewing-stand"],
        text:
          "你是说，先把最弱的一匹送上去？第一轮若就输掉，场边的人怕是只会觉得我昏了头。你这办法，赌得是不是太险了些？",
        nextSceneId: "first-round-given",
      },
      {
        id: "first-round-given",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: tianjiHorseRaceAiBackdropMap["racecourse-side"],
        text:
          "第一轮很快就输了。你的下等马刚被齐王上等马压过去，场边已经有人笑出声来，连看台上的目光都像在问：田忌今日到底是来赛马，还是来认输的。",
        nextSceneId: "tianji-uneasy",
      },
      {
        id: "tianji-uneasy",
        type: "dialogue",
        speaker: "孙膑",
        speakerId: "sunbin",
        visualKey: "sunbin",
        background: tianjiHorseRaceAiBackdropMap["viewing-stand"],
        text:
          "让他们先笑一会儿。真正该算的是三轮之后谁赢两场，不是眼前这一阵起哄。第二轮换你的上等马出去，现在开始，局面才真正轮到你手里。",
        nextSceneId: "second-round-turns",
      },
      {
        id: "second-round-turns",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: tianjiHorseRaceAiBackdropMap["racecourse-side"],
        text:
          "第二轮冲出去的是你的上等马，对面的却只是中等。马蹄声一近一远地拉开后，你这边先冲过终点，方才那阵笑声顿时断了半截，连你自己都觉得胸口那口气终于往回提了一点。",
        nextSceneId: "third-round-locks",
      },
      {
        id: "third-round-locks",
        type: "dialogue",
        speaker: "田忌",
        speakerId: "tianji",
        visualKey: "tianji",
        background: tianjiHorseRaceAiBackdropMap["racecourse-side"],
        text:
          "我明白了。前一轮不是白送，而是把对面的上等马提前耗掉。如今再以中等对下等，这第三轮若稳住，输掉的那一场反倒成了整局最值的一步。",
        nextSceneId: "king-and-crowd-react",
      },
      {
        id: "king-and-crowd-react",
        type: "dialogue",
        speaker: "齐王",
        speakerId: "qiwang",
        visualKey: "qiwang",
        background: tianjiHorseRaceAiBackdropMap["finish-lane"],
        text:
          "原来如此。马并没有忽然变强，是你们把三轮的先后调了个位置。刚才场边笑得最早的人，如今倒都安静下来了，看来胜负果然不只看眼前这一匹。",
        nextSceneId: "after-race",
      },
      {
        id: "after-race",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: tianjiHorseRaceAiBackdropMap["finish-lane"],
        text:
          "你回望赛场时，扬起的尘土还没完全落下。真正改掉胜负的并不是哪匹马忽然生出神力，而是孙膑早就看见了一件别人都没顾上的事：同样三轮，只要顺序换了，整局就会换人。 ",
      },
    ],
  }),
  "humen-destroy-opium": createEventPlayableContent({
    eventId: "humen-destroy-opium",
    initialSceneId: "seaside-morning",
    defaultBackdrop: {
      label: "虎门",
      tone: "jade",
      description:
        "背景占位图：海风、箱子、销烟池和登记册把这一天压成一场必须当众完成的公开行动。",
      backgroundKey: "humen-seaside-morning",
    },
    viewpoints: humenViewpoints,
    speakerVisuals: humenSpeakerVisualMap,
    scenes: [
      {
        id: "seaside-morning",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: humenAiBackdropMap["seaside-morning"],
        text:
          "海风一早就压得很重。你站在虎门现场，看见清军已经在四周列开，远处一排排箱子还没完全搬近，潮气、盐味和人群的低声议论一起把这一天的分量先压到了肩上。",
        nextSceneId: "crates-carried-in",
      },
      {
        id: "crates-carried-in",
        type: "dialogue",
        speaker: "督办官员",
        speakerId: "officer",
        visualKey: "officer",
        background: humenAiBackdropMap["opium-yard"],
        text:
          "抬箱子的都靠这边走，封条别碰坏。登记的人把箱数、来源和移交次序一项项记清楚，今天这里不是乱砸乱倒，谁都不许先乱了规程。",
        nextSceneId: "linzexu-arrives",
      },
      {
        id: "linzexu-arrives",
        type: "dialogue",
        speaker: "林则徐",
        speakerId: "linzexu",
        visualKey: "linzexu",
        background: humenAiBackdropMap["opium-yard"],
        text:
          "先看销烟池，再看登记册。箱数、封条、移交和倾倒都要对得上，今天这件事既然当众做，就不能留半点含糊给人挑错。",
        nextSceneId: "checking-registers",
      },
      {
        id: "checking-registers",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: humenAiBackdropMap["opium-yard"],
        text:
          "你低头核对册页，封条、箱数和手上记下的数字一项都不敢错。旁边有人催得很紧，可你越听见催声，越知道眼前这不是一把火烧掉就算了的差事，而是一笔一笔都要落在纸上的公开处置。",
        nextSceneId: "dump-into-pit",
      },
      {
        id: "dump-into-pit",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: humenAiBackdropMap["destruction-pit"],
        text:
          "箱盖被撬开后，烟土一团团倒进池里。石灰、海水和潮湿的气味很快混到一起，眼前不是壮观，而是一种发沉的真实：这些东西正在众目睽睽之下被一点点推向再也回不去的地方。",
        nextSceneId: "crowd-watches",
      },
      {
        id: "crowd-watches",
        type: "dialogue",
        speaker: "围观百姓",
        speakerId: "citizen",
        visualKey: "citizen",
        background: humenAiBackdropMap["crowd-edge"],
        text:
          "真在销了……不是只说几句就散场。你看那些箱子，一箱接一箱地往里倒，今天这地方怕是要被人记很多年。",
        nextSceneId: "foreign-eyes",
      },
      {
        id: "foreign-eyes",
        type: "dialogue",
        speaker: "督办官员",
        speakerId: "officer",
        visualKey: "officer",
        background: humenAiBackdropMap["crowd-edge"],
        text:
          "把字再看清一遍。远处有人盯着咱们，越是这个时候，册子越不能错，动作也不能乱。今天让人看见的，不只是销毁多少，更是我们有没有把这件事做稳。",
        nextSceneId: "order-to-continue",
      },
      {
        id: "order-to-continue",
        type: "dialogue",
        speaker: "林则徐",
        speakerId: "linzexu",
        visualKey: "linzexu",
        background: humenAiBackdropMap["destruction-pit"],
        text:
          "照规程继续。查验、登记、倾倒，一项都不要省；该快的地方快，该稳的地方稳。今天既然开始了，就让所有人都看明白，这不是一句空话。",
        nextSceneId: "destruction-continues",
      },
      {
        id: "destruction-continues",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: humenAiBackdropMap["destruction-pit"],
        text:
          "时间一段一段地过去，池边换了几轮人，登记册上的数字也一页页往后翻。你抬头时，海风还是那样重，可现场已经没人把这里当成普通差事了，每个人都在用自己的方式撑着这场漫长的公开行动。",
        nextSceneId: "day-settles",
      },
      {
        id: "day-settles",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: humenAiBackdropMap["crowd-edge"],
        text:
          "等这一批鸦片终于处置完，百姓慢慢散开，官员还在回头核对箱数。海风里混着石灰味，地上留下的不是喧闹过后的空场，而是一整天规程、目光和压力叠出来的沉静。",
        nextSceneId: "aftertaste-humen",
      },
      {
        id: "aftertaste-humen",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: humenAiBackdropMap["seaside-morning"],
        text:
          "你合上登记册再回看虎门时，记住的不是某句响亮的话，而是海风、箱子、销烟池和一双双盯着现场的眼睛。今天这件事之所以沉重，正因为它不是停在纸上的命令，而是真的当众做完了。",
      },
    ],
  }),
  "debate-with-wu-scholars": createEventPlayableContent({
    eventId: "debate-with-wu-scholars",
    initialSceneId: "enter-wu-hall",
    defaultBackdrop: {
      label: "吴堂",
      tone: "ink",
      description:
        "背景占位图：东吴朝堂上臣列分坐，问题与目光都先压在使者踏进堂中的那一刻。",
      backgroundKey: "wu-court-hall",
    },
    viewpoints: debateWithWuViewpoints,
    speakerVisuals: debateWithWuSpeakerVisualMap,
    scenes: [
      {
        id: "enter-wu-hall",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: debateWithWuAiBackdropMap["court-approach"],
        text:
          "你被引入东吴议事堂前时，门内的低声议论并没有因为脚步靠近而停下。堂上那股不算失礼、却也绝称不上欢迎的气息，让你一进门就明白今天不是寻常会见。",
        nextSceneId: "courtiers-open",
      },
      {
        id: "courtiers-open",
        type: "dialogue",
        speaker: "东吴群臣",
        speakerId: "courtier",
        visualKey: "courtier",
        background: debateWithWuAiBackdropMap["debate-hall"],
        text:
          "刘备兵少势弱，寄身荆州尚且未稳，如今却要江东跟着一起担这口气。使者既到，不如先说明白：凭什么要我们陪你们去挡曹操？",
        nextSceneId: "zhangzhao-challenges",
      },
      {
        id: "zhangzhao-challenges",
        type: "dialogue",
        speaker: "张昭",
        speakerId: "zhangzhao",
        visualKey: "zhangzhao",
        background: debateWithWuAiBackdropMap["debate-hall"],
        text:
          "刘玄德败于长坂，寄人篱下尚且难安，如今却叫江东与之抗曹。蜀使若真为联盟而来，总该先说清楚：以这样的兵力与根基，凭什么让人信你们撑得住？",
        nextSceneId: "zhuge-initial-answer",
      },
      {
        id: "zhuge-initial-answer",
        type: "dialogue",
        speaker: "诸葛亮",
        speakerId: "zhuge-liang",
        visualKey: "zhuge-liang",
        background: debateWithWuAiBackdropMap.dais,
        text:
          "玄德兵少，不是假话；曹操势大，也无人否认。可今日真正该问的，不是谁暂时弱些，而是曹操若顺江东下，江东还能不能像今日这样安坐堂上议论取舍。",
        nextSceneId: "courtiers-press",
      },
      {
        id: "courtiers-press",
        type: "dialogue",
        speaker: "东吴群臣",
        speakerId: "courtier",
        visualKey: "courtier",
        background: debateWithWuAiBackdropMap["debate-hall"],
        text:
          "若抗曹而败，江东岂不是连退路都没有？与其把全境压上去，倒不如先保住眼前。你劝我们迎战，可曾替江东算过输了以后拿什么收场？",
        nextSceneId: "zhuge-counter-question",
      },
      {
        id: "zhuge-counter-question",
        type: "dialogue",
        speaker: "诸葛亮",
        speakerId: "zhuge-liang",
        visualKey: "zhuge-liang",
        background: debateWithWuAiBackdropMap.dais,
        text:
          "若一味只求眼前安稳，便真有收场可言吗？江东今日若先低头，曹操得了江东水师与地利，日后再想保孙氏基业，恐怕连这一堂议事的余地都不会剩下。",
        nextSceneId: "zhangzhao-argues-again",
      },
      {
        id: "zhangzhao-argues-again",
        type: "dialogue",
        speaker: "张昭",
        speakerId: "zhangzhao",
        visualKey: "zhangzhao",
        background: debateWithWuAiBackdropMap["debate-hall"],
        text:
          "曹军强盛是真，江东兵民也是真。老臣所忧的不是一句声名，而是若贸然迎战，败则俱败。江东不是不能战，而是不能只凭一腔意气就把多年积累全押进去。",
        nextSceneId: "zhuge-reveals-stakes",
      },
      {
        id: "zhuge-reveals-stakes",
        type: "dialogue",
        speaker: "诸葛亮",
        speakerId: "zhuge-liang",
        visualKey: "zhuge-liang",
        background: debateWithWuAiBackdropMap.dais,
        text:
          "亮也不劝江东凭意气行事。可正因江东有根基、有水军、有天险，才更该明白：今日能与曹操周旋的，不是退让，而是守住自己不肯让出的那条线。若连这条线都先交出去，往后便只剩听命。",
        nextSceneId: "sunquan-observes",
      },
      {
        id: "sunquan-observes",
        type: "narration",
        speaker: "旁白",
        speakerId: "narration",
        visualKey: "narration",
        background: debateWithWuAiBackdropMap.dais,
        text:
          "你说到这里时，终于看见主位上的孙权不再只是听着。他没有立刻表态，却把原本搭在扶手上的手收紧了一寸，像是第一次真正把堂上争的，不止当作刘备的请求，而是江东自己的去路。",
        nextSceneId: "resistance-softens",
      },
      {
        id: "resistance-softens",
        type: "dialogue",
        speaker: "东吴群臣",
        speakerId: "courtier",
        visualKey: "courtier",
        background: debateWithWuAiBackdropMap["debate-hall"],
        text:
          "……若真要抗曹，也总得有能抗的法子。如今看来，使者倒不是只会替刘备求援，话里确实在替江东算账。只是此事太重，终归不能凭一时口舌就定下。",
        nextSceneId: "final-stance",
      },
      {
        id: "final-stance",
        type: "dialogue",
        speaker: "诸葛亮",
        speakerId: "zhuge-liang",
        visualKey: "zhuge-liang",
        background: debateWithWuAiBackdropMap.dais,
        text:
          "亮今日来，不是逼江东逞一时之勇，只是把眼前真正的选择摆明。抗曹固然险，可求降未必生；若终须一战，越早看清这件事，江东就越不是被人逼着动身，而是自己替自己守住根本。",
        nextSceneId: "hall-after-echo",
      },
      {
        id: "hall-after-echo",
        type: "narration",
        speaker: "收束",
        speakerId: "ending",
        visualKey: "ending",
        background: debateWithWuAiBackdropMap["after-debate"],
        text:
          "堂上一时静了下来，连刚才接得最急的声音都慢了半拍。你知道今日并没有把大局当场定下，可也看见那层原本结得很紧的反对，已经被撬出了一道能让真正决断透进来的缝。",
      },
    ],
  }),
};

export function getHistoricalFigure(figureId: string) {
  return historicalFigureCatalog.find((figure) => figure.id === figureId) ?? null;
}

export function getHistoricalEvent(eventId: string) {
  return historicalEventCatalog.find((eventItem) => eventItem.id === eventId) ?? null;
}

export function getFigureEventRelations(figureId: string) {
  return figureEventRelations.filter((relation) => relation.figureId === figureId);
}

export function getEventRelations(eventId: string) {
  return figureEventRelations.filter((relation) => relation.eventId === eventId);
}

export function getEventPlayableContent(eventId: string) {
  return eventStoryCatalog[eventId] ?? null;
}

export function getEventPreparationData(eventId: string): EventPreparationData | null {
  const event = getHistoricalEvent(eventId);
  if (!event) {
    return null;
  }

  const playableContent = getEventPlayableContent(eventId);
  const viewpoints = playableContent?.viewpoints ?? [];

  return {
    event,
    viewpoints,
    recommendedViewpointIds: event.recommendedViewpointIds ?? [],
    hasPlayableStory: !!event.hasPlayableStory && !!playableContent,
  };
}

export function getFigureRelatedExperiences(figureId: string): FigureExperienceOption[] {
  const relations = getFigureEventRelations(figureId);
  const figure = getHistoricalFigure(figureId);

  const eventEntries = relations.map((relation) => {
    const eventItem = relation.eventId ? getHistoricalEvent(relation.eventId) : null;
    const viewpointNames =
      eventItem?.recommendedViewpointIds?.map(
        (viewpointId) =>
          eventStoryCatalog[relation.eventId ?? ""]?.viewpoints.find(
            (viewpoint) => viewpoint.id === viewpointId,
          )?.name ?? viewpointId,
      ) ?? [];
    const href = relation.eventId
      ? relation.canBeViewpoint
        ? `/events/${relation.eventId}?viewpoint=${figureId}&fromFigure=${figureId}`
        : `/events/${relation.eventId}?fromFigure=${figureId}`
      : undefined;

    return {
      id: relation.id,
      kind: "event" as const,
      title: relation.eventTitle,
      description: relation.summary,
      note: relation.isRecommendedViewpoint
        ? `推荐从${figure?.name ?? "该人物"}视角进入`
        : viewpointNames.length > 0
          ? `当前事件推荐视角：${viewpointNames.join("、")}`
          : undefined,
      ctaLabel: href ? "进入事件准备页" : "当前先浏览人物档案",
      href,
    };
  });

  const timeTheaterEntry: FigureExperienceOption = figure?.canJoinTimeTheater
    ? {
        id: `${figureId}-time-theater`,
        kind: "time-theater",
        title: "跨时空互动剧场",
        description:
          "把这个人物带入跨时代讨论，在另一种玩法里观察他会如何表达、如何判断、如何回应问题。",
        note: "可在互动页中继续设为第一视角",
        ctaLabel: "进入跨时空互动",
        href: "/time-theater",
      }
    : {
        id: `${figureId}-time-theater`,
        kind: "time-theater",
        title: "跨时空互动剧场",
        description:
          "这个人物暂时不在当前跨时空剧场阵容中，但这条入口结构已经保留，后续可以继续扩展。",
        ctaLabel: "当前人物暂不在剧场阵容中",
      };

  return [...eventEntries, timeTheaterEntry];
}

export const figureDynastyGroups = [
  "全部朝代",
  "战国",
  "秦",
  "汉",
  "三国",
  "唐",
  "宋",
  "明",
  "清",
] as const;

export const figureRoleGroups = [
  "全部身份",
  "君主",
  "谋士",
  "武将",
  "文人",
  "学者",
] as const;

export const eventCategoryGroups = [
  "全部分类",
  "权谋博弈",
  "战场军略",
  "宫廷朝堂",
  "现场行动",
  "情感和解",
] as const;

type FigureDynastyGroup = (typeof figureDynastyGroups)[number];
type FigureRoleGroup = (typeof figureRoleGroups)[number];
type EventCategoryGroup = (typeof eventCategoryGroups)[number];

const figureDynastyGroupByDynasty: Record<
  string,
  Exclude<FigureDynastyGroup, "全部朝代">
> = {
  战国: "战国",
  秦: "秦",
  西汉: "汉",
  东汉末: "汉",
  三国: "三国",
  唐周: "唐",
  宋: "宋",
  北宋: "宋",
  明: "明",
  清: "清",
};

const figureRoleGroupByFigureId: Record<
  string,
  Exclude<FigureRoleGroup, "全部身份">
> = {
  liubang: "君主",
  xiangyu: "君主",
  "zhuge-liang": "谋士",
  zhouyu: "武将",
  "huang-gai": "武将",
  wuzetian: "君主",
  liqingzhao: "文人",
  wangyangming: "学者",
  simayi: "谋士",
  caocao: "君主",
  liubei: "君主",
  zhaokuangyin: "君主",
  jingke: "武将",
  yingzheng: "君主",
  tianji: "武将",
  sunbin: "谋士",
  guanyu: "武将",
  huatuo: "学者",
  caopi: "君主",
  caozhi: "文人",
  linzexu: "谋士",
  lianpo: "武将",
  linxiangru: "谋士",
  simaguang: "文人",
};

const eventCategoryGroupByCategory: Record<
  string,
  Exclude<EventCategoryGroup, "全部分类">
> = {
  权谋博弈: "权谋博弈",
  酒局试探: "权谋博弈",
  制度抉择: "权谋博弈",
  博弈奇谋: "权谋博弈",
  战局转折: "战场军略",
  军阵试探: "战场军略",
  军前誓师: "战场军略",
  "宫廷权力 / 政治转折": "宫廷朝堂",
  宫廷权力: "宫廷朝堂",
  朝堂辩论: "宫廷朝堂",
  宫廷试压: "宫廷朝堂",
  极限刺杀: "现场行动",
  帐中生死: "现场行动",
  公开行动: "现场行动",
  庭院应变: "现场行动",
  将相和解: "情感和解",
};

export function getFigureDynastyGroup(dynasty: string): FigureDynastyGroup {
  const mappedGroup = figureDynastyGroupByDynasty[dynasty];
  if (mappedGroup) {
    return mappedGroup;
  }

  if (dynasty.includes("战国")) return "战国";
  if (dynasty.includes("秦")) return "秦";
  if (dynasty.includes("汉")) return "汉";
  if (dynasty.includes("三国")) return "三国";
  if (dynasty.includes("唐")) return "唐";
  if (dynasty.includes("宋")) return "宋";
  if (dynasty.includes("明")) return "明";
  if (dynasty.includes("清")) return "清";

  return "汉";
}

export function getFigureRoleGroup(
  figure: Pick<HistoricalFigure, "id" | "role">,
): FigureRoleGroup {
  const mappedGroup = figureRoleGroupByFigureId[figure.id];
  if (mappedGroup) {
    return mappedGroup;
  }

  if (figure.role.includes("君")) return "君主";
  if (figure.role.includes("谋")) return "谋士";
  if (
    figure.role.includes("将") ||
    figure.role.includes("统帅") ||
    figure.role.includes("刺客")
  ) {
    return "武将";
  }
  if (figure.role.includes("文")) return "文人";
  if (figure.role.includes("学") || figure.role.includes("医")) return "学者";

  return "谋士";
}

export function getEventCategoryGroup(category: string): EventCategoryGroup {
  const mappedGroup = eventCategoryGroupByCategory[category];
  if (mappedGroup) {
    return mappedGroup;
  }

  if (
    category.includes("权谋") ||
    category.includes("酒局") ||
    category.includes("博弈") ||
    category.includes("制度")
  ) {
    return "权谋博弈";
  }
  if (
    category.includes("战") ||
    category.includes("军") ||
    category.includes("阵")
  ) {
    return "战场军略";
  }
  if (category.includes("宫廷") || category.includes("朝堂")) {
    return "宫廷朝堂";
  }
  if (
    category.includes("行动") ||
    category.includes("刺") ||
    category.includes("生死") ||
    category.includes("庭院")
  ) {
    return "现场行动";
  }
  if (category.includes("和解")) {
    return "情感和解";
  }

  return "权谋博弈";
}

export const figureRelatedExperiences = Object.fromEntries(
  historicalFigureCatalog.map((figure) => [
    figure.id,
    getFigureRelatedExperiences(figure.id),
  ]),
) as Record<string, FigureExperienceOption[]>;

export const historicalFigures: HistoricalFigure[] = historicalFigureCatalog.map(
  (figure) => ({
    ...figure,
    experienceOptions: getFigureRelatedExperiences(figure.id),
  }),
);

export const historicalEvents = historicalEventCatalog;

export const eventCategories = [...eventCategoryGroups];

export const eventStatuses = [
  "全部状态",
  ...new Set(historicalEventCatalog.map((eventItem) => eventItem.statusLabel)),
];

export const timeTheaterEligibleFigureIds = historicalFigureCatalog
  .filter((figure) => figure.canJoinTimeTheater)
  .map((figure) => figure.id);

const hongmenEvent = historicalEventCatalog.find(
  (eventItem) => eventItem.id === "hongmen-banquet",
);

const hongmenPlayableContent = eventStoryCatalog["hongmen-banquet"];

export const eventPlayableContent = eventStoryCatalog;
export const aiStructuredStoryFixtures: Record<
  string,
  {
    output: AiStructuredStoryOutput;
    backgrounds: Record<string, PlaceholderAsset>;
    speakerVisuals: Record<string, EventSpeakerVisual>;
  }
> = {};

export const hongmenRoles = hongmenPlayableContent?.viewpoints ?? [];

export const hongmenScenes = hongmenPlayableContent?.scenes ?? [];

export const hongmenSpeakerVisuals = hongmenPlayableContent?.speakerVisuals ?? {};

export const hongmenStageMeta = {
  title: hongmenEvent?.title ?? "楦块棬瀹?",
  preparationDescription: hongmenEvent?.description ?? "",
  backdropLabel: hongmenEvent?.backdropLabel ?? "楦块棬",
  backdropDescription: hongmenEvent?.backdropDescription ?? "",
};
