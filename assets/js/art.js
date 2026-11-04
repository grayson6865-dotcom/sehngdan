/* XPPen Christmas 2026 — illustration layer
 * All artwork is generated as inline SVG: no external image assets, crisp on
 * every screen size and easy to re-rasterise for the share / keepsake cards.
 */
(function (global) {
  'use strict';

  var P = {
    ice: '#EAF3FF',
    ice2: '#BFE3FF',
    gold: '#F7C869',
    gold2: '#E8A94B',
    gold3: '#FFE7B0',
    red: '#E4574C',
    red2: '#B93A33',
    pine: '#2F7A5A',
    pine2: '#3F9169',
    pine3: '#1F6B4F',
    brown: '#8B5A3C',
    skin: '#F3C9A8',
    ink: '#1B2130',
    violet: '#8B7BF7',
    teal: '#57D2C8'
  };

  /* ---------------------------------------------------------------- icons */

  var ICONS = {
    'christmas-tree':
      '<path d="M60 14 43 40h34z" fill="' + P.pine2 + '"/>' +
      '<path d="M60 32 36 66h48z" fill="' + P.pine + '"/>' +
      '<path d="M60 54 28 94h64z" fill="' + P.pine2 + '"/>' +
      '<rect x="52" y="92" width="16" height="16" rx="4" fill="' + P.brown + '"/>' +
      '<circle cx="50" cy="62" r="3.5" fill="' + P.gold + '"/><circle cx="70" cy="72" r="3.5" fill="' + P.red + '"/>' +
      '<circle cx="56" cy="82" r="3.5" fill="' + P.ice2 + '"/><circle cx="64" cy="44" r="3" fill="' + P.red + '"/>' +
      '<path d="M60 4l3.4 7 7.7 1.1-5.6 5.4 1.4 7.6L60 21.6l-6.9 3.5 1.4-7.6-5.6-5.4 7.7-1.1z" fill="' + P.gold + '"/>',

    'ornament-ball':
      '<path d="M60 10v8" stroke="' + P.ice + '" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="51" y="14" width="18" height="12" rx="4" fill="' + P.gold2 + '"/>' +
      '<circle cx="60" cy="12" r="4.5" fill="none" stroke="' + P.gold + '" stroke-width="3"/>' +
      '<circle cx="60" cy="72" r="36" fill="' + P.red + '"/>' +
      '<path d="M27 60c10-6 16 8 26 4s14-12 22-8 10 10 18 6" fill="none" stroke="' + P.gold + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M28 84c12 6 22-4 32 0s14 8 24 4" fill="none" stroke="' + P.ice + '" stroke-width="4" stroke-linecap="round" opacity=".65"/>' +
      '<ellipse cx="46" cy="56" rx="9" ry="14" fill="#fff" opacity=".22" transform="rotate(-28 46 56)"/>' +
      '<circle cx="60" cy="72" r="36" fill="none" stroke="' + P.red2 + '" stroke-width="2" opacity=".4"/>',

    wreath:
      '<circle cx="60" cy="64" r="34" fill="none" stroke="' + P.pine + '" stroke-width="18"/>' +
      '<circle cx="60" cy="64" r="34" fill="none" stroke="' + P.pine2 + '" stroke-width="8" stroke-dasharray="14 10"/>' +
      '<circle cx="42" cy="44" r="5" fill="' + P.red + '"/><circle cx="50" cy="38" r="4" fill="' + P.red + '"/>' +
      '<circle cx="80" cy="46" r="5" fill="' + P.red + '"/><circle cx="88" cy="58" r="4" fill="' + P.red + '"/>' +
      '<circle cx="34" cy="76" r="4" fill="' + P.gold + '"/>' +
      '<path d="M60 98l-12 15 12-4 12 4z" fill="' + P.red + '"/>',

    bell:
      '<path d="M60 24c-15 0-24 13-24 30v16l-9 12h66l-9-12V54c0-17-9-30-24-30z" fill="' + P.gold + '"/>' +
      '<path d="M60 24c-15 0-24 13-24 30v16l-9 12h20z" fill="' + P.gold2 + '" opacity=".45"/>' +
      '<rect x="26" y="82" width="68" height="9" rx="4.5" fill="' + P.gold2 + '"/>' +
      '<circle cx="60" cy="96" r="9" fill="' + P.gold2 + '"/>' +
      '<path d="M60 18v6" stroke="' + P.red + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M44 64c0-12 5-22 14-26" stroke="#fff" stroke-width="5" opacity=".35" fill="none" stroke-linecap="round"/>',

    'candy-cane':
      '<path d="M78 24c-21 0-29 16-29 34v44" fill="none" stroke="' + P.red + '" stroke-width="18" stroke-linecap="round"/>' +
      '<path d="M78 24c-21 0-29 16-29 34v44" fill="none" stroke="#FFF6EC" stroke-width="18" stroke-dasharray="9 15"/>' +
      '<path d="M78 24c-21 0-29 16-29 34v44" fill="none" stroke="' + P.red2 + '" stroke-width="1.5" opacity=".35"/>' +
      '<path d="M50 98h20" stroke="' + P.brown + '" stroke-width="4" stroke-linecap="round"/>',

    snowflake:
      '<g stroke="#CFEBFF" stroke-width="7" stroke-linecap="round">' +
      '<path d="M60 18v84"/><path d="M24 39l72 42"/><path d="M96 39L24 81"/></g>' +
      '<g stroke="#8FD0FF" stroke-width="5" stroke-linecap="round">' +
      '<path d="M60 30l-13-13M60 30l13-13M60 90l-13 13M60 90l13 13"/>' +
      '<path d="M34 40l-2-17M86 40l2-17M34 80l-2 17M86 80l2 17"/></g>' +
      '<circle cx="60" cy="60" r="7" fill="#EAF3FF"/>',

    'star-topper':
      '<path d="M60 6l16 32 35 4-25 24 6 35-32-17-32 17 6-35L9 42l35-4z" fill="' + P.gold + '"/>' +
      '<path d="M60 30l9 18 20 2-14 14 3 20-18-10-18 10 3-20-14-14 20-2z" fill="' + P.gold3 + '" opacity=".75"/>' +
      '<circle cx="60" cy="60" r="5" fill="#fff" opacity=".8"/>',

    santa:
      '<ellipse cx="60" cy="60" rx="31" ry="29" fill="' + P.skin + '"/>' +
      '<path d="M36 70c0 18 10 30 24 30s24-12 24-30c-6 6-14 8-24 8s-18-2-24-8z" fill="#FFF6EC"/>' +
      '<path d="M34 46c0-22 12-34 26-34s26 12 26 34z" fill="' + P.red + '"/>' +
      '<rect x="27" y="44" width="66" height="12" rx="6" fill="#FFF6EC"/>' +
      '<circle cx="60" cy="10" r="8" fill="#FFF6EC"/>' +
      '<circle cx="49" cy="62" r="3.4" fill="' + P.ink + '"/><circle cx="71" cy="62" r="3.4" fill="' + P.ink + '"/>' +
      '<circle cx="60" cy="68" r="6" fill="#E8A48E"/>' +
      '<path d="M53 78c4 4 10 4 14 0" stroke="' + P.red2 + '" stroke-width="3" fill="none" stroke-linecap="round"/>',

    reindeer:
      '<path d="M40 42c-9-12-11-22-7-31M80 42c9-12 11-22 7-31M50 34c-5-14-3-23 1-30M70 34c5-14 3-23-1-30" stroke="#8B5A3C" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M34 52c-9-5-16-1-16 7 7 3 13 2 18-2zM86 52c9-5 16-1 16 7-7 3-13 2-18-2z" fill="#A9714B"/>' +
      '<ellipse cx="60" cy="66" rx="26" ry="30" fill="#A9714B"/>' +
      '<ellipse cx="60" cy="82" rx="17" ry="14" fill="#C98A5E"/>' +
      '<circle cx="60" cy="88" r="7.5" fill="#E4574C"/>' +
      '<circle cx="60" cy="88" r="14" fill="#E4574C" opacity=".22"/>' +
      '<circle cx="50" cy="62" r="3.4" fill="#1B2130"/><circle cx="70" cy="62" r="3.4" fill="#1B2130"/>' +
      '<path d="M54 74c4 3 8 3 12 0" stroke="#7A4A33" stroke-width="2.4" fill="none" stroke-linecap="round"/>',

    snowman:
      '<circle cx="60" cy="84" r="26" fill="#DCE9FF"/>' +
      '<circle cx="60" cy="54" r="20" fill="#F4F9FF"/>' +
      '<circle cx="60" cy="29" r="14" fill="#FFFFFF"/>' +
      '<path d="M44 20h32v7H44z" fill="' + P.ink + '"/>' +
      '<rect x="52" y="5" width="16" height="17" rx="3" fill="' + P.ink + '"/>' +
      '<circle cx="55" cy="28" r="2.2" fill="' + P.ink + '"/><circle cx="65" cy="28" r="2.2" fill="' + P.ink + '"/>' +
      '<path d="M60 31l14 5-14 4z" fill="' + P.gold2 + '"/>' +
      '<path d="M41 64c12 7 26 7 38 0" stroke="' + P.red + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<circle cx="60" cy="76" r="3" fill="' + P.ink + '"/><circle cx="60" cy="90" r="3" fill="' + P.ink + '"/>' +
      '<path d="M36 80l-16 6M84 80l16 6" stroke="' + P.brown + '" stroke-width="4" stroke-linecap="round"/>',

    elf:
      '<path d="M60 28c16 0 28 13 28 30S76 90 60 90 32 75 32 58s12-30 28-30z" fill="' + P.skin + '"/>' +
      '<path d="M29 44c0-17 14-29 31-29s31 12 31 29c-9-4-19-2-25 4-6-8-14-10-22-8-8 2-13 6-15 4z" fill="' + P.pine + '"/>' +
      '<path d="M90 26c8-5 15 1 13 10" stroke="' + P.pine2 + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<circle cx="105" cy="38" r="5" fill="' + P.gold + '"/>' +
      '<path d="M30 60l-11-7 7 13zM90 60l11-7-7 13z" fill="' + P.skin + '"/>' +
      '<circle cx="50" cy="62" r="3.4" fill="' + P.ink + '"/><circle cx="70" cy="62" r="3.4" fill="' + P.ink + '"/>' +
      '<path d="M54 74c4 4 8 4 12 0" stroke="' + P.red2 + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M40 88c10 8 30 8 40 0l7 12H33z" fill="' + P.pine2 + '"/>',

    penguin:
      '<ellipse cx="60" cy="66" rx="34" ry="38" fill="' + P.ink + '"/>' +
      '<ellipse cx="60" cy="72" rx="22" ry="28" fill="#F4F9FF"/>' +
      '<ellipse cx="46" cy="54" rx="6" ry="8" fill="#fff"/><ellipse cx="74" cy="54" rx="6" ry="8" fill="#fff"/>' +
      '<circle cx="47" cy="55" r="3" fill="' + P.ink + '"/><circle cx="73" cy="55" r="3" fill="' + P.ink + '"/>' +
      '<path d="M60 62l10 6-10 6-10-6z" fill="' + P.gold2 + '"/>' +
      '<path d="M40 84c8 5 32 5 40 0" stroke="' + P.red + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<path d="M46 96c0 8-4 12-10 12s-8-6-8-12zM74 96c0 8 4 12 10 12s8-6 8-12z" fill="' + P.gold2 + '"/>' +
      '<path d="M26 64c-8 6-8 16 0 22M94 64c8 6 8 16 0 22" stroke="' + P.ink + '" stroke-width="7" fill="none" stroke-linecap="round"/>',

    'christmas-bear':
      '<circle cx="33" cy="36" r="13" fill="#A9714B"/><circle cx="87" cy="36" r="13" fill="#A9714B"/>' +
      '<circle cx="33" cy="36" r="6" fill="#E0AE87"/><circle cx="87" cy="36" r="6" fill="#E0AE87"/>' +
      '<circle cx="60" cy="62" r="34" fill="#C98A5E"/>' +
      '<ellipse cx="60" cy="76" rx="18" ry="14" fill="#F0D3B8"/>' +
      '<ellipse cx="60" cy="69" rx="6" ry="4.5" fill="#5B3B2A"/>' +
      '<path d="M60 74v7M60 81c-3 3-7 2-8-1M60 81c3 3 7 2 8-1" stroke="#5B3B2A" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="48" cy="55" r="3.4" fill="' + P.ink + '"/><circle cx="72" cy="55" r="3.4" fill="' + P.ink + '"/>' +
      '<path d="M32 94c16 10 40 10 56 0" stroke="' + P.pine + '" stroke-width="10" fill="none" stroke-linecap="round"/>',

    'gift-box':
      '<rect x="26" y="46" width="68" height="54" rx="6" fill="' + P.red + '"/>' +
      '<rect x="20" y="34" width="80" height="18" rx="6" fill="' + P.red2 + '"/>' +
      '<rect x="54" y="34" width="12" height="66" fill="' + P.gold + '"/>' +
      '<path d="M60 34c-14 0-22-6-22-14 0-6 6-10 12-8 8 3 10 12 10 22zM60 34c14 0 22-6 22-14 0-6-6-10-12-8-8 3-10 12-10 22z" fill="' + P.gold + '"/>' +
      '<rect x="26" y="46" width="68" height="8" fill="#000" opacity=".08"/>',

    stocking:
      '<path d="M38 20h40v44c0 14 12 18 22 22 13 5 10 26-4 27-27 3-58 1-58-19z" fill="' + P.red + '"/>' +
      '<path d="M88 84c18 6 14 27-2 27-11 0-17-6-19-14" fill="' + P.red + '"/>' +
      '<rect x="30" y="14" width="56" height="16" rx="5" fill="#FFF6EC"/>' +
      '<path d="M52 46c0 12 6 20 16 24" stroke="#FFF6EC" stroke-width="4" opacity=".45" fill="none"/>' +
      '<path d="M58 8c-6 0-10 4-10 10" stroke="' + P.brown + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M42 62l7 7M66 78l7 7" stroke="' + P.gold + '" stroke-width="4" stroke-linecap="round"/>',

    ribbon:
      '<path d="M60 58c-6-18-18-28-30-24-12 4-12 20 0 24 10 3 22-1 30 0z" fill="' + P.red + '"/>' +
      '<path d="M60 58c6-18 18-28 30-24 12 4 12 20 0 24-10 3-22-1-30 0z" fill="' + P.red + '"/>' +
      '<path d="M56 58c-14 12-20 28-14 36 6 8 18 2 18-12z" fill="' + P.red2 + '"/>' +
      '<path d="M64 58c14 12 20 28 14 36-6 8-18 2-18-12z" fill="' + P.red2 + '"/>' +
      '<circle cx="60" cy="58" r="9" fill="' + P.gold + '"/>' +
      '<path d="M56 58c-8-10-16-16-22-14" stroke="#FFD9B0" stroke-width="3" opacity=".5" fill="none"/>',

    'greeting-card':
      '<rect x="20" y="24" width="80" height="74" rx="6" fill="#FFF6EC"/>' +
      '<rect x="20" y="24" width="80" height="74" rx="6" fill="none" stroke="' + P.gold2 + '" stroke-width="3"/>' +
      '<path d="M60 38l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="' + P.pine + '"/>' +
      '<path d="M28 90c10-12 30-12 40 0" fill="none" stroke="' + P.ice2 + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M38 86c0-8 4-14 10-18M82 80c-6 0-10 4-12 10" stroke="' + P.red + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="34" cy="36" r="4" fill="' + P.gold + '"/>',

    candle:
      '<rect x="46" y="42" width="28" height="54" rx="6" fill="#FFF6EC"/>' +
      '<path d="M46 56h28" stroke="' + P.gold + '" stroke-width="4" opacity=".5"/>' +
      '<path d="M46 56c6 0 8 4 8 8s-4 6-8 6M74 56c-6 0-8 4-8 8s4 6 8 6" fill="' + P.red + '"/>' +
      '<ellipse cx="60" cy="98" rx="22" ry="8" fill="' + P.gold2 + '"/>' +
      '<rect x="54" y="92" width="12" height="8" fill="#C9A227"/>' +
      '<path d="M60 42c-9-9-7-19 0-28 7 9 9 19 0 28z" fill="' + P.gold + '"/>' +
      '<path d="M60 38c-4-5-3-10 0-15 3 5 4 10 0 15z" fill="#FFF6EC"/>' +
      '<path d="M36 102c6-6 11-8 17-8M84 102c-6-6-11-8-17-8" stroke="' + P.pine + '" stroke-width="4" fill="none" stroke-linecap="round"/>',

    gingerbread:
      '<circle cx="60" cy="32" r="16" fill="#B9762F"/>' +
      '<rect x="46" y="50" width="28" height="32" rx="10" fill="#B9762F"/>' +
      '<path d="M46 56L26 70M74 56l20 14M48 82l-6 22M72 82l6 22" stroke="#B9762F" stroke-width="12" stroke-linecap="round"/>' +
      '<circle cx="54" cy="29" r="2.6" fill="#3A2416"/><circle cx="66" cy="29" r="2.6" fill="#3A2416"/>' +
      '<path d="M54 38c4 4 8 4 12 0" stroke="#3A2416" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M42 46c5 8 6 14 4 18M78 46c-5 8-6 14-4 18" stroke="#FFF6EC" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="60" cy="66" r="3.4" fill="' + P.red + '"/><circle cx="56" cy="58" r="2.4" fill="' + P.pine2 + '"/><circle cx="65" cy="76" r="2.4" fill="' + P.pine2 + '"/>',

    'hot-cocoa':
      '<path d="M30 44h54v34c0 16-12 26-27 26S30 94 30 78z" fill="' + P.red + '"/>' +
      '<path d="M84 54h10c11 0 11 18 0 18h-10" fill="none" stroke="' + P.red + '" stroke-width="8"/>' +
      '<ellipse cx="57" cy="45" rx="29" ry="9" fill="#8B5A3C"/>' +
      '<ellipse cx="57" cy="43" rx="25" ry="7" fill="#5B3B2A"/>' +
      '<circle cx="48" cy="42" r="5" fill="#FFF6EC"/><circle cx="62" cy="40" r="4" fill="#FFF6EC"/>' +
      '<path d="M42 26c4-6 0-10 4-16M60 24c4-6 0-10 4-16" stroke="' + P.ice + '" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M76 22l9 30" stroke="' + P.red + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M76 22l9 30" stroke="#FFF6EC" stroke-width="7" stroke-dasharray="4 7"/>' +
      '<path d="M38 56c14 6 30 6 42 0" stroke="#FFF6EC" stroke-width="3" opacity=".35" fill="none"/>',

    cabin:
      '<rect x="34" y="58" width="52" height="42" fill="' + P.brown + '"/>' +
      '<path d="M26 58L60 28l34 30z" fill="' + P.pine + '"/>' +
      '<path d="M22 58l38-34 38 34-6 5-32-28-32 28z" fill="#FFF6EC"/>' +
      '<path d="M34 58h52M34 74h52" stroke="#7A4A33" stroke-width="2" opacity=".45"/>' +
      '<rect x="44" y="68" width="14" height="14" rx="2" fill="' + P.gold + '"/>' +
      '<rect x="66" y="70" width="14" height="30" rx="2" fill="#5B3B2A"/>' +
      '<circle cx="77" cy="86" r="1.6" fill="' + P.gold + '"/>' +
      '<rect x="70" y="30" width="8" height="18" fill="' + P.brown + '"/>' +
      '<circle cx="76" cy="24" r="4" fill="#DCE9FF" opacity=".35"/><circle cx="84" cy="16" r="5" fill="#DCE9FF" opacity=".22"/>' +
      '<path d="M26 100h68" stroke="#EAF3FF" stroke-width="5" stroke-linecap="round"/>',

    chimney:
      '<rect x="34" y="34" width="52" height="64" rx="4" fill="#A85C46"/>' +
      '<path d="M34 46h52M34 62h52M34 78h52" stroke="#8B4632" stroke-width="2.5"/>' +
      '<path d="M48 34v12M70 34v12M40 46v16M60 46v16M80 46v16M48 62v16M70 62v16M40 78v20M60 78v20M80 78v20" stroke="#8B4632" stroke-width="2.5"/>' +
      '<rect x="28" y="24" width="64" height="12" rx="4" fill="#DCE9FF"/>' +
      '<rect x="40" y="20" width="40" height="6" rx="3" fill="#F4F9FF"/>' +
      '<path d="M68 20c-7-9-2-15 4-22 2 9 7 13 5 22" fill="#DCE9FF" opacity=".45"/>' +
      '<path d="M58 8c-4-6 0-10 5-14" stroke="#DCE9FF" stroke-width="4" opacity=".3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="40" cy="54" r="4" fill="' + P.red + '"/>',

    'street-lamp':
      '<circle cx="60" cy="58" r="30" fill="' + P.gold + '" opacity=".13"/>' +
      '<rect x="56" y="62" width="8" height="42" fill="#3B4A66"/>' +
      '<rect x="44" y="96" width="32" height="8" rx="4" fill="#3B4A66"/>' +
      '<path d="M60 20l18 10v18c0 8-8 14-18 14s-18-6-18-14V30z" fill="' + P.gold + '"/>' +
      '<path d="M60 20l18 10v18c0 8-8 14-18 14s-18-6-18-14V30z" fill="none" stroke="' + P.gold2 + '" stroke-width="4"/>' +
      '<path d="M52 30l16 8v16" stroke="#FFF6EC" stroke-width="3" opacity=".5" fill="none"/>' +
      '<circle cx="60" cy="18" r="4" fill="#3B4A66"/>' +
      '<path d="M42 34l-8-4M78 34l8-4" stroke="#3B4A66" stroke-width="3" stroke-linecap="round"/>',

    sleigh:
      '<path d="M24 78h58c9 0 14-6 14-15v-5h8" fill="none" stroke="' + P.red + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M32 56h46v22H32z" fill="' + P.red + '"/>' +
      '<rect x="36" y="42" width="18" height="14" rx="2" fill="' + P.gold + '"/>' +
      '<rect x="58" y="46" width="16" height="10" rx="2" fill="' + P.pine2 + '"/>' +
      '<path d="M20 90c0 7 7 11 15 11h48" fill="none" stroke="' + P.brown + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M30 68h48" stroke="#FFF6EC" stroke-width="3" opacity=".55"/>' +
      '<path d="M84 50l14-9" stroke="' + P.gold2 + '" stroke-width="4" stroke-linecap="round"/>',

    fireplace:
      '<rect x="22" y="26" width="76" height="13" rx="4" fill="' + P.brown + '"/>' +
      '<rect x="30" y="39" width="60" height="58" fill="#7A4A33"/>' +
      '<rect x="40" y="54" width="40" height="43" rx="4" fill="#3A2416"/>' +
      '<path d="M60 92c-10 0-17-8-15-17 2-6 8-9 8-16 6 4 8 10 8 14 4-2 6-6 6-9 4 6 6 12 6 18 0 6-5 10-13 10z" fill="' + P.gold + '"/>' +
      '<path d="M60 88c-5 0-9-4-8-9 1-3 5-4 5-8 4 4 5 8 5 12 2-1 3-3 3-5 2 4 0 10-5 10z" fill="' + P.red + '"/>' +
      '<path d="M20 102h80" stroke="' + P.brown + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M33 34c6 4 8 8 8 14M74 32c-4 6-5 10-3 14" stroke="' + P.red + '" stroke-width="5" fill="none" stroke-linecap="round"/>',

    'window-decor':
      '<rect x="18" y="18" width="84" height="84" rx="4" fill="#0E1A31"/>' +
      '<circle cx="40" cy="38" r="2" fill="#fff"/><circle cx="78" cy="32" r="1.6" fill="#fff"/><circle cx="66" cy="50" r="1.4" fill="#fff"/><circle cx="34" cy="62" r="1.2" fill="#fff"/>' +
      '<path d="M18 52c10-7 18-2 26 2s14 0 20-6 18-4 24 4 10 6 14 2v46H18z" fill="#DCE9FF" opacity=".18"/>' +
      '<path d="M60 18v84M18 60h84" stroke="' + P.brown + '" stroke-width="6"/>' +
      '<rect x="18" y="18" width="84" height="84" rx="4" fill="none" stroke="' + P.brown + '" stroke-width="6"/>' +
      '<circle cx="60" cy="86" r="14" fill="none" stroke="' + P.pine + '" stroke-width="7"/>' +
      '<path d="M60 99l-5 8 5-2 5 2z" fill="' + P.red + '"/>' +
      '<path d="M22 20c9 0 14 8 14 18V20zM98 20c-9 0-14 8-14 18V20z" fill="' + P.red + '" opacity=".75"/>',

    'market-stall':
      '<path d="M26 22h68l12 30H14z" fill="' + P.red + '"/>' +
      '<path d="M26 22h14l-4 30H14zM54 22h14l4 30H48zM82 22h12l12 30H88z" fill="#FFF6EC"/>' +
      '<rect x="22" y="52" width="76" height="8" fill="' + P.brown + '"/>' +
      '<rect x="26" y="60" width="68" height="34" fill="#8B5A3C"/>' +
      '<rect x="32" y="68" width="18" height="18" rx="3" fill="' + P.gold + '"/>' +
      '<rect x="56" y="72" width="14" height="14" rx="3" fill="' + P.pine2 + '"/>' +
      '<rect x="76" y="68" width="12" height="18" rx="3" fill="' + P.red + '"/>' +
      '<path d="M26 94v10M94 94v10" stroke="#5B3B2A" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="40" cy="32" r="3" fill="' + P.gold + '"/><circle cx="60" cy="28" r="3" fill="' + P.gold + '"/><circle cx="80" cy="34" r="3" fill="' + P.gold + '"/>',

    'night-sky':
      '<rect x="12" y="12" width="96" height="96" rx="20" fill="#0E1A3A"/>' +
      '<circle cx="78" cy="44" r="19" fill="' + P.gold + '"/>' +
      '<circle cx="71" cy="38" r="17" fill="#0E1A3A"/>' +
      '<path d="M32 30l2.4 5.6 5.6 2.4-5.6 2.4L32 46l-2.4-5.6L24 38l5.6-2.4z" fill="#FFF6EC"/>' +
      '<path d="M44 68l1.8 4.2 4.2 1.8-4.2 1.8L44 80l-1.8-4.2L38 74l4.2-1.8z" fill="#BFE3FF"/>' +
      '<circle cx="70" cy="86" r="2" fill="#fff"/><circle cx="34" cy="58" r="1.6" fill="#fff"/>' +
      '<circle cx="88" cy="74" r="1.4" fill="#fff"/><circle cx="52" cy="28" r="1.2" fill="#fff"/>'
  };

  function icon(id, extraClass) {
    var body = ICONS[id] || ICONS['star-topper'];
    return '<svg class="icon ' + (extraClass || '') + '" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* --------------------------------------------------------------- prizes */

  var PRIZE_ICONS = {
    coupon: function (label) {
      return '<rect x="8" y="34" width="104" height="56" rx="10" fill="#E4574C"/>' +
        '<path d="M34 34v56" stroke="#FFF6EC" stroke-width="3" stroke-dasharray="5 6" opacity=".55"/>' +
        '<g fill="#FFF6EC"><text x="72" y="74" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="30" font-weight="800">' + (label || '%') + '</text></g>' +
        '<circle cx="16" cy="62" r="6" fill="#1B2130"/><circle cx="104" cy="62" r="6" fill="#1B2130"/>' +
        '<path d="M60 40l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#F7C869" opacity=".9"/>';
    },
    coins: function (label) {
      return '<ellipse cx="52" cy="84" rx="32" ry="12" fill="#C9A227"/>' +
        '<ellipse cx="52" cy="76" rx="32" ry="12" fill="#F7C869"/>' +
        '<ellipse cx="52" cy="66" rx="32" ry="12" fill="#FFDF9B"/>' +
        '<ellipse cx="52" cy="66" rx="24" ry="8" fill="#F7C869"/>' +
        '<path d="M68 40l8 16v6h-28v-6l8-16z" fill="#FFDF9B"/>' +
        '<g fill="#8A5A12"><text x="52" y="71" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="15" font-weight="800">X</text></g>' +
        '<g fill="#FFF6EC"><text x="86" y="52" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="20" font-weight="800">' + (label || '50') + '</text></g>';
    },
    gift: function () {
      return '<rect x="22" y="50" width="66" height="50" rx="6" fill="#E4574C"/>' +
        '<rect x="16" y="38" width="78" height="16" rx="6" fill="#B93A33"/>' +
        '<rect x="49" y="38" width="12" height="62" fill="#F7C869"/>' +
        '<path d="M55 38c-13 0-21-6-21-13 0-6 6-9 11-7 8 3 10 11 10 20zM55 38c13 0 21-6 21-13 0-6-6-9-11-7-8 3-10 11-10 20z" fill="#F7C869"/>' +
        '<circle cx="94" cy="30" r="4" fill="#BFE3FF"/><circle cx="24" cy="26" r="3" fill="#BFE3FF"/>';
    },
    product: function (label, accent) {
      var a = accent || '#8B7BF7';
      return '<rect x="12" y="22" width="96" height="64" rx="9" fill="#1B2130"/>' +
        '<rect x="19" y="29" width="82" height="50" rx="5" fill="#2A3550"/>' +
        '<path d="M19 79L101 29" stroke="' + a + '" stroke-width="22" opacity=".35"/>' +
        '<path d="M19 79L101 29" stroke="' + a + '" stroke-width="4" opacity=".8"/>' +
        '<rect x="46" y="86" width="28" height="6" rx="3" fill="#1B2130"/>' +
        '<rect x="38" y="92" width="44" height="5" rx="2.5" fill="#1B2130"/>' +
        '<path d="M76 84l12 22" stroke="#EAF3FF" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="90" cy="108" r="3" fill="#EAF3FF"/>' +
        '<g fill="#EAF3FF" opacity=".85"><text x="60" y="62" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="20" font-weight="800">' + (label || '') + '</text></g>';
    }
  };

  function prizeIcon(kind, label, rarity) {
    var accent = rarity === 'legendary' ? '#F7C869' : rarity === 'epic' ? '#E4574C' : '#8B7BF7';
    var body;
    if (kind === 'coupon') body = PRIZE_ICONS.coupon(label);
    else if (kind === 'coins') body = PRIZE_ICONS.coins(label);
    else if (kind === 'gift') body = PRIZE_ICONS.gift();
    else body = PRIZE_ICONS.product(label, accent);
    return '<svg class="prize-art" viewBox="0 0 120 120" aria-hidden="true">' + body + '</svg>';
  }

  /* ---------------------------------------------------------------- scene */

  function makeRng(seed) {
    var s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
  }

  function starsMarkup() {
    var rnd = makeRng(20261225);
    var out = '';
    for (var i = 0; i < 110; i++) {
      var x = +(rnd() * 1120).toFixed(1);
      var y = +(18 + rnd() * 380).toFixed(1);
      if (Math.hypot(x - 900, y - 118) < 120) continue;
      var r = +(0.5 + rnd() * 1.5).toFixed(2);
      var o = +(0.22 + rnd() * 0.62).toFixed(2);
      var delay = +(rnd() * 6).toFixed(2);
      out += '<circle class="star" cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#EAF3FF" opacity="' + o + '" style="animation-delay:' + delay + 's"/>';
    }
    var spark = [[120, 90], [300, 58], [520, 128], [700, 66], [1032, 214], [252, 196], [812, 250], [430, 250]];
    spark.forEach(function (p) {
      out += '<path class="star-spark" d="M' + p[0] + ' ' + (p[1] - 8) + 'l1.8 6.2 6.2 1.8-6.2 1.8L' + p[0] + ' ' + (p[1] + 8) +
        'l-1.8-6.2L' + (p[0] - 6.2) + ' ' + (p[1] + 1.8) + 'l6.2-1.8z" fill="#EAF3FF" opacity=".8"/>';
    });
    return out;
  }

  function pine(x, baseY, h, fill, opacity) {
    var w = h * 0.5;
    var s = '';
    s += '<g opacity="' + (opacity === undefined ? 1 : opacity) + '">';
    s += '<rect x="' + (x - h * 0.032) + '" y="' + (baseY - h * 0.16) + '" width="' + (h * 0.064) + '" height="' + (h * 0.2) + '" fill="#2A1E22"/>';
    s += '<path d="M' + x + ' ' + (baseY - h) + 'L' + (x + w * 0.56) + ' ' + (baseY - h * 0.52) + 'H' + (x - w * 0.56) + 'Z" fill="' + fill + '"/>';
    s += '<path d="M' + x + ' ' + (baseY - h * 0.82) + 'L' + (x + w * 0.8) + ' ' + (baseY - h * 0.28) + 'H' + (x - w * 0.8) + 'Z" fill="' + fill + '"/>';
    s += '<path d="M' + x + ' ' + (baseY - h * 0.56) + 'L' + (x + w) + ' ' + (baseY - h * 0.03) + 'H' + (x - w) + 'Z" fill="' + fill + '"/>';
    // snow on tips of each tier
    s += '<path d="M' + (x - w * 0.4) + ' ' + (baseY - h * 0.56) + 'Q' + x + ' ' + (baseY - h * 0.5) + ' ' + (x + w * 0.4) + ' ' + (baseY - h * 0.56) +
      '" stroke="#DCE9FF" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>';
    s += '</g>';
    return s;
  }

  function house(x, baseY, w, h, opts) {
    var o = opts || {};
    var roofPeak = baseY - h;
    var roofY = baseY - h * 0.62;
    var left = x, right = x + w;
    var mid = x + w / 2;
    var winY = baseY - h * 0.4;
    var out = '';
    out += '<g>';
    out += '<ellipse cx="' + mid + '" cy="' + (baseY + 3) + '" rx="' + (w * 0.62) + '" ry="' + (h * 0.1) + '" fill="#0B1228" opacity=".25"/>';
    out += '<rect x="' + left + '" y="' + roofY + '" width="' + w + '" height="' + (baseY - roofY) + '" fill="' + (o.wall || '#26365A') + '"/>';
    // side shade
    out += '<rect x="' + (right - w * 0.18) + '" y="' + roofY + '" width="' + (w * 0.18) + '" height="' + (baseY - roofY) + '" fill="#0B1631" opacity=".35"/>';
    // roof
    out += '<path d="M' + (left - w * 0.09) + ' ' + (roofY + 6) + 'L' + mid + ' ' + roofPeak + 'L' + (right + w * 0.09) + ' ' + (roofY + 6) + 'Z" fill="#E6F0FF"/>';
    out += '<path d="M' + (left - w * 0.09) + ' ' + (roofY + 6) + 'L' + mid + ' ' + roofPeak + 'L' + (right + w * 0.09) + ' ' + (roofY + 6) + 'L' + (right + w * 0.03) + ' ' + (roofY + 6) + 'L' + mid + ' ' + (roofPeak + 12) + 'L' + (left - w * 0.03) + ' ' + (roofY + 6) + 'Z" fill="#BFD4EC"/>';
    // warm windows
    if (o.windows !== false) {
      var wy = winY;
      var ww = w * 0.2, wh = h * 0.28;
      var xs = o.singleWindow ? [mid - ww / 2] : [left + w * 0.15, right - w * 0.15 - ww];
      xs.forEach(function (wx) {
        out += '<circle cx="' + (wx + ww / 2) + '" cy="' + (wy + wh / 2) + '" r="' + (ww * 1.25) + '" fill="url(#warmGlow)" opacity=".55"/>';
        var winColor = o.window || '#FFC46B';
        out += '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="' + (w * 0.015) + '" fill="' + winColor + '"/>';
        out += '<path d="M' + (wx + ww / 2) + ' ' + wy + 'v' + wh + 'M' + wx + ' ' + (wy + wh / 2) + 'h' + ww + '" stroke="#8B5A3C" stroke-width="2.5" opacity=".55"/>';
      });
    }
    // door
    if (!o.noDoor) {
      var dw = w * 0.17, dh = h * 0.34;
      out += '<rect x="' + (mid - dw / 2) + '" y="' + (baseY - dh) + '" width="' + dw + '" height="' + dh + '" rx="' + (dw * 0.18) + '" fill="#1A2540"/>';
      out += '<circle cx="' + (mid + dw * 0.26) + '" cy="' + (baseY - dh * 0.5) + '" r="2" fill="#F7C869"/>';
    }
    // chimney + smoke
    var cx = left + w * 0.78, cy = roofPeak + h * 0.14;
    out += '<rect x="' + cx + '" y="' + cy + '" width="' + (w * 0.09) + '" height="' + (h * 0.3) + '" fill="#3A2A2E"/>';
    out += '<rect x="' + (cx - 4) + '" y="' + (cy - 4) + '" width="' + (w * 0.09 + 8) + '" height="7" rx="3" fill="#EAF3FF"/>';
    out += '<g filter="url(#smokeBlur)" fill="#CDE0F6" opacity=".22">';
    out += '<circle cx="' + (cx + w * 0.07) + '" cy="' + (cy - h * 0.16) + '" r="' + (w * 0.06) + '"/>';
    out += '<circle cx="' + (cx + w * 0.02) + '" cy="' + (cy - h * 0.3) + '" r="' + (w * 0.08) + '"/>';
    out += '<circle cx="' + (cx + w * 0.12) + '" cy="' + (cy - h * 0.42) + '" r="' + (w * 0.1) + '"/>';
    out += '</g>';
    // snow drift at base
    out += '<ellipse cx="' + mid + '" cy="' + baseY + '" rx="' + (w * 0.58) + '" ry="' + (h * 0.075) + '" fill="#EAF3FF" opacity=".85"/>';
    out += '</g>';
    return out;
  }

  // Centre-out tile order used by the town mosaic (also reused by the share card).
  function tileOrder() {
    var cells = [];
    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 6; c++) {
        var dx = (c - 2.5) / 6;
        var dy = (r - 1.5) / 4;
        cells.push({ idx: r * 6 + c, d: dx * dx + dy * dy + ((r * 6 + c) % 3) * 0.0015 });
      }
    }
    cells.sort(function (a, b) { return a.d - b.d; });
    return cells.map(function (c) { return c.idx; });
  }

  function sceneSVG(opts) {
    var o = opts || {};
    var snowInside = '';
    var rnd = makeRng(777);
    for (var i = 0; i < 60; i++) {
      var sx = +(rnd() * 1120).toFixed(1);
      var sy = +(rnd() * 700).toFixed(1);
      var sr = +(0.7 + rnd() * 2.1).toFixed(1);
      var so = +(0.16 + rnd() * 0.5).toFixed(2);
      snowInside += '<circle cx="' + sx + '" cy="' + sy + '" r="' + sr + '" fill="#FFFFFF" opacity="' + so + '"/>';
    }

    var sceneLabel = o.lang === 'zh'
      ? '雪夜里的圣诞小镇：亮着灯的圣诞树、房屋、教堂和飘落的雪'
      : 'A snow-covered Christmas town at night with a tall lit tree, houses, a church and falling snow';
    var svgOpen = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (o.viewBox || '0 0 1120 700') + '" width="' + (o.width || 1120) + '" height="' + (o.height || 700) + '"' +
      (o.fit === 'slice' ? ' preserveAspectRatio="xMidYMid slice"' : '') +
      (o.className ? ' class="' + o.className + '"' : '') +
      ' role="img" aria-label="' + sceneLabel + '">';

    return svgOpen + `
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#04081A"/><stop offset=".4" stop-color="#0A1330"/>
          <stop offset=".7" stop-color="#16264B"/><stop offset=".92" stop-color="#2B4068"/>
        </linearGradient>
        <linearGradient id="auroraTeal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#57D2C8" stop-opacity="0"/><stop offset=".45" stop-color="#57D2C8" stop-opacity=".8"/>
          <stop offset="1" stop-color="#8B7BF7" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="auroraViolet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#8B7BF7" stop-opacity="0"/><stop offset=".55" stop-color="#8B7BF7" stop-opacity=".6"/>
          <stop offset="1" stop-color="#57D2C8" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="moonHalo">
          <stop offset="0" stop-color="#FFF4D6" stop-opacity=".5"/>
          <stop offset=".45" stop-color="#FFF4D6" stop-opacity=".14"/>
          <stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="warmGlow">
          <stop offset="0" stop-color="#FFC46B" stop-opacity=".65"/>
          <stop offset="1" stop-color="#FFC46B" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7E96BA"/><stop offset=".28" stop-color="#9FB6D6"/>
          <stop offset=".62" stop-color="#C6D8EF"/><stop offset="1" stop-color="#E4EEFB"/>
        </linearGradient>
        <linearGradient id="ridgeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#16264A"/><stop offset="1" stop-color="#0D1834"/>
        </linearGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2B4068" stop-opacity="0"/>
          <stop offset="1" stop-color="#3E5480" stop-opacity=".55"/>
        </linearGradient>
        <radialGradient id="vignette" cx=".5" cy=".52" r=".74">
          <stop offset=".5" stop-color="#04060F" stop-opacity="0"/><stop offset="1" stop-color="#04060F" stop-opacity=".6"/>
        </radialGradient>
        <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".12"/><stop offset=".35" stop-color="#FFFFFF" stop-opacity="0"/>
          <stop offset=".62" stop-color="#FFFFFF" stop-opacity=".045"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <filter id="blurBig" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>
        <filter id="smokeBlur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>
        <filter id="lampBlur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9"/></filter>
        <filter id="treeGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>

      <rect width="1120" height="700" fill="url(#skyGrad)"/>

      <g filter="url(#blurBig)" opacity=".6">
        <path d="M-80 320C160 160 340 260 560 150S940 70 1200 180" stroke="url(#auroraTeal)" stroke-width="86" fill="none" opacity=".42"/>
        <path d="M-60 380C200 260 430 340 670 220S1000 160 1200 270" stroke="url(#auroraViolet)" stroke-width="64" fill="none" opacity=".32"/>
      </g>

      <g class="scene-stars">${starsMarkup()}</g>

      <circle cx="900" cy="118" r="155" fill="url(#moonHalo)"/>
      <circle cx="900" cy="118" r="42" fill="#FFF4D6"/>
      <circle cx="886" cy="104" r="7" fill="#EFDDAE" opacity=".5"/>
      <circle cx="913" cy="132" r="5" fill="#EFDDAE" opacity=".42"/>
      <circle cx="898" cy="138" r="3.5" fill="#EFDDAE" opacity=".38"/>

      <!-- far mountain range -->
      <path d="M0 430 110 330 205 382 330 296 452 404 566 342 700 420 820 322 940 402 1052 344 1120 392V700H0Z" fill="url(#ridgeGrad)"/>
      <path d="M330 296l30 30-34 8-14-20zM820 322l30 28-32 8-14-18zM110 330l28 26-30 8-12-18zM1052 344l26 24-28 6z" fill="#39517E" opacity=".75"/>
      <path d="M0 446C180 410 360 442 540 428S900 408 1120 438V700H0Z" fill="#0E1B38"/>
      <rect y="420" width="1120" height="90" fill="url(#haze)"/>

      <!-- distant pine ridge -->
      <g opacity=".85">
        ${pine(66, 462, 54, '#0C1830')}${pine(104, 464, 38, '#0C1830')}${pine(300, 462, 44, '#0C1830')}
        ${pine(728, 458, 42, '#0C1830')}${pine(766, 462, 56, '#0C1830')}${pine(1048, 464, 48, '#0C1830')}
        ${pine(1088, 468, 62, '#0C1830')}
      </g>

      <!-- snowfield -->
      <path d="M0 482C180 446 350 476 540 458S900 444 1120 466V700H0Z" fill="url(#snowGrad)"/>
      <ellipse cx="250" cy="520" rx="300" ry="120" fill="url(#warmGlow)" opacity=".16"/>
      <ellipse cx="580" cy="520" rx="280" ry="130" fill="url(#warmGlow)" opacity=".2"/>
      <ellipse cx="880" cy="520" rx="250" ry="110" fill="url(#warmGlow)" opacity=".14"/>

      <!-- houses -->
      ${house(44, 500, 104, 122, { wall: '#22314F', window: '#FFC46B' })}
      ${house(170, 502, 152, 170, { wall: '#26365A' })}
      ${house(344, 498, 92, 112, { wall: '#20304D', singleWindow: false })}
      ${house(930, 500, 118, 140, { wall: '#243354' })}

      <!-- little pines between houses -->
      ${pine(152, 505, 78, '#1B4A3A', 1)}
      ${pine(330, 502, 62, '#1B4A3A', 1)}

      <!-- church -->
      <g class="church">
        <ellipse cx="841" cy="506" rx="80" ry="12" fill="#0B1228" opacity=".26"/>
        <rect x="776" y="402" width="130" height="102" fill="#2A3A5C"/>
        <rect x="776" y="402" width="20" height="102" fill="#0F1C36" opacity=".3"/>
        <path d="M766 406 841 344 916 406Z" fill="#E6F0FF"/>
        <path d="M766 406 841 344 916 406 908 406 841 354 774 406Z" fill="#BFD4EC"/>
        <rect x="816" y="252" width="50" height="152" fill="#31446B"/>
        <rect x="810" y="244" width="62" height="11" rx="3" fill="#E6F0FF"/>
        <path d="M812 252 841 194 870 252Z" fill="#EAF3FF"/>
        <path d="M818 252 841 204 864 252Z" fill="#C3D6EE"/>
        <path d="M841 160v26M830 171h22" stroke="#F7C869" stroke-width="4" stroke-linecap="round"/>
        <circle cx="841" cy="302" r="10" fill="#F7C869"/>
        <circle cx="841" cy="302" r="24" fill="url(#warmGlow)" opacity=".7"/>
        <path d="M833 302a8 8 0 1 1 16 0" fill="none" stroke="#8A5A12" stroke-width="2" opacity=".55"/>
        <rect x="833" y="336" width="16" height="34" rx="8" fill="#FFC46B"/>
        <circle cx="841" cy="352" r="20" fill="url(#warmGlow)" opacity=".55"/>
        <rect x="792" y="436" width="18" height="38" rx="9" fill="#FFC46B"/>
        <rect x="872" y="436" width="18" height="38" rx="9" fill="#FFC46B"/>
        <circle cx="801" cy="456" r="18" fill="url(#warmGlow)" opacity=".4"/>
        <circle cx="881" cy="456" r="18" fill="url(#warmGlow)" opacity=".4"/>
        <path d="M828 504v-42c0-8 6-14 13-14s13 6 13 14v42z" fill="#1A2540"/>
        <path d="M841 458v46" stroke="#0E1830" stroke-width="3" opacity=".6"/>
        <path d="M776 504h130" stroke="#EAF3FF" stroke-width="3" opacity=".45"/>
        <ellipse cx="841" cy="506" rx="70" ry="9" fill="#EAF3FF" opacity=".85"/>
        <path d="M786 408c14-8 30-12 55-12" stroke="#FFFFFF" stroke-width="3" opacity=".5" fill="none"/>
      </g>

      <!-- big tree -->
      <g class="big-tree">
        <ellipse cx="560" cy="556" rx="150" ry="18" fill="#0B1228" opacity=".32"/>
        <ellipse cx="560" cy="520" rx="200" ry="90" fill="url(#warmGlow)" opacity=".3"/>
        <rect x="547" y="500" width="26" height="58" fill="#5B3B2A"/>
        <path d="M560 196 616 300H504Z" fill="#1F6B4F"/>
        <path d="M560 248 650 376H470Z" fill="#226F52"/>
        <path d="M560 318 686 462H434Z" fill="#1B5F47"/>
        <path d="M560 396 716 544H404Z" fill="#1B5F47"/>
        <path d="M560 196 592 268H528Z" fill="#2F8A63" opacity=".35"/>
        <path d="M560 248 602 330H518Z" fill="#2F8A63" opacity=".28"/>
        <path d="M560 318 610 402H510Z" fill="#2F8A63" opacity=".22"/>
        <path d="M522 300Q560 314 598 300M496 376Q560 394 624 376M462 462Q560 484 658 462M436 544Q560 566 684 544"
              stroke="#DCE9FF" stroke-width="5" fill="none" opacity=".4" stroke-linecap="round"/>
        <path d="M540 268c14 10 34 12 50 4M512 344c18 12 42 14 62 4M478 428c22 14 50 16 74 6" stroke="#DCE9FF" stroke-width="3.5" fill="none" opacity=".3" stroke-linecap="round"/>
        <g fill="#FFD98A">
          <circle cx="578" cy="228" r="4"/><circle cx="540" cy="250" r="4"/><circle cx="598" cy="282" r="4"/>
          <circle cx="520" cy="300" r="4"/><circle cx="612" cy="330" r="4"/><circle cx="560" cy="348" r="4"/>
          <circle cx="500" cy="368" r="4"/><circle cx="640" cy="392" r="4"/><circle cx="520" cy="414" r="4"/>
          <circle cx="600" cy="444" r="4"/><circle cx="470" cy="462" r="4"/><circle cx="654" cy="486" r="4"/>
          <circle cx="510" cy="506" r="4"/><circle cx="620" cy="522" r="4"/>
        </g>
        <g fill="#E4574C">
          <circle cx="560" cy="276" r="6"/><circle cx="588" cy="322" r="6"/><circle cx="530" cy="342" r="6"/>
          <circle cx="606" cy="402" r="6"/><circle cx="512" cy="420" r="6"/><circle cx="566" cy="472" r="6"/><circle cx="638" cy="480" r="6"/>
        </g>
        <g fill="#BFE3FF" opacity=".9">
          <circle cx="550" cy="222" r="3"/><circle cx="610" cy="306" r="3"/><circle cx="494" cy="336" r="3"/>
          <circle cx="582" cy="410" r="3"/><circle cx="462" cy="440" r="3"/><circle cx="670" cy="516" r="3"/>
        </g>
        <path d="M560 158l11.5 23.5 26 3.8-18.8 18.3 4.4 25.8L560 217l-23.1 12.4 4.4-25.8-18.8-18.3 26-3.8z" fill="#F7C869"/>
        <circle cx="560" cy="190" r="40" fill="url(#warmGlow)" opacity=".85"/>
        <circle cx="560" cy="190" r="7" fill="#FFF6EC" opacity=".55"/>
        <g transform="translate(560 190)"><path d="M0-30V30M-30 0H30" stroke="#FFD98A" stroke-width="1.4" opacity=".45"/></g>
      </g>

      <!-- gift boxes under the tree -->
      <g>
        <rect x="470" y="540" width="34" height="28" rx="3" fill="#E4574C"/>
        <rect x="468" y="534" width="38" height="9" rx="3" fill="#B93A33"/>
        <rect x="484" y="534" width="7" height="34" fill="#F7C869"/>
        <rect x="610" y="546" width="28" height="24" rx="3" fill="#2F7A5A"/>
        <rect x="608" y="541" width="32" height="8" rx="3" fill="#22644B"/>
        <rect x="621" y="541" width="6" height="29" fill="#F7C869"/>
        <rect x="522" y="550" width="24" height="20" rx="3" fill="#8B7BF7"/>
        <rect x="521" y="545" width="26" height="7" rx="3" fill="#6F5FE0"/>
        <rect x="531" y="545" width="5" height="25" fill="#F7C869"/>
      </g>

      <!-- market stalls -->
      <g class="stalls">
        <g>
          <ellipse cx="456" cy="592" rx="70" ry="10" fill="#0B1228" opacity=".3"/>
          <path d="M392 494h128l10 34H382Z" fill="#E4574C"/>
          <path d="M392 494h18l-4 34h-24zM432 494h18l3 34h-24zM474 494h18l9 34h-24z" fill="#FFF6EC"/>
          <path d="M382 528h138v9H382Z" fill="#6B4530"/>
          <rect x="400" y="537" width="102" height="49" fill="#7A4A33"/>
          <rect x="400" y="537" width="102" height="9" fill="#9A6446"/>
          <rect x="410" y="548" width="22" height="22" rx="3" fill="#F7C869"/>
          <rect x="440" y="552" width="18" height="18" rx="3" fill="#3F9169"/>
          <rect x="468" y="548" width="20" height="22" rx="3" fill="#E4574C"/>
          <path d="M400 586v6M502 586v6" stroke="#4E3223" stroke-width="6"/>
          <circle cx="410" cy="505" r="3" fill="#FFD98A"/><circle cx="440" cy="503" r="3" fill="#FFD98A"/><circle cx="470" cy="505" r="3" fill="#FFD98A"/><circle cx="500" cy="503" r="3" fill="#FFD98A"/>
          <path d="M396 496c30-5 80-5 120 0" stroke="#EAF3FF" stroke-width="4" opacity=".55" fill="none" stroke-linecap="round"/>
        </g>
        <g>
          <ellipse cx="660" cy="600" rx="66" ry="10" fill="#0B1228" opacity=".3"/>
          <path d="M600 504h128l10 32H590Z" fill="#2F7A5A"/>
          <path d="M600 504h18l-4 32h-24zM640 504h18l3 32h-24zM682 504h18l9 32h-24z" fill="#FFF6EC"/>
          <path d="M590 536h138v9H590Z" fill="#6B4530"/>
          <rect x="608" y="545" width="102" height="43" fill="#7A4A33"/>
          <rect x="608" y="545" width="102" height="9" fill="#9A6446"/>
          <rect x="618" y="556" width="22" height="20" rx="3" fill="#F7C869"/>
          <rect x="648" y="560" width="18" height="16" rx="3" fill="#BFE3FF"/>
          <rect x="676" y="556" width="20" height="20" rx="3" fill="#E4574C"/>
          <path d="M608 588v6M710 588v6" stroke="#4E3223" stroke-width="6"/>
          <path d="M604 506c30-5 80-5 120 0" stroke="#EAF3FF" stroke-width="4" opacity=".5" fill="none" stroke-linecap="round"/>
        </g>
      </g>

      <!-- street lamps -->
      <g class="lamps">
        <g>
          <ellipse cx="350" cy="612" rx="80" ry="24" fill="url(#warmGlow)" opacity=".5"/>
          <rect x="346" y="524" width="8" height="88" fill="#2C3A55"/>
          <rect x="334" y="608" width="32" height="9" rx="4" fill="#2C3A55"/>
          <path d="M350 490l20 12v22l-20 10-20-10v-22z" fill="#F7C869"/>
          <path d="M350 490l20 12v22l-20 10-20-10v-22z" fill="none" stroke="#C98A3E" stroke-width="3"/>
          <path d="M350 490v44M330 502l40 22M370 502l-40 22" stroke="#C98A3E" stroke-width="1.6" opacity=".5"/>
          <path d="M350 482v8" stroke="#2C3A55" stroke-width="4"/>
          <circle cx="350" cy="512" r="32" fill="#FFD98A" opacity=".2" filter="url(#lampBlur)"/>
        </g>
        <g>
          <ellipse cx="744" cy="612" rx="80" ry="24" fill="url(#warmGlow)" opacity=".46"/>
          <rect x="740" y="524" width="8" height="88" fill="#2C3A55"/>
          <rect x="728" y="608" width="32" height="9" rx="4" fill="#2C3A55"/>
          <path d="M744 490l20 12v22l-20 10-20-10v-22z" fill="#F7C869"/>
          <path d="M744 490l20 12v22l-20 10-20-10v-22z" fill="none" stroke="#C98A3E" stroke-width="3"/>
          <path d="M744 490v44M724 502l40 22M764 502l-40 22" stroke="#C98A3E" stroke-width="1.6" opacity=".5"/>
          <path d="M744 482v8" stroke="#2C3A55" stroke-width="4"/>
          <circle cx="744" cy="512" r="32" fill="#FFD98A" opacity=".18" filter="url(#lampBlur)"/>
        </g>
      </g>

      <!-- foreground snow bank -->
      <path d="M0 612C160 578 330 628 500 608S840 580 1120 616V700H0Z" fill="#E9F2FF" opacity=".75"/>
      <path d="M0 664C200 636 360 676 560 660S900 640 1120 668V700H0Z" fill="#F7FBFF" opacity=".55"/>

      <!-- path & footprints -->
      <path d="M452 700c-8-34 14-58 48-78 26-15 40-36 34-58" fill="none" stroke="#BFD4EC" stroke-width="42" opacity=".42" stroke-linecap="round"/>
      <path d="M452 700c-8-34 14-58 48-78 26-15 40-36 34-58" fill="none" stroke="#E8F2FF" stroke-width="16" opacity=".4" stroke-linecap="round" stroke-dasharray="20 30"/>
      <g fill="#9DB4D4" opacity=".5">
        <ellipse cx="500" cy="684" rx="7" ry="4"/><ellipse cx="512" cy="676" rx="7" ry="4"/>
        <ellipse cx="528" cy="656" rx="6" ry="3.5"/><ellipse cx="540" cy="648" rx="6" ry="3.5"/>
        <ellipse cx="552" cy="628" rx="5.5" ry="3.2"/><ellipse cx="562" cy="620" rx="5.5" ry="3.2"/>
      </g>

      <!-- snowman -->
      <g class="snowman">
        <ellipse cx="206" cy="664" rx="54" ry="11" fill="#0B1228" opacity=".28"/>
        <circle cx="206" cy="622" r="38" fill="#DCE9FF"/>
        <circle cx="206" cy="574" r="28" fill="#F4F9FF"/>
        <circle cx="206" cy="534" r="19" fill="#FFFFFF"/>
        <path d="M218 588l-6 54" stroke="#9DB4D4" stroke-width="3" opacity=".35" fill="none"/>
        <path d="M188 523h36v8h-36z" fill="#1B2130"/>
        <rect x="197" y="502" width="18" height="21" rx="3" fill="#1B2130"/>
        <circle cx="200" cy="532" r="2.4" fill="#1B2130"/><circle cx="212" cy="532" r="2.4" fill="#1B2130"/>
        <path d="M206 536l16 5-16 5z" fill="#E8A94B"/>
        <path d="M180 576c16 8 36 8 52 0" stroke="#E4574C" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M224 582c8 8 10 18 6 28" stroke="#E4574C" stroke-width="7" fill="none" stroke-linecap="round"/>
        <circle cx="206" cy="602" r="3.4" fill="#1B2130"/><circle cx="206" cy="624" r="3.4" fill="#1B2130"/>
        <path d="M172 596l-26 14M240 596l26 14M146 610l-8-8M266 610l8-8" stroke="#8B5A3C" stroke-width="5" stroke-linecap="round"/>
      </g>

      <!-- reindeer + sleigh -->
      <g class="sleigh">
        <g transform="translate(736 566)">
          <ellipse cx="42" cy="78" rx="54" ry="7" fill="#0B1228" opacity=".28"/>
          <path d="M22 52v22M34 52v22M58 54v20M70 54v20" stroke="#6F452B" stroke-width="5" stroke-linecap="round"/>
          <ellipse cx="46" cy="42" rx="32" ry="15" fill="#8B5A3C"/>
          <ellipse cx="46" cy="46" rx="25" ry="9" fill="#A9714B" opacity=".55"/>
          <path d="M68 34c6-10 12-16 18-18" stroke="#8B5A3C" stroke-width="14" fill="none" stroke-linecap="round"/>
          <ellipse cx="90" cy="14" rx="15" ry="10" fill="#9A6446" transform="rotate(-8 90 14)"/>
          <path d="M99 18c5 2 8 3 12 3" stroke="#9A6446" stroke-width="7" stroke-linecap="round"/>
          <path d="M82 4c-2-7 2-11 7-12 1 6 0 10-3 13z" fill="#7A4A33"/>
          <path d="M86 -2c-3-12 0-20 6-26M92 0c5-9 12-13 19-13M96 -6c2-10 5-16 9-19" stroke="#6F452B" stroke-width="3.4" fill="none" stroke-linecap="round"/>
          <circle cx="94" cy="11" r="2.6" fill="#1B2130"/>
          <circle cx="107" cy="18" r="5" fill="#E4574C"/>
          <circle cx="107" cy="18" r="13" fill="url(#warmGlow)" opacity=".85"/>
          <path d="M14 36c-6-2-9 0-10 4" stroke="#6F452B" stroke-width="4" stroke-linecap="round"/>
          <path d="M70 30c8 4 12 8 14 14" stroke="#F7C869" stroke-width="3" fill="none" opacity=".8"/>
        </g>
        <path d="M846 616c14 6 26 4 34-4" stroke="#E8A94B" stroke-width="2.5" fill="none" opacity=".8"/>
        <path d="M868 604h74c12 0 20-8 20-20v-6h10" fill="none" stroke="#E4574C" stroke-width="10" stroke-linecap="round"/>
        <path d="M874 578h58v22h-58z" fill="#E4574C"/>
        <rect x="880" y="560" width="24" height="18" rx="3" fill="#F7C869"/>
        <rect x="908" y="565" width="18" height="13" rx="3" fill="#3F9169"/>
        <path d="M856 616c0 8 8 13 18 13h50" fill="none" stroke="#8B5A3C" stroke-width="5" stroke-linecap="round"/>
        <rect x="902" y="626" width="28" height="26" rx="3" fill="#2F7A5A"/>
        <rect x="912" y="626" width="8" height="26" fill="#F7C869"/>
        <rect x="876" y="632" width="20" height="20" rx="3" fill="#8B7BF7"/>
        <rect x="883" y="632" width="6" height="20" fill="#F7C869"/>
      </g>

      <!-- foreground framing pines -->
      <g>${pine(46, 706, 216, '#0A172E')}${pine(116, 716, 152, '#0C1A34')}</g>
      <g>${pine(1082, 710, 232, '#0A172E')}${pine(1014, 720, 148, '#0C1A34')}</g>

      <ellipse cx="300" cy="692" rx="180" ry="16" fill="#F7FBFF" opacity=".28"/>
      <ellipse cx="860" cy="696" rx="170" ry="14" fill="#F7FBFF" opacity=".22"/>

      <g class="scene-snow">${snowInside}</g>

      <rect width="1120" height="700" fill="url(#vignette)"/>
      ${o.clean ? '' : '<rect width="1120" height="700" fill="url(#glassShine)"/>'}
    </svg>`;
  }

  global.XMASArt = {
    icon: icon,
    prizeIcon: prizeIcon,
    sceneSVG: sceneSVG,
    tileOrder: tileOrder,
    palette: P
  };
})(window);
