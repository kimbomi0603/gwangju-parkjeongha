/* ============================================================
   지방재정365 OpenAPI 연동 (선택)
   - LOFIN.enabled === false 이면 아무 동작도 하지 않고
     data.js 의 확정 공식 수치(BUDGET)를 그대로 사용합니다.
   - enabled 이고 인증키가 있으면 공공데이터포털 API 를 호출해
     BUDGET.total / general / special / year 를 갱신 시도합니다.
   - 실패하더라도(키 오류·CORS 등) 페이지는 항상 공식 수치로 정상 동작합니다.
   ============================================================ */
const LofinAPI = (function(){
  function buildUrl(){
    // 공공데이터포털 '행정안전부 지방재정365' 엔드포인트 예시.
    // 실제 오퍼레이션/파라미터명은 발급받은 API 문서에 맞춰 조정하세요.
    const base = "https://apis.data.go.kr/1741000/FinanceData/getFinanceList";
    const p = new URLSearchParams({
      serviceKey: LOFIN.serviceKey,
      type: "json",
      sidoNm: LOFIN.region.sido,
      sigunguNm: LOFIN.region.sigungu,
      year: String(LOFIN.year),
      numOfRows: "100",
      pageNo: "1"
    });
    const url = base + "?" + p.toString();
    return LOFIN.proxy ? (LOFIN.proxy + encodeURIComponent(url)) : url;
  }

  // 응답에서 총계/일반/특별회계(억원)를 방어적으로 추출
  function parse(json){
    try{
      const items = json?.response?.body?.items?.item
                 || json?.items || json?.data || [];
      const arr = Array.isArray(items) ? items : [items];
      if(!arr.length) return null;
      const num = v => { const n = Number(String(v).replace(/[^\d.-]/g,"")); return isFinite(n)?n:null; };
      // 원 단위 → 억원 환산 (필드명은 실제 API 에 맞춰 매핑)
      let total=null, general=null, special=null;
      for(const it of arr){
        const t = num(it.budgetAmt ?? it.totalAmt ?? it.amt);
        if(t!=null) total = (t>1e8 ? Math.round(t/1e8) : t);
        const g = num(it.generalAmt); if(g!=null) general = (g>1e8?Math.round(g/1e8):g);
        const s = num(it.specialAmt); if(s!=null) special = (s>1e8?Math.round(s/1e8):s);
      }
      if(total==null && general==null) return null;
      return { total, general, special };
    }catch(e){ return null; }
  }

  async function refresh(){
    if(!LOFIN.enabled || !LOFIN.serviceKey) return false;
    try{
      const res = await fetch(buildUrl(), { headers:{ "Accept":"application/json" }});
      if(!res.ok) return false;
      const json = await res.json();
      const d = parse(json);
      if(!d) return false;
      if(d.total)   BUDGET.total   = d.total;
      if(d.general) BUDGET.general = d.general;
      if(d.special) BUDGET.special = d.special;
      BUDGET._live = true;
      return true;
    }catch(e){
      console.warn("[LofinAPI] 실시간 연동 실패 — 공식 확정 수치로 표시합니다.", e);
      return false;
    }
  }

  return { refresh };
})();
