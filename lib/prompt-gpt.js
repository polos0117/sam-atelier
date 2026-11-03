/* GPT 세션용 구조형 지시문(2026-11-03 사용자 「응 진행해줘」).
   GPT 세션의 image_gen 은 긴 영문 한 덩어리 지시문에서 「Extremely intricate … high-detail」 같은 말을 세게 잡아 선 · 장식이 API 보다 세게 나왔다.
   화풍을 형태 · 얼굴 · 머리 · 몸 · 셰이딩 · 조명 · 색 · 배제로 나눠 쓴 구조형(법정 시험 — 세계 그림 5c 영문, 일상컷 4판 영문)에서 API 와 같은 그림체가 나왔다.
   설계 값은 생성기 지시문(lib/prompt-sam.js 의 build · buildCasual)에서만 온다 — 여기서는 그 지시문의 줄을 칸으로 옮기기만 한다.
   STYLE 줄(API 화풍)은 버리고 고정 화풍 칸으로 바꾼다. 일상컷의 화풍 · 얼굴은 첨부 그림에 맡긴다(같은 날 다른 세션 「일상컷 얼굴 · 화풍은 첨부 그림에 맡긴다」).
     world(prompt, { bodyText })  → { text, unknown }   세계 그림
     casual(prompt, { bodyText }) → { text, unknown }   일상컷 — bodyText 는 그 장수 체형 글(세계 그림 SILHOUETTE 의 첫 칸)
   unknown 은 칸을 못 찾은 줄 — 지시문 틀이 바뀌면 여기를 고친다(tests/prompt-gpt.cjs 가 막는다). */
(function (root) {
  'use strict';
  var trim = function (s) { return String(s || '').trim(); };
  var bullet = function (head, v) { return trim(v) ? '* ' + head + ': ' + trim(v) : ''; };
  var join = function (a) { return a.filter(Boolean).join('\n'); };

  /* 줄 → { head, rest } — 머리말은 지시문 틀(lib/prompt-spec.js)의 것 */
  var HEADS = [
    ['concept', /^CONCEPT:\s*/], ['style', /^STYLE:\s*/], ['traits', /^TRAITS of [^:]+:\s*/], ['faction', /^FACTION — /],
    ['age', /^AGE:\s*/], ['silhouette', /^SILHOUETTE:\s*/], ['face', /^FACE(?: \([^)]*\))?(?::| —)\s*/], ['world', /^WORLD — /],
    ['setting', /^SETTING(?: \(this card\))?:\s*/], ['time', /^TIME & WEATHER:\s*/], ['mood', /^MOOD:\s*/], ['exposure', /^EXPOSURE(?: \([^)]*\))?:\s*/],
    ['note', /^(?:SCENE NOTE|OUTFIT NOTE|EXTRA|Note):\s*/], ['output', /^OUTPUT:\s*/], ['sigItem', /^SIGNATURE ITEM:\s*/],
    ['sigShape', /^SIGNATURE ITEM SHAPE:\s*/], ['sigAcc', /^SIGNATURE ACCESSORY:\s*/], ['expr', /^EXPRESSION:\s*/], ['body', /^BODY:\s*/],
    ['identity', /^IDENTITY\b/], ['one', /^ONE (?:MAIN )?FIGURE(?: ONLY)?[.:]\s*/], ['anatomy', /^ANATOMY:\s*/], ['hands', /^HANDS:\s*/],
    ['input', /^INPUT:\s*/], ['character', /^CHARACTER:\s*/], ['design', /^DESIGN \(accessory hints only\):\s*/], ['frame', /^FRAME:\s*/],
    ['era', /^(?:ERA|WORLD):\s*/], ['screens', /^SCREENS:\s*/], ['sceneHead', /^SCENE \(chosen\):\s*$/], ['place', /^Place:\s*/], ['weather', /^Weather \/ season:\s*/], ['timeOfDay', /^Time of day:\s*/],
    ['hair', /^Hair:\s*/], ['outfit', /^Outfit:\s*/], ['posture', /^POSTURE:\s*/], ['support', /^SUPPORT:\s*/], ['composition', /^COMPOSITION:\s*/],
    ['crop', /^CROP:\s*/], ['lens', /^Lens \/ perspective:\s*/], ['bothHands', /^BOTH HANDS:\s*/], ['right', /^RIGHT HAND:\s*/], ['left', /^LEFT HAND:\s*/],
    ['lookBack', /^LOOK-BACK:\s*/], ['prop', /^PROP:\s*/], ['legs', /^LEGS:\s*/], ['gaze', /^GAZE:\s*/], ['intensity', /^overall_intensity:\s*/],
    ['skin', /^skin_exposure:\s*/], ['wardrobe', /^WARDROBE:\s*/], ['angle', /^ANGLE:\s*/]
  ];
  function parse(prompt) {
    var out = {}, unknown = [], blocks = String(prompt || '').split(/\n\s*\n/);
    blocks.forEach(function (b) {
      b.split('\n').forEach(function (line, i, arr) {
        line = line.replace(/\s+$/, ''); if (!trim(line)) return;
        for (var k = 0; k < HEADS.length; k++) {
          var m = line.match(HEADS[k][1]);
          if (m) {
            var key = HEADS[k][0], rest = line.slice(m[0].length);
            if (key === 'identity') rest = arr.slice(i + 1).join('\n');   /* 직접 고른 외형 — 아래 줄까지 한 덩어리 */
            (out[key] = out[key] || []).push(trim(rest));
            if (key === 'identity') arr.length = i + 1;
            return;
          }
        }
        unknown.push(line);
      });
    });
    return { get: function (k) { return (out[k] || []).join(' '); }, all: function (k) { return out[k] || []; }, unknown: unknown };
  }

  /* 세계 그림 화풍 — 법정 5c 영문(2026-11-03) */
  var WORLD_STYLE = [
    'ART STYLE', '',
    '* Medium / reference class: an in-engine 3D character model with hand-painted textures — a premium Korean MMORPG promotional render, character-select-screen shot',
    '* Detailed art style:',
    '00 POSITIVE - technical rendering',
    'Form language: semi-realistic volumetric 3D forms, no lineart, forms read through planes and light, softly melting edges, a softly curved silhouette with dense ornament',
    'Face structure: small refined face, delicate realistic-anime features, a small soft chin, soft feminine contours, realistically proportioned eyes, subtle lashes, small iris highlights',
    'Hair: soft, glossy hair in large masses, a few strands lifted by the wind, diffused specular highlights, no individually drawn strands',
    'Body / proportions: long legs, narrow waist, full curvaceous figure — natural, rounded volume at bust, hips and thighs (never thin), semi-realistic anatomy, a clean, readable card pose',
    'Rendering / shading: soft continuous gradients (not cel shading), porcelain skin with soft subsurface glow, glossy specular highlights on skin, metal, silk and gems, a painterly finish with low micro-contrast',
    'Lighting: character-select-screen lighting — strong rim light, soft key light on the face, drifting light particles, atmospheric depth, softly blurred background, warm golden-hour tone with a light atmospheric haze',
    'Texture / colour: polished metal, silk, jade and gems catching sharp highlights, filigree metalwork, jewel inlays, layered translucent fabrics, fine embroidery; {palette}; muted, soft, low saturation — the palette kept subdued, no primary or neon colour, yet never greyed-out or near-monochrome',
    'World mood: {mood}',
    '00 NEGATIVE - technical exclusions',
    'saturated primary colours, oversaturation, neon glow, landscape composition, half-body crop, cropped feet, lineart, outlines, flat cel shading, 2D anime illustration, photographic skin or pores, individually drawn hair strands, blown-out white sky, thin, flat or boyish body, elongated face, horse-like face, mannish face, heavy jaw, sneer, glare, smirk-pulled cheek, chin lifted to look down, exaggerated acting expression, horse or other creature, logo, watermark, speech bubble, frame border, extra limbs, deformed hands'
  ].join('\n');
  var WORLD_SPEC = 'OUTPUT SPEC: one vertical 2:3 image (1024×1536), full body from head to feet inside the frame with clear margins. No landscape, no square, no half-body crop.';

  function splitWorld(text) {
    /* WORLD 줄 = 세계 글 + COSTUME … + LIGHT … + 세계 차림 덧말 → 장소 · 옷으로 */
    var t = trim(text), i = t.indexOf('COSTUME'), place = i >= 0 ? t.slice(0, i) : t, costume = i >= 0 ? t.slice(i) : '';
    var light = (costume.match(/LIGHT:[^.]*\./) || [''])[0];
    costume = trim(costume.replace(light, ''));
    return { place: trim(place) + (light ? ' ' + light.replace('LIGHT:', 'Light:') : ''), costume: costume };
  }

  function world(prompt) {
    var p = parse(prompt), wd = splitWorld(p.get('world'));
    var palette = trim(p.get('faction')).replace(/\.\s*$/, '');
    var style = WORLD_STYLE.replace('{palette}', palette || 'the faction palette').replace('{mood}', p.get('mood') || 'as the WORLD describes');
    var text = [WORLD_SPEC, '', style, '',
      '2. CHARACTER LOOK',
      join([bullet('Concept', p.get('concept')), bullet('Traits to carry in her design', p.get('traits')), bullet('Age', p.get('age')),
        bullet('Build and hair', p.get('silhouette')), bullet('Face', p.get('face')), p.get('identity') ? '* Chosen details (override the automatic look):\n' + p.get('identity') : '',
        bullet('Expression', p.get('expr'))]), '',
      '4. COORDINATION',
      join([bullet('Held item (most important)', p.get('sigItem')), bullet('Costume', wd.costume + (p.get('sigItem') ? ' Any hand prop this costume names (a fan, scrolls, a weapon) is replaced by the held item above — she holds only that.' : '')), bullet('Exposure', p.get('exposure')),
        p.all('note').map(function (n) { return bullet('Note', n); }).join('\n')]), '',
      '5. SCENE',
      join([bullet('Setting', wd.place + (p.get('setting') ? ' This card: ' + p.get('setting') : '') + (p.get('time') ? ' ' + p.get('time') : '')),
        bullet('Action', p.get('output') + ' Camera at eye level; head and feet not cropped.'),
        bullet('Body', p.get('body') + ' ' + p.get('anatomy')), bullet('Rules', p.get('one'))])
    ].join('\n');
    return { text: text + '\n', unknown: p.unknown.concat(p.get('style') ? [] : []) };
  }

  /* 일상컷 — 법정 일상 4판 영문(2026-11-03). 화풍 · 얼굴은 첨부 그림, 몸의 볼륨은 체형 글에서(첨부 그림의 옷이 몸을 가린다) */
  var CASUAL_STYLE = [
    'ART STYLE', '',
    '* Medium / reference class: the same as the attached image — do not reinterpret it',
    '* Detailed art style:',
    '00 POSITIVE - technical rendering',
    "Rendering: keep the attached image's rendering exactly — the same finish, skin rendering, line weight, colour palette, saturation and lighting quality",
    'What changes: only the outfit, pose, expression, framing and place',
    '00 NEGATIVE - technical exclusions',
    "making her more realistic, more painterly or more 2D than the attached image, restyling, adding skin texture or pores, harder nose or lip modelling, stronger lines or outlines, blown-out white sky, default card pose, front-facing ID-photo face, carrying over the attached image's outfit, armor, palette or patterns, other people posed with her, logo, watermark, speech bubble, frame border, readable text or numbers, extra limbs, deformed hands, a smaller head or longer neck, a longer face or heavier jaw from the camera angle, a changed eye colour, heavier makeup than the attached image"
  ].join('\n');
  var CASUAL_INPUT = [
    '0. INPUT',
    '* The attached image is the approved character. Bring this same woman into one everyday scene.',
    "* Take from the attached image: her face, hair and body, and the image's finish (rendering).",
    '* Do NOT take from the attached image: its outfit, armor, ornaments, background, pose or camera angle.'
  ].join('\n');
  var CASUAL_FACE = "exactly the face of the attached image — the same face shape, jawline, eye shape and size, nose, lips and their proportions, and the same skin rendering. Add no facial definition or texture the attached image does not have. From any camera angle or pose — low or high camera, chin resting on a hand, profile, looking back — keep her small, soft chin and soft contours as in the attached image; the angle must never make her face look longer or her jaw heavier";
  var CASUAL_LOOK = 'exactly as in the attached image (hair may move differently in the wind) — the same iris colour in every light; makeup no heavier than in the attached image';

  function casual(prompt, opts) {
    var p = parse(prompt), o = opts || {};
    var card = (p.get('input').match(/her ([^—;]+?) card/) || [])[1] || 'world';
    var bodyText = trim(o.bodyText).replace(/\s+build$/, '');
    var body = (bodyText ? 'her own figure — ' + bodyText + '; ' : '') + 'natural, rounded volume at bust, hips and thighs (never thin), the same woman as in the attached image. ' +
      "The attached image's costume (layered robes, armor or mecha plates) hides much of her figure — take her body volume from this description, not from the costume's silhouette";
    var hands = p.get('bothHands') ? p.get('bothHands') : [p.get('right') && 'Right hand: ' + p.get('right'), p.get('left') && 'Left hand: ' + p.get('left')].filter(Boolean).join(' ');
    var sig = p.get('sigAcc') || p.get('sigShape');
    var text = [
      'OUTPUT SPEC: one vertical 2:3 image (1024×1536). Use the attached image (her ' + card + ' card) as the reference. Do not reuse earlier conversation images.', '',
      CASUAL_INPUT, '', CASUAL_STYLE, '',
      '2. CHARACTER LOOK',
      join([bullet('Who', p.get('character')), bullet('Face (most important)', CASUAL_FACE), bullet('Eye colour, hair colour, haircut, skin tone', CASUAL_LOOK + (p.get('hair') ? '. Hair today: ' + p.get('hair') : '')),
        bullet('Body', body), bullet('Proportions', p.get('anatomy').replace(/\s*No body-part enlargement,\s*no extra limbs\./, ' No extra limbs.'))   /* 「몸 일부 키우지 않기」 는 볼륨을 줄였다(법정 일상 2판) */, bullet('Expression', p.get('expr'))]), '',
      '4. COORDINATION',
      join([bullet('Concept', p.get('wardrobe') + ' ' + p.get('output')), bullet('Outfit', p.get('outfit')), bullet('Exposure', p.get('skin') + (p.get('intensity') ? '; styling ' + p.get('intensity') : '')),
        bullet('Accessories', p.get('design')), bullet('Signature', sig), bullet('Held item', p.get('prop') || 'none (both hands as in the action below)'),
        p.all('note').map(function (n) { return bullet('Note', n); }).join('\n')]), '',
      '5. SCENE',
      join([bullet('Setting', [p.get('era') || p.get('setting'), p.get('place') && 'Place: ' + p.get('place'), p.get('weather') && 'Weather: ' + p.get('weather'), p.get('timeOfDay') && 'Time: ' + p.get('timeOfDay')].filter(Boolean).join(' ')),
        bullet('Crop (wins over every other line)', p.get('crop')),
        bullet('Action', [p.get('posture'), p.get('support'), hands, p.get('lookBack'), p.get('legs') && 'Legs: ' + p.get('legs')].filter(Boolean).join(' ')),
        bullet('Screens', p.get('screens')),
        bullet('Composition', p.get('composition') + (p.get('lens') ? ' ' + p.get('lens') : '')), bullet('Gaze', p.get('gaze')), bullet('Angle', p.get('angle')),
        bullet('Body', p.get('body') + ' ' + p.get('hands')), bullet('Rules', p.get('one'))])
    ].join('\n');
    /* 버리는 줄 — 화풍 · 얼굴(첨부 그림이 쥔다) · 틀(OUTPUT SPEC 이 쥔다) · SCENE 머리말 */
    return { text: text + '\n', unknown: p.unknown };
  }

  var api = { parse: parse, world: world, casual: casual, HEADS: HEADS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AtelierPromptGpt = api;
})(typeof window !== 'undefined' ? window : globalThis);
