/* ============================================================
   공통 스크립트 — 헤더/푸터 주입, 모바일 메뉴, 라이트박스
   ============================================================ */
(function(){
  const page = document.body.dataset.page || "";
  const NAV = [
    ["index","홈","index.html"],
    ["profile","후보 소개","profile.html"],
    ["pledges","공약","pledges.html"],
    ["village","우리동네","village.html"],
    ["budget","예산 현황","budget.html"],
    ["execution","집행 내역","execution.html"],
    ["gallery","활동·공보","gallery.html"],
    ["propose","민원·제안","propose.html"]
  ];

  /* SNS 바로가기 (data.js 의 CAND.sns 주소를 사용) */
  const SNS = [
    ["tiktok","틱톡","TT"],
    ["instagram","인스타그램","IG"],
    ["facebook","페이스북","f"],
    ["youtube","유튜브","▶"],
    ["blog","블로그","B"]
  ];
  function snsHTML(){
    return SNS.map(function(item){
      const k = item[0], label = item[1], short = item[2];
      const url = (CAND.sns && CAND.sns[k]) || "";
      const attrs = url ? 'target="_blank" rel="noopener"' : 'aria-disabled="true"';
      const tip = url ? label : label + " (준비중)";
      return '<a class="sns-btn sns-' + k + '" href="' + (url || '#') + '" ' + attrs + ' title="' + tip + '">' + short + '</a>';
    }).join("");
  }

  /* ---------- 헤더 ---------- */
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="wrap nav">
      <a class="brand" href="index.html" aria-label="박정하 홈">
        <span class="num">${CAND.number}</span>
        <span><span class="bname">${CAND.name}</span>
        <span class="bsub">광주 북구의회 · 나선거구</span></span>
      </a>
      <button class="nav-toggle" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
      <nav class="nav-menu">
        ${NAV.map(([k,label,href])=>`<a href="${href}" class="${k===page?'active':''}">${label}</a>`).join("")}
        <a href="propose.html" class="nav-cta">제안하기</a>
      </nav>
    </div>`;
  const headerMount = document.getElementById("site-header");
  if (headerMount) headerMount.replaceWith(header); else document.body.prepend(header);

  const toggle = header.querySelector(".nav-toggle");
  const menu = header.querySelector(".nav-menu");
  toggle.addEventListener("click",()=>menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("open")));

  /* ---------- 푸터 ---------- */
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="wrap">
      <div class="foot-top">
        <div>
          <div class="foot-brand"><span class="num">${CAND.number}</span> ${CAND.name}</div>
          <p class="foot-info" style="margin-top:14px;color:#aebbdd">
            ${CAND.slogan} · ${CAND.sub}<br>${CAND.district}<br>${CAND.dongs}
          </p>
          <div class="foot-sns" data-sns aria-label="SNS 바로가기"></div>
        </div>
        <div>
          <h4>바로가기</h4>
          ${NAV.map(([k,label,href])=>`<a href="${href}">${label}</a>`).join("")}
        </div>
        <div>
          <h4>선거사무소</h4>
          <div class="foot-info">
            <b>전화</b> <a href="tel:${CAND.phoneRaw}" style="display:inline">${CAND.phone}</a><br>
            <b>이메일</b> <a href="mailto:${CAND.email}" style="display:inline">${CAND.email}</a><br>
            <b>주소</b> ${CAND.office}
          </div>
        </div>
      </div>
      <div class="foot-bottom">
        본 웹사이트는 ${CAND.party} ${CAND.number} ${CAND.name} (광주 북구의회의원 나선거구 후보)의 선거운동을 위한 홍보물입니다.
        예산·집행 데이터는 광주 북구 공개자료 및 지방재정365 등 공공 출처를 기반으로 하며, 최신·정확한 수치는 각 공식 시스템에서 확인하실 수 있습니다.<br>
        © 2026 ${CAND.name}. 제작·게재 책임 : ${CAND.name} 선거사무소.
      </div>
    </div>`;
  const footMount = document.getElementById("site-footer");
  if (footMount) footMount.replaceWith(footer); else document.body.append(footer);

  /* SNS 버튼 채우기 (헤더/히어로/푸터 등 data-sns 모든 영역) */
  document.querySelectorAll("[data-sns]").forEach(el=>{ el.innerHTML = snsHTML(); });

  /* ---------- 라이트박스(갤러리) ---------- */
  if (document.querySelector("[data-lightbox]")){
    const lb = document.createElement("div");
    lb.className = "lb";
    lb.innerHTML = '<span class="x" aria-label="닫기">×</span><img alt="확대 이미지">';
    document.body.append(lb);
    const img = lb.querySelector("img");
    document.querySelectorAll("[data-lightbox]").forEach(el=>{
      el.addEventListener("click",e=>{
        e.preventDefault();
        img.src = el.getAttribute("href") || el.dataset.src;
        lb.classList.add("open");
      });
    });
    const close=()=>lb.classList.remove("open");
    lb.addEventListener("click",e=>{ if(e.target===lb||e.target.classList.contains("x")) close(); });
    document.addEventListener("keydown",e=>{ if(e.key==="Escape") close(); });
  }
})();
