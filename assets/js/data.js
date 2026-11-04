/* XPPen Christmas 2026 — content & rules data
 * All copy lives here so operations can update text without touching UI code.
 */
(function (global) {
  'use strict';

  var EVENT = {
    year: 2026,
    // All times are fixed to UTC+8 per the event plan (business confirmation pending).
    startISO: '2026-12-03T10:00:00+08:00',
    endISO: '2026-12-31T10:00:00+08:00',
    specialOpenISO: '2026-12-25T00:00:00+08:00',
    specialCloseISO: '2026-12-26T00:00:00+08:00',
    makeupStartISO: '2026-12-18T00:00:00+08:00',
    startLabel: 'Dec 3, 2026 · 10:00',
    endLabel: 'Dec 31, 2026 · 10:00',
    tzLabel: 'UTC+8',
    tagline: 'Create the Magic, Give the Joy.'
  };

  // 28 daily elements. Day 1 opens Dec 3 2026; day N opens on Dec (2 + N).
  // Categories follow the plan: Decor 7 / Characters 6 / Cozy 7 / Town 7 / Sky 1
  var TASKS = [
    { id: 'christmas-tree', day: 1,  name: 'Christmas Tree',     nameZh: '圣诞树',       category: 'Decor',      blurb: 'Evergreen, star-topped, impossibly tall.',        blurbZh: '常青、顶星，高得不可思议。' },
    { id: 'ornament-ball',  day: 2,  name: 'Ornament Ball',      nameZh: '圣诞装饰球',   category: 'Decor',      blurb: 'A shiny bauble for the town tree.',               blurbZh: '给小镇圣诞树挂一颗闪亮的装饰球。' },
    { id: 'wreath',         day: 3,  name: 'Wreath',             nameZh: '圣诞花环',     category: 'Decor',      blurb: 'Holly, berries and a red ribbon.',                blurbZh: '冬青、浆果和一条红丝带。' },
    { id: 'bell',           day: 4,  name: 'Golden Bell',        nameZh: '金色铃铛',     category: 'Decor',      blurb: 'Ring in the season with a golden bell.',          blurbZh: '摇响金色铃铛，迎接圣诞。' },
    { id: 'candy-cane',     day: 5,  name: 'Candy Cane',         nameZh: '拐杖糖',       category: 'Decor',      blurb: 'Stripes, curls and a peppermint twist.',          blurbZh: '条纹、弯钩和薄荷的甜味。' },
    { id: 'snowflake',      day: 6,  name: 'Snowflake',          nameZh: '雪花',         category: 'Decor',      blurb: 'One of a kind — just like your drawing.',         blurbZh: '独一无二——就像你的画。' },
    { id: 'star-topper',    day: 7,  name: 'Star Topper',        nameZh: '树顶星',       category: 'Decor',      blurb: 'The brightest star on the tree.',                 blurbZh: '圣诞树上最亮的那颗星。' },
    { id: 'santa',          day: 8,  name: 'Santa Claus',        nameZh: '圣诞老人',     category: 'Characters', blurb: 'Ho ho ho — beard and all.',                       blurbZh: '胡子飘飘的圣诞老人。' },
    { id: 'reindeer',       day: 9,  name: 'Reindeer',           nameZh: '驯鹿',         category: 'Characters', blurb: 'That nose is definitely glowing.',               blurbZh: '它的鼻子在发光。' },
    { id: 'snowman',        day: 10, name: 'Snowman',            nameZh: '雪人',         category: 'Characters', blurb: 'Three snowballs and a carrot nose.',              blurbZh: '三个雪球和一根胡萝卜鼻子。' },
    { id: 'elf',            day: 11, name: 'Elf',                nameZh: '圣诞精灵',     category: 'Characters', blurb: "Santa's busiest little helper.",                 blurbZh: '圣诞老人最忙的小帮手。' },
    { id: 'penguin',        day: 12, name: 'Penguin',            nameZh: '企鹅',         category: 'Characters', blurb: 'Waddled in from the South Pole.',                blurbZh: '从南极摇摇摆摆地赶来。' },
    { id: 'christmas-bear', day: 13, name: 'Christmas Bear',     nameZh: '圣诞小熊',     category: 'Characters', blurb: 'A cosy bear with a long winter scarf.',           blurbZh: '围着长围巾的暖冬小熊。' },
    { id: 'gift-box',       day: 14, name: 'Gift Box',           nameZh: '礼物盒',       category: 'Cozy',       blurb: "What's inside? Nobody knows.",                   blurbZh: '里面是什么？没人知道。' },
    { id: 'stocking',       day: 15, name: 'Stocking',           nameZh: '圣诞袜',       category: 'Cozy',       blurb: 'Hung by the fire, waiting for gifts.',            blurbZh: '挂在壁炉边，等着礼物。' },
    { id: 'ribbon',         day: 16, name: 'Ribbon',             nameZh: '丝带',         category: 'Cozy',       blurb: 'A perfect bow ties it all together.',            blurbZh: '一个完美的蝴蝶结。' },
    { id: 'greeting-card',  day: 17, name: 'Greeting Card',      nameZh: '贺卡',         category: 'Cozy',       blurb: 'A little paper joy, delivered.',                 blurbZh: '一张写着祝福的小卡片。' },
    { id: 'candle',         day: 18, name: 'Candle',             nameZh: '蜡烛',         category: 'Cozy',       blurb: 'Warm light on a winter night.',                  blurbZh: '冬夜里的一盏暖光。' },
    { id: 'gingerbread',    day: 19, name: 'Gingerbread',        nameZh: '姜饼人',       category: 'Cozy',       blurb: 'Fresh from the oven, extra sprinkles.',          blurbZh: '刚出炉，撒满糖霜。' },
    { id: 'hot-cocoa',      day: 20, name: 'Hot Cocoa',          nameZh: '热可可',       category: 'Cozy',       blurb: 'Marshmallows and a candy cane stir.',            blurbZh: '棉花糖和拐杖糖搅拌的热可可。' },
    { id: 'cabin',          day: 21, name: 'Cabin',              nameZh: '小木屋',       category: 'Town',       blurb: 'A little wooden cabin in the snow.',             blurbZh: '雪地里的一间小木屋。' },
    { id: 'chimney',        day: 22, name: 'Chimney',            nameZh: '烟囱',         category: 'Town',       blurb: 'Smoke curls up into the night.',                 blurbZh: '炊烟袅袅，飘进夜色。' },
    { id: 'street-lamp',    day: 23, name: 'Street Lamp',        nameZh: '街灯',         category: 'Town',       blurb: 'It lights the way home.',                        blurbZh: '照亮回家的路。' },
    { id: 'sleigh',         day: 24, name: 'Sleigh',             nameZh: '雪橇',         category: 'Town',       blurb: 'Loaded with gifts, ready to fly.',               blurbZh: '装满礼物，准备出发。' },
    { id: 'fireplace',      day: 25, name: 'Fireplace',          nameZh: '壁炉',         category: 'Town',       blurb: 'Stockings hung, fire crackling.',                blurbZh: '袜子挂好，炉火正旺。' },
    { id: 'window-decor',   day: 26, name: 'Window Decoration',  nameZh: '窗饰',         category: 'Town',       blurb: 'Candles, wreath and frosty glass.',              blurbZh: '蜡烛、花环和结霜的玻璃。' },
    { id: 'market-stall',   day: 27, name: 'Market Stall',       nameZh: '集市摊位',     category: 'Town',       blurb: 'Mulled cider and holiday treats.',               blurbZh: '热苹果酒和节日小摊。' },
    { id: 'night-sky',      day: 28, name: 'Night Sky',          nameZh: '夜空',         category: 'Sky',        blurb: 'Stars, moon and the whole town below.',           blurbZh: '星星、月亮和脚下的小镇。' }
  ];

  var MILESTONES = [
    { id: 'stage1', at: 6,  index: 1, label: 'Stage One',   labelZh: '第一阶段', piecesLabel: '6 / 28',  short: 'Stage 1' },
    { id: 'stage2', at: 12, index: 2, label: 'Stage Two',   labelZh: '第二阶段', piecesLabel: '12 / 28', short: 'Stage 2' },
    { id: 'stage3', at: 18, index: 3, label: 'Stage Three', labelZh: '第三阶段', piecesLabel: '18 / 28', short: 'Stage 3' }
  ];

  var SPECIAL = {
    id: 'special',
    at: 18,
    bonusAt: 23,
    label: 'Christmas Day Draw',
    labelZh: '圣诞日抽奖',
    windowLabel: 'Dec 25 only',
    openLabel: 'Dec 25 · 00:00',
    closeLabel: 'Dec 25 · 23:59:59'
  };

  // Prototype prize pools. Weights are placeholders for demo purposes only and
  // must be replaced with the operations-approved pool, stock and odds.
  var PRIZE_POOLS = {
    limited: [
      { id: 'coupon3',  name: '3% OFF Coupon',       nameZh: '3% 折扣券',       kind: 'coupon', iconLabel: '3%',  weight: 34, rarity: 'common',
        note: 'Demo record only. In production this coupon is usable on the XPPen official store under its terms.',
        noteZh: '仅演示记录。正式活动中可在 XPPen 官方商城使用，适用范围与有效期以券面说明为准。' },
      { id: 'coupon5',  name: '5% OFF Coupon',       nameZh: '5% 折扣券',       kind: 'coupon', iconLabel: '5%',  weight: 16, rarity: 'common',
        note: 'Demo record only. In production this coupon is usable on the XPPen official store under its terms.',
        noteZh: '仅演示记录。正式活动中可在 XPPen 官方商城使用，适用范围与有效期以券面说明为准。' },
      { id: 'coins50',  name: '50 X-Coins',          nameZh: '50 X-Coins',       kind: 'coins',  iconLabel: '50',  weight: 24, rarity: 'common',
        note: 'Demo record only — no X-Coins are issued.',
        noteZh: '仅演示记录，不会真实发放 X-Coins。' },
      { id: 'giftpack', name: 'Christmas Gift Pack', nameZh: '圣诞礼包',         kind: 'gift',   iconLabel: '',    weight: 14, rarity: 'rare',
        note: 'Demo record only — no gift pack is shipped.',
        noteZh: '仅演示记录，不会真实寄送礼包。' },
      { id: 'deco01',   name: 'Deco 01 V3',          nameZh: 'Deco 01 V3',       kind: 'product', iconLabel: '01', weight: 7, rarity: 'rare',
        note: 'Demo record only — no physical prize is shipped. In production, shipping, taxes and duties follow the official claim terms.',
        noteZh: '仅演示记录，不会真实发货；正式活动中配送范围、运费及关税以领奖说明为准。' },
      { id: 'artist12', name: 'Artist 12 3rd Gen',   nameZh: 'Artist 12 3rd Gen', kind: 'product', iconLabel: '12', weight: 5, rarity: 'epic',
        note: 'Demo record only — no physical prize is shipped. In production, shipping, taxes and duties follow the official claim terms.',
        noteZh: '仅演示记录，不会真实发货；正式活动中配送范围、运费及关税以领奖说明为准。' }
    ],
    special: [
      { id: 'coupon5',   name: '5% OFF Coupon',       nameZh: '5% 折扣券',       kind: 'coupon',  iconLabel: '5%',  weight: 26, rarity: 'common',
        note: 'Demo record only. In production this coupon is usable on the XPPen official store under its terms.',
        noteZh: '仅演示记录。正式活动中可在 XPPen 官方商城使用，适用范围与有效期以券面说明为准。' },
      { id: 'coins100',  name: '100 X-Coins',         nameZh: '100 X-Coins',      kind: 'coins',   iconLabel: '100', weight: 26, rarity: 'common',
        note: 'Demo record only — no X-Coins are issued.',
        noteZh: '仅演示记录，不会真实发放 X-Coins。' },
      { id: 'giftpack',  name: 'Christmas Gift Pack', nameZh: '圣诞礼包',         kind: 'gift',    iconLabel: '',    weight: 22, rarity: 'rare',
        note: 'Demo record only — no gift pack is shipped.',
        noteZh: '仅演示记录，不会真实寄送礼包。' },
      { id: 'artist12',  name: 'Artist 12 3rd Gen',   nameZh: 'Artist 12 3rd Gen', kind: 'product', iconLabel: '12',  weight: 14, rarity: 'rare',
        note: 'Demo record only — no physical prize is shipped. In production, shipping, taxes and duties follow the official claim terms.',
        noteZh: '仅演示记录，不会真实发货；正式活动中配送范围、运费及关税以领奖说明为准。' },
      { id: 'magicpro',  name: 'Magic Pro 13',        nameZh: 'Magic Pro 13',      kind: 'product', iconLabel: '13',  weight: 8, rarity: 'epic',
        note: 'Demo record only — no physical prize is shipped. In production, shipping, taxes and duties follow the official claim terms.',
        noteZh: '仅演示记录，不会真实发货；正式活动中配送范围、运费及关税以领奖说明为准。' },
      { id: 'artistultra', name: 'Artist Ultra 14',   nameZh: 'Artist Ultra 14',   kind: 'product', iconLabel: '14',  weight: 4, rarity: 'legendary',
        note: 'Demo record only — no physical prize is shipped. In production, shipping, taxes and duties follow the official claim terms.',
        noteZh: '仅演示记录，不会真实发货；正式活动中配送范围、运费及关税以领奖说明为准。' }
    ]
  };

  var BLESSINGS = [
    'Merry Christmas & a creative new year!',
    'May your days be merry and bright.',
    'Wishing you a canvas full of joy.'
  ];

  var BLESSINGS_ZH = [
    '圣诞快乐，新年灵感不断！',
    '愿你的每一天都明亮温暖。',
    '愿你的画布永远充满快乐。'
  ];

  var RULES = [
    {
      title: 'Event period',
      titleZh: '活动时间',
      body: '<p>The event runs from <strong>December 3, 2026, 10:00</strong> to <strong>December 31, 2026, 10:00 (UTC+8)</strong>. Drawings and make-up drawings cannot be submitted after the closing time. One new Christmas element opens each day from December 3 to December 30 — 28 elements in total.</p>',
      bodyZh: '<p>活动时间为 <strong>2026 年 12 月 3 日 10:00</strong> 至 <strong>12 月 31 日 10:00（UTC+8）</strong>。活动结束后无法继续提交创作或补画。12 月 3 日至 12 月 30 日每天开放 1 个圣诞元素，共 28 个。</p>'
    },
    {
      title: 'Who can join',
      titleZh: '参与资格',
      body: '<p>You can browse the event as a guest. Drawing, saving a free work, opening a draw and viewing the keepsake require a demo sign-in. This prototype stores your progress and prize records in this browser only — it is not synced with an XPPen account.</p>',
      bodyZh: '<p>访客可浏览活动内容；绘画、保存自由创作、抽奖和查看纪念图需要先完成演示登录。本原型的进度与奖品记录仅保存在当前浏览器，暂不与 XPPen 账号同步。</p>'
    },
    {
      title: 'Daily drawing',
      titleZh: '每日创作',
      body: '<p>Each day from December 3 to December 30 a new Christmas element opens in the studio. Submit at most one daily task per day. Each task can be rewarded only once — resubmitting the same task does not add energy or pieces. From December 26 you can also make up missed tasks.</p>',
      bodyZh: '<p>12 月 3 日至 12 月 30 日每天在画室开放 1 个圣诞元素，每位用户每天最多完成 1 个当日任务。每个任务仅可获得一次奖励，重复提交不再增加能量或碎片。12 月 26 日起还可补画错过的任务。</p>'
    },
    {
      title: 'Energy & town pieces',
      titleZh: '能量与小镇',
      body: '<p>Every <strong>daily</strong> drawing gives <strong>1 regular energy</strong> and lights <strong>1 piece</strong> of the town. Make-up drawings light a piece but add no energy. There are 28 pieces; this browser keeps your demo energy and pieces.</p>',
      bodyZh: '<p>每完成一个<strong>每日</strong>任务，获得 <strong>1 点能量</strong>并点亮 <strong>1 块</strong>小镇碎片；补画点亮碎片但不增加能量。共 28 块；演示能量与碎片保存在当前浏览器。</p>'
    },
    {
      title: 'Energy & limited draws',
      titleZh: '能量与限时抽奖',
      body: '<p><strong>1 regular energy = 1 limited draw.</strong> Each daily drawing adds 1 energy while the town has 18 or fewer lit pieces; from the 19th piece no more regular energy is added. Sharing once a day adds 1 energy before 18 pieces. Lighting <strong>6, 12 and 18</strong> pieces opens the limited draw <strong>once per threshold</strong>. Each opening lasts up to <strong>24 hours</strong> and ends no later than <strong>December 31, 10:00 (UTC+8)</strong>. If windows overlap, the later end time applies. There is one limited prize pool; no stage selection. Unused energy stays in your balance for a later window.</p><p>The complete town can only be shared once all <strong>28 pieces</strong> are lit.</p>',
      bodyZh: '<p><strong>1 点能量 = 抽 1 次限时抽奖。</strong>小镇点亮 18 块及以前，每完成一个每日任务 +1 点能量；第 19 块起不再增加。18 块前每天首次分享 +1 点。点亮 <strong>6、12、18 块</strong>时，每个门槛各开启<strong>一次</strong>限时抽奖，每次最多开放 <strong>24 小时</strong>，最晚不超过 <strong>2026 年 12 月 31 日 10:00（UTC+8）</strong>。若窗口重叠，以较晚的结束时间为准。限时奖池只有一套，不再分阶段选择；未用完的能量保留到后续窗口。</p><p>完整小镇需点亮全部 <strong>28 块</strong>后才能分享。</p>'
    },
    {
      title: 'Christmas Day draw',
      titleZh: '圣诞日抽奖',
      body: '<p>The Christmas Day draw opens from <strong>December 25, 2026, 00:00 (inclusive)</strong> to <strong>December 26, 2026, 00:00 (exclusive), UTC+8</strong>. Lighting <strong>18 pieces</strong> gives <strong>1 special energy</strong>; <strong>23 pieces</strong> gives <strong>2 special energy</strong> in total. Each Christmas draw uses <strong>1 special energy</strong> and never deducts regular energy. The draw can be closed; unused special energy expires when the window closes. Make-up drawings start December 26 and cannot add special energy before this window closes.</p>',
      bodyZh: '<p>圣诞日抽奖开放时间为 <strong>2026 年 12 月 25 日 00:00（含）至 12 月 26 日 00:00（不含，UTC+8）</strong>。点亮 <strong>18 块</strong>获得 <strong>1 点特殊能量</strong>；<strong>23 块</strong>累计获得 <strong>2 点特殊能量</strong>。每次圣诞日抽奖消耗 <strong>1 点特殊能量</strong>，不扣普通能量。抽奖可随时关闭；未使用的特殊能量在窗口结束时失效。补画从 12 月 26 日开始，无法在本窗口关闭前增加特殊能量。</p>'
    },
    {
      title: 'Make-up drawings',
      titleZh: '补画',
      body: '<p>From <strong>December 26</strong> until the event closes, you can make up any previously opened task you have not completed, with no daily limit. Make-up drawings light town pieces and can complete a <strong>6/12/18 threshold</strong>, but they add no energy. If a threshold opens a limited window, it still ends at the event close. A new daily task still opens December 26–30 and gives energy as usual.</p>',
      bodyZh: '<p>12 月 26 日至活动结束，可补画此前已开放但未完成的任务，不限每日数量。补画会点亮碎片、可完成 <strong>6/12/18 门槛</strong>，但不增加能量；若因此开启限时窗口，窗口仍最晚在活动结束时关闭。12 月 26 日至 30 日仍有每日新任务，正常获得能量。</p>'
    },
    {
      title: 'Free creation',
      titleZh: '自由创作',
      body: '<p>After submitting a daily or make-up work, you can open a blank canvas from “Continue drawing” and save an independent free work. Free works do not light town pieces, add energy, open windows or affect thresholds. They appear in My Works and can be downloaded; there is no edit entry for a saved work.</p>',
      bodyZh: '<p>提交每日或补画作品后，可通过“继续画画”打开空白画布，保存一幅独立的自由创作。自由创作不会点亮小镇碎片、增加能量、开启抽奖窗口或影响门槛。作品会出现在“我的作品”中并可下载；已保存作品不提供编辑入口。</p>'
    },
    {
      title: 'Prizes & fulfilment',
      titleZh: '奖品与领取',
      body: '<p>Prizes include XPPen products, Christmas gift packs, store coupons and X-Coins. Coupon scope, validity and conditions follow the coupon itself. Physical winners will be contacted by <strong>official@xp-pen.com</strong> to confirm delivery; shipping coverage, fees and duties follow the official claim notice. Prize stock and odds are published on the event page.</p>',
      bodyZh: '<p>奖品包括 XPPen 实物产品、圣诞礼包、商城优惠券和 X-Coins，具体以活动页面公布为准。优惠券适用范围、有效期与条件以券面说明为准。实物中奖者将由 <strong>official@xp-pen.com</strong> 通过注册邮箱联系确认收货信息；配送范围、运费与关税以正式领奖说明为准。奖品库存与概率以活动页面公布为准。</p>'
    },
    {
      title: 'Fair play & contact',
      titleZh: '公平参与与联系方式',
      body: '<p>Multiple accounts, automated submissions or any attempt to farm energy are not allowed. XPPen may adjust or cancel rewards obtained through abuse. We only contact winners from <strong>official@xp-pen.com</strong> — please watch out for impersonation. Questions? Write to official@xp-pen.com.</p><p class="rules-fine">The personalised town keepsake is a digital commemorative reward. It has no cash value and cannot be exchanged for physical goods.</p>',
      bodyZh: '<p>每位用户仅可使用一个账号，禁止多账号、恶意刷取或自动化提交。对于违规获得奖励，XPPen 有权调整或取消。我们仅通过 <strong>official@xp-pen.com</strong> 联系中奖用户，请注意甄别冒充邮件。如有疑问，请发送邮件至 official@xp-pen.com。</p><p class="rules-fine">个性化小镇纪念图为数字纪念奖励，不具备现金价值，不可兑换实物。</p>'
    }
  ];

  // Revised rules supplied by the business on November 3.
  RULES.forEach(function (rule) {
    var revised = {
      'Daily drawing': ['One new task opens each day. Each task can award one piece and one regular draw chance.', '每天开放一个新任务；每个任务首次完成获得对应碎片及 1 次普通抽奖机会。'],
      'Energy & town pieces': ['Each completed daily or make-up task lights one piece and earns one regular draw chance.', '每日任务和补画首次完成时，各点亮对应碎片并获得 1 次普通抽奖机会。'],
      'Energy & limited draws': ['Each chance is valid only on the day it is earned (UTC+8). The first successful drawing share each day adds one chance; make-up and subscription rewards are additional.', '普通抽奖机会仅在获得当天有效（UTC+8），每日首次成功分享画作额外获得 1 次；补画和订阅奖励另计。'],
      'Christmas Day draw': ['On December 25 (UTC+8), reaching 18 pieces awards one chance and reaching 23 awards another, including pieces earned by make-up. Unused chances expire when the draw closes.', '12 月 25 日（UTC+8）达到 18 块获得 1 次，达到 23 块再获得 1 次；补画碎片计入。未使用的机会在大奖日结束后失效。'],
      'Make-up drawings': ['December 18–25: up to 3 missed tasks per day. From December 26 until the activity ends: no daily limit. Each task earns a piece and one regular draw chance.', '12 月 18—25 日每天最多补画 3 个；12 月 26 日至活动结束不限每日数量。每个补画任务获得对应碎片和 1 次普通抽奖机会。']
    }[rule.title];
    if (revised) { rule.body = '<p>' + revised[0] + '</p>'; rule.bodyZh = '<p>' + revised[1] + '</p>'; }
    if (rule.title === 'Energy & limited draws') { rule.title = 'Regular draw'; rule.titleZh = '抽奖'; }
  });

  var CATEGORY_ORDER = ['Decor', 'Characters', 'Cozy', 'Town', 'Sky'];

  // Where the prize actions send people. Swap these when the event goes live.
  var LINKS = {
    store: 'https://www.xp-pen.com/store/',
    coins: 'https://xfanstest.xp-pen.com/user/xcoins'
  };

  global.XMASData = {
    EVENT: EVENT,
    TASKS: TASKS,
    TASK_BY_ID: TASKS.reduce(function (map, t) { map[t.id] = t; return map; }, {}),
    MILESTONES: MILESTONES,
    SPECIAL: SPECIAL,
    PRIZE_POOLS: PRIZE_POOLS,
    BLESSINGS: BLESSINGS,
    BLESSINGS_ZH: BLESSINGS_ZH,
    RULES: RULES,
    CATEGORY_ORDER: CATEGORY_ORDER,
    LINKS: LINKS
  };
})(window);
