/* 낱말 표 — 화면에 뜨는 말은 전부 여기 한 곳에서 온다.

   game-atelier → element-atelier 의 같은 파일에서 왔다(2026-11-02). 화면은 W('kind.unit') 로 부르고, 말은 이 파일에만 적는다(tests/words.cjs 가 막는다).
   설계표의 글(장수 이름·일화·세력 설명)은 자료라서 화면이 그대로 읽는다.

   쓰는 법
     W('nav.dex')                   → '도감'
     W('art.count', {n: 3})         → 자리표시자가 있으면 채워 넣는다
     W('없는.열쇠')                  → 열쇠를 그대로 돌려주고 콘솔에 적는다  */
(function (root) {
  'use strict';

  var WORDS = {
    /* 머리 */
    'app.title': '삼국지 공방',
    'app.subtitle': '장수 한 명이 여성 한 명이 된다 — 삼국시대 · 중세 판타지 · 메카.',
    'nav.index': '군막(게임)',
    'nav.dex': '도감',
    'nav.prompt': '프롬프트',
    'dex.title': '도감',
    'prompt.title': '프롬프트',
    'prompt.subtitle': '세력 › 장수 › 갈래 › 단계를 한 칸씩 고르면 지시문이 나온다. 세계 그림 셋, 일상컷은 트리 버전2. 그림은 그림 저장소에, 기록은 records 에.',

    /* 설정 */
    'ui.settings': '설정',
    'ui.theme': '공간',
    'ui.background': '배경',
    'ui.background.on': '보이기',
    'ui.background.off': '끄기',
    'ui.background.hide': '배경 끄기',
    'ui.background.show': '배경 보이기',
    'ui.density': '화면 밀도',
    'ui.density.compact': '촘촘히',
    'ui.density.relaxed': '넉넉히',
    'ui.header.fold': '머리 접기',
    'ui.header.fold.short': '접기',
    'ui.header.unfold': '머리 펼치기',

    /* 공간 다섯 — 열쇠는 workspace.css 와 같다 */
    'theme.sunlit': '한낮의 군막',
    'theme.moonlit': '달밤의 성루',
    'theme.hanok': '죽간 서고',
    'theme.forest': '대나무 숲',
    'theme.phosphor': '작전 지휘소',
    'theme.note.sunlit': '햇살이 드는 군막. 지도와 깃발 사이에서 장수들을 고릅니다.',
    'theme.note.moonlit': '달 뜬 성루의 밤. 멀리 적의 횃불이 보입니다.',
    'theme.note.hanok': '죽간과 먹 냄새의 서고. 장수들의 일화가 묶여 있습니다.',
    'theme.note.forest': '안개 낀 대나무 숲. 잔도로 가는 길입니다.',
    'theme.note.phosphor': '2190년의 작전 지휘소. 초록 화면에 함대가 깜빡입니다.',
    'home.themes': '공간',

    /* 세력 · 역할 · 능력치 · 세계 — 설계표 vocab 의 열쇠 */
    'stat.lead': '통솔', 'stat.war': '무력', 'stat.int': '지력', 'stat.pol': '정치',
    'world.samguk': '삼국시대', 'world.fantasy': '중세 판타지', 'world.mecha': '메카',
    'world.none': '이 세계엔 없다',
    'art.count': '{n}장',
    'art.missing': '아직 없다',

    /* 도감 */
    'dex.pick': '세력 고르기', 'dex.pick.n': '{n}명 · {done}칸',
    'dex.count': '{n}명',
    'dex.stats': '능력치',
    'dex.hand': '★ 손 설계', 'dex.hand.title': '외형 · 성정 · 물건을 장수마다 손으로 적었다. 나머지는 세력 팔레트 · 역할 · 능력치로 돌린 자동 설계',
    'dex.find': '이름 찾기(한글 · 병음 · 성씨)',
    'dex.empty': '이 거르기에 맞는 장수가 없다',
    'dex.casual': '일상컷',
    'dex.view': '보기', 'dex.view.world': '세계 그림', 'dex.view.casual': '일상컷', 'dex.view.all': '전부', 'dex.wf': '세계', 'dex.wf.all': '모든 세계',
    'dex.toc': '역할로 바로 가기', 'dex.about': '세력 설명',
    'dex.more.casual': '일상컷 {n} ▸', 'dex.less.casual': '일상컷 접기 ▴', 'dex.more.alt': '다른 화풍 {n} ▸', 'dex.less.alt': '다른 화풍 접기 ▴',
    'dex.casual.draft': '시안', 'dex.casual.none': '이 보기에 맞는 일상컷이 아직 없다', 'dex.counter': '{i} / {n}',
    'dex.fav': '즐겨찾기', 'dex.fav.count': '즐겨찾기 {n}', 'dex.fav.open': '담은 그림 {n}장 — 공방 모음 즐겨찾기로', 'dex.fav.inCard': '이 카드에서 담은 그림 {n}장',
    'dex.fav.added': '즐겨찾기에 담았다', 'dex.fav.removed': '즐겨찾기에서 뺐다', 'dex.fav.blocked': '저장이 막혀 못 담았다', 'dex.fav.note': '지금 보이는 그림 한 장을 공방 모음 즐겨찾기에 담는다',
    'dex.style.alt': '다른 화풍 · {name}',
    'dex.progress': '{done}/{all}장',
    'dex.open': '크게 보기',
    'dex.close': '닫기',
    'dex.prev': '앞',
    'dex.next': '뒤',
    'dex.prompt': '이 장수의 지시문',
    'dex.loading': '읽는 중',
    'dex.fail': '자료를 읽지 못했다',
    'dex.only.art': '그림 있는 것만',

    /* 생성기 */
    'prompt.card': '장수',
    'prompt.world': '세계',
    'prompt.style': '화풍',
    'prompt.notes': '덧붙임',
    'prompt.notes.help': '비워도 된다 — 설계표가 지시문을 짓는다. 쓰면 그 글이 더해진다.',
    'prompt.out': '지시문',
    'prompt.words': '{n}낱말',
    'prompt.copy': '복사',
    'prompt.copied': '복사했다',
    'prompt.copy.fail': '자동 복사가 안 된다 — 글을 골라 두었다',
    'prompt.file': '올릴 파일 이름',
    'prompt.record': '기록 내보내기',
    'prompt.record.note': '그림 저장소 records/{card}/{world}.{style}-ui.json 에 둔다. 원본 PNG 의 sha256 은 올릴 때 더한다.',
    'prompt.art': '등록된 그림',
    'prompt.art.none': '이 자리엔 아직 그림이 없다',
    'prompt.reset': '처음으로',
    'prompt.traits': '성정',
    'prompt.loading': '설계표를 읽는 중',
    'prompt.fail': '설계표를 읽지 못했다',

    /* 생성기 판(허브 통합 생성기 꼴) — 경로·단계·단추 */
    'studio.lede': '세력 › 장수 › 갈래를 고르면 단계가 한 칸씩 열린다. 고른 단계는 위 칩으로 접히고, 누르면 그 단계로 돌아간다. 일상컷은 트리 버전2 — 앞 칸이 뒤 칸을 거른다.',
    'studio.help': '설명 보기',
    'studio.chips': '고른 단계',
    'studio.bar': '단계 단추',
    'studio.head.faction': '세력', 'studio.head.card': '장수', 'studio.head.out': '갈래',
    'studio.out.world': '세계 그림', 'studio.out.casual': '일상컷',
    'studio.out.world.note': '삼국시대 · 중세 판타지 · 메카 한 장. 설계표가 짓고 덧붙임만 더한다.',
    'studio.out.casual.note': '지금의 평상시 한 장 — 세계 그림을 참고 그림으로 붙인다. 세계 → 시대 → 장소 → 의상 → 몸 자세 → 구도 → 손 → 다리 → 시선을 고른다.',
    'studio.panel.faction': '세력', 'studio.panel.faction.note': '어느 세력의 장수인가. 게임(군막)의 세력 그대로.',
    'studio.panel.card': '장수', 'studio.panel.card.note': '역할 차례(군주 · 무장 · 책사 · 문관). ★ 는 외형 · 성정 · 물건을 손으로 적은 장수 — 나머지는 자동 설계.',
    'studio.panel.out': '갈래',
    'studio.step.world': '세계', 'studio.step.notes': '덧붙임', 'studio.step.design': '설계 줄', 'studio.step.look': '외형',
    'studio.step.scene': '장면', 'studio.step.pose': '자세·표정', 'studio.step.time': '시간대', 'studio.step.hair': '머리 변화',
    'studio.note.scene': '그 세계 안의 장소 변주. 비우면 세계 글의 장소 그대로. 같은 세력 장수들이 같은 배경에 서지 않게 바꿔 본다.',
    'studio.scene.auto': '세계 글대로', 'studio.scene.auto.sub': '설계표의 세계 글이 정한 장소', 'studio.shot.time': '시간대·날씨', 'studio.shot.expr': '표정',
    'studio.note.pose': '세 세계를 나란히 견주는 자리라 프레이밍·카메라(전신 · 정면 또는 3/4)는 그대로, 자세와 표정만 바꾼다.',
    'studio.pose.auto': '카드 자세',
    'studio.note.time': '비우면 싣지 않는다. 계절·날씨와 따로.',
    'studio.note.hair': '참고 그림의 머리색·길이는 지키고 매무새만 바꾼다.',
    'studio.hair.keep': '그대로', 'studio.hair.keep.sub': '참고 그림의 머리 그대로',
    'studio.note.design': '설계표의 외형 성향(세력 팔레트 → 머리·눈 색, 역할 · 성정 → 인상·체형)을 지시문에 싣는다. 끄면 그 묶음을 빼고, 외형 칸에서 직접 고른 항목이 그 묶음을 이긴다.',
    'studio.design.why': '왜 이 외형인가 — {why}', 'studio.design.over': '직접 고른 값이 이긴다',
    'studio.design.sil.use': '실루엣 싣기(체형 · 머리 윤곽 · 머리색)', 'studio.design.face.use': '얼굴 설계 싣기(윤곽 · 눈 · 눈썹 · 코 · 입 · 눈 색)',
    'studio.design.sil': '실루엣', 'studio.design.sil.off': '실루엣 끔', 'studio.design.face': '얼굴', 'studio.design.face.off': '얼굴 끔',
    'studio.exposure': '노출', 'studio.exposure.auto': '노출 자동', 'studio.exposure.low': '노출 적게', 'studio.exposure.moderate': '노출 보통', 'studio.exposure.bold': '노출 과감',
    'studio.exposure.help.auto': '노출 줄을 싣지 않는다 — 모델이 세계 의상대로 정한다(보수적으로 가기 쉽다).',
    'studio.exposure.help.low': '세계 의상을 대부분 가린다. 얼굴·목·손만.',
    'studio.exposure.help.moderate': '쇄골이 열리고 팔이나 종아리가 드러난다. 가슴·골반은 가린다.',
    'studio.exposure.help.bold': '세계마다 따로 — 삼국시대는 교령(엇깃)을 깊게 연 네크라인 · 어깨와 팔 · 치마 트임, 중세 판타지는 견갑과 팔찌 사이의 어깨 · 고르젯 아래 네크라인 · 높은 트임, 메카는 겉판을 양 어깨에 제대로 두고 안쪽 재단으로만. 가슴·골반은 가리고 세계 의상·재료·팔레트는 그대로.',
    'studio.note.look': '자동 항목은 설계표와 모델이 정한다. 「설계」 표시가 붙은 칸은 설계 줄이 채우는 칸 — 직접 고르면 그 값이 이긴다. 세계마다 사람이 다르니 세계마다 따로 고른다.',
    'studio.look.n': '{n}칸 고름', 'studio.look.design': '설계표대로', 'studio.look.rand': '🎲 외형 무작위', 'studio.look.reset': '외형 초기화', 'studio.look.designed': '설계표', 'studio.look.designed.title': '자동이면 설계 줄(설계표 look)이 이 칸을 채운다 — 직접 고르면 그 값이 이긴다', 'studio.look.custom': '직접 입력',
    'studio.look.group.base': '기본', 'studio.look.group.build': '체형', 'studio.look.group.face': '얼굴', 'studio.look.group.hair': '머리',
    /* 공방 모음 통합 생성기가 묻는 낱말(prompt/steps.js lookStep) */
    'prompt.appearance': '외형', 'prompt.appearance.note': '자동 항목은 설계표와 모델이 정한다. 직접 고른 값이 설계 줄을 이긴다.', 'prompt.random': '🎲 외형 무작위', 'prompt.reset': '외형 초기화', 'prompt.auto': '자동', 'prompt.custom': '직접 입력',
    'prompt.group.base': '기본', 'prompt.group.build': '체형', 'prompt.group.face': '얼굴', 'prompt.group.hair': '머리',
    'look.face.face_shape': '윤곽', 'look.face.eyes': '눈', 'look.face.brows': '눈썹', 'look.face.nose': '코', 'look.face.lips': '입', 'look.face.eye_color': '눈 색',
    'look.sil.body': '체형', 'look.sil.hair': '머리 윤곽', 'look.sil.hair_color': '머리색',
    'studio.step.era': '시대', 'studio.step.place': '장소', 'studio.step.weather': '계절·날씨', 'studio.step.ofam': '의상 계열', 'studio.step.item': '옷',
    'studio.step.preset': '자세 추천', 'studio.step.posture': '몸 자세', 'studio.step.support': '받침', 'studio.step.frame': '프레이밍', 'studio.step.body': '몸 방향',
    'studio.step.head': '머리 방향', 'studio.step.camera': '카메라 높이', 'studio.step.right': '오른손', 'studio.step.left': '왼손', 'studio.step.use': '소품 동작',
    'studio.step.legs': '다리', 'studio.step.gaze': '시선', 'studio.step.expr': '표정',
    'studio.note.world': '그 세계의 한 장. 얼굴·생김새·자세는 세계마다 따로 뽑는다.',
    'studio.note.world.casual': '참고 그림이 되는 세계 그림. 일상컷은 그 사람이 지금 일상에 나온 한 장 — 화풍도 그 그림을 따른다. 세계 그림이 아직 없으면 그것부터.',
    'studio.note.era': '지금 현실 · 역사의 자리 · 세계 안 · 무대·환상.',
    'studio.note.place': '시대에 있는 곳만. 장소의 받침(의자·벽·물…)이 뒤의 몸 자세를 거른다.',
    'studio.note.weather': '고르지 않으면 싣지 않는다.',
    'studio.note.ofam': '★ 는 필수 갈래(한 묶음에 한 장 이상). 장소와 어색하면 ⚠ 가 붙는다.',
    'studio.note.item': '자동이면 계열 안에서 장면에 맞게. 「옷 직접 쓰기」(덧붙임)가 이긴다.',
    'studio.note.preset': '자세 · 받침 · 구도 · 손 · 다리를 한 번에 채운다. 그 뒤 칸마다 바꿀 수 있다. 지금 장소에서 그대로 되는 추천만 보인다.',
    'studio.note.posture': '장소의 받침이 받는 자세만.',
    'studio.note.support': '무엇이 몸을 받치나.',
    'studio.note.frame': '프레이밍이 보이는 부위를 정한다 — 그 안에서만 손·다리를 고른다. 렌즈는 자동.',
    'studio.note.body': '가까운 컷엔 뒤쪽 몸 방향이 없다.',
    'studio.note.head': '몸 옆모습에선 고개를 옆으로 못 돌린다(카메라 쪽으로 몸까지 돈다).',
    'studio.note.camera': '',
    'studio.note.right': '인물 본인 기준. 비우면 이 손은 지시문에 싣지 않는다. 「소품 동작」을 고르면 다음에 어떤 소품을 어떻게 쓰나 고른다.',
    'studio.note.left': '인물 본인 기준. 두 손 자세는 다른 손도 같은 값이 된다.',
    'studio.note.use': '소품을 쓰는 손이 있을 때만. 이 장소·시대에 나오는 소품, 이 컷에 보이는 자리, 이 자세로 되는 동작만.',
    'studio.note.legs': '다리가 보이는 컷에서만. 비워도 된다.',
    'studio.note.gaze': '비우면 소품 동작이 정하거나 기본값.',
    'studio.note.expr': '시선은 시선 칸이 정한다 — 표정은 눈썹·눈·입만.',
    'studio.note.expr.hidden': '몸이 「뒤」 이고 고개를 돌리지 않아 얼굴이 안 보인다 — 표정은 고르지 않는다.',
    'studio.note.notes': '비워도 된다 — 설계표와 트리가 지시문을 짓는다. 쓰면 그 글이 더해진다(옷 직접 쓰기는 트리 옷을 대신한다). 일상컷은 여기서 전체 강도·피부 노출도 고른다.',
    'studio.note.done': '칩을 누르면 그 단계로 돌아간다. {where}',
    'studio.note.done.pc': '아래 지시문을 복사해 쓴다.', 'studio.note.done.m': '위 지시문을 아래 「복사」로 쓴다.',
    'studio.note.fixed': '기본값 — 전체 강도 가장 강함 · 피부 노출 많이(덧붙임 칸에서 바꾼다) · 2:3.',
    'studio.axis.fixed': '기본',
    'studio.all': '전체', 'studio.auto': '자동', 'studio.auto.hand': '자동 — 이 손은 싣지 않는다', 'studio.auto.weather': '자동 — 싣지 않는다', 'studio.auto.item': '자동 — 계열 안에서 장면에 맞게',
    'studio.auto.gaze': '자동 — 소품 동작이 정하면 그것', 'studio.preset.none': '고르지 않음 — 칸마다 직접', 'studio.legs.none': '고르지 않음', 'studio.hand.prop': '소품 동작',
    'studio.notes.scene': '장소·상황', 'studio.notes.outfit': '옷 직접 쓰기', 'studio.notes.custom': '추가 연출 요청',
    'studio.notes.n': '{n}칸', 'studio.none': '없음',
    'studio.unlock': '해방 — 트리 밖 선택지도 보기({n})', 'studio.unlock.short': '🔓 해방',
    'studio.unlock.note': '🔓 흐린 것은 이 길에서 빠진 값 — 고르면 기록에 남고 트리가 그 칸을 고치지 않는다.',
    'studio.unlocked': '🔓 트리 밖에서 고른 칸: {fields}',
    'studio.awkward': '⚠ 어색한 조합: {what}',
    'studio.required.star': ' ★',
    'studio.rand.one': '이 칸 랜덤', 'studio.rand.from': '여기부터 다 랜덤', 'studio.rand.all': '처음부터 다 랜덤',
    'studio.rand.one.m': '🎲 이 칸 랜덤', 'studio.rand.from.m': '🎲 여기부터 다 랜덤', 'studio.rand.all.m': '🎲 랜덤', 'studio.rand.menu': '🎲 랜덤 ▾', 'studio.more.menu': '↺ 더 ▾',
    'studio.next': '다음', 'studio.next.m': '다음 ›', 'studio.skip': '건너뛰기', 'studio.skip.m': '건너뛰기 ›', 'studio.done': '다 골랐다', 'studio.todone': '다 골랐다로', 'studio.prev': '이전 단계',
    'studio.restart': '↺ 여기부터 다시', 'studio.restart.title': '뒤 단계를 다 비우고 이 단계부터 다시', 'studio.reset': '↺ 처음부터 다시', 'studio.reset.m': '↺ 처음', 'studio.reset.title': '모든 칸을 비우고 첫 단계부터 다시',
    'studio.status.restart': '여기부터 다시 — 뒤 {n}칸을 비웠다. 이 단계부터 고른다.', 'studio.status.restart.none': '여기부터 다시 — 뒤에 비울 칸이 없다.', 'studio.status.reset': '처음부터 다시 — {n}칸을 비웠다. 첫 단계부터 고른다.',
    'studio.prompt': '지시문', 'studio.words': '{n}낱말', 'studio.copy': '복사', 'studio.copy.m': '📋 복사', 'studio.copied': '복사했다', 'studio.copy.fail': '자동 복사가 안 된다 — 글을 골라 두었다',
    'studio.record': '기록 JSON', 'studio.record.m': '기록', 'studio.sheet': '지시문 {n}', 'studio.close': '닫기', 'studio.more': '펼치기 ▾', 'studio.less': '접기 ▴',
    'studio.file': '올릴 파일 이름', 'studio.art': '이 자리에 등록된 그림', 'studio.casual.n': '일상컷 번호',
    'studio.ref': '참고 그림(첨부)', 'studio.ref.none': '아직 없다 — 세계 그림을 먼저 만든다',
    'studio.loading': '설계표와 트리를 읽는 중…', 'studio.fail': '읽지 못했다 — {what}',
    'studio.invalid': '맞지 않는 칸이 남았다: {fields}',
    /* 트리가 왜 거르나 — lib/casual-tree-v2.js why 의 code */
    'studio.why.unknown': '없는 값', 'studio.why.era': '이 시대엔 없는 곳', 'studio.why.year': '그 해엔 없던 곳', 'studio.why.place': '장소에 받침이 없다({needs})',
    'studio.why.posture': '이 자세에선 안 된다', 'studio.why.banned': '이 공방은 안 쓴다', 'studio.why.close': '가까운 컷에서만(또는 가까운 컷엔 안 보인다)', 'studio.why.far': '가까운 컷엔 뒤쪽 몸 방향이 없다',
    'studio.why.zone': '이 프레이밍엔 그 손 자리가 안 보인다', 'studio.why.outfit': '옷에 {feature}이(가) 없다', 'studio.why.both': '다른 손과 함께 하는 자세·동작', 'studio.why.same': '두 손이 같은 데를 쓴다',
    'studio.why.chin': '두 손이 다 턱을 괸다', 'studio.why.lookback': '뒷모습으로 돌아보는 컷엔 얼굴·머리에 손을 안 댄다', 'studio.why.noprop': '맞는 소품 동작이 없다', 'studio.why.nohand': '소품을 쓰는 손이 없다', 'studio.why.fit': '이 장면엔 안 맞는 소품 동작',
    'studio.why.legs': '다리가 안 보이는 컷', 'studio.why.feet': '발 동작은 전신·환경 컷만', 'studio.why.family': '이 자세 계열의 다리가 아니다', 'studio.why.use': '소품 동작이 시선을 정한다',
    'studio.why.support': '받침이 그 손을 막는다', 'studio.why.back': '등이 카메라 쪽인데 고개를 안 돌렸다', 'studio.why.body': '이 몸 방향과 같이 못 고른다', 'studio.why.required': '필수 갈래 의상엔 안 쓰는 프레이밍',
    'studio.why.companion': '동료 묶음에서만', 'studio.why.path': '이 길에 없다', 'studio.why.preset': '지금 장소·컷에선 그대로 안 된다',
    'studio.feature.pocket': '주머니', 'studio.feature.strap': '어깨끈', 'studio.feature.collar': '옷깃', 'studio.feature.glasses': '안경',
    /* 프레이밍 이름 — 트리 표의 열쇠 */
    'frame.face_close': '얼굴 클로즈업', 'frame.detail': '디테일', 'frame.chest_up': '가슴 위', 'frame.waist_up': '허리 위', 'frame.three_quarter': '3/4', 'frame.full_body': '전신', 'frame.environmental': '환경',
    'studio.lens': '렌즈 자동 — {lens}',

    /* 새 판 살피기 */
    'fresh.notice': '새 판이 나왔습니다. 하던 것을 마치고 눌러 주세요.',
    'fresh.reload': '갈아타기',
    'fresh.close': '닫기',
    'fresh.stamp': '판'
  };

  var missing = [];
  function W(key, vars) {
    var s = WORDS[key];
    if (s == null) { if (missing.indexOf(key) < 0) { missing.push(key); if (root.console) root.console.warn('words: ' + key); } return key; }
    if (vars) s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : '{' + k + '}'; });
    return s;
  }
  var api = { W: W, table: WORDS, load: function (more) { for (var k in more) WORDS[k] = more[k]; }, missing: function () { return missing.slice(); } };
  root.AtelierWords = api;
  root.W = W;
})(typeof window !== 'undefined' ? window : globalThis);
