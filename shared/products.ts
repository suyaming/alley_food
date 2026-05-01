import type { Product } from './types'

const NOODLES = '面食 Noodles'
const SNACKS = '小食 Snacks'
const MAINS = '主食 Mains'
const SWEETS = '甜品 Sweets'
const SOUPS = '汤品 Soups'
const DRINKS = '饮品 Drinks'
const TEA = '茶 Tea'
const CUTLERY = '餐具 Tableware'

export const categories = [
  NOODLES,
  SNACKS,
  MAINS,
  SWEETS,
  SOUPS,
  DRINKS,
  TEA,
  CUTLERY,
] as const

export const products: Product[] = [
  // ─── 面食 Noodles · 16 ───────────────────────────────────────────────
  {
    id: 'lao-tan-suanla-fen',
    name: '老坛酸辣粉 Sour & Spicy Noodles',
    description:
      'Sweet potato noodles bathing in a clay-jar sour broth with chilli oil, peanuts and fried soybeans. Carry-out tub.',
    price: 8.8,
    currency: 'USD',
    image: '/products/lao-tan-suanla-fen.png',
    category: NOODLES,
  },
  {
    id: 'cong-you-ban-mian',
    name: '葱油拌面 Scallion Oil Noodles',
    description:
      'Hand-pulled wheat noodles tossed with slow-confit scallion oil, light soy and a pinch of sugar. A Shanghai lane classic.',
    price: 7.2,
    currency: 'USD',
    image: '/products/cong-you-ban-mian.png',
    category: NOODLES,
  },
  {
    id: 'dan-dan-mian',
    name: '担担面 Dan Dan Noodles',
    description:
      'Sichuan thin wheat noodles under a chilli-and-peanut crown, with minced pork sui mi ya cai. Mix and eat.',
    price: 9.5,
    currency: 'USD',
    image: '/products/dan-dan-mian.png',
    category: NOODLES,
  },
  {
    id: 'lan-zhou-niu-rou-mian',
    name: '兰州牛肉拉面 Lanzhou Beef Noodle Soup',
    description:
      'Hand-pulled noodles in clear beef broth — five-radish bouquet, white daikon, chilli oil, coriander. A bowl that walks across China.',
    price: 12.8,
    currency: 'USD',
    image: '/products/lan-zhou-niu-rou-mian.png',
    category: NOODLES,
  },
  {
    id: 'chong-qing-xiao-mian',
    name: '重庆小面 Chongqing Xiao Mian',
    description:
      'Mountain-style chilli oil over thin yellow noodles, finished with Sichuan peppercorn, peanuts and pickled greens.',
    price: 9.8,
    currency: 'USD',
    image: '/products/chong-qing-xiao-mian.png',
    category: NOODLES,
  },
  {
    id: 'zha-jiang-mian',
    name: '老北京炸酱面 Beijing Zha Jiang Mian',
    description:
      'Thick noodles in a fermented soybean and pork-belly sauce, topped with shredded cucumber, radish and bean sprouts.',
    price: 9.2,
    currency: 'USD',
    image: '/products/zha-jiang-mian.png',
    category: NOODLES,
  },
  {
    id: 'dao-xiao-mian',
    name: '山西刀削面 Knife-shaved Noodles',
    description:
      'Wide ribbons shaved from a dough loaf, served in tomato-and-egg sauce or lamb broth. Chewy by design.',
    price: 11.8,
    currency: 'USD',
    image: '/products/dao-xiao-mian.png',
    category: NOODLES,
  },
  {
    id: 'biang-biang-mian',
    name: '油泼面 Biang Biang Noodles',
    description:
      'Belt-wide hand-torn noodles dressed with garlic, scallion and chilli flakes, then doused in smoking-hot oil at the table.',
    price: 11.2,
    currency: 'USD',
    image: '/products/biang-biang-mian.png',
    category: NOODLES,
  },
  {
    id: 'liang-pi',
    name: '西安凉皮 Cold Skin Noodles',
    description:
      'Steamed wheat-starch sheets with cucumber, sprouts, sesame paste and chilli vinegar. Cold, sour, gluten-y.',
    price: 8.8,
    currency: 'USD',
    image: '/products/liang-pi.png',
    category: NOODLES,
  },
  {
    id: 'yun-tun-mian',
    name: '港式云吞面 Cantonese Wonton Noodle Soup',
    description:
      'Thin springy egg noodles, plump pork-and-shrimp wontons, clear flounder broth and a sliver of yellow chive.',
    price: 11.5,
    currency: 'USD',
    image: '/products/yun-tun-mian.png',
    category: NOODLES,
  },
  {
    id: 'tai-shi-niu-rou-mian',
    name: '台式牛肉面 Taiwanese Beef Noodle Soup',
    description:
      'Slow-braised shin and tendon in a five-spice tomato broth, over chewy hand-cut noodles. Pickled mustard greens on the side.',
    price: 14.8,
    currency: 'USD',
    image: '/products/tai-shi-niu-rou-mian.png',
    category: NOODLES,
  },
  {
    id: 'guo-qiao-mi-xian',
    name: '过桥米线 Crossing-the-Bridge Rice Noodles',
    description:
      'Yunnan rice vermicelli arranged with raw chicken, ham and chrysanthemum petals — you tip them into 90 °C broth at the table.',
    price: 13.5,
    currency: 'USD',
    image: '/products/guo-qiao-mi-xian.png',
    category: NOODLES,
  },
  {
    id: 'gan-chao-niu-he',
    name: '干炒牛河 Beef Chow Fun',
    description:
      'Wide rice noodles wok-tossed with beef, scallion and bean sprouts over flamethrower heat. Smokey, glossy, never wet.',
    price: 13.5,
    currency: 'USD',
    image: '/products/gan-chao-niu-he.png',
    category: NOODLES,
  },
  {
    id: 'ma-jiang-liang-mian',
    name: '麻酱凉面 Sesame Cold Noodles',
    description:
      'Cold noodles tossed in a sesame-paste sauce thinned with rice vinegar, finished with shredded cucumber and chilli oil.',
    price: 8.5,
    currency: 'USD',
    image: '/products/ma-jiang-liang-mian.png',
    category: NOODLES,
  },
  {
    id: 're-gan-mian',
    name: '武汉热干面 Wuhan Hot Dry Noodles',
    description:
      'Pre-cooked alkaline noodles tossed (not soupy) with sesame paste, pickled radish and chilli. Wuhan breakfast staple.',
    price: 8.8,
    currency: 'USD',
    image: '/products/re-gan-mian.png',
    category: NOODLES,
  },
  {
    id: 'yang-chun-mian',
    name: '阳春面 Yangchun Plain Noodles',
    description:
      'Thin noodles in clear broth with lard, scallion and a single drop of soy. The most stripped-down comfort bowl in Jiangnan.',
    price: 6.5,
    currency: 'USD',
    image: '/products/yang-chun-mian.png',
    category: NOODLES,
  },

  // ─── 小食 Snacks · 14 ────────────────────────────────────────────────
  {
    id: 'mala-mianjin',
    name: '麻辣面筋串 Mala Gluten Skewer',
    description:
      'Pillowy wheat-gluten ribbons brushed with Sichuan chilli, cumin and roasted sesame, threaded on bamboo.',
    price: 6.5,
    currency: 'USD',
    image: '/products/mala-mianjin.png',
    category: SNACKS,
  },
  {
    id: 'jian-bing-guo-zi',
    name: '天津煎饼果子 Jian Bing',
    description:
      'A thin mung-bean crepe griddled with egg, scallion, fermented bean paste, chilli and a crackly fried cracker rolled inside.',
    price: 7.5,
    currency: 'USD',
    image: '/products/jian-bing-guo-zi.png',
    category: SNACKS,
  },
  {
    id: 'xiao-long-bao',
    name: '上海小笼包 Soup Dumplings (8 pcs)',
    description:
      'Thin-skinned pork dumplings filled with aspic that melts to soup when steamed. Serve with ginger, black vinegar.',
    price: 9.8,
    currency: 'USD',
    image: '/products/xiao-long-bao.png',
    category: SNACKS,
  },
  {
    id: 'shao-mai',
    name: '烧麦 Pork & Sticky Rice Shumai (6 pcs)',
    description:
      'Open-topped wheat dumplings with pork, glutinous rice, mushroom and a touch of soy. Steamed to glassy.',
    price: 8.2,
    currency: 'USD',
    image: '/products/shao-mai.png',
    category: SNACKS,
  },
  {
    id: 'guo-tie',
    name: '锅贴 Pan-fried Pork Pot Stickers (6 pcs)',
    description:
      'Crisp-bottom dumplings with pork and napa cabbage. Bottom lattice-fried, top steamed under a lid.',
    price: 8.5,
    currency: 'USD',
    image: '/products/guo-tie.png',
    category: SNACKS,
  },
  {
    id: 'cong-you-bing',
    name: '葱油饼 Scallion Pancake',
    description:
      'Laminated dough rolled with scallion and lard, pan-fried until each leaf shatters. One of the great snacks.',
    price: 5.8,
    currency: 'USD',
    image: '/products/cong-you-bing.png',
    category: SNACKS,
  },
  {
    id: 'jiu-cai-he-zi',
    name: '韭菜盒子 Chive & Egg Pocket',
    description:
      'A half-moon flatbread stuffed with garlic chives, scrambled egg and glass noodles, fried until blistered.',
    price: 6.2,
    currency: 'USD',
    image: '/products/jiu-cai-he-zi.png',
    category: SNACKS,
  },
  {
    id: 'ji-dan-guan-bing',
    name: '鸡蛋灌饼 Egg-stuffed Flatbread',
    description:
      'A puffed flatbread split open and filled with a thin omelette, lettuce, hoisin and chilli. Held in one hand.',
    price: 6.8,
    currency: 'USD',
    image: '/products/ji-dan-guan-bing.png',
    category: SNACKS,
  },
  {
    id: 'cha-ye-dan',
    name: '茶叶蛋 Tea Eggs (3-pack)',
    description:
      'Eggs cracked and steeped in five-spice tea broth overnight, marbled like map ink, salty as the sea.',
    price: 5.5,
    currency: 'USD',
    image: '/products/cha-ye-dan.png',
    category: SNACKS,
  },
  {
    id: 'lu-wei-pin-pan',
    name: '卤味拼盘 Lu Wei Cold Cuts',
    description:
      'A tray of soy-braised tofu skin, lotus root, peanuts, kelp and dried bamboo. Chilled, sliced, ready.',
    price: 14.5,
    currency: 'USD',
    image: '/products/lu-wei-pin-pan.png',
    category: SNACKS,
  },
  {
    id: 'roujiamo',
    name: '西安肉夹馍 Pork Burger',
    description:
      'Slow-braised pork shoulder, hand-chopped with green peppers and stuffed inside a wood-fired flatbread. The Chinese hamburger.',
    price: 8.8,
    currency: 'USD',
    image: '/products/roujiamo.png',
    category: SNACKS,
  },
  {
    id: 'chou-dou-fu',
    name: '长沙臭豆腐 Stinky Tofu (Changsha-style)',
    description:
      'Black-fermented tofu deep-fried until crisp, drowned in chilli garlic sauce and pickled radish. Smell first, taste later.',
    price: 6.5,
    currency: 'USD',
    image: '/products/chou-dou-fu.png',
    category: SNACKS,
  },
  {
    id: 'liang-fen',
    name: '川北凉粉 Sichuan Cold Jelly',
    description:
      'Pea-starch jelly cubes tossed with chilli oil, garlic vinegar, soy and Sichuan pepper. Slippery, cold, intensely red.',
    price: 6.8,
    currency: 'USD',
    image: '/products/liang-fen.png',
    category: SNACKS,
  },
  {
    id: 'shao-bing',
    name: '麻酱烧饼 Sesame Flatbread',
    description:
      'Layered sesame-paste flatbread baked on the inside of a barrel oven. Crackly, nutty, eaten plain or split with eggs.',
    price: 4.5,
    currency: 'USD',
    image: '/products/shao-bing.png',
    category: SNACKS,
  },

  // ─── 主食 Mains · 16 ─────────────────────────────────────────────────
  {
    id: 'tang-cu-xiao-pai',
    name: '糖醋小排 Sweet & Sour Spare Ribs',
    description:
      'Pork ribs braised with rock sugar, Zhenjiang vinegar and Shaoxing wine until lacquered and glossy. Serves two.',
    price: 16.0,
    currency: 'USD',
    image: '/products/tang-cu-xiao-pai.png',
    category: MAINS,
  },
  {
    id: 'ma-po-tofu',
    name: '麻婆豆腐 Mapo Tofu',
    description:
      'Silken tofu in chilli-bean broth with minced beef, fermented black bean and a snowdrift of fresh-ground Sichuan pepper.',
    price: 11.5,
    currency: 'USD',
    image: '/products/ma-po-tofu.png',
    category: MAINS,
  },
  {
    id: 'gong-bao-ji-ding',
    name: '宫保鸡丁 Kung Pao Chicken',
    description:
      'Diced chicken with peanuts, dried chillies and Sichuan pepper. Sour-sweet glaze, charred edges, restraint with the sauce.',
    price: 14.8,
    currency: 'USD',
    image: '/products/gong-bao-ji-ding.png',
    category: MAINS,
  },
  {
    id: 'hong-shao-rou',
    name: '红烧肉 Mao-style Red-braised Pork',
    description:
      'Pork belly cubes caramelised in rock sugar and braised in dark soy until each cube wobbles on the chopstick.',
    price: 17.8,
    currency: 'USD',
    image: '/products/hong-shao-rou.png',
    category: MAINS,
  },
  {
    id: 'yu-xiang-rou-si',
    name: '鱼香肉丝 Fish-fragrant Pork',
    description:
      'Slivered pork with wood-ear, bamboo and pickled chilli in the famous "fish-fragrant" sauce — sour, sweet, spicy, salty, no fish.',
    price: 13.5,
    currency: 'USD',
    image: '/products/yu-xiang-rou-si.png',
    category: MAINS,
  },
  {
    id: 'dong-po-rou',
    name: '东坡肉 Dong Po Braised Pork Belly',
    description:
      'A 4-cm cube of pork belly, slow-braised in Shaoxing wine and rock sugar for three hours. Hangzhou\'s greatest gift.',
    price: 18.5,
    currency: 'USD',
    image: '/products/dong-po-rou.png',
    category: MAINS,
  },
  {
    id: 'hui-guo-rou',
    name: '回锅肉 Twice-cooked Pork',
    description:
      'Pork belly first poached, then sliced and stir-fried with leek, broad-bean paste and sweet sauce. Sichuan country home cooking.',
    price: 14.5,
    currency: 'USD',
    image: '/products/hui-guo-rou.png',
    category: MAINS,
  },
  {
    id: 'shui-zhu-yu',
    name: '水煮鱼 Boiled Fish in Chilli Oil',
    description:
      'Tilapia fillets poached in chilli-and-peppercorn oil over bean sprouts. Looks like a volcano, drinks like a broth.',
    price: 22.0,
    currency: 'USD',
    image: '/products/shui-zhu-yu.png',
    category: MAINS,
  },
  {
    id: 'suan-cai-yu',
    name: '酸菜鱼 Sour Fish & Pickled Greens',
    description:
      'Fresh basa in a pickled-mustard-green broth with bird\'s-eye chilli and white pepper. Sour-spicy, brightly hot.',
    price: 21.0,
    currency: 'USD',
    image: '/products/suan-cai-yu.png',
    category: MAINS,
  },
  {
    id: 'gan-bian-si-ji-dou',
    name: '干煸四季豆 Dry-fried Green Beans',
    description:
      'Long beans blistered until shrivelled, tossed with minced pork, dried shrimp, Sichuan pepper and sui mi ya cai.',
    price: 10.5,
    currency: 'USD',
    image: '/products/gan-bian-si-ji-dou.png',
    category: MAINS,
  },
  {
    id: 'yu-xiang-qie-zi',
    name: '鱼香茄子 Fish-fragrant Eggplant',
    description:
      'Chinese eggplant batons fried until silken, then tossed in the fish-fragrant sauce. Dangerous over white rice.',
    price: 11.8,
    currency: 'USD',
    image: '/products/yu-xiang-qie-zi.png',
    category: MAINS,
  },
  {
    id: 'dan-chao-fan',
    name: '蛋炒饭 Egg Fried Rice',
    description:
      'Day-old rice, egg, scallion, white pepper, lard. Five things, done with violence over the stove. Three minutes.',
    price: 8.5,
    currency: 'USD',
    image: '/products/dan-chao-fan.png',
    category: MAINS,
  },
  {
    id: 'yang-zhou-chao-fan',
    name: '扬州炒饭 Yangzhou Fried Rice',
    description:
      'Egg fried rice with shrimp, ham, peas, mushroom and scallion. Each grain glossy and individual, the canonical version.',
    price: 11.2,
    currency: 'USD',
    image: '/products/yang-zhou-chao-fan.png',
    category: MAINS,
  },
  {
    id: 'lu-rou-fan',
    name: '台式卤肉饭 Taiwanese Braised Pork Rice',
    description:
      'Hand-chopped pork belly braised in soy, rock sugar and shallot oil, ladled over warm rice with a soft-boiled egg.',
    price: 10.8,
    currency: 'USD',
    image: '/products/lu-rou-fan.png',
    category: MAINS,
  },
  {
    id: 'cha-shao-fan',
    name: '港式叉烧饭 Char Siu over Rice',
    description:
      'Honey-glazed barbecued pork sliced over rice with blanched gai lan, drizzled with the roasting tray drippings.',
    price: 13.5,
    currency: 'USD',
    image: '/products/cha-shao-fan.png',
    category: MAINS,
  },
  {
    id: 'pi-dan-shou-rou-zhou',
    name: '皮蛋瘦肉粥 Century Egg & Pork Congee',
    description:
      'A bowl of long-cooked rice porridge with century egg, salted pork and a drift of fried dough sticks.',
    price: 9.8,
    currency: 'USD',
    image: '/products/pi-dan-shou-rou-zhou.png',
    category: MAINS,
  },

  // ─── 甜品 Sweets · 12 ────────────────────────────────────────────────
  {
    id: 'hong-tang-ci-ba',
    name: '红糖糍粑 Brown-Sugar Mochi',
    description:
      'Pan-seared glutinous rice cakes drizzled with brown-sugar syrup and toasted soy flour. Crisp outside, chewy inside.',
    price: 6.8,
    currency: 'USD',
    image: '/products/hong-tang-ci-ba.png',
    category: SWEETS,
  },
  {
    id: 'xing-ren-dou-fu',
    name: '杏仁豆腐 Almond Tofu',
    description:
      'A silken set custard of apricot kernel and milk, served cold in syrup with goji berries.',
    price: 5.5,
    currency: 'USD',
    image: '/products/xing-ren-dou-fu.png',
    category: SWEETS,
  },
  {
    id: 'gui-ling-gao',
    name: '龟苓膏 Tortoise Herbal Jelly',
    description:
      'A glossy black herbal jelly cooked from twenty bitter roots, eaten cold with honey. Cantonese medicine you actually want.',
    price: 6.2,
    currency: 'USD',
    image: '/products/gui-ling-gao.png',
    category: SWEETS,
  },
  {
    id: 'shuang-pi-nai',
    name: '双皮奶 Double-skin Milk Pudding',
    description:
      'A two-layer pudding from Shunde, set from buffalo milk with egg white and sugar. Custardy, with a wrinkled top.',
    price: 6.8,
    currency: 'USD',
    image: '/products/shuang-pi-nai.png',
    category: SWEETS,
  },
  {
    id: 'mang-guo-bu-ding',
    name: '港式芒果布丁 HK Mango Pudding',
    description:
      'A small bowl of bright Alphonso pudding, evaporated milk poured over the top. Goes with a pot of jasmine.',
    price: 6.5,
    currency: 'USD',
    image: '/products/mang-guo-bu-ding.png',
    category: SWEETS,
  },
  {
    id: 'zhi-ma-tang-yuan',
    name: '黑芝麻汤圆 Black Sesame Tang Yuan (5 pcs)',
    description:
      'Glutinous rice balls filled with molten black-sesame and lard, served in a thin ginger broth.',
    price: 5.8,
    currency: 'USD',
    image: '/products/zhi-ma-tang-yuan.png',
    category: SWEETS,
  },
  {
    id: 'ma-tuan',
    name: '芝麻麻团 Sesame Balls (4 pcs)',
    description:
      'Golden glutinous-rice balls with red bean inside and a coat of toasted white sesame. Fry-stand classic.',
    price: 4.8,
    currency: 'USD',
    image: '/products/ma-tuan.png',
    category: SWEETS,
  },
  {
    id: 'sa-qi-ma',
    name: '沙琪玛 Sachima Crispy Cake',
    description:
      'Manchurian sweet of fried noodle clusters bound with maltose and rosewater. Crisp turns chewy in your mouth.',
    price: 4.5,
    currency: 'USD',
    image: '/products/sa-qi-ma.png',
    category: SWEETS,
  },
  {
    id: 'gui-hua-gao',
    name: '桂花糕 Osmanthus Cake',
    description:
      'A pale, springy steamed cake scented with dried osmanthus and rock sugar. Elegant with green tea.',
    price: 5.2,
    currency: 'USD',
    image: '/products/gui-hua-gao.png',
    category: SWEETS,
  },
  {
    id: 'lu-dou-bing',
    name: '绿豆冰糕 Mung Bean Cake',
    description:
      'A pressed mung-bean cake from Beijing, served chilled. Tastes faintly of summer and old Hutongs.',
    price: 4.8,
    currency: 'USD',
    image: '/products/lu-dou-bing.png',
    category: SWEETS,
  },
  {
    id: 'dou-sha-bao',
    name: '豆沙包 Red Bean Buns (3 pcs)',
    description:
      'Steamed white buns filled with hand-mashed red-bean paste and a thread of orange peel. Breakfast in a basket.',
    price: 5.5,
    currency: 'USD',
    image: '/products/dou-sha-bao.png',
    category: SWEETS,
  },
  {
    id: 'tang-hu-lu',
    name: '糖葫芦 Candied Hawthorn Skewer',
    description:
      'Six bright red hawthorn berries threaded on bamboo and dipped in cracking-clear hard sugar. Beijing winter staple.',
    price: 4.2,
    currency: 'USD',
    image: '/products/tang-hu-lu.png',
    category: SWEETS,
  },

  // ─── 汤品 Soups · 8 ──────────────────────────────────────────────────
  {
    id: 'gui-hua-jiu-niang',
    name: '桂花酒酿圆子 Osmanthus Rice Ball Soup',
    description:
      'A Jiangnan dessert soup of small glutinous rice balls with fermented sweet rice and dried osmanthus blossoms.',
    price: 5.5,
    currency: 'USD',
    image: '/products/gui-hua-jiu-niang.png',
    category: SOUPS,
  },
  {
    id: 'xi-hu-niu-rou-geng',
    name: '西湖牛肉羹 West Lake Beef Soup',
    description:
      'A delicate Hangzhou soup of minced beef, egg white and tofu in a thick clear broth. Spoon-only.',
    price: 9.8,
    currency: 'USD',
    image: '/products/xi-hu-niu-rou-geng.png',
    category: SOUPS,
  },
  {
    id: 'suan-la-tang',
    name: '川式酸辣汤 Sichuan Hot & Sour Soup',
    description:
      'A clear, fierce soup of mushroom, tofu, lily bud and bamboo, sharpened with vinegar and white pepper.',
    price: 7.5,
    currency: 'USD',
    image: '/products/suan-la-tang.png',
    category: SOUPS,
  },
  {
    id: 'zi-cai-dan-hua',
    name: '紫菜蛋花汤 Seaweed & Egg Drop Soup',
    description:
      'The simplest soup — laver, scallion, sesame oil, dried shrimp and a swirl of beaten egg. Two minutes from the stove.',
    price: 5.8,
    currency: 'USD',
    image: '/products/zi-cai-dan-hua.png',
    category: SOUPS,
  },
  {
    id: 'lian-zi-bai-he-tang',
    name: '莲子百合汤 Lotus Seed & Lily Bulb',
    description:
      'A clear, lightly sweet tonic soup with white fungus, lotus seed and dried lily bulb. Cantonese late-summer cool.',
    price: 6.8,
    currency: 'USD',
    image: '/products/lian-zi-bai-he-tang.png',
    category: SOUPS,
  },
  {
    id: 'luo-song-tang',
    name: '海派罗宋汤 Shanghai Borscht',
    description:
      'A China-via-Russia tomato beef soup with cabbage, potato, carrot and a knob of butter. Lunchtime in old Shanghai.',
    price: 7.5,
    currency: 'USD',
    image: '/products/luo-song-tang.png',
    category: SOUPS,
  },
  {
    id: 'yu-tou-dou-fu-tang',
    name: '鱼头豆腐汤 Fish Head & Tofu Soup',
    description:
      'Bighead carp head simmered until the broth turns ivory white, served with silken tofu and ginger. Restorative.',
    price: 13.8,
    currency: 'USD',
    image: '/products/yu-tou-dou-fu-tang.png',
    category: SOUPS,
  },
  {
    id: 'san-xian-tang',
    name: '三鲜汤 Three-Fresh Seafood Soup',
    description:
      'Shrimp, scallop and squid with bamboo and sea cucumber in clear chicken stock. The umami comes from the sea.',
    price: 8.5,
    currency: 'USD',
    image: '/products/san-xian-tang.png',
    category: SOUPS,
  },

  // ─── 饮品 Drinks · 8 ─────────────────────────────────────────────────
  {
    id: 'suan-mei-tang-1l',
    name: '老北京酸梅汤 1L Smoked Plum Cooler',
    description:
      'A pot-brewed cooler of smoked plum, hawthorn and licorice. Tart, smoky and the only good answer to mala.',
    price: 9.0,
    currency: 'USD',
    image: '/products/suan-mei-tang-1l.png',
    category: DRINKS,
  },
  {
    id: 'dou-jiang-1l',
    name: '现磨豆浆 1L Fresh Soy Milk',
    description:
      'Freshly ground non-GMO soybeans, sweetened lightly. Drink it warm with a youtiao at 7 in the morning.',
    price: 6.5,
    currency: 'USD',
    image: '/products/dou-jiang-1l.png',
    category: DRINKS,
  },
  {
    id: 'yang-zhi-gan-lu',
    name: '港式杨枝甘露 Mango Pomelo Sago',
    description:
      'Hong Kong icon — Alphonso mango, fresh pomelo segments, sago pearls, evaporated milk. Cold-cup in summer.',
    price: 7.8,
    currency: 'USD',
    image: '/products/yang-zhi-gan-lu.png',
    category: DRINKS,
  },
  {
    id: 'dong-gua-cha-1l',
    name: '古早冬瓜茶 1L Winter Melon Tea',
    description:
      'Slow-boiled rock sugar and winter melon flesh, strained and chilled. Old-stand Taiwan, vegetal, faintly caramel.',
    price: 7.5,
    currency: 'USD',
    image: '/products/dong-gua-cha-1l.png',
    category: DRINKS,
  },
  {
    id: 'gui-hua-leng-pao',
    name: '桂花蜜冷泡茶 Osmanthus Cold Brew',
    description:
      'Green tea steeped overnight in cold water with dried osmanthus and a thread of honey. Floral, almost dry.',
    price: 6.8,
    currency: 'USD',
    image: '/products/gui-hua-leng-pao.png',
    category: DRINKS,
  },
  {
    id: 'ning-meng-shui',
    name: '鲜榨柠檬水 Pressed Lemonade',
    description:
      'Three pressed lemons, rock sugar syrup, sea salt rim. Made by the cup, served with a wide bamboo straw.',
    price: 5.8,
    currency: 'USD',
    image: '/products/ning-meng-shui.png',
    category: DRINKS,
  },
  {
    id: 'xian-cao-mi-jiang',
    name: '仙草米浆 Grass Jelly & Rice Milk',
    description:
      'A Taiwan night-market drink of grass jelly cubes, peanut, taro and a creamy rice-milk float on top.',
    price: 6.5,
    currency: 'USD',
    image: '/products/xian-cao-mi-jiang.png',
    category: DRINKS,
  },
  {
    id: 'mi-feng-you-zi',
    name: '蜂蜜柚子茶 Honey Pomelo Tea',
    description:
      'A spoon of jarred honey-pomelo preserve, dissolved in hot water. Sticky, bitter-bright, oddly hangover-curing.',
    price: 7.2,
    currency: 'USD',
    image: '/products/mi-feng-you-zi.png',
    category: DRINKS,
  },

  // ─── 茶 Tea · 6 ──────────────────────────────────────────────────────
  {
    id: 'mo-li-xiang-pian',
    name: '茉莉香片 50g Jasmine Tea',
    description:
      'Spring-picked green tea scented seven times over fresh jasmine blossoms. Loose leaf, single-origin Fujian.',
    price: 12.0,
    currency: 'USD',
    image: '/products/mo-li-xiang-pian.png',
    category: TEA,
  },
  {
    id: 'xi-hu-long-jing',
    name: '明前西湖龙井 30g Pre-Qingming Long Jing',
    description:
      'Hangzhou Longjing picked before the spring rains. Pan-fired flat leaves, vegetal sweetness, chestnut finish.',
    price: 28.0,
    currency: 'USD',
    image: '/products/xi-hu-long-jing.png',
    category: TEA,
  },
  {
    id: 'tie-guan-yin',
    name: '安溪铁观音 50g Iron Goddess Oolong',
    description:
      'A medium-roast Anxi oolong with the orchid note Tie Guan Yin is famous for. Many infusions deep.',
    price: 18.0,
    currency: 'USD',
    image: '/products/tie-guan-yin.png',
    category: TEA,
  },
  {
    id: 'pu-er-cha-bing',
    name: '云南普洱茶饼 357g Pu Er Cake',
    description:
      'A 2018 sheng pu er cake from Yiwu mountain. Earthy, leather, cellar — improves on the shelf for decades.',
    price: 38.0,
    currency: 'USD',
    image: '/products/pu-er-cha-bing.png',
    category: TEA,
  },
  {
    id: 'da-hong-pao',
    name: '武夷大红袍 50g Da Hong Pao',
    description:
      'A heavy-roast Wuyi rock oolong — mineral, dark caramel, the soft smoke of pine charcoal in the finish.',
    price: 24.0,
    currency: 'USD',
    image: '/products/da-hong-pao.png',
    category: TEA,
  },
  {
    id: 'feng-huang-dan-cong',
    name: '凤凰单丛 50g Phoenix Dancong',
    description:
      'A Guangdong oolong from Phoenix Mountain — single-bush picking, with a famous magnolia-and-honey note.',
    price: 22.0,
    currency: 'USD',
    image: '/products/feng-huang-dan-cong.png',
    category: TEA,
  },

  // ─── 餐具 Tableware · 8 ───────────────────────────────────────────────
  {
    id: 'zhu-kuai-zi',
    name: '竹筷一双 Bamboo Chopsticks',
    description:
      'A pair of natural raw bamboo chopsticks — unlacquered, sanded smooth. The shop standard; we slip one pair in every order.',
    price: 0.03,
    currency: 'USD',
    image: '/products/zhu-kuai-zi.png',
    category: CUTLERY,
  },
  {
    id: 'qing-hua-tang-chi',
    name: '青花瓷调羹 Blue & White Soup Spoon',
    description:
      'A small porcelain Chinese soup spoon with cobalt-blue brushwork on a bone-white glaze. The right shape for broth, congee and soup dumplings.',
    price: 1.8,
    currency: 'USD',
    image: '/products/qing-hua-tang-chi.png',
    category: CUTLERY,
  },
  {
    id: 'kuai-jia',
    name: '樱桃木筷架 Cherry-wood Chopstick Rest',
    description:
      'A turned cherry-wood chopstick rest, hand-sanded and food-safe oil finished. Comes as a set of two; rests one pair of chopsticks per piece.',
    price: 2.4,
    currency: 'USD',
    image: '/products/kuai-jia.png',
    category: CUTLERY,
  },
  {
    id: 'qing-ci-fan-wan',
    name: '青瓷饭碗 Celadon Rice Bowl',
    description:
      'A hand-thrown rice bowl in pale celadon glaze, with a slightly irregular foot and a fine crackle. 11cm diameter, 6cm tall.',
    price: 4.8,
    currency: 'USD',
    image: '/products/qing-ci-fan-wan.png',
    category: CUTLERY,
  },
  {
    id: 'cha-bei-yi-dui',
    name: '白瓷茶杯一对 Porcelain Tea Cup Pair',
    description:
      'Two thin-walled white porcelain tea cups, undecorated, the right size to pair with a gaiwan. 60ml each, sold as a pair.',
    price: 6.5,
    currency: 'USD',
    image: '/products/cha-bei-yi-dui.png',
    category: CUTLERY,
  },
  {
    id: 'gai-wan',
    name: '盖碗 Gaiwan Tea Bowl',
    description:
      'A traditional three-piece gaiwan — bowl, lid and saucer — for brewing leaf tea by hand. White porcelain, 120ml. The most honest tea vessel there is.',
    price: 9.8,
    currency: 'USD',
    image: '/products/gai-wan.png',
    category: CUTLERY,
  },
  {
    id: 'zhu-zheng-long',
    name: '竹蒸笼 Bamboo Steamer',
    description:
      'A natural bamboo steamer, 18cm — for dumplings, buns, leafy greens. Hand-bound rim, woven bamboo lid; sits over any pot of simmering water.',
    price: 12.5,
    currency: 'USD',
    image: '/products/zhu-zheng-long.png',
    category: CUTLERY,
  },
  {
    id: 'zi-sha-cha-hu',
    name: '紫砂茶壶 Yixing Clay Teapot',
    description:
      'A small unglazed Yixing purple-clay teapot, ~150ml. The kind that "remembers" the tea you brew in it; season it with one varietal and never wash it with soap.',
    price: 36.0,
    currency: 'USD',
    image: '/products/zi-sha-cha-hu.png',
    category: CUTLERY,
  },
]

export const productsById: Map<string, Product> = new Map(
  products.map((p) => [p.id, p]),
)

export function getProduct(id: string): Product | undefined {
  return productsById.get(id)
}
