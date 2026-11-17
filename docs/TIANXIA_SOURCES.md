# 천하 지도 — 성의 주인과 근거

`data/tianxia.json` 에서 뽑은 표다(`node tests/tianxia-data.cjs --write`). 여기를 손으로 고치지 않는다 — 자료를 고치고 다시 뽑는다.

천하 지도 자료 — 성과 판도 다섯(팩 열쇠 그대로)의 주인. 연도 판도 넷은 when 에 적은 그 무렵의 모습이고, 줄마다 why(근거 한 줄)와 src(확인한 주소). 확인이 안 되거나 그해 세력 표에 없는 쪽이 가졌으면 f 가 null(주인 없음 · 다툼). 「주 단위 근거」 는 그 성 하나가 아니라 그 주(州) · 군을 누가 쥐었는지로 적었다는 뜻. 군웅록(mx)은 가상 판도다 — 세력마다 실제로 근거지로 삼았던 성을 주었을 뿐, 세력 사이의 땅 넓이는 사실이 아니다. x · y 는 세로 지도의 백분율(왼쪽 위 0 · 0) — 기준 바탕 그림(무협 밝은 판)의 강 · 분지 · 해안에 맞췄다. 연도 판도의 그해 세력 표는 옛 게임 명단(data/draft2-packs.json)에 추가 명단(data/draft2-roster.json — 사용자 2026-11-17 「추가 명단 넣어서 채워주고」)을 얹은 것이다. lords 는 군주가 여럿인 세력에서 그 판도의 우두머리(막사 가운데에 선다) — 그해 세력 이름으로 못 가리는 곳만, 분명한 곳만 적는다. 사람이 훑어볼 표는 docs/TIANXIA_SOURCES.md(node tests/tianxia-data.cjs --write 가 이 자료에서 뽑는다).

## 군웅록 (`mx`)

모든 영웅이 모인 천하 · 역사의 한 해가 아니다 — 세력마다 실제로 근거지로 삼았던 성을 준 가상 판도

주인 있는 성 33 · 주인 없음 1

| 성 | 주인 | 근거 | 출처 |
|---|---|---|---|
| 낙양 | 진 | 진의 첫 도읍(266~311) — 위도 226~266년 도읍했으나 더 오래 도읍한 진에게 | <https://en.wikipedia.org/wiki/Jin_dynasty_(266–420)> |
| 장안 | 동탁 | 190년 동탁이 헌제와 조정을 옮겨 온 곳 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 허창 | 조위 | 196년 조조가 헌제를 모셔 도읍한 곳 — 위의 첫 도읍(220~226) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 업 | 조위 | 204년 조조가 얻은 뒤 위가 끝까지 가진 기주의 중심 — 원소(191~204)와 겹치나 더 오래 근거한 조위에게 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 남피 | 원소 | 190년 원소가 발해태수로 처음 자리 잡은 발해군 — 업이 조위와 겹쳐 발해를(남피가 그 치소라는 줄은 확인한 자료에 없다) | <https://en.wikipedia.org/wiki/Yuan_Shao> |
| 북평 | 공손찬 | 공손찬이 군사 1만을 두었던 우북평 | <https://en.wikipedia.org/wiki/Gongsun_Zan> |
| 진양 | 원소 | 원소의 조카 고간이 병주를 일곱 해쯤 다스렸다(206년까지) — 진양(태원)이 그 치소라는 줄은 확인한 자료에 없다 | <https://en.wikipedia.org/wiki/Gao_Gan> |
| 하내 | 장양 | 191년 하내태수가 된 장양이 야왕에 자리 잡았다 | <https://en.wikipedia.org/wiki/Zhang_Yang_(warlord)> |
| 진류 | 조위 | 195년 연주를 되찾아 연주목이 된 조조의 땅(주 단위 근거) | <https://en.wikipedia.org/wiki/Cao_Cao> |
| 복양 | 여포 | 194~195년 여포가 차지하고 연주목을 자칭하며 조조와 백여 일을 맞선 곳 | <https://en.wikipedia.org/wiki/L%C3%BC_Bu> |
| 견성 | 조위 | 194년 연주가 등을 돌렸을 때 끝까지 남은 조조의 근거지 | <https://en.wikipedia.org/wiki/Battle_of_Yan_Province> |
| 소패 | 도겸 | 194년 도겸이 유비를 예주자사로 올려 소패에 두었다 — 서주의 중심 하비는 여포에게 주어 도겸에게는 소패를(만든 쪽이 정함) | <https://en.wikipedia.org/wiki/Liu_Bei> |
| 하비 | 여포 | 196년 유비에게서 빼앗아 199년 2월 죽을 때까지 서주를 다스린 곳 | <https://en.wikipedia.org/wiki/L%C3%BC_Bu> |
| 여남 | 황건 | 여남 · 영천의 황건 잔당(하의 · 유벽 · 황소)이 190년대까지 버틴 곳 | <https://en.wikipedia.org/wiki/Yellow_Turban_Rebellion> |
| 수춘 | 원술 | 193년부터 원술의 본거지 — 197년 여기서 황제를 자칭했다 | <https://en.wikipedia.org/wiki/Yuan_Shu> |
| 합비 | 조위 | 200년 조조의 양주자사 유복이 성을 쌓아 치소로 삼은 뒤 위가 오를 막아 낸 곳 | <https://en.wikipedia.org/wiki/Liu_Fu_(Yuanying)> |
| 건업 | 동오 | 211년 손권이 본영을 말릉으로 옮기고 이듬해 건업이라 고쳤다 — 오의 도읍(229~265 · 266~280) | <https://en.wikipedia.org/wiki/Sun_Quan> |
| 오 | 동오 | 195년 주치가 허공을 꺾고 손책에게 바친 오군 — 손씨의 강동 | <https://en.wikipedia.org/wiki/Sun_Ce%27s_conquests_in_Jiangdong> |
| 회계 | 동오 | 196년 손책이 왕랑을 꺾고 스스로 회계태수가 되었다 | <https://en.wikipedia.org/wiki/Sun_Ce%27s_conquests_in_Jiangdong> |
| 시상 | 동오 | 후한 말 제갈량이 와서 손권과 조조에 맞설 일을 꾀한 곳 — 삼국 때 오의 강하군 | <https://zh.wikipedia.org/wiki/柴桑县> |
| 강하 | 유표 | 유표의 강하태수 황조가 지킨 곳(208년 봄 손권에게 죽을 때까지) | <https://en.wikipedia.org/wiki/Liu_Biao> |
| 양양 | 유표 | 유표가 형주의 치소를 옮겨 온 곳 — 208년 여기서 죽었다 | <https://en.wikipedia.org/wiki/Jing_Province> |
| 완 | 장수 | 숙부 장제가 죽은 뒤 장수가 완에 자리 잡고 유표와 손잡았다 | <https://en.wikipedia.org/wiki/Zhang_Xiu_(warlord)> |
| 강릉 | 유표 | 유표의 형주 남군 — 208년 조조가 얻기 전까지(주 단위 근거) | <https://en.wikipedia.org/wiki/Jing_Province> |
| 장사 | 유표 | 유표가 장사군을 평정하고 유반 · 황충에게 지키게 했다 | <https://en.wikipedia.org/wiki/Liu_Biao> |
| 한중 | 장로 | 장로가 한녕이라 고쳐 215년까지 다스린 곳 — 뒤에 촉한도 가졌으나 장로의 하나뿐인 근거지라 장로에게(만든 쪽이 정함) | <https://en.wikipedia.org/wiki/Zhang_Lu_(Han_dynasty)> |
| 성도 | 촉한 | 214년 유비가 얻어 221~263년 촉한의 도읍 — 유장(194~214)과 겹치나 더 오래 근거한 촉한에게 | <https://en.wikipedia.org/wiki/Shu_Han> |
| 강주 | 유장 | 유장의 익주 — 성도가 촉한과 겹쳐 익주의 다른 큰 성을(만든 쪽이 정함, 주 단위 근거) | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 영안 | 촉한 | 촉한의 파동군 영안(어복) — 263년 나헌이 끝까지 지킨 동쪽 관문 | <https://en.wikipedia.org/wiki/Conquest_of_Shu_by_Wei> |
| 금성 | 서량 | 한수의 고향 — 192년 진서장군이 되어 금성으로 돌아갔다 | <https://zh.wikipedia.org/wiki/韓遂> |
| 천수 | 서량 | 211년 뒤 마초가 양주자사 위강을 죽이고 양주의 치소 기성(천수)을 차지했다 | <https://en.wikipedia.org/wiki/Ma_Chao> |
| 운남 | 남만 | 남중의 우두머리 맹획(건녕 사람)의 땅 — 운남군은 225년 제갈량이 남중에 둔 군 | <https://en.wikipedia.org/wiki/Meng_Huo> |
| 교지 | 교주 | 사섭이 187년 교지태수가 되어 마흔 해를 다스렸다 | <https://en.wikipedia.org/wiki/Shi_Xie> |

주인 없음 · 다툼

| 성 | 사정 | 출처 |
|---|---|---|
| 양평 | 요동은 공손도 집안 삼대(189~238)의 땅 — 우리 세력 표에 그 세력이 없다 | <https://en.wikipedia.org/wiki/Sima_Yi%27s_Liaodong_campaign> |

세력의 한 줄

- **조위** — 조조가 헌제를 허에 모시고(196) 업을 얻어(204) 화북을 아우른 나라.
- **촉한** — 유비가 214년 성도를 얻고 221년에 세운 나라 — 263년까지.
- **동오** — 손책이 강동을 평정하고 손권이 건업에 도읍한 나라.
- **진** — 사마염이 266년 위를 이어 낙양에 세운 나라.
- **원소** — 발해태수에서 기주의 주인으로 — 199년 황하 북쪽 네 주를 쥐었다.
- **동탁** — 190년 낙양을 불태우고 조정을 장안으로 옮겼다.
- **여포** — 복양에서 조조와 맞서고, 하비에서 서주를 다스리다 199년에 졌다.
- **원술** — 수춘에 자리 잡고 197년 황제를 자칭했다.
- **유표** — 양양에서 208년까지 형주를 다스렸다.
- **유장** — 아버지 유언을 이은 익주목 — 214년 유비에게 성도를 내주었다.
- **공손찬** — 우북평에 군사를 두고 유주를 쥐었다가 199년 역경에서 졌다.
- **서량** — 양주(涼州)의 마등 · 한수 · 마초.
- **장로** — 한중을 한녕이라 고쳐 제 교단의 법으로 다스렸다 — 215년 조조에게 항복.
- **황건** — 184년에 일어난 황건 — 여남 · 영천의 남은 무리는 190년대까지 버텼다.
- **도겸** — 서주목 — 194년 병으로 죽으며 서주를 유비에게 맡겼다.
- **장수** — 숙부 장제를 이어 완에 자리 잡고 조조와 싸우다 항복했다.
- **남만** — 남중의 맹획 — 223년 뒤 옹개의 난에 함께했다가 제갈량에게 복종했다.
- **교주** — 사섭이 교지를 마흔 해 다스렸다.
- **장양** — 하내태수 — 야왕에 자리 잡았고 198년 부하에게 죽었다.
- **한조정** — 제 땅 없이 한나라 조정에 선 사람들 — 지도에는 성이 없다.
- **재야** — 벼슬 없이 세상 밖에 머문 사람들 — 지도에는 성이 없다.

## 195 군웅할거 (`w194`)

195 겨울 — 조조가 연주를 되찾고 손책이 강을 건넌 해 · 195년 겨울(12월 말) — 옹구가 떨어져 연주가 평정되고, 여포는 서주의 유비에게 얹혀 있으며, 헌제는 장안을 떠나 하동 안읍에 닿은 무렵(여포의 하비 습격 · 장수의 완 주둔 · 손책의 회계 정벌은 모두 196년)

주인 있는 성 20 · 주인 없음 14

| 성 | 주인 | 근거 | 출처 |
|---|---|---|---|
| 업 | 원소 | 191년 한복에게서 기주를 넘겨받아 업을 근거로 삼았다 — 195년에도 기주의 주인(주 단위 근거) | <https://en.wikipedia.org/wiki/Yuan_Shao> |
| 하내 | 장양 | 하내태수 장양의 땅 — 동탁이 건의장군 · 하내태수로 삼은 뒤 건안 3~4년 부하 양추에게 죽을 때까지 지켰다 | <https://zh.wikisource.org/wiki/三國志/卷08> |
| 진류 | 조위 | 가을 8월부터 에워싼 진류군 옹구가 12월에 무너져 장초가 죽고 장막도 부하에게 죽었다 — 무제기는 이로써 「연주가 평정되었다」 고 적는다(군 단위 근거) | <https://zh.wikisource.org/wiki/三國志/卷01> |
| 견성 | 조위 | 194년 9월부터 조조의 근거지 — 195년 여름 여포를 내쫓고 겨울 10월 조정이 조조를 연주목으로 삼았다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 소패 | 도겸 | 194년 말 도겸이 죽고 유비가 서주를 물려받았다 — 여포가 하비를 빼앗고 유비를 소패에 두는 것은 196년의 일이라 195년 말에는 유비의 땅. 여포가 얹혀 지낸 곳이 소패라는 줄은 확인한 자료에 없다(유비는 그해 서주군) | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 하비 | 도겸 | 194년 말 도겸이 죽고 유비가 서주를 물려받았다 — 원술이 유비를 치고 그 틈에 여포가 하비를 덮친 것은 196년이라 195년 말에는 유비의 땅(유비는 그해 서주군) | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 수춘 | 원술 | 193년 봉구에서 지고 구강의 수춘으로 옮겨 자리 잡은 뒤 줄곧 원술의 본거지 — 195년 손책이 강을 건넌 뒤 주상 · 주유도 수춘으로 돌아갔다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 건업 | 동오 | 195년 손책이 강을 건너 우저를 빼앗고 말릉의 설례 · 착융을 친 뒤 호숙 · 강승을 떨어뜨리고 곡아에 들어갔다 — 유요는 단도를 거쳐 예장으로 달아났다. 자치통감은 이를 195년 끝에 달 없이 적으며, 말릉 성 자체는 착융이 굳게 지켜 손책이 한 번 버려두고 지나갔다는 줄도 있다(군 단위 근거) | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 회계 | 왕랑 | 조정이 임명한 회계태수 왕랑의 땅 — 손책이 왕랑을 쳐 동야로 내쫓은 것은 196년 | <https://zh.wikisource.org/wiki/三國志/卷13> |
| 시상 | 유요 | 시상이 속한 예장군 — 곡아에서 밀려난 양주자사 유요가 강을 거슬러 예장을 지키며 팽택에 머물렀고, 태수 주호를 죽인 착융을 쳐서 깨뜨렸다. 자치통감은 이를 195년 끝에 달 없이 적는다(군 단위 근거) | <https://zh.wikisource.org/wiki/三國志/卷49> |
| 강하 | 유표 | 유표의 강하태수 황조 — 191년 손견과 싸웠고 208년까지 지켰다(195년 그 한 해의 기록은 없다) | <https://en.wikipedia.org/wiki/Liu_Biao> |
| 양양 | 유표 | 형주를 맡은 유표가 치소를 북쪽 양양으로 옮겼다(190년부터 형주) | <https://en.wikipedia.org/wiki/Jing_Province> |
| 강릉 | 유표 | 191~207년 유표가 형주를 다스렸다(주 단위 근거) | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 장사 | 유표 | 유표의 형주 — 장사태수 장선이 유표를 등진 것은 200년(주 단위 근거) | <https://en.wikipedia.org/wiki/Huan_Jie> |
| 한중 | 장로 | 장로가 한중을 차지해 「사군」 이라 일컬으며 다스렸다(215년 조조에게 항복할 때까지) | <https://zh.wikisource.org/wiki/三國志/卷08> |
| 성도 | 유장 | 유언이 치소를 성도로 옮기고 194년에 죽자 아들 유장이 익주를 이었다 | <https://zh.wikisource.org/wiki/三國志/卷31> |
| 강주 | 유장 | 194년 유언을 이은 익주목 유장의 땅(주 단위 근거) | <https://zh.wikisource.org/wiki/三國志/卷31> |
| 영안 | 유장 | 194년 유언을 이은 익주목 유장의 땅(주 단위 근거 — 이때 이름은 어복) | <https://zh.wikisource.org/wiki/三國志/卷31> |
| 금성 | 서량 | 192년 금성으로 돌아간 한수 — 194년 마등과 장안을 쳤다가 장평관에서 지고 양주(涼州)로 물러난 뒤 그대로다(195년 그 한 해의 기록은 없다, 주 단위 근거) | <https://zh.wikipedia.org/wiki/韓遂> |
| 교지 | 교주 | 교지태수 사섭(187~226)의 땅 — 형제가 여러 군을 맡아 한 주를 쥐었다 | <https://zh.wikisource.org/wiki/三國志/卷49> |

주인 없음 · 다툼

| 성 | 사정 | 출처 |
|---|---|---|
| 낙양 | 190년 동탁이 불태운 뒤 폐허 — 헌제는 195년 7월 장안을 떠나 12월에 하동 안읍에 닿았고 낙양에 든 것은 196년 7월이라, 그해 겨울 낙양의 주인은 분명치 않다 | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 장안 | 헌제가 7월 장안을 떠났고 이각 · 곽사 · 장제는 겨울에 어가를 쫓아 홍농까지 나와 싸웠다 — 그해 겨울 장안의 주인을 적은 줄은 없다(이각 · 곽사는 추가 명단으로 동탁 세력에 들었으나 성은 비워 둔다) | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 허창 | 영천 · 여남에 황건 잔당이 버티던 때(196년 조조가 평정) — 그해 허의 주인을 적은 자료를 찾지 못했다 | <https://en.wikipedia.org/wiki/Yellow_Turban_Rebellion> |
| 남피 | 191년 말 발해의 군사가 공손범을 따라 공손찬에게 넘어갔고 192년 용주에서 진 공손찬이 유주로 물러났다 — 그 뒤 195년 발해(남피)의 주인을 적은 줄은 찾지 못했다 | <https://zh.wikipedia.org/wiki/公孫瓚> |
| 북평 | 195년 유우의 옛 부하들과 원소군이 포구에서 공손찬을 크게 이기자 대군 · 광양 · 상곡 · 우북평이 공손찬이 둔 관리를 죽였고 공손찬은 역(易)으로 옮겼다 — 달은 기록에 없으나 그해의 일이라 연말에는 공손찬 손을 떠난 것으로 보며, 넘어간 쪽(유화 · 선우보)은 우리 그해 세력 표에 없다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 양평 | 189년 말부터 요동태수 공손도의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Sima_Yi%27s_Liaodong_campaign> |
| 진양 | 그해 병주(태원)의 주인을 적은 자료를 찾지 못했다 | <https://en.wikipedia.org/wiki/Gao_Gan> |
| 복양 | 무제기는 12월 옹구 함락으로 연주가 평정되었다고 적지만, 동군은 194년 원소가 진궁에게서 빼앗아 장홍을 태수(동무양)로 두었고 장홍은 옹구 구원을 거절당한 뒤 원소와 갈라서 해를 넘겨 에워싸였다 — 195년 말 복양 성 자체가 조조 · 원소 · 장홍 가운데 누구 것인지 적은 줄은 찾지 못했다 | <https://zh.wikipedia.org/wiki/臧洪> |
| 여남 | 황건 잔당이 버티던 때(196년 조조가 평정) — 비워 둔다(사용자 2026-11-17 「여남은 비워두자」) | <https://en.wikipedia.org/wiki/Yellow_Turban_Rebellion> |
| 합비 | 그해 합비의 주인을 적은 자료를 찾지 못했다(합비가 든 구강군의 수춘은 원술의 것) | <https://en.wikipedia.org/wiki/Yuan_Shu> |
| 오 | 오군태수 허공의 땅 — 그해 세력 표에 없다. 손책 쪽 주치가 허공을 내쫓고 오군을 차지했다는 줄을 자치통감은 195년 끝에 달 없이 적지만, 영어 위키백과도 때를 못 박지 않아 195년 안의 일인지 가릴 수 없다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 완 | 장제는 195년 겨울 이각 · 곽사와 함께 홍농에서 어가를 쫓고 있었다 — 장제가 양(穰)을 치다 죽고 장수가 완에 주둔하는 것은 196년이며, 그해 완의 주인을 적은 자료를 찾지 못했다 | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 천수 | 그해 한양군(천수)의 주인을 적은 자료를 찾지 못했다 | <https://zh.wikipedia.org/wiki/韓遂> |
| 운남 | 남중 — 운남군은 225년에야 생긴다. 그해 남중의 사정은 확인한 자료에 없다 | <https://en.wikipedia.org/wiki/Zhuge_Liang%27s_Southern_Campaign> |

세력의 한 줄

- **조위** — 여름에 거야에서 여포를 깨뜨리고 겨울 10월 연주목이 되었다 — 12월 옹구를 떨어뜨려 연주를 되찾고 동쪽 진(陳) 땅으로 나아간다.
- **원소** — 업의 기주 — 북쪽에서는 유우의 옛 부하들을 도와 포구에서 공손찬을 꺾었고, 옹구 구원을 청한 동군태수 장홍이 등을 돌리자 동무양을 에워싼다.
- **동오** — 손책이 원술의 군사를 빌려 강을 건넜다 — 우저 · 곡아를 빼앗아 유요를 예장으로 내쫓았으나 아직 원술의 장수이고, 회계 정벌은 이듬해다.
- **여포** — 여름에 조조에게 크게 지고 서주의 유비에게 달아나 얹혀 있다 — 12월 옹구가 떨어져 장막 형제도 죽어, 하비를 빼앗는 196년까지 제 성이 없다.
- **도겸** — 194년 말 도겸이 죽고 유비가 서주를 물려받았다 — 달아난 여포를 받아들였고, 원술과 싸우다 하비를 잃는 것은 이듬해다.
- **유표** — 양양에서 형주를 다스린다.
- **공손찬** — 유우를 죽인 뒤 민심을 잃어 포구에서 크게 지고 여러 군이 등을 돌렸다 — 역경으로 옮겨 틀어박히며, 지도에는 성이 없다.
- **서량** — 194년 장평관에서 진 뒤 한수 · 마등이 양주(涼州)에 물러나 있다.
- **원술** — 수춘에 자리 잡고 손책을 시켜 강동의 유요를 내쫓았다 — 이듬해 서주의 유비를 친다.
- **장수** — 숙부 장제가 이각 · 곽사와 함께 홍농에서 어가를 쫓던 때 — 완에 드는 것은 196년이라 이해엔 제 성이 없다.
- **유장** — 194년 아버지 유언이 죽자 익주를 이었다 — 214년까지 익주의 주인.
- **장로** — 유언 때 한중을 차지해 「사군」 이라 일컬으며 다스린다 — 215년 조조에게 항복할 때까지.
- **장양** — 동탁이 건의장군 · 하내태수로 삼은 뒤 줄곧 하내에 있다 — 원소를 떠나온 동소가 곁에 머문다.
- **교주** — 교지태수 사섭 — 형제가 여러 군을 맡아 한 주를 쥐었다.
- **왕랑** — 조정이 임명한 회계태수 왕랑 — 손책에게 져서 동야로 달아나는 것은 이듬해다.
- **유요** — 조서로 양주자사가 되어 곡아에 있다가 손책에게 밀려 예장(팽택)으로 옮겼다.
- **동탁** — 동탁의 옛 장수 이각 · 곽사 — 겨울에 동쪽으로 가는 어가를 쫓았다. 그해 겨울 장안의 주인을 적은 줄이 없어 지도에는 성이 없다.
- **한조정** — 장안을 떠난 헌제를 동승과 양봉 밑의 서황이 호위해 12월 안읍에 닿았다 — 북해에는 공융이 있으나 지도에는 성이 없다.
- **황건** — 흑산의 우두머리 장연(흑산적을 세력 열쇠 「황건」 으로 적었다)과 연의의 주창 — 지도에는 성이 없다(여남은 비워 두었다).
- **재야** — 오 사람 엄백호 무리가 저마다 만여 명으로 곳곳에 진을 치고 있다 — 손책이 깨뜨리는 것은 회계를 얻은 뒤다.

추가 명단 31명 — 옛 게임 명단(`data/draft2-packs.json`) 위에 얹은 장수(`data/draft2-roster.json`)

| 세력 | 장수 | 근거 | 출처 |
|---|---|---|---|
| 유장 | 유장 | 흥평 원년(194) 아버지 유언이 등창으로 죽고 익주를 이었다 — 214년까지 익주의 주인 | <https://zh.wikisource.org/wiki/三國志/卷31> |
| 유장 | 오의 | 아버지가 유언과 옛 벗이라 온 집안이 유언을 따라 촉에 들어갔고, 유장 때 중랑장이었다(오일 = 오의) | <https://zh.wikisource.org/wiki/三國志/卷34> |
| 유장 | 장임 | 섬기기 시작한 해는 기록에 없다 — 유장의 장수로 넣는다(사용자 2026-11-17 「유장, 장로 쪽 장수들 넣어줘」) | <https://en.wikipedia.org/wiki/Zhang_Ren> |
| 유장 | 엄안 | 섬기기 시작한 해는 기록에 없다 — 유장의 장수로 넣는다(사용자 2026-11-17 「유장, 장로 쪽 장수들 넣어줘」) | <https://en.wikipedia.org/wiki/Yan_Yan> |
| 유장 | 황권 | 섬기기 시작한 해는 기록에 없다 — 유장의 장수로 넣는다(사용자 2026-11-17 「유장, 장로 쪽 장수들 넣어줘」) | <https://en.wikipedia.org/wiki/Huang_Quan_(general)> |
| 유장 | 장송 | 섬기기 시작한 해는 기록에 없다 — 유장의 장수로 넣는다(사용자 2026-11-17 「유장, 장로 쪽 장수들 넣어줘」) | <https://en.wikipedia.org/wiki/Zhang_Song> |
| 장로 | 장로 | 유언 때 한중을 차지해 「사군」 이라 일컬으며 215년까지 다스렸다(차지한 해는 본전에 없다 — 190년대 초) | <https://zh.wikisource.org/wiki/三國志/卷08> |
| 장로 | 염포 | 섬기기 시작한 해는 기록에 없다 — 장로의 장수로 넣는다(사용자 2026-11-17 「유장, 장로 쪽 장수들 넣어줘」) | <https://en.wikipedia.org/wiki/Yan_Pu> |
| 장로 | 양송 | 섬기기 시작한 해는 기록에 없다 — 장로의 장수로 넣는다(사용자 2026-11-17 「유장, 장로 쪽 장수들 넣어줘」) · 양송은 연의의 인물 | <https://en.wikipedia.org/wiki/Yang_Song> |
| 동탁 | 이각(군주) | 동탁의 옛 장수 — 195년 3월 번조를 죽이고, 겨울에 곽사와 함께 동쪽으로 가는 어가를 쫓았다. 198년에 죽는다 | <https://en.wikipedia.org/wiki/Li_Jue_(Han_dynasty)> |
| 동탁 | 곽사 | 동탁의 옛 장수 — 195년 겨울 이각과 함께 어가를 쫓았고 뒤에 미(郿)에서 부하 오습에게 죽는다 | <https://zh.wikisource.org/wiki/三國志/卷06> |
| 장양 | 장양 | 동탁이 건의장군 · 하내태수로 삼은 뒤 줄곧 하내에 있었다 — 건안 3~4년 부하 양추에게 죽는다 | <https://zh.wikisource.org/wiki/三國志/卷08> |
| 장양 | 동소 | 원소를 떠나 헌제에게 가다가 하내에서 장양에게 붙들려 머물렀고, 천자가 안읍에 있을 때 하내에서 가서 의랑이 되었다(196) — 195년 말에는 장양 곁 | <https://zh.wikisource.org/wiki/三國志/卷14> |
| 교주 | 사섭 | 교지태수 — 형제가 여러 군을 맡아 한 주를 쥐었다(210년 손권의 보즐을 받아들일 때까지 홀로 섰다) | <https://zh.wikisource.org/wiki/三國志/卷49> |
| 유요 | 유요 | 조서로 양주자사가 되어 곡아에 있다가 195년 손책에게 밀려 예장(팽택)으로 옮겼다 — 198년 무렵 42세로 죽는다 | <https://zh.wikisource.org/wiki/三國志/卷49> |
| 왕랑 | 왕랑(군주) | 조정이 임명한 회계태수 — 손책에게 져서 동야로 달아나는 것은 196년 | <https://zh.wikisource.org/wiki/三國志/卷13> |
| 왕랑 | 우번 | 회계태수 왕랑의 공조 — 손책이 회계를 칠 때(196) 부친상 중에도 왕랑에게 피하라고 권했다 | <https://zh.wikisource.org/wiki/三國志/卷57> |
| 한조정 | 동승 | 195년 이각 · 곽사에게서 벗어나 동쪽으로 가는 헌제를 호위한 장수(200년 2월에 처형된다) | <https://en.wikipedia.org/wiki/Dong_Cheng_(Han_dynasty)> |
| 한조정 | 서황 | 양봉 밑의 기도위로 천자를 낙양으로 모시자고 권했고, 천자가 황하를 건너 안읍에 닿자(195년 12월) 도정후에 봉해졌다 — 조조에게 가는 것은 196년 | <https://zh.wikisource.org/wiki/三國志/卷17> |
| 한조정 | 공융 | 북해상(190~196) — 196년 원담에게 져서 허로 달아날 때까지 북해를 지켰다 | <https://en.wikipedia.org/wiki/Kong_Rong> |
| 황건 | 장연(군주) | 흑산의 우두머리 — 무리가 백만이라 일컬었고 205년에야 조조에게 항복한다(흑산적을 세력 열쇠 「황건」 으로 적었다) | <https://zh.wikisource.org/wiki/三國志/卷08> |
| 황건 | 주창 | 연의의 인물 — 장보 밑의 황건이었다가 와우산의 도적이 되어, 관우를 만나기(200년) 전까지 그대로다. 정사에는 없다 | <https://en.wikipedia.org/wiki/Zhou_Cang> |
| 재야 | 엄백호 | 오 사람 엄백호 무리가 저마다 만여 명으로 곳곳에 진을 치고 있었다 — 손책이 회계를 얻은 뒤(196)에야 깨뜨렸다 | <https://zh.wikisource.org/wiki/三國志/卷46> |
| 재야 | 엄여 | 엄백호의 아우 — 손책이 회계를 얻은 뒤 형의 화친 사자로 갔다가 손책의 수극에 죽는다(196년 뒤) | <https://zh.wikisource.org/wiki/三國志/卷46> |
| 원소 | 원담 | 193년 원소가 맏아들 원담을 청주로 내보내 전해와 맞서게 했고 196년 공융의 북해를 빼앗는다 | <https://en.wikipedia.org/wiki/Yuan_Tan> |
| 원소 | 신비 | 형 신평을 따라 원소를 섬겼다 — 조조가 사공이 되어(196) 불렀으나 가지 못했다 | <https://zh.wikisource.org/wiki/三國志/卷25> |
| 동오 | 여범 | 수춘에서 식객 백 명을 데리고 손책에게 몸을 맡겼고, 여강을 친 뒤 함께 강을 건너 횡강 · 당리에 이르렀다(195) | <https://zh.wikisource.org/wiki/三國志/卷56> |
| 동오 | 주치 | 손견 때부터의 장수 — 손책을 도와 오군태수 허공을 유권에서 깨뜨리고 오군에 들어가 태수 일을 맡았다 | <https://zh.wikisource.org/wiki/三國志/卷56> |
| 동오 | 능조 | 손책이 처음 일어났을 때부터 싸움마다 따라 늘 앞장섰다(능통전 첫머리) | <https://zh.wikisource.org/wiki/三國志/卷55> |
| 동오 | 진무 | 손책이 수춘에 있을 때 열여덟 살로 찾아가 뵙고 따라서 강을 건넜다 | <https://zh.wikisource.org/wiki/三國志/卷55> |
| 도겸 | 감부인 | 유비가 예주자사로 소패에 머물 때(194~) 첩으로 들였다 — 그해 유비는 서주군 | <https://zh.wikisource.org/wiki/三國志/卷34> |

## 200 관도 (`gd200`)

200 — 조조와 원소가 황하에서 맞서다 · 200년 봄~여름 — 조조가 서주를 되찾고 유비가 원소에게 간 뒤, 관도 싸움 무렵

주인 있는 성 27 · 주인 없음 7

| 성 | 주인 | 근거 | 출처 |
|---|---|---|---|
| 낙양 | 조위 | 196년 조조가 낙양에 들어 헌제를 허로 옮겼고, 조조가 올린 사례교위 종요가 낙양 백성을 관중으로 옮겨 다스렸다 | <https://zh.wikipedia.org/wiki/鍾繇> |
| 장안 | 조위 | 조조가 올린 사례교위 종요가 건안 4년 12월(양력 200년 1월) 장안에 부임해 관중의 군사를 맡았다 | <https://zh.wikipedia.org/wiki/鍾繇> |
| 허창 | 조위 | 196년 조조가 헌제를 허로 모셔 새 도읍으로 삼았다 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 업 | 원소 | 기주의 치소 — 191~202년 원소의 본거지 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 남피 | 원소 | 199년 초 원소가 황하 북쪽 네 주를 쥐었다 — 기주 발해군(주 단위 근거) | <https://en.wikipedia.org/wiki/Yuan_Shao> |
| 북평 | 원소 | 199년 역경에서 공손찬을 꺾고 그 땅을 아울렀다(주 단위 근거) | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 진양 | 원소 | 199년 초 원소가 황하 북쪽 네 주를 쥐었고 조카 고간이 병주를 맡았다(주 단위 근거) | <https://en.wikipedia.org/wiki/Gao_Gan> |
| 하내 | 조위 | 198년 장양이 죽고 그 무리를 이끈 수고를 조조군(사환 · 조인 등)이 쳐서 하내를 아울렀다 | <https://zh.wikipedia.org/wiki/眭固> |
| 진류 | 조위 | 195년 조조가 연주의 성을 모두 되찾았다(주 단위 근거) | <https://en.wikipedia.org/wiki/Battle_of_Yan_Province> |
| 복양 | 조위 | 195년 조조가 연주의 성을 모두 되찾았다(주 단위 근거) | <https://en.wikipedia.org/wiki/Battle_of_Yan_Province> |
| 견성 | 조위 | 195년 조조가 연주의 성을 모두 되찾았다(주 단위 근거) | <https://en.wikipedia.org/wiki/Battle_of_Yan_Province> |
| 소패 | 조위 | 유비가 차주를 죽이고 서주를 차지해 소패에 있었으나 조조가 쳐서 되찾았다 | <https://en.wikipedia.org/wiki/Liu_Bei> |
| 하비 | 조위 | 유비가 서주를 차지해 관우가 하비를 지켰으나 조조가 쳐서 되찾았다(관우는 그해 조조군) | <https://en.wikipedia.org/wiki/Liu_Bei> |
| 합비 | 조위 | 조조가 올린 양주자사 유복이 치소를 합비로 옮기고 성을 쌓았다 | <https://en.wikipedia.org/wiki/Liu_Fu_(Yuanying)> |
| 건업 | 동오 | 195년 손책이 유요를 꺾고 강동을 평정했다 — 말릉 한 곳을 얻었다는 줄은 없다(지역 단위 근거) | <https://en.wikipedia.org/wiki/Sun_Ce%27s_conquests_in_Jiangdong> |
| 오 | 동오 | 195년 무렵 주치가 허공을 꺾고 오군을 손책에게 바쳤다 | <https://en.wikipedia.org/wiki/Sun_Ce%27s_conquests_in_Jiangdong> |
| 회계 | 동오 | 196년 손책이 왕랑을 꺾고 스스로 회계태수가 되었다 | <https://en.wikipedia.org/wiki/Sun_Ce%27s_conquests_in_Jiangdong> |
| 시상 | 동오 | 199~200년 무렵 화흠이 항복해 손책이 예장군을 얻었다(시상은 후한의 예장군 — 군 단위 근거) | <https://en.wikipedia.org/wiki/Sun_Ce%27s_conquests_in_Jiangdong> |
| 강하 | 유표 | 강하태수 황조가 208년 봄 손권에게 죽을 때까지 지켰다 | <https://en.wikipedia.org/wiki/Sun_Quan> |
| 양양 | 유표 | 형주목 유표의 치소 | <https://en.wikipedia.org/wiki/Jing_Province> |
| 완 | 조위 | 199~200년 겨울 장수가 조조에게 다시 항복했다 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 강릉 | 유표 | 191~207년 유표가 형주를 다스렸다(주 단위 근거) | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 한중 | 장로 | 장로가 한중을 한녕이라 고쳐 다스렸다(190~208년 장로의 땅) | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 성도 | 유장 | 익주의 치소 — 그해 조위(趙韙)의 난에 유장이 성도에서 버텼다 | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 영안 | 유장 | 익주목 유장의 땅(주 단위 근거 — 이때 이름은 어복) | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 금성 | 서량 | 마등 · 한수가 양주(涼州)를 쥐고 있었다 — 197년 조조에게 복종(주 단위 근거) | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 교지 | 교주 | 교지태수 사섭(187~226)의 땅 — 형제가 여러 군을 맡아 한 주를 쥐었다 | <https://zh.wikisource.org/wiki/三國志/卷49> |

주인 없음 · 다툼

| 성 | 사정 | 출처 |
|---|---|---|
| 양평 | 요동태수 공손도의 땅(204년까지) — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Sima_Yi%27s_Liaodong_campaign> |
| 여남 | 유벽이 원소 편에서 일어나고 유비가 도우러 와 조인과 싸우던 때 — 다투는 중(유벽이 196년에 죽었다는 자료와도 엇갈린다) | <https://en.wikipedia.org/wiki/Battle_of_Guandu> |
| 수춘 | 199년 원술이 죽은 뒤 수춘의 주인을 적은 자료를 찾지 못했다 — 회남은 폐허였고 조조의 양주자사 유복은 합비에 자리했다 | <https://en.wikipedia.org/wiki/Liu_Fu_(Yuanying)> |
| 장사 | 관도 싸움 때 장사태수 장선이 무릉 · 영릉 · 계양과 함께 유표를 등지고 조조 편에 섰고 유표가 장사를 쳤다 — 다투는 중 | <https://en.wikipedia.org/wiki/Huan_Jie> |
| 강주 | 그해 유장에게 반란한 조위(趙韙)가 져서 강주로 물러났다가 죽었다 — 다투는 중 | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 천수 | 그해 한양군(천수)의 주인을 적은 자료를 찾지 못했다 | <https://zh.wikipedia.org/wiki/韓遂> |
| 운남 | 남중 — 운남군은 225년에야 생긴다. 유장 때 남중의 사정은 확인한 자료에 없다 | <https://en.wikipedia.org/wiki/Zhuge_Liang%27s_Southern_Campaign> |

세력의 한 줄

- **조위** — 헌제를 허에 모시고 황하 남쪽을 거의 쥐었다 — 서주의 유비를 내쫓고 관도에서 원소와 맞선다.
- **원소** — 199년 역경에서 공손찬을 꺾어 황하 북쪽 네 주를 쥐고 남으로 내려온다.
- **유표** — 원소를 도우려 했으나 장사태수 장선이 등을 돌렸다.
- **동오** — 손책이 강동을 평정했으나 이해에 죽고 손권이 이었다.
- **유장** — 아버지 유언을 이은 익주목 — 이해 조위(趙韙)가 반란해 성도에서 버텼다.
- **서량** — 사례교위 종요의 설득으로 마등 · 한수가 조정에 복종해 아들을 인질로 보냈다.
- **장로** — 한중을 한녕이라 고쳐 다스리며 유장의 명을 듣지 않아 원수가 되었다.
- **교주** — 교지태수 사섭 — 형제가 여러 군을 맡아 한 주를 쥐었다.
- **황건** — 흑산의 우두머리 장연(흑산적을 세력 열쇠 「황건」 으로 적었다) — 205년에야 조조에게 항복한다. 연의의 주창은 와우산의 도적. 지도에는 성이 없다.

추가 명단 22명 — 옛 게임 명단(`data/draft2-packs.json`) 위에 얹은 장수(`data/draft2-roster.json`)

| 세력 | 장수 | 근거 | 출처 |
|---|---|---|---|
| 교주 | 사섭 | 교지태수 — 형제가 여러 군을 맡아 한 주를 쥐었다(210년 손권의 보즐을 받아들일 때까지 홀로 섰다) | <https://zh.wikisource.org/wiki/三國志/卷49> |
| 황건 | 장연(군주) | 흑산의 우두머리 — 건안 10년(205)에야 무리 십여 만을 이끌고 조조에게 항복한다(흑산적을 세력 열쇠 「황건」 으로 적었다) | <https://zh.wikisource.org/wiki/三國志/卷01> |
| 황건 | 주창 | 연의의 인물 — 황건 잔당으로 와우산의 도적이다가 관우의 천리행 때 따른다(그해 관우는 아직 조조군). 정사에는 없다 | <https://en.wikipedia.org/wiki/Zhou_Cang> |
| 조위 | 가후 | 관도에서 원소와 맞설 때 장수를 설득해 조조에게 항복시켰고(건안 4년 11월) 집금오 · 도정후, 참사공군사가 되었다 | <https://zh.wikisource.org/wiki/三國志/卷10> |
| 조위 | 장수 | 건안 4년 겨울 11월 무리를 이끌고 조조에게 항복했고 관도 싸움에서 힘껏 싸워 파강장군이 되었다 | <https://zh.wikisource.org/wiki/三國志/卷08> |
| 조위 | 진군 | 여포가 깨진 뒤(199년 초) 조조가 사공서조연속으로 불러 썼다 | <https://zh.wikisource.org/wiki/三國志/卷22> |
| 조위 | 진등 | 197년부터 조조가 세운 광릉태수 — 199~200년 광기에서 손책군을 물리쳤고 200년 여름 사양에 있었다 | <https://en.wikipedia.org/wiki/Chen_Deng> |
| 조위 | 공융 | 196년 북해를 잃고 허로 와 조정의 장작대장 · 소부를 지냈다(208년 8월 처형) — 조조가 낀 허도 조정의 신하라 조위로 적었다 | <https://en.wikipedia.org/wiki/Kong_Rong> |
| 원소 | 미축 | 벼슬을 버리고 유비를 따라다녔다 — 유비가 형주로 가려 할 때 먼저 유표에게 보내졌다. 그해 유비가 원소군이라 함께 적는다 | <https://zh.wikisource.org/wiki/三國志/卷38> |
| 원소 | 미방 | 팽성상 벼슬을 버리고 형 미축과 함께 유비를 따라다녔다 — 그해 유비가 원소군이라 함께 적는다 | <https://zh.wikisource.org/wiki/三國志/卷38> |
| 원소 | 손건 | 유비가 조조를 등졌을 때 원소와 손잡으러 보낸 사자 — 그해 유비가 원소군이라 함께 적는다 | <https://zh.wikisource.org/wiki/三國志/卷38> |
| 원소 | 간옹 | 젊어서부터 유비를 따라다녔고 형주에 이르러 미축 · 손건과 함께 종사중랑이 되었다 — 그해 유비가 원소군이라 함께 적는다 | <https://zh.wikisource.org/wiki/三國志/卷38> |
| 유표 | 황충 | 유표가 중랑장으로 삼아 조카 유반과 함께 장사 유현을 지키게 했다 | <https://zh.wikisource.org/wiki/三國志/卷36> |
| 유표 | 이적 | 젊어서부터 같은 고을 사람인 진남장군 유표에게 의지했다 | <https://zh.wikisource.org/wiki/三國志/卷38> |
| 서량 | 염행 | 한수의 장수 — 건안 초 마등과 싸울 때 마초를 찔러 죽일 뻔했고 209년 한수의 사자로 조조에게 간다 | <https://en.wikipedia.org/wiki/Yan_Xing_(Han_dynasty)> |
| 동오 | 화흠 | 예장태수로 있다가 손책을 맞아들여 그 밑에 머물렀다 — 조조가 관도에 있을 때 천자에게 표를 올려 불렀고 손권은 보내지 않으려 했다 | <https://zh.wikisource.org/wiki/三國志/卷13> |
| 동오 | 여몽 | 열대여섯에 매형 등당을 따라 싸웠고 손책이 곁에 두었다 — 등당이 죽자 별부사마로 그 군사를 이었다 | <https://zh.wikisource.org/wiki/三國志/卷54> |
| 동오 | 동습 | 손책이 회계군에 들어올 때(196) 고천정에서 맞이해 따랐다 | <https://zh.wikisource.org/wiki/三國志/卷55> |
| 동오 | 진무 | 손책이 수춘에 있을 때 열여덟 살로 찾아가 따랐고 강을 건너 별부사마가 되었다 | <https://zh.wikisource.org/wiki/三國志/卷55> |
| 동오 | 하제 | 건안 원년(196) 손책이 회계군에 와서 효렴으로 천거했다 | <https://zh.wikisource.org/wiki/三國志/卷60> |
| 동오 | 우번 | 왕랑이 진 뒤 돌아오자 손책이 다시 공조로 삼고 벗의 예로 대했다 | <https://zh.wikisource.org/wiki/三國志/卷57> |
| 동오 | 반장 | 손권이 양선현장일 때(196년 무렵) 처음 찾아가 따랐다 | <https://zh.wikisource.org/wiki/三國志/卷55> |

## 208 적벽 (`jb208`)

208 적벽 전야 · 208년 겨울 — 유종이 항복한 뒤, 적벽 싸움 직전

주인 있는 성 30 · 주인 없음 4

| 성 | 주인 | 근거 | 출처 |
|---|---|---|---|
| 낙양 | 조위 | 조조가 올린 사례교위 종요의 관할 — 낙양 한 곳의 주인을 적은 줄은 없다(주 단위 근거) | <https://zh.wikipedia.org/wiki/鍾繇> |
| 장안 | 조위 | 사례교위 종요가 장안에서 관중을 다스렸다(211년 동관 싸움 전까지) | <https://zh.wikipedia.org/wiki/鍾繇> |
| 허창 | 조위 | 196년부터 헌제가 있는 조조의 도읍 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 업 | 조위 | 204년 조조가 업을 함락했다 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 남피 | 조위 | 204년 뒤 조조가 원담의 마지막 근거지 남피를 함락했다(조조 항목은 205년 봄 원담을 죽였다고 적는다) | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 북평 | 조위 | 207년 오환 원정으로 화북이 모두 조조의 것이 되었다(주 단위 근거) | <https://en.wikipedia.org/wiki/Cao_Cao> |
| 진양 | 조위 | 206년 봄 조조가 호관에서 고간을 꺾었다(주 단위 근거) | <https://en.wikipedia.org/wiki/Cao_Cao> |
| 하내 | 조위 | 수고를 친 뒤 조조가 아우른 하내 | <https://zh.wikipedia.org/wiki/眭固> |
| 진류 | 조위 | 195년 뒤 줄곧 조조의 연주(주 단위 근거) | <https://en.wikipedia.org/wiki/Battle_of_Yan_Province> |
| 복양 | 조위 | 195년 뒤 줄곧 조조의 연주(주 단위 근거) | <https://en.wikipedia.org/wiki/Battle_of_Yan_Province> |
| 견성 | 조위 | 195년 뒤 줄곧 조조의 연주(주 단위 근거) | <https://en.wikipedia.org/wiki/Battle_of_Yan_Province> |
| 소패 | 조위 | 200년 유비를 내쫓은 뒤 조조의 땅(주 단위 근거) | <https://en.wikipedia.org/wiki/Cao_Cao> |
| 하비 | 조위 | 여포를 꺾고(199) 유비를 내쫓은(200) 뒤 조조의 서주 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 여남 | 조위 | 201년 여남을 차지한 공도와 유비를 조조가 꺾었다 | <https://en.wikipedia.org/wiki/Yellow_Turban_Rebellion> |
| 합비 | 조위 | 양주자사 유복이 그해 말까지 지켰고, 적벽 뒤 손권의 포위를 장제(蔣濟)가 물리쳤다 | <https://en.wikipedia.org/wiki/Battle_of_Hefei_(208)> |
| 건업 | 동오 | 손권의 강동 — 211년 본영을 단도에서 말릉으로 옮긴다(건업이라는 이름은 212년부터) | <https://en.wikipedia.org/wiki/Sun_Quan> |
| 오 | 동오 | 200년 손권이 형에게서 이어받은 장강 동남쪽 땅(지역 단위 근거) | <https://en.wikipedia.org/wiki/Sun_Quan> |
| 회계 | 동오 | 200년 손권이 형에게서 이어받은 장강 동남쪽 땅(지역 단위 근거) | <https://en.wikipedia.org/wiki/Sun_Quan> |
| 시상 | 동오 | 제갈량이 시상으로 가서 손권과 동맹을 맺었다 | <https://en.wikipedia.org/wiki/Battle_of_Red_Cliffs> |
| 강하 | 촉한 | 장판에서 진 유비가 하구로 와 유기(그해 유비군)에게 의지해 강하군을 쥐었다 — 봄에 황조를 꺾은 손권이 강하 땅을 많이 얻었다는 자료도 있다 | <https://en.wikipedia.org/wiki/Liu_Bei> |
| 양양 | 조위 | 8월 유표가 죽고 유종이 조조에게 항복했다 — 뒤에 악진이 양양에 주둔 | <https://en.wikipedia.org/wiki/Battle_of_Red_Cliffs> |
| 완 | 조위 | 적벽 뒤에도 조조가 지킨 남양군(군 단위 근거) | <https://en.wikipedia.org/wiki/Jing_Province> |
| 강릉 | 조위 | 유종의 항복으로 조조가 강릉과 수군을 얻어 전진 기지로 삼았다(209년 말 주유에게 넘어간다) | <https://en.wikipedia.org/wiki/Battle_of_Red_Cliffs> |
| 장사 | 조위 | 조조가 형주를 얻자 황충이 임시 비장군으로 옛 자리 그대로 장사태수 한현에게 딸렸다(황충전) — 장사는 이름으로는 조조 아래. 209년 유비에게 항복한다 | <https://zh.wikisource.org/wiki/三國志/卷36> |
| 한중 | 장로 | 장로의 한중(한녕) — 215년 조조에게 항복할 때까지 | <https://en.wikipedia.org/wiki/Zhang_Lu_(Han_dynasty)> |
| 성도 | 유장 | 익주목 유장의 치소(214년 유비에게 항복할 때까지) | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 강주 | 유장 | 익주목 유장의 땅(주 단위 근거) | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 영안 | 유장 | 익주목 유장의 땅(주 단위 근거 — 이때 이름은 어복) | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 금성 | 서량 | 마등이 업으로 간 뒤 마초가 양주(涼州)에 남아 무리를 이끌었다(주 단위 근거) | <https://en.wikipedia.org/wiki/Ma_Chao> |
| 교지 | 교주 | 교지태수 사섭(187~226)의 땅 — 210년에야 손권의 교주자사 보즐을 받아들인다 | <https://zh.wikisource.org/wiki/三國志/卷49> |

주인 없음 · 다툼

| 성 | 사정 | 출처 |
|---|---|---|
| 양평 | 204년 공손도를 이은 공손강의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Sima_Yi%27s_Liaodong_campaign> |
| 수춘 | 그해 수춘의 주인을 적은 자료를 찾지 못했다 — 조조의 양주자사는 합비에 있었다 | <https://en.wikipedia.org/wiki/Battle_of_Hefei_(208)> |
| 천수 | 양주자사 위강이 기성에 있다가 211년 뒤 마초에게 죽었다 — 208년의 주인은 확인하지 못했다 | <https://en.wikipedia.org/wiki/Ma_Chao> |
| 운남 | 남중 — 운남군은 225년에야 생긴다. 유장 때 남중의 사정은 확인한 자료에 없다 | <https://en.wikipedia.org/wiki/Zhuge_Liang%27s_Southern_Campaign> |

세력의 한 줄

- **조위** — 화북을 평정하고 승상이 되어 남하 — 유종의 항복으로 양양과 강릉을 얻었다.
- **촉한** — 장판에서 지고 하구로 달아나 유기와 함께 강하에 의지했다.
- **동오** — 봄에 황조를 꺾었고, 시상에서 제갈량을 맞아 유비와 손잡았다.
- **유장** — 익주를 지키며 조조에게 사자를 보내 예를 표했다.
- **서량** — 마등이 조정의 부름으로 업에 들어가고 마초가 양주(涼州)에 남아 무리를 이끌었다.
- **장로** — 한중을 한녕이라 부르며 다스린다 — 215년 조조에게 항복할 때까지.
- **교주** — 교지태수 사섭 — 210년 손권이 보즐을 교주자사로 보낼 때까지 홀로 섰다.

추가 명단 16명 — 옛 게임 명단(`data/draft2-packs.json`) 위에 얹은 장수(`data/draft2-roster.json`)

| 세력 | 장수 | 근거 | 출처 |
|---|---|---|---|
| 교주 | 사섭 | 교지태수 — 건안 15년(210) 손권이 보즐을 교주자사로 보낼 때까지 홀로 섰다 | <https://zh.wikisource.org/wiki/三國志/卷49> |
| 조위 | 한현 | 장사태수 — 조조가 형주를 얻자 황충이 옛 자리 그대로 한현 밑에 놓였다(황충전). 209년 유비에게 항복한다 | <https://zh.wikisource.org/wiki/三國志/卷36> |
| 조위 | 유파 | 유표가 죽고 조조가 형주를 치자 북쪽으로 조조에게 갔고, 조조가 연(掾)으로 삼아 장사 · 영릉 · 계양을 달래러 보냈다 | <https://zh.wikisource.org/wiki/三國志/卷39> |
| 조위 | 사마의 | 208년 승상이 된 조조 밑에서 문학연으로 벼슬을 시작했다(조조의 승상 취임은 그해 6월) | <https://en.wikipedia.org/wiki/Sima_Yi> |
| 조위 | 진군 | 여포가 깨진 뒤 조조의 사공서조연속이 되어 현령들을 거쳐 치서시어사, 참승상군사로 옮겼다 | <https://zh.wikisource.org/wiki/三國志/卷22> |
| 조위 | 장패 | 여포가 진 뒤 조조에게 항복해 청주 · 서주를 맡았고, 적벽 뒤 회수를 건너 손권을 치는 데 따라 거소를 떨어뜨렸다 | <https://en.wikipedia.org/wiki/Zang_Ba> |
| 조위 | 여건 | 조조가 태산태수로 삼아 십여 년을 다스렸고 문제가 왕위에 오르자(220) 서주자사로 옮겼다 | <https://zh.wikisource.org/wiki/三國志/卷18> |
| 조위 | 전예 | 공손찬이 진 뒤 선우보의 장사로 조씨에게 귀순하라 권했고, 조조가 불러 승상군모연으로 삼았다 | <https://zh.wikisource.org/wiki/三國志/卷26> |
| 조위 | 조비 | 조조의 아들(187년생) — 204년 업 함락 때 견씨를 아내로 맞았다. 벼슬(오관중랑장)은 211년부터 | <https://en.wikipedia.org/wiki/Cao_Pi> |
| 조위 | 견씨 | 204년 업이 떨어진 뒤 조비의 아내가 되었다(221년에 죽는다) | <https://en.wikipedia.org/wiki/Lady_Zhen> |
| 촉한 | 이적 | 유표가 죽자 유비를 따라 남쪽으로 강을 건넜다 | <https://zh.wikisource.org/wiki/三國志/卷38> |
| 촉한 | 유봉 | 유비가 형주에 와서 뒤이을 아들이 없어 양자로 삼았다 — 유비가 촉에 들어가 유장을 칠 때 스물 남짓 | <https://zh.wikisource.org/wiki/三國志/卷40> |
| 촉한 | 감부인 | 그해 당양 장판에서 조운의 보호로 화를 면했다 — 뒤에 죽어 남군에 묻혔다 | <https://zh.wikisource.org/wiki/三國志/卷34> |
| 촉한 | 진도 | 예주 때부터 유비를 따랐고 이름과 지위가 늘 조운 다음이었다(계한보신찬 주) | <https://zh.wikisource.org/wiki/三國志/卷45> |
| 동오 | 주환 | 손권이 장군이 되자(200~) 막부에서 일하다 여요현장이 되었다(238년 62세로 죽는다) | <https://zh.wikisource.org/wiki/三國志/卷56> |
| 동오 | 여대 | 손권이 일을 맡자(200~) 막부에 나아가 오현의 승이 되었다(256년 96세로 죽는다) | <https://zh.wikisource.org/wiki/三國志/卷60> |

## 263 종결 (`end263`)

263 — 삼국이 저무는 해 · 263년 여름 — 위의 촉 정벌(가을) 직전

주인 있는 성 32 · 주인 없음 2

| 성 | 주인 | 근거 | 출처 |
|---|---|---|---|
| 낙양 | 진 | 위의 도읍(226~266) — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 장안 | 진 | 위의 옹주 경조군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 허창 | 진 | 위의 예주 영천군 — 220~226년 위의 도읍 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 업 | 진 | 위의 기주 위군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 남피 | 진 | 위의 기주 발해군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 북평 | 진 | 위의 유주 우북평군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 양평 | 진 | 238년 사마의가 양평을 함락해 요동이 위의 것이 되었다 — 위의 유주 요동군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Sima_Yi%27s_Liaodong_campaign> |
| 진양 | 진 | 위의 병주 태원군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 하내 | 진 | 위의 사주 하내군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 진류 | 진 | 위의 연주 진류 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 복양 | 진 | 위의 연주 동군(군 단위 근거) — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 견성 | 진 | 위의 연주 제음군(군 단위 근거) — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 소패 | 진 | 위의 예주 패국(군 단위 근거) — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 하비 | 진 | 위의 서주 하비군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 여남 | 진 | 위의 예주 여남군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 수춘 | 진 | 258년 제갈탄의 난이 꺾인 뒤 위의 것 — 위의 양주 회남군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Zhuge_Dan%27s_Rebellion> |
| 합비 | 진 | 253년 위장 장특이 신성을 지켜 냈고 268년 무렵에는 진의 석포가 합비를 지켰다 — 그 사이인 263년도 위의 것으로 본다 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Battle_of_Hefei_(253)> |
| 건업 | 동오 | 오의 도읍(229~265) | <https://en.wikipedia.org/wiki/Eastern_Wu> |
| 오 | 동오 | 오의 양주 오군 | <https://en.wikipedia.org/wiki/Eastern_Wu> |
| 회계 | 동오 | 오의 양주 회계군 | <https://en.wikipedia.org/wiki/Eastern_Wu> |
| 시상 | 동오 | 삼국 때 오의 강하군에 속했다 | <https://zh.wikipedia.org/wiki/柴桑县> |
| 양양 | 진 | 위의 형주 양양군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 완 | 진 | 위의 형주 남양군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 강릉 | 동오 | 오의 형주 남군(치소 강릉) — 오가 형주를 다스린 중심 | <https://en.wikipedia.org/wiki/Eastern_Wu> |
| 장사 | 동오 | 오의 형주 장사군 | <https://en.wikipedia.org/wiki/Eastern_Wu> |
| 한중 | 촉한 | 촉이 지키던 한중 — 그해 가을 종회의 위군이 양안관을 넘어 차지한다 | <https://en.wikipedia.org/wiki/Conquest_of_Shu_by_Wei> |
| 성도 | 촉한 | 촉한의 도읍 — 그해 겨울 유선이 등애에게 항복한다 | <https://en.wikipedia.org/wiki/Conquest_of_Shu_by_Wei> |
| 강주 | 촉한 | 촉한의 파군(첫 현 강주) | <https://en.wikipedia.org/wiki/Shu_Han> |
| 영안 | 촉한 | 파동군의 치소 — 나헌이 군사 2천으로 지켰다 | <https://en.wikipedia.org/wiki/Conquest_of_Shu_by_Wei> |
| 금성 | 진 | 위의 양주(涼州) 금성군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 천수 | 진 | 위의 옹주 천수군 — 그해 세력 표의 진군(사마소가 실권을 쥔 위) | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 운남 | 촉한 | 곽익이 남중을 맡아 촉이 망할 때까지 지켰다 | <https://en.wikipedia.org/wiki/Huo_Yi> |

주인 없음 · 다툼

| 성 | 사정 | 출처 |
|---|---|---|
| 강하 | 위에도 강하군이 있고 오도 강하(무창)를 가졌다 — 둘이 나눠 가진 땅 | <https://en.wikipedia.org/wiki/Cao_Wei> |
| 교지 | 오의 교주였으나 그 무렵 교지에서 반란이 일어나 오가 촉을 돕지 못했다 — 다투는 중 | <https://en.wikipedia.org/wiki/Eastern_Wu> |

세력의 한 줄

- **진** — 사마소가 위의 실권을 쥐고 가을에 촉 정벌군을 낸다 — 진(晉)이 서는 것은 266년이라 이해의 땅은 아직 위의 이름이다.
- **촉한** — 성도의 유선 — 가을에 위군이 한중을 넘고 겨울에 항복한다.
- **동오** — 건업의 오 — 교지 쪽 반란 탓에 촉을 돕지 못했다.
- **회남** — 수춘에서 일어난 세 번의 반란(251 · 255 · 257~258)은 모두 꺾였다 — 이해엔 땅이 없다.

추가 명단 1명 — 옛 게임 명단(`data/draft2-packs.json`) 위에 얹은 장수(`data/draft2-roster.json`)

| 세력 | 장수 | 근거 | 출처 |
|---|---|---|---|
| 촉한 | 종예 | 경요 원년(258) 병으로 성도에 불려 와 있었고, 함희 원년(264) 봄 요화와 함께 낙양으로 옮겨지다 길에서 병으로 죽었다 | <https://zh.wikisource.org/wiki/三國志/卷45> |
