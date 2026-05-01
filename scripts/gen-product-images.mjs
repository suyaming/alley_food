#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Generates one editorial-style flat-lay PNG per dish in `shared/products.ts`,
 * via OpenRouter using Google's Nano Banana 2 (gemini-3.1-flash-image-preview).
 * Writes to `public/products/{id}.png`.
 *
 * Idempotent: existing files are skipped, so partial runs / retries are cheap.
 *
 * Usage:
 *   $env:OPENROUTER_API_KEY = "sk-or-..."     # PowerShell
 *   export OPENROUTER_API_KEY=sk-or-...       # bash / zsh
 *   npm run gen:images                        # run with defaults
 *   npm run gen:images -- --aspect-ratio 4:5  # portrait crop
 *   npm run gen:images -- --image-size 2K     # higher-res
 *   npm run gen:images -- --concurrency 8     # faster
 *   npm run gen:images -- --only lao-tan-suanla-fen,ma-po-tofu
 *   npm run gen:images -- --force             # regenerate even if file exists
 */

import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '..', 'public', 'products')

// ─── CLI args ──────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function flag(name, def = null) {
  const i = args.indexOf(name)
  if (i === -1) return def
  const v = args[i + 1]
  return v === undefined || v.startsWith('--') ? true : v
}
const MODEL = flag('--model', 'google/gemini-3.1-flash-image-preview')
const ASPECT_RATIO = flag('--aspect-ratio', '1:1')
const IMAGE_SIZE = flag('--image-size', '1K') // 0.5K | 1K | 2K | 4K (3.1 supports 0.5K)
const CONCURRENCY = Number(flag('--concurrency', 4))
const FORCE = !!flag('--force', false)
const ONLY = (flag('--only', '') || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const DRY = !!flag('--dry-run', false)
const TIMEOUT_MS = Number(flag('--timeout', 120000))
const MAX_RETRIES = Number(flag('--max-retries', 2))

if (!process.env.OPENROUTER_API_KEY && !DRY) {
  console.error('Missing OPENROUTER_API_KEY. Get one at https://openrouter.ai/keys')
  process.exit(1)
}

// ─── Shared style spec (locked from approved prototypes) ───────────────
const STYLE_PREFIX =
  'Top-down 90 degree flat lay overhead photograph. ' +
  'Centered on warm off-white unbleached linen tablecloth with soft natural texture. '
const STYLE_SUFFIX =
  'Soft diffused daylight from upper-left, gentle natural shadow on the lower-right. ' +
  'Restrained editorial food photography, magazine still-life quality, ' +
  'muted natural palette, generous negative space. ' +
  'NO additional props beyond what is listed, NO hands, NO text, NO watermarks, ' +
  'NO garnish theatrics, NO sauce splatter, NO bright neon colors, NO patterns on background. ' +
  'Square 1:1 composition.'

// ─── Archetype builders ────────────────────────────────────────────────
const NOODLE = ({ detail, vessel = 'dark-charcoal matte unglazed ceramic' }) =>
  `${STYLE_PREFIX}A single deep round ${vessel} bowl. The bowl is filled with ${detail}. ` +
  `Two natural raw bamboo chopsticks resting flat beside the bowl on the linen. ` +
  `The bowl occupies about 55% of the frame. ${STYLE_SUFFIX}`

const SOUP = ({ detail, vessel = 'cream-glaze hand-thrown ceramic' }) =>
  `${STYLE_PREFIX}A single deep round ${vessel} bowl. The bowl is filled with ${detail}. ` +
  `A small porcelain Chinese soup spoon rests on the right edge of the bowl. ` +
  `The bowl occupies about 55% of the frame. ${STYLE_SUFFIX}`

const MAIN = ({ detail, vessel = 'cream-glaze hand-thrown ceramic' }) =>
  `${STYLE_PREFIX}A wide shallow round ${vessel} plate. On the plate is ${detail}. ` +
  `A small porcelain Chinese soup spoon rests on the right edge of the plate. ` +
  `The plate occupies about 60% of the frame. ${STYLE_SUFFIX}`

const SNACK = ({ detail, vessel = 'sand-colored matte ceramic' }) =>
  `${STYLE_PREFIX}A small ${vessel} plate. On the plate is ${detail}. ` +
  `A pair of natural raw bamboo chopsticks resting flat to the right of the plate. ` +
  `The plate occupies about 50% of the frame. ${STYLE_SUFFIX}`

const SWEET = ({ detail, vessel = 'sand-colored matte ceramic' }) =>
  `${STYLE_PREFIX}A small round ${vessel} saucer plate. On the saucer is ${detail}. ` +
  `A tiny natural raw bamboo fork lies diagonally to the right of the saucer on the linen. ` +
  `The saucer occupies about 55% of the frame. ${STYLE_SUFFIX}`

const DRINK = ({ detail, glass = 'tall clear straight-sided glass tumbler' }) =>
  `${STYLE_PREFIX}A ${glass} sitting on a thin round natural raw paper coaster with slightly rough edges. ` +
  `The glass contains ${detail}. A few small beads of cold condensation are visible on the upper outer surface of the glass. ` +
  `The glass occupies about 35% of the frame, with abundant space around. ${STYLE_SUFFIX}`

const TEA = ({ detail }) =>
  `${STYLE_PREFIX}A loose pile of dried tea is spread directly on a sheet of rough kraft brown paper in the center — ${detail}. ` +
  `A small natural raw bamboo tea scoop lies diagonally on the paper. ` +
  `To the upper right, a small cylindrical unglazed clay tea tin sits open on its side with a few more tea leaves spilling out. ` +
  `The composition occupies about 55% of the frame. ${STYLE_SUFFIX}`

// Empty tableware on the linen — the object IS the subject. No food.
const TABLEWARE = ({ detail }) =>
  `${STYLE_PREFIX}${detail} ` +
  `Centered on the linen, no food, no liquid, the empty object is the subject. ` +
  `Generous negative space framing the piece on all sides. ` +
  `The object occupies about 45% of the frame. ${STYLE_SUFFIX}`

const TPL = { NOODLE, SOUP, MAIN, SNACK, SWEET, DRINK, TEA, TABLEWARE }

// ─── 80 dish specs ─────────────────────────────────────────────────────
// Each entry: id (matches shared/products.ts), template, detail (~30 words)
/** @type {Array<{ id: string, tpl: keyof typeof TPL, detail: string, vessel?: string, glass?: string }>} */
const DISHES = [
  // ── 面食 Noodles · 16 ──
  { id: 'lao-tan-suanla-fen', tpl: 'NOODLE', detail: 'Sour & Spicy Sweet Potato Noodles — translucent dark-red sour broth, glassy noodles partly visible coiled below the surface, dotted with crushed peanuts and a few golden fried soybeans, a single sliver of pickled mustard green floating' },
  { id: 'cong-you-ban-mian', tpl: 'MAIN', detail: 'Scallion Oil Noodles — glossy thin hand-pulled wheat noodles tossed in a thin amber scallion-oil glaze (no broth), generous fresh-cut green scallion garnish on top', vessel: 'soft sand-colored matte ceramic' },
  { id: 'dan-dan-mian', tpl: 'NOODLE', detail: 'Dan Dan Noodles — thin wheat noodles topped with a deep red chilli oil pool, a small mound of dark minced pork sui mi ya cai, scattered crushed peanuts and Sichuan peppercorn flakes' },
  { id: 'lan-zhou-niu-rou-mian', tpl: 'NOODLE', detail: 'Lanzhou Beef Noodle Soup — clear amber beef broth with thin pulled wheat noodles, three slices of stewed beef, two thin rounds of white daikon radish, chilli oil swirl, fresh coriander leaves' },
  { id: 'chong-qing-xiao-mian', tpl: 'NOODLE', detail: 'Chongqing Xiao Mian — thin yellow alkaline noodles in deep red Sichuan chilli oil with crushed peanuts, scallion, dark fermented broad-bean paste, pickled mustard greens' },
  { id: 'zha-jiang-mian', tpl: 'NOODLE', detail: 'Beijing Zha Jiang Mian — thick wheat noodles topped with a dark fermented soybean and minced pork sauce, neat piles of julienned cucumber, julienned radish, and white bean sprouts arranged around the sauce', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'dao-xiao-mian', tpl: 'NOODLE', detail: 'Shanxi Knife-shaved Noodles — wide irregular hand-shaved wheat ribbons in a tomato-and-egg sauce with bright red tomato chunks, scrambled egg flakes, scallion green' },
  { id: 'biang-biang-mian', tpl: 'MAIN', detail: 'Biang Biang Noodles — extra-wide hand-torn belt noodles glossy with chilli oil, topped with minced garlic, scallion, chilli flakes and a pool of smoking-hot chilli oil', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'liang-pi', tpl: 'MAIN', detail: 'Cold Skin Noodles — translucent steamed wheat-starch sheets, julienned cucumber, mung-bean sprouts, sesame paste drizzle, chilli vinegar, crushed peanuts', vessel: 'soft sand-colored matte ceramic' },
  { id: 'yun-tun-mian', tpl: 'NOODLE', detail: 'Cantonese Wonton Noodle Soup — clear pale flounder broth with thin springy egg noodles, four plump pork-and-shrimp wontons, a sliver of yellow chive, single drop of sesame oil', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'tai-shi-niu-rou-mian', tpl: 'NOODLE', detail: 'Taiwanese Beef Noodle Soup — deep brown five-spice tomato broth with hand-cut chewy wheat noodles, slow-braised beef shin chunks, soft tendon, baby bok choy, pickled mustard greens on the side' },
  { id: 'guo-qiao-mi-xian', tpl: 'SOUP', detail: 'Yunnan Crossing-the-Bridge Rice Vermicelli — clear chicken broth with thin white rice noodles, raw thin slices of chicken and ham just dropped in, mushroom slices, chrysanthemum petals floating' },
  { id: 'gan-chao-niu-he', tpl: 'MAIN', detail: 'Beef Chow Fun — wide flat rice noodles wok-tossed glossy and dark with beef slices, white scallion lengths, mung-bean sprouts; smokey wok-hei char marks visible', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'ma-jiang-liang-mian', tpl: 'MAIN', detail: 'Sesame Cold Noodles — chilled pale yellow wheat noodles tossed in pale beige sesame paste sauce, julienned cucumber on top, single drizzle of dark chilli oil, sprinkle of toasted sesame seeds', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 're-gan-mian', tpl: 'MAIN', detail: 'Wuhan Hot Dry Noodles — alkaline yellow wheat noodles tossed (not soupy) in beige sesame paste, pickled radish dice, scallion green, chilli oil drizzle, no broth', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'yang-chun-mian', tpl: 'NOODLE', detail: 'Yangchun Plain Noodles — thin wheat noodles in clear pale broth, a small dot of melted lard floating, fine-cut green scallion rings, single drop of soy sauce coloring the broth', vessel: 'cream-glaze hand-thrown ceramic' },

  // ── 小食 Snacks · 14 ──
  { id: 'mala-mianjin', tpl: 'SNACK', detail: 'three Mala Gluten Skewers on bamboo sticks — pillowy wheat-gluten ribbons brushed with deep-red Sichuan chilli oil, dusted with cumin and toasted sesame; sticks lined up neatly', vessel: 'soft sand-colored matte ceramic plank-shaped' },
  { id: 'jian-bing-guo-zi', tpl: 'SNACK', detail: 'a single rolled Tianjin Jian Bing — thin mung-bean crepe wrap browned with egg, scallion, dark fermented bean paste, chilli sauce and a crackly fried cracker visible inside, cut on the diagonal' },
  { id: 'xiao-long-bao', tpl: 'SNACK', detail: 'six Shanghai soup dumplings (xiao long bao) in a bamboo steamer basket — translucent thin pleated tops, soup visible at the base; small saucer of black vinegar with thin ginger threads beside the steamer', vessel: 'natural bamboo steamer with a sand-colored saucer of vinegar' },
  { id: 'shao-mai', tpl: 'SNACK', detail: 'six open-topped pork-and-sticky-rice shumai dumplings in a bamboo steamer — yellow wheat wrappers gathered around glossy filling of pork, mushroom and glutinous rice, single orange dot of fish roe on top of each', vessel: 'natural bamboo steamer' },
  { id: 'guo-tie', tpl: 'SNACK', detail: 'six pan-fried pork pot stickers arranged in a curved row, deep golden-brown crispy lattice bottoms facing up, pleated steamed tops; a small dipping saucer of dark vinegar and ginger threads beside' },
  { id: 'cong-you-bing', tpl: 'SNACK', detail: 'one whole golden-brown round Scallion Pancake cut into six wedges, flaky laminated layers visible at each cut edge, scattered scallion green flecks throughout the dough' },
  { id: 'jiu-cai-he-zi', tpl: 'SNACK', detail: 'two half-moon Chive & Egg Pockets — golden-brown blistered fried flatbreads stuffed with garlic chives and scrambled egg, slightly crimped sealed edges; one whole, one cut to show filling' },
  { id: 'ji-dan-guan-bing', tpl: 'SNACK', detail: 'one Egg-stuffed Flatbread cut on the diagonal showing thin omelette, lettuce leaf, hoisin sauce smear and chilli inside the puffed flatbread; sesame seeds on the crust' },
  { id: 'cha-ye-dan', tpl: 'SNACK', detail: 'three peeled tea eggs arranged in a row — egg whites cracked with a fine dark brown marbled pattern from steeping in tea broth, golden yolks slightly visible at one cut edge' },
  { id: 'lu-wei-pin-pan', tpl: 'SNACK', detail: 'a Lu Wei cold-cut platter — thinly sliced soy-braised tofu skin folded, lotus root rounds, peanuts, dried bamboo strips, kelp knots, all dark amber glossy from soy braise, arranged in distinct neat clusters', vessel: 'sand-colored matte ceramic wide oval' },
  { id: 'roujiamo', tpl: 'SNACK', detail: 'one Xian Pork Burger — a round wood-fired flatbread split with hand-chopped slow-braised pork shoulder, fine green pepper bits, dark sauce visible at the cut; one whole next to it on the plate' },
  { id: 'chou-dou-fu', tpl: 'SNACK', detail: 'four cubes of Changsha-style stinky tofu — black-fermented tofu deep-fried with crackly black-charcoal crust, drowned in deep-red chilli garlic sauce with pickled radish dice and scallion' },
  { id: 'liang-fen', tpl: 'SNACK', detail: 'Sichuan Cold Jelly — translucent pale green-yellow pea-starch jelly cubes tossed in deep-red chilli oil with minced garlic, soy sauce, vinegar pool, scattered Sichuan peppercorn flakes and scallion green', vessel: 'sand-colored matte ceramic shallow' },
  { id: 'shao-bing', tpl: 'SNACK', detail: 'three Sesame Flatbreads stacked slightly off-axis — golden-brown round breads densely covered in toasted white sesame seeds on top, layered slightly so the sesame coating is the focal point' },

  // ── 主食 Mains · 16 ──
  { id: 'tang-cu-xiao-pai', tpl: 'MAIN', detail: 'Sweet & Sour Spare Ribs — deep mahogany lacquered pork ribs glossy with rock-sugar-and-vinegar glaze, scattered toasted white sesame seeds, single sprig of fresh coriander' },
  { id: 'ma-po-tofu', tpl: 'MAIN', detail: 'Mapo Tofu — silken white tofu cubes in deep red Sichuan chilli oil with finely minced beef, sliced bright green scallion rings on top, scattered crushed black Sichuan peppercorn flakes' },
  { id: 'gong-bao-ji-ding', tpl: 'MAIN', detail: 'Kung Pao Chicken — diced chicken with charred edges glossy in dark sour-sweet glaze, mixed with whole roasted peanuts, dried red chillies, scattered Sichuan peppercorns, diced green scallion' },
  { id: 'hong-shao-rou', tpl: 'MAIN', detail: 'Mao-style Red-braised Pork Belly — six glossy mahogany-lacquered cubes of pork belly arranged neatly, alternating layers of fat and meat clearly visible, deep dark caramelised soy glaze pooling, single star anise floating in the sauce', vessel: 'dark-charcoal matte unglazed ceramic' },
  { id: 'yu-xiang-rou-si', tpl: 'MAIN', detail: 'Fish-fragrant Pork Slivers — pork strips with bamboo, wood-ear mushroom and pickled chilli in a glossy reddish-brown sour-sweet-spicy sauce, scallion green tops', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'dong-po-rou', tpl: 'MAIN', detail: 'Dong Po Braised Pork Belly — one large 4cm cube of pork belly tied with a single piece of plain twine, deep mahogany glaze, layers of fat and meat visible, sitting in a small pool of dark soy braising liquid', vessel: 'dark-charcoal matte unglazed ceramic' },
  { id: 'hui-guo-rou', tpl: 'MAIN', detail: 'Twice-cooked Pork — wide thin slices of pork belly with crispy curled edges, stir-fried with leek lengths, fermented broad-bean paste glaze, slight char on the meat' },
  { id: 'shui-zhu-yu', tpl: 'MAIN', detail: 'Boiled Fish in Chilli Oil — white tilapia fillets submerged in a glistening pool of red chilli oil with whole dried red chillies, Sichuan peppercorns and crushed garlic floating on top, bean sprouts visible at the bottom edge', vessel: 'dark-charcoal matte unglazed ceramic deep-walled' },
  { id: 'suan-cai-yu', tpl: 'MAIN', detail: 'Sour Fish & Pickled Greens — basa fish fillets in a pale yellow-green pickled-mustard-green broth, bird-eye chillies and white pepper visible, slivers of pickled cabbage', vessel: 'cream-glaze hand-thrown ceramic deep-walled' },
  { id: 'gan-bian-si-ji-dou', tpl: 'MAIN', detail: 'Dry-fried Green Beans — long beans blistered shrivelled and dark, tossed with browned minced pork, dried shrimp flecks, Sichuan pepper, dark sui mi ya cai pickled greens', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'yu-xiang-qie-zi', tpl: 'MAIN', detail: 'Fish-fragrant Eggplant — Chinese eggplant batons fried until silken and dark purple, glossy in a reddish-brown sour-sweet sauce with pickled chilli flecks, scallion green' },
  { id: 'dan-chao-fan', tpl: 'MAIN', detail: 'Egg Fried Rice — long-grain rice grains glossy and individual, mixed with scrambled egg flakes, fine green scallion rings, light soy color, white pepper dust', vessel: 'sand-colored matte ceramic shallow' },
  { id: 'yang-zhou-chao-fan', tpl: 'MAIN', detail: 'Yangzhou Fried Rice — long-grain rice mixed with diced shrimp, ham cubes, peas, mushroom dice and scrambled egg, individual grains visible, scallion green', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'lu-rou-fan', tpl: 'MAIN', detail: 'Taiwanese Braised Pork Rice — a domed mound of white rice topped with hand-chopped braised pork belly in dark soy and shallot oil sauce, one halved soft-boiled egg, two slices of pickled radish, single sprig of greens', vessel: 'cream-glaze hand-thrown ceramic deep' },
  { id: 'cha-shao-fan', tpl: 'MAIN', detail: 'Char Siu over Rice — slices of mahogany-glazed barbecued pork (char siu) fanned over white rice, blanched gai lan greens beside, drizzle of dark sauce', vessel: 'cream-glaze hand-thrown ceramic deep' },
  { id: 'pi-dan-shou-rou-zhou', tpl: 'SOUP', detail: 'Century Egg & Pork Congee — pale beige glossy rice porridge dotted with grey-green chunks of century egg, shredded salted pork, scallion green, two short pieces of golden fried dough sticks set on top', vessel: 'cream-glaze hand-thrown ceramic deep' },

  // ── 甜品 Sweets · 12 ──
  { id: 'hong-tang-ci-ba', tpl: 'SWEET', detail: 'three pan-seared glutinous rice cakes lined up, golden crispy crust on top, drizzled generously with deep-amber molten brown-sugar syrup pooling at one corner, fine dust of toasted soy bean flour' },
  { id: 'xing-ren-dou-fu', tpl: 'SWEET', detail: 'a chilled square of silken almond tofu in a shallow pool of clear sugar syrup, three goji berries floating, single mint leaf to the side', vessel: 'cream-glaze hand-thrown ceramic shallow' },
  { id: 'gui-ling-gao', tpl: 'SWEET', detail: 'a glossy black tortoise herbal jelly cube in a small bowl, one swirl of golden honey on top, two physalis berries beside the bowl', vessel: 'cream-glaze hand-thrown ceramic' },
  { id: 'shuang-pi-nai', tpl: 'SWEET', detail: 'a small bowl of double-skin milk pudding — pale cream custard with a slightly wrinkled top skin, three red beans on top as garnish', vessel: 'cream-glaze hand-thrown ceramic small bowl' },
  { id: 'mang-guo-bu-ding', tpl: 'SWEET', detail: 'a small bowl of bright orange-yellow set mango pudding, evaporated milk poured over the top forming a pale yellow pool, one small piece of fresh mango on top' },
  { id: 'zhi-ma-tang-yuan', tpl: 'SWEET', detail: 'five glossy white glutinous rice balls (tang yuan) floating in a thin clear ginger broth, one ball broken open showing molten black sesame paste filling oozing out' },
  { id: 'ma-tuan', tpl: 'SWEET', detail: 'four golden deep-fried sesame balls (ma tuan) coated in toasted white sesame seeds, one ball cut in half showing dark red bean paste filling and the puffy hollow interior' },
  { id: 'sa-qi-ma', tpl: 'SWEET', detail: 'three golden Manchurian Sachima cubes — pressed bricks of fried noodle clusters bound with maltose, dotted with raisins and goji berries, one block visible from the side showing fluffy noodle structure' },
  { id: 'gui-hua-gao', tpl: 'SWEET', detail: 'a small pale-yellow square of steamed osmanthus cake, slightly translucent springy texture, scattered tiny dried osmanthus flowers on top' },
  { id: 'lu-dou-bing', tpl: 'SWEET', detail: 'three pressed round mung-bean cakes pale yellow-green, each stamped with a delicate flower pattern on top, slightly chilled with a hint of frost' },
  { id: 'dou-sha-bao', tpl: 'SWEET', detail: 'three white steamed buns arranged in a small bamboo basket, one cut open showing dark red mashed red-bean paste filling and a thin orange peel thread', vessel: 'natural bamboo steamer' },
  { id: 'tang-hu-lu', tpl: 'SWEET', detail: 'one Candied Hawthorn Skewer with six bright red hawthorn berries on a bamboo stick, dipped in a clear hard sugar coating that catches the light, single drop of sugar syrup pooled beside the skewer', vessel: 'kraft brown paper square' },

  // ── 汤品 Soups · 8 ──
  { id: 'gui-hua-jiu-niang', tpl: 'SOUP', detail: 'Osmanthus Rice Ball Soup — small white glutinous rice balls floating in a translucent slightly-cloudy fermented sweet rice broth, dried osmanthus blossoms and fermented rice grains visible, single thread of egg white' },
  { id: 'xi-hu-niu-rou-geng', tpl: 'SOUP', detail: 'West Lake Beef Soup — pale thick clear soup with finely minced beef, swirled egg white threads, soft tofu cubes and tiny finely chopped coriander leaves' },
  { id: 'suan-la-tang', tpl: 'SOUP', detail: 'Sichuan Hot & Sour Soup — dark amber clear soup with shredded mushroom, soft tofu strips, dried lily bud, bamboo strips, swirled egg threads on top, scattered white pepper, drizzle of dark vinegar' },
  { id: 'zi-cai-dan-hua', tpl: 'SOUP', detail: 'Seaweed & Egg Drop Soup — clear pale soup with fluttering dark purple-black laver seaweed, swirled yellow egg threads, fine green scallion rings, single drop of sesame oil' },
  { id: 'lian-zi-bai-he-tang', tpl: 'SOUP', detail: 'Lotus Seed & Lily Bulb soup — clear pale slightly-sweet broth with floating cream-colored white wood-ear fungus pieces, lotus seeds, segmented lily bulb pieces, two goji berries' },
  { id: 'luo-song-tang', tpl: 'SOUP', detail: 'Shanghai Borscht — deep red tomato beef soup with cabbage chunks, potato cubes, carrot dice and a small disk of butter melting on the surface, single piece of bread crouton' },
  { id: 'yu-tou-dou-fu-tang', tpl: 'SOUP', detail: 'Fish Head & Tofu Soup — opaque ivory-white milky-rich broth with a fish head section visible at the surface, silken tofu cubes, ginger threads, scallion green' },
  { id: 'san-xian-tang', tpl: 'SOUP', detail: 'Three-Fresh Seafood Soup — clear chicken broth with whole pink shrimp, scallop slices, squid rings, bamboo shoot pieces and two small sea cucumber pieces' },

  // ── 饮品 Drinks · 8 ──
  { id: 'suan-mei-tang-1l', tpl: 'DRINK', detail: 'deep amber-mahogany Chinese smoked plum drink, one single natural ice cube floating, a thin slice of dried red hawthorn floating beside the ice', glass: 'tall clear straight-sided glass tumbler' },
  { id: 'dou-jiang-1l', tpl: 'DRINK', detail: 'opaque cream-white fresh soy milk filled to about three-quarters of the glass, a thin natural milk skin partly forming on the surface', glass: 'tall clear straight-sided glass tumbler' },
  { id: 'yang-zhi-gan-lu', tpl: 'DRINK', detail: 'pale golden-yellow Hong Kong mango pomelo sago — opaque mango pulp base, fresh pomelo flesh strands floating, translucent sago pearls visible at the bottom, single small piece of fresh mango on top', glass: 'short clear stemless dessert glass cup' },
  { id: 'dong-gua-cha-1l', tpl: 'DRINK', detail: 'pale clear amber-caramel Taiwan winter melon tea, one single natural ice cube floating, completely transparent', glass: 'tall clear straight-sided glass tumbler' },
  { id: 'gui-hua-leng-pao', tpl: 'DRINK', detail: 'pale gold-green osmanthus cold-brew tea, dried tea leaves and tiny dried osmanthus flowers visible suspended in the liquid, one ice cube', glass: 'tall clear straight-sided glass tumbler' },
  { id: 'ning-meng-shui', tpl: 'DRINK', detail: 'pale lemon-yellow pressed lemonade, two thin round lemon slices floating, one ice cube, a fine sea-salt rim on the upper edge of the glass, a wide natural bamboo straw resting against the rim', glass: 'tall clear straight-sided glass tumbler' },
  { id: 'xian-cao-mi-jiang', tpl: 'DRINK', detail: 'Taiwan grass jelly and rice milk drink — black grass jelly cubes settled at the bottom, cream-white rice milk floating layer on top, scattered roasted peanut halves, one small piece of taro on top', glass: 'short clear stemless dessert glass cup' },
  { id: 'mi-feng-you-zi', tpl: 'DRINK', detail: 'pale gold honey-pomelo tea, suspended translucent pomelo peel strands and pomelo flesh visible, slight golden honey settling at the bottom of the glass', glass: 'tall clear straight-sided glass tumbler' },

  // ── 茶 Tea · 6 ──
  { id: 'mo-li-xiang-pian', tpl: 'TEA', detail: 'jasmine green tea — small dark-green tea curls intermixed with tiny white dried jasmine flowers' },
  { id: 'xi-hu-long-jing', tpl: 'TEA', detail: 'Long Jing tea — flat pan-fired pale-jade-green tea leaves, slender and uniform, with a faint silvery down on some leaves' },
  { id: 'tie-guan-yin', tpl: 'TEA', detail: 'Tie Guan Yin oolong — tightly rolled dark-green tea pellets, glossy with medium roast amber tones at the edges' },
  { id: 'pu-er-cha-bing', tpl: 'TEA', detail: 'Yunnan Pu Er — a single round disk-shaped pressed tea cake (small portion broken off, leaves visible), dark brown leaves, with a small chunk broken off showing the cake structure' },
  { id: 'da-hong-pao', tpl: 'TEA', detail: 'Wuyi Da Hong Pao — long twisted dark-charcoal-brown roasted oolong leaves, faintly oily with deep roast' },
  { id: 'feng-huang-dan-cong', tpl: 'TEA', detail: 'Phoenix Dancong oolong — long thin twisted dark-brown leaves with hints of green at the edges' },

  // ── 餐具 Tableware · 8 ──
  { id: 'zhu-kuai-zi', tpl: 'TABLEWARE', detail: 'A single pair of natural raw unlacquered bamboo chopsticks, lying parallel to each other horizontally with a 2cm gap between them, slightly tapered tips pointing right. Light blonde bamboo color with subtle grain texture, no decoration, no print, no lacquer.' },
  { id: 'qing-hua-tang-chi', tpl: 'TABLEWARE', detail: 'One small Chinese porcelain soup spoon, deep oval bowl with a flat short handle, white bone-glaze base with hand-painted cobalt-blue floral brushwork on the inside of the bowl. The spoon is angled diagonally with the bowl pointing toward upper-left, handle resting flat on the linen.' },
  { id: 'kuai-jia', tpl: 'TABLEWARE', detail: 'Two small turned cherry-wood chopstick rests, warm reddish-brown wood with visible end-grain, each rest is a smooth 5cm long elongated arch shape with a shallow groove on top. The two rests sit side by side with about 6cm of linen visible between them. No chopsticks on the rests, the rests are empty.' },
  { id: 'qing-ci-fan-wan', tpl: 'TABLEWARE', detail: 'A single empty hand-thrown rice bowl in pale celadon green-blue glaze, viewed from a slight angle showing both the open top and the curved side. The bowl has a slightly irregular foot ring, fine crackle pattern in the glaze and a subtle thumb-mark on the side. About 11cm diameter. Empty, no food inside.' },
  { id: 'cha-bei-yi-dui', tpl: 'TABLEWARE', detail: 'Two small thin-walled white porcelain tea cups (about 5cm tall, 6cm wide at the rim, no handles), placed side by side with about 4cm of linen between them. Both cups are empty, undecorated, with a smooth bone-white glaze. Slight reflection of the daylight on the rim. No tea, no liquid.' },
  { id: 'gai-wan', tpl: 'TABLEWARE', detail: 'One traditional three-piece Chinese gaiwan tea bowl set in white porcelain, viewed from above and slightly to the front: the saucer (flat round plate, 11cm) on the bottom, the bowl (8cm) sitting centered on the saucer, and the lid placed slightly askew on top of the bowl with the small knob clearly visible. Undecorated white glaze, empty, no tea inside.' },
  { id: 'zhu-zheng-long', tpl: 'TABLEWARE', detail: 'One natural bamboo dim sum steamer (about 18cm diameter), woven flat lattice base, pale blonde bamboo strip rim hand-bound with thin reed cord, the lid sits at a 30 degree angle leaning against the side of the steamer base showing the empty interior of the basket. Empty, no food, no parchment lining inside.' },
  { id: 'zi-sha-cha-hu', tpl: 'TABLEWARE', detail: 'One small unglazed Yixing purple-clay (zisha) teapot, deep purple-brown matte clay color with a slightly textured surface, classic round body about 9cm diameter, short straight spout pointing right, simple rounded handle on the left, small flat lid with a tiny knob. Empty, no tea visible. Slight reflection of soft daylight on the curved body.' },
]

// ─── Sanity check ──────────────────────────────────────────────────────
if (DISHES.length !== 88) {
  console.error(`Expected 88 dish specs, got ${DISHES.length}.`)
  process.exit(2)
}
{
  const seen = new Set()
  for (const d of DISHES) {
    if (seen.has(d.id)) {
      console.error(`Duplicate dish id: ${d.id}`)
      process.exit(2)
    }
    seen.add(d.id)
    if (!TPL[d.tpl]) {
      console.error(`Unknown template "${d.tpl}" for ${d.id}`)
      process.exit(2)
    }
  }
}

// ─── Plan ─────────────────────────────────────────────────────────────
const candidates = ONLY.length
  ? DISHES.filter((d) => ONLY.includes(d.id))
  : DISHES

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function planRun() {
  const todo = []
  const skipped = []
  for (const d of candidates) {
    const out = join(OUT_DIR, `${d.id}.png`)
    if (!FORCE && (await exists(out))) skipped.push(d.id)
    else todo.push(d)
  }
  return { todo, skipped }
}

// ─── OpenRouter call ──────────────────────────────────────────────────
async function callOpenRouter(prompt, signal) {
  const body = {
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    modalities: ['image', 'text'],
    image_config: {
      aspect_ratio: ASPECT_RATIO,
      image_size: IMAGE_SIZE,
    },
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/local-shop/paypal_shop',
      'X-Title': 'Alley Shop · product image batch',
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 240)}`)
  }
  const json = await res.json()
  const message = json?.choices?.[0]?.message
  const dataUrl = message?.images?.[0]?.image_url?.url
  if (!dataUrl) {
    const reason = message?.refusal || message?.content || JSON.stringify(json).slice(0, 240)
    throw new Error(`no image in response — ${reason}`)
  }

  const m = /^data:image\/\w+;base64,(.+)$/s.exec(dataUrl)
  if (!m) throw new Error('image_url not a base64 data URL')
  return Buffer.from(m[1], 'base64')
}

// ─── Worker pool ───────────────────────────────────────────────────────
async function genOne(spec) {
  const out = join(OUT_DIR, `${spec.id}.png`)
  const prompt = TPL[spec.tpl](spec)
  const t0 = Date.now()

  if (DRY) {
    return { id: spec.id, status: 'dry', ms: 0, prompt }
  }

  let lastErr
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const ctrl = new AbortController()
    const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
    try {
      const buf = await callOpenRouter(prompt, ctrl.signal)
      await writeFile(out, buf)
      return { id: spec.id, status: 'generated', ms: Date.now() - t0, attempts: attempt }
    } catch (err) {
      lastErr = err
      if (attempt <= MAX_RETRIES) {
        const backoff = 1500 * attempt
        await new Promise((r) => setTimeout(r, backoff))
      }
    } finally {
      clearTimeout(tid)
    }
  }
  throw lastErr
}

async function runPool(todo) {
  const queue = [...todo]
  const results = []
  let inflight = 0
  let failed = 0

  await new Promise((resolve) => {
    const next = () => {
      while (inflight < CONCURRENCY && queue.length) {
        const spec = queue.shift()
        inflight++
        genOne(spec)
          .then((r) => {
            const sec = (r.ms / 1000).toFixed(1)
            const att = r.attempts && r.attempts > 1 ? `  (retry ×${r.attempts - 1})` : ''
            console.log(`  ✓ ${r.id.padEnd(28)} ${sec.padStart(5)}s${att}`)
            results.push(r)
          })
          .catch((err) => {
            failed++
            console.error(`  ✗ ${spec.id.padEnd(28)} ${err.message}`)
            results.push({ id: spec.id, status: 'error', error: err.message })
          })
          .finally(() => {
            inflight--
            if (queue.length) next()
            else if (inflight === 0) resolve()
          })
      }
    }
    next()
  })

  return { results, failed }
}

// ─── Main ──────────────────────────────────────────────────────────────
;(async () => {
  await mkdir(OUT_DIR, { recursive: true })
  const { todo, skipped } = await planRun()

  console.log('━'.repeat(60))
  console.log(' OpenRouter  ·  model', MODEL)
  console.log(' aspect_ratio :', ASPECT_RATIO, ' image_size :', IMAGE_SIZE)
  console.log(' total dishes :', candidates.length)
  console.log(' skipped (file exists) :', skipped.length)
  console.log(' to generate  :', todo.length)
  console.log(' concurrency  :', CONCURRENCY)
  console.log(' est. cost   ~ $' + (todo.length * 0.005).toFixed(2) +
              '  (Nano Banana 2 ≈ $0.004-0.006 per 1K image)')
  console.log('━'.repeat(60))

  if (DRY) {
    for (const d of todo) {
      const r = await genOne(d)
      console.log(`[dry] ${r.id.padEnd(28)} ${d.tpl.padEnd(7)} ${r.prompt.length} chars`)
    }
    console.log('\n[dry-run] no API calls made.')
    return
  }
  if (!todo.length) {
    console.log('\nNothing to do. Use --force to regenerate.')
    return
  }

  const t0 = Date.now()
  const { results, failed } = await runPool(todo)
  const dt = ((Date.now() - t0) / 1000).toFixed(1)

  const ok = results.filter((r) => r.status === 'generated').length
  console.log('━'.repeat(60))
  console.log(` done in ${dt}s — ${ok} generated, ${failed} failed, ${skipped.length} skipped`)
  if (failed > 0) {
    console.log(' rerun the same command to retry only the failed/missing files.')
    process.exit(1)
  }
})().catch((err) => {
  console.error('fatal:', err)
  process.exit(1)
})
