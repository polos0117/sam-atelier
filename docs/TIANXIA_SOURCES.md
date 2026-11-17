# 천하 지도 — 성의 주인과 근거

`data/tianxia.json` 에서 뽑은 표다(`node tests/tianxia-data.cjs --write`). 여기를 손으로 고치지 않는다 — 자료를 고치고 다시 뽑는다.

천하 지도 자료 — 성과 판도 다섯(팩 열쇠 그대로)의 주인. 연도 판도 넷은 when 에 적은 그 무렵의 모습이고, 줄마다 why(근거 한 줄)와 src(확인한 주소). 확인이 안 되거나 그해 세력 표에 없는 쪽이 가졌으면 f 가 null(주인 없음 · 다툼). 「주 단위 근거」 는 그 성 하나가 아니라 그 주(州) · 군을 누가 쥐었는지로 적었다는 뜻. 군웅록(mx)은 가상 판도다 — 세력마다 실제로 근거지로 삼았던 성을 주었을 뿐, 세력 사이의 땅 넓이는 사실이 아니다. x · y 는 세로 지도의 백분율(왼쪽 위 0 · 0) 잠정값 — 바탕 그림이 정해지면 맞춘다. 사람이 훑어볼 표는 docs/TIANXIA_SOURCES.md(node tests/tianxia-data.cjs --write 가 이 자료에서 뽑는다).

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

주인 있는 성 12 · 주인 없음 22

| 성 | 주인 | 근거 | 출처 |
|---|---|---|---|
| 업 | 원소 | 191년 한복에게서 기주를 넘겨받아 업을 근거로 삼았다 — 195년에도 기주의 주인(주 단위 근거) | <https://en.wikipedia.org/wiki/Yuan_Shao> |
| 진류 | 조위 | 가을 8월부터 에워싼 진류군 옹구가 12월에 무너져 장초가 죽고 장막도 부하에게 죽었다 — 무제기는 이로써 「연주가 평정되었다」 고 적는다(군 단위 근거) | <https://zh.wikisource.org/wiki/三國志/卷01> |
| 견성 | 조위 | 194년 9월부터 조조의 근거지 — 195년 여름 여포를 내쫓고 겨울 10월 조정이 조조를 연주목으로 삼았다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 소패 | 도겸 | 194년 말 도겸이 죽고 유비가 서주를 물려받았다 — 여포가 하비를 빼앗고 유비를 소패에 두는 것은 196년의 일이라 195년 말에는 유비의 땅. 여포가 얹혀 지낸 곳이 소패라는 줄은 확인한 자료에 없다(유비는 그해 서주군) | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 하비 | 도겸 | 194년 말 도겸이 죽고 유비가 서주를 물려받았다 — 원술이 유비를 치고 그 틈에 여포가 하비를 덮친 것은 196년이라 195년 말에는 유비의 땅(유비는 그해 서주군) | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 수춘 | 원술 | 193년 봉구에서 지고 구강의 수춘으로 옮겨 자리 잡은 뒤 줄곧 원술의 본거지 — 195년 손책이 강을 건넌 뒤 주상 · 주유도 수춘으로 돌아갔다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 건업 | 동오 | 195년 손책이 강을 건너 우저를 빼앗고 말릉의 설례 · 착융을 친 뒤 호숙 · 강승을 떨어뜨리고 곡아에 들어갔다 — 유요는 단도를 거쳐 예장으로 달아났다. 자치통감은 이를 195년 끝에 달 없이 적으며, 말릉 성 자체는 착융이 굳게 지켜 손책이 한 번 버려두고 지나갔다는 줄도 있다(군 단위 근거) | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 강하 | 유표 | 유표의 강하태수 황조 — 191년 손견과 싸웠고 208년까지 지켰다(195년 그 한 해의 기록은 없다) | <https://en.wikipedia.org/wiki/Liu_Biao> |
| 양양 | 유표 | 형주를 맡은 유표가 치소를 북쪽 양양으로 옮겼다(190년부터 형주) | <https://en.wikipedia.org/wiki/Jing_Province> |
| 강릉 | 유표 | 191~207년 유표가 형주를 다스렸다(주 단위 근거) | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 장사 | 유표 | 유표의 형주 — 장사태수 장선이 유표를 등진 것은 200년(주 단위 근거) | <https://en.wikipedia.org/wiki/Huan_Jie> |
| 금성 | 서량 | 192년 금성으로 돌아간 한수 — 194년 마등과 장안을 쳤다가 장평관에서 지고 양주(涼州)로 물러난 뒤 그대로다(195년 그 한 해의 기록은 없다, 주 단위 근거) | <https://zh.wikipedia.org/wiki/韓遂> |

주인 없음 · 다툼

| 성 | 사정 | 출처 |
|---|---|---|
| 낙양 | 190년 동탁이 불태운 뒤 폐허 — 헌제는 195년 7월 장안을 떠나 12월에 하동 안읍에 닿았고 낙양에 든 것은 196년 7월이라, 그해 겨울 낙양의 주인은 분명치 않다 | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 장안 | 헌제가 7월 장안을 떠났고 이각 · 곽사 · 장제는 겨울에 어가를 쫓아 홍농까지 나와 싸웠다 — 그해 겨울 장안의 주인을 적은 줄은 없고, 이각 · 곽사는 우리 그해 세력 표에 없다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 허창 | 영천 · 여남에 황건 잔당이 버티던 때(196년 조조가 평정) — 그해 허의 주인을 적은 자료를 찾지 못했다 | <https://en.wikipedia.org/wiki/Yellow_Turban_Rebellion> |
| 남피 | 191년 말 발해의 군사가 공손범을 따라 공손찬에게 넘어갔고 192년 용주에서 진 공손찬이 유주로 물러났다 — 그 뒤 195년 발해(남피)의 주인을 적은 줄은 찾지 못했다 | <https://zh.wikipedia.org/wiki/公孫瓚> |
| 북평 | 195년 유우의 옛 부하들과 원소군이 포구에서 공손찬을 크게 이기자 대군 · 광양 · 상곡 · 우북평이 공손찬이 둔 관리를 죽였고 공손찬은 역(易)으로 옮겼다 — 달은 기록에 없으나 그해의 일이라 연말에는 공손찬 손을 떠난 것으로 보며, 넘어간 쪽(유화 · 선우보)은 우리 그해 세력 표에 없다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 양평 | 189년 말부터 요동태수 공손도의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Sima_Yi%27s_Liaodong_campaign> |
| 진양 | 그해 병주(태원)의 주인을 적은 자료를 찾지 못했다 | <https://en.wikipedia.org/wiki/Gao_Gan> |
| 하내 | 하내태수 장양(191~198)의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Zhang_Yang_(warlord)> |
| 복양 | 무제기는 12월 옹구 함락으로 연주가 평정되었다고 적지만, 동군은 194년 원소가 진궁에게서 빼앗아 장홍을 태수(동무양)로 두었고 장홍은 옹구 구원을 거절당한 뒤 원소와 갈라서 해를 넘겨 에워싸였다 — 195년 말 복양 성 자체가 조조 · 원소 · 장홍 가운데 누구 것인지 적은 줄은 찾지 못했다 | <https://zh.wikipedia.org/wiki/臧洪> |
| 여남 | 황건 잔당이 버티던 때(196년 조조가 평정) — 황건은 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Yellow_Turban_Rebellion> |
| 합비 | 그해 합비의 주인을 적은 자료를 찾지 못했다(합비가 든 구강군의 수춘은 원술의 것) | <https://en.wikipedia.org/wiki/Yuan_Shu> |
| 오 | 오군태수 허공의 땅 — 그해 세력 표에 없다. 손책 쪽 주치가 허공을 내쫓고 오군을 차지했다는 줄을 자치통감은 195년 끝에 달 없이 적지만, 영어 위키백과도 때를 못 박지 않아 195년 안의 일인지 가릴 수 없다 | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 회계 | 회계태수 왕랑의 땅 — 그해 세력 표에 없다. 손책이 왕랑을 쳐 항복받은 것은 196년 | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 시상 | 시상이 속한 예장군은 태수 자리 다툼 끝에 착융이 태수 주호를 죽이고 차지했다가, 곡아에서 쫓겨 온 유요에게 져서 죽었다 — 유요 · 착융 모두 그해 세력 표에 없다(군 단위 근거) | <https://zh.wikisource.org/wiki/資治通鑑/卷061> |
| 완 | 장제는 195년 겨울 이각 · 곽사와 함께 홍농에서 어가를 쫓고 있었다 — 장제가 양(穰)을 치다 죽고 장수가 완에 주둔하는 것은 196년이며, 그해 완의 주인을 적은 자료를 찾지 못했다 | <https://zh.wikisource.org/wiki/資治通鑑/卷062> |
| 한중 | 장로의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/End_of_the_Han_dynasty> |
| 성도 | 194년 유언을 이은 익주목 유장의 땅 — 유장은 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 강주 | 익주(유장)의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 영안 | 익주(유장)의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 천수 | 그해 한양군(천수)의 주인을 적은 자료를 찾지 못했다 | <https://zh.wikipedia.org/wiki/韓遂> |
| 운남 | 남중 — 운남군은 225년에야 생긴다. 그해 남중의 사정은 확인한 자료에 없다 | <https://en.wikipedia.org/wiki/Zhuge_Liang%27s_Southern_Campaign> |
| 교지 | 교지태수 사섭(187~226)의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Shi_Xie> |

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

## 200 관도 (`gd200`)

200 — 조조와 원소가 황하에서 맞서다 · 200년 봄~여름 — 조조가 서주를 되찾고 유비가 원소에게 간 뒤, 관도 싸움 무렵

주인 있는 성 26 · 주인 없음 8

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
| 교지 | 교지태수 사섭(187~226)의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Shi_Xie> |

세력의 한 줄

- **조위** — 헌제를 허에 모시고 황하 남쪽을 거의 쥐었다 — 서주의 유비를 내쫓고 관도에서 원소와 맞선다.
- **원소** — 199년 역경에서 공손찬을 꺾어 황하 북쪽 네 주를 쥐고 남으로 내려온다.
- **유표** — 원소를 도우려 했으나 장사태수 장선이 등을 돌렸다.
- **동오** — 손책이 강동을 평정했으나 이해에 죽고 손권이 이었다.
- **유장** — 아버지 유언을 이은 익주목 — 이해 조위(趙韙)가 반란해 성도에서 버텼다.
- **서량** — 사례교위 종요의 설득으로 마등 · 한수가 조정에 복종해 아들을 인질로 보냈다.
- **장로** — 한중을 한녕이라 고쳐 다스리며 유장의 명을 듣지 않아 원수가 되었다.

## 208 적벽 (`jb208`)

208 적벽 전야 · 208년 겨울 — 유종이 항복한 뒤, 적벽 싸움 직전

주인 있는 성 28 · 주인 없음 6

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
| 한중 | 장로 | 장로의 한중(한녕) — 215년 조조에게 항복할 때까지 | <https://en.wikipedia.org/wiki/Zhang_Lu_(Han_dynasty)> |
| 성도 | 유장 | 익주목 유장의 치소(214년 유비에게 항복할 때까지) | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 강주 | 유장 | 익주목 유장의 땅(주 단위 근거) | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 영안 | 유장 | 익주목 유장의 땅(주 단위 근거 — 이때 이름은 어복) | <https://en.wikipedia.org/wiki/Liu_Zhang_(warlord)> |
| 금성 | 서량 | 마등이 업으로 간 뒤 마초가 양주(涼州)에 남아 무리를 이끌었다(주 단위 근거) | <https://en.wikipedia.org/wiki/Ma_Chao> |

주인 없음 · 다툼

| 성 | 사정 | 출처 |
|---|---|---|
| 양평 | 204년 공손도를 이은 공손강의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Sima_Yi%27s_Liaodong_campaign> |
| 수춘 | 그해 수춘의 주인을 적은 자료를 찾지 못했다 — 조조의 양주자사는 합비에 있었다 | <https://en.wikipedia.org/wiki/Battle_of_Hefei_(208)> |
| 장사 | 유종이 항복한 뒤 형남 네 군(장사태수 한현)이 누구를 따랐는지 확인한 자료에 없다 — 209년 유비에게 항복한다 | <https://en.wikipedia.org/wiki/Han_Xuan> |
| 천수 | 양주자사 위강이 기성에 있다가 211년 뒤 마초에게 죽었다 — 208년의 주인은 확인하지 못했다 | <https://en.wikipedia.org/wiki/Ma_Chao> |
| 운남 | 남중 — 운남군은 225년에야 생긴다. 유장 때 남중의 사정은 확인한 자료에 없다 | <https://en.wikipedia.org/wiki/Zhuge_Liang%27s_Southern_Campaign> |
| 교지 | 교지태수 사섭(187~226)의 땅 — 그해 세력 표에 없다 | <https://en.wikipedia.org/wiki/Shi_Xie> |

세력의 한 줄

- **조위** — 화북을 평정하고 승상이 되어 남하 — 유종의 항복으로 양양과 강릉을 얻었다.
- **촉한** — 장판에서 지고 하구로 달아나 유기와 함께 강하에 의지했다.
- **동오** — 봄에 황조를 꺾었고, 시상에서 제갈량을 맞아 유비와 손잡았다.
- **유장** — 익주를 지키며 조조에게 사자를 보내 예를 표했다.
- **서량** — 마등이 조정의 부름으로 업에 들어가고 마초가 양주(涼州)에 남아 무리를 이끌었다.
- **장로** — 한중을 한녕이라 부르며 다스린다 — 215년 조조에게 항복할 때까지.

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
