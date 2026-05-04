// miniprogram/data/perfumes.ts

export interface PerfumeNotes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface PerfumeItem {
  id: number;
  brand: string;
  name: string;
  desc: string;
  price: number;
  priceStr: string;
  sales: number;
  isNew: boolean;
  tags: string[];
  image: string;
  stock: number;
  volume: string;
  concentration: string;
  notes: PerfumeNotes;
  story: string;
  allowMemberDiscount?: boolean;
  overrideKey?: string;
}

export const allPerfumes: PerfumeItem[] = [
  {
    id: 1,
    brand: "Roja Dove",
    name: "Diaghilev",
    desc: "宏大的西普调，俄罗斯芭蕾的致敬之作。",
    price: 8500,
    priceStr: "¥8,500",
    sales: 120,
    isNew: false,
    tags: ["西普调", "浓香精", "典藏"],
    image: "/images/perfume-diaghilev.png",
    stock: 3,
    volume: "100ml",
    concentration: "Parfum",
    notes: {
      top: ["佛手柑", "孜然", "柠檬"],
      middle: ["五月玫瑰", "茉莉", "依兰"],
      base: ["橡木苔", "广藿香", "鸢尾根"]
    },
    story: "层次极其繁复的古典西普，开场明亮辛香，随后转入厚重花香与苔藓木质。适合收藏、晚宴和正式场合。",
    allowMemberDiscount: false
  },
  {
    id: 2,
    brand: "Sultan Pasha",
    name: "Aurum d'Angkhor",
    desc: "极度奢华的沉香与藏红花，3ml纯香精。",
    price: 2100,
    priceStr: "¥2,100",
    sales: 45,
    isNew: true,
    tags: ["沉香", "辛香", "纯香精"],
    image: "/images/perfume-aurum.png",
    stock: 12,
    volume: "3ml",
    concentration: "Attar",
    notes: {
      top: ["藏红花", "蜂蜜", "柑橘皮"],
      middle: ["玫瑰", "树脂", "肉桂"],
      base: ["沉香", "檀香", "龙涎香"]
    },
    story: "高浓度油香带来贴肤而持久的金色暖意，沉香和香料逐层展开，适合偏爱东方调与小容量珍藏的用户。"
  },
  {
    id: 3,
    brand: "Fueguia 1833",
    name: "Muskara Phero J",
    desc: "费洛蒙与亚马逊植物的结合。",
    price: 2400,
    priceStr: "¥2,400",
    sales: 389,
    isNew: false,
    tags: ["伪体香", "麝香", "贴肤"],
    image: "/images/perfume-muskara.png",
    stock: 4,
    volume: "30ml",
    concentration: "Extrait",
    notes: {
      top: ["粉感麝香", "植物气息"],
      middle: ["鸢尾", "柔和木质"],
      base: ["白麝香", "琥珀", "皮肤香"]
    },
    story: "安静、干净、贴近皮肤的气味，像高级织物在肌肤上留下的温度。适合日常通勤和低调亲密距离。"
  },
  {
    id: 4,
    brand: "L'Artisan",
    name: "Passage d'Enfer",
    desc: "冥府之路，经典木质调。",
    price: 850,
    priceStr: "¥850",
    sales: 1200,
    isNew: false,
    tags: ["木质", "焚香", "入门"],
    image: "/images/perfume-passage.png",
    stock: 200,
    volume: "100ml",
    concentration: "Eau de Toilette",
    notes: {
      top: ["清冷白花", "空气感"],
      middle: ["焚香", "百合"],
      base: ["雪松", "白麝香", "木质香"]
    },
    story: "清冷焚香与木质感构成克制的空间感，不厚重也不甜腻，是适合入门木质焚香调的长期款。"
  },
  {
    id: 5,
    brand: "Frederic Malle",
    name: "Portrait of a Lady",
    desc: "贵妇肖像，广藿玫瑰的天花板。",
    price: 2680,
    priceStr: "¥2,680",
    sales: 600,
    isNew: true,
    tags: ["玫瑰", "广藿香", "高扩散"],
    image: "/images/perfume-portrait.png",
    stock: 1,
    volume: "50ml",
    concentration: "Eau de Parfum",
    notes: {
      top: ["覆盆子", "黑醋栗", "丁香"],
      middle: ["土耳其玫瑰", "天竺葵"],
      base: ["广藿香", "檀香", "乳香"]
    },
    story: "馥郁玫瑰与广藿香构成强烈存在感，优雅但不柔弱。适合约会、派对和希望留下记忆点的场合。"
  }
];
