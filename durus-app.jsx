import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── SUPABASE ─────────────────────────────────────────────────
const SUPABASE_URL = "https://ezgjygshyeychcmnozii.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Z2p5Z3NoeWV5Y2hjbW5vemlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzU2NjksImV4cCI6MjA5MTMxMTY2OX0.c4t_VqhfCP0i-DazFQyuFYCy_Hmt4CI87_9MchV78g8";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── CONSTANTS ────────────────────────────────────────────────
const PASSWORD = "Marwane2024!";
const DAYS_AR  = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","ماي","يونيو","يوليو","غشت","شتنبر","أكتوبر","نونبر","دجنبر"];

const GROUPS = [
  { id:"1", name:"فوج 1", days:[1,3,6], slot:"4:30 → 6:30", levels:[1,2],     color:"#0ea5e9" },
  { id:"2", name:"فوج 2", days:[1,3,6], slot:"6:30 → 8:30", levels:[3,4,7],   color:"#8b5cf6" },
  { id:"3", name:"فوج 3", days:[2,4,5], slot:"4:30 → 6:30", levels:[5,6],     color:"#10b981" },
  { id:"4", name:"فوج 4", days:[2,4,5], slot:"6:30 → 8:30", levels:[6,8,9],   color:"#f59e0b" },
];

const LEVEL_NAMES = {
  1:"الأول ابتدائي", 2:"الثاني ابتدائي", 3:"الثالث ابتدائي",
  4:"الرابع ابتدائي", 5:"الخامس ابتدائي", 6:"السادس ابتدائي",
  7:"الأولى إعدادي", 8:"الثانية إعدادي", 9:"الثالثة إعدادي"
};

const SUBJECTS_LOW  = ["الرياضيات","اللغة الفرنسية","اللغة العربية"];
const SUBJECTS_HIGH = ["الرياضيات","الإملاء","التعبير الكتابي","الخط","الصرف والتحويل","التراكيب","Grammaire","Conjugaison","Dictée","Orthographe","Lexique","Lecture","Écriture","Compréhension","Expression écrite"];
const getSubjects = (level) => level <= 3 ? SUBJECTS_LOW : SUBJECTS_HIGH;

const GRADE = (n) => {
  if (n === null || n === undefined || n === "") return { label:"—", color:"#64748b", bg:"rgba(100,116,139,0.1)" };
  const v = parseFloat(n);
  if (v >= 9)   return { label:"ممتاز",     color:"#16a34a", bg:"rgba(22,163,74,0.15)" };
  if (v >= 8)   return { label:"حسن",       color:"#2563eb", bg:"rgba(37,99,235,0.15)" };
  if (v >= 7)   return { label:"مستحسن",    color:"#ca8a04", bg:"rgba(202,138,4,0.15)" };
  if (v >= 5.5) return { label:"لا بأس به", color:"#ea580c", bg:"rgba(234,88,12,0.15)" };
  if (v >= 5)   return { label:"متوسط",     color:"#92400e", bg:"rgba(146,64,14,0.15)" };
  return           { label:"ضعيف جداً",  color:"#dc2626", bg:"rgba(220,38,38,0.15)" };
};

const SURAHS = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

const STATUS_CYCLE = ["none","present","absent","late"];
const STATUS_INFO  = {
  none:    { label:"—",     color:"#64748b", bg:"rgba(100,116,139,0.08)" },
  present: { label:"حاضر",  color:"#16a34a", bg:"rgba(22,163,74,0.15)"  },
  absent:  { label:"غائب",  color:"#dc2626", bg:"rgba(220,38,38,0.15)"  },
  late:    { label:"متأخر", color:"#d97706", bg:"rgba(217,119,6,0.15)"  },
};

const todayStr = () => new Date().toISOString().split("T")[0];
const curMonth = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; };
const formatDateAr = (str) => { const d=new Date(str); return `${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`; };
const todayGroups = () => GROUPS.filter(g=>g.days.includes(new Date().getDay()));

// ─── STYLES ──────────────────────────────────────────────────
const S = {
  app:   { minHeight:"100vh", background:"#060d1a", color:"#e2e8f0", fontFamily:"'Segoe UI',Tahoma,sans-serif", direction:"rtl" },
  card:  { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"16px 18px", marginBottom:12 },
  input: { width:"100%", padding:"11px 14px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box" },
  btn:   (bg, c="#fff") => ({ padding:"10px 20px", borderRadius:10, border:"none", background:bg, color:c, fontWeight:700, fontSize:13, cursor:"pointer" }),
  tab:   (a) => ({ padding:"9px 16px", border:"none", cursor:"pointer", fontWeight:700, fontSize:13, background:"transparent", color:a?"#38bdf8":"#475569", borderBottom:a?"2px solid #38bdf8":"2px solid transparent" }),
  badge: (color,bg) => ({ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color, background:bg }),
};

// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [authed, setAuthed]     = useState(false);
  const [pwd, setPwd]           = useState("");
  const [pwdErr, setPwdErr]     = useState(false);

  const [page, setPage]         = useState("home");
  const [subPage, setSubPage]   = useState("list");
  const [selectedId, setSelectedId] = useState(null);

  const [students, setStudents]   = useState([]);
  const [sessions, setSessions]   = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades]       = useState([]);
  const [quran, setQuran]         = useState([]);
  const [payments, setPayments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  const tryLogin = () => {
    if (pwd === PASSWORD) { setAuthed(true); setPwdErr(false); }
    else setPwdErr(true);
  };

  // ── LOAD DATA ──
  useEffect(() => {
    if (!authed) return;
    (async () => {
      setLoading(true);
      const [s,se,a,g,q,p] = await Promise.all([
        sb.from("students").select("*").order("name"),
        sb.from("sessions").select("*").order("date",{ascending:false}),
        sb.from("attendance").select("*"),
        sb.from("grades").select("*"),
        sb.from("quran").select("*"),
        sb.from("payments").select("*"),
      ]);
      if (s.data)  setStudents(s.data);
      if (se.data) setSessions(se.data);
      if (a.data)  setAttendance(a.data);
      if (g.data)  setGrades(g.data);
      if (q.data)  setQuran(q.data);
      if (p.data)  setPayments(p.data);
      setLoading(false);
    })();
  }, [authed]);

  // ── DB HELPERS ──
  const addStudent = async (data) => {
    const { data:d } = await sb.from("students").insert(data).select().single();
    if (d) setStudents(prev=>[...prev,d].sort((a,b)=>a.name.localeCompare(b.name,"ar")));
  };

  const addSession = async (data) => {
    const { data:d } = await sb.from("sessions").insert(data).select().single();
    if (d) setSessions(prev=>[d,...prev]);
    return d;
  };

  const upsertAttendance = async (records) => {
    await sb.from("attendance").upsert(records,{onConflict:"session_id,student_id"});
    setAttendance(prev=>{
      const filtered = prev.filter(a=>!records.find(r=>r.session_id===a.session_id&&r.student_id===a.student_id));
      return [...filtered,...records];
    });
  };

  const upsertGrade = async (record) => {
    await sb.from("grades").upsert(record,{onConflict:"student_id,subject"});
    setGrades(prev=>{
      const filtered = prev.filter(g=>!(g.student_id===record.student_id&&g.subject===record.subject));
      return [...filtered,record];
    });
  };

  const upsertQuran = async (record) => {
    await sb.from("quran").upsert(record,{onConflict:"student_id,surah_index"});
    setQuran(prev=>{
      const filtered = prev.filter(q=>!(q.student_id===record.student_id&&q.surah_index===record.surah_index));
      return [...filtered,record];
    });
  };

  const upsertPayment = async (record) => {
    await sb.from("payments").upsert(record,{onConflict:"student_id,month"});
    setPayments(prev=>{
      const filtered = prev.filter(p=>!(p.student_id===record.student_id&&p.month===record.month));
      return [...filtered,record];
    });
  };

  // ── ALERTS ──
  const now = new Date();
  const alerts = [];
  if (now.getDate() > 10) {
    students.forEach(s => {
      const paid = payments.find(p=>p.student_id===s.id&&p.month===curMonth()&&p.paid);
      if (!paid) alerts.push({ type:"payment", student:s, msg:"لم يدفع هذا الشهر" });
    });
  }
  students.forEach(s => {
    const sSessions = sessions.filter(se=>se.group_id===s.group_id).slice(0,4);
    if (sSessions.length>=4) {
      const allAbsent = sSessions.every(se=>attendance.find(a=>a.session_id===se.id&&a.student_id===s.id)?.status==="absent");
      if (allAbsent) alerts.push({ type:"absence", student:s, msg:"4 غيابات متتالية" });
    }
  });

  // ── LOGIN SCREEN ──
  if (!authed) return (
    <div style={{...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh"}}>
      <div style={{width:340, padding:40, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, textAlign:"center"}}>
        <div style={{fontSize:48, marginBottom:16}}>📚</div>
        <div style={{fontSize:22, fontWeight:900, marginBottom:6, background:"linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
          دروس الدعم
        </div>
        <div style={{fontSize:13, color:"#64748b", marginBottom:28}}>مرحباً بك — أدخل كلمة السر</div>
        <input type="password" placeholder="كلمة السر" value={pwd}
          onChange={e=>setPwd(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&tryLogin()}
          style={{...S.input, textAlign:"center", marginBottom:14, fontSize:16, letterSpacing:4}} />
        {pwdErr && <div style={{color:"#ef4444", fontSize:13, marginBottom:10}}>كلمة السر غلط ❌</div>}
        <button onClick={tryLogin} style={{...S.btn("linear-gradient(135deg,#0ea5e9,#6366f1)"), width:"100%", padding:13, fontSize:15}}>
          دخول →
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{...S.app, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16}}>
      <div style={{fontSize:48}}>📚</div>
      <div style={{fontSize:16, color:"#38bdf8"}}>جارٍ تحميل البيانات...</div>
    </div>
  );

  const openStudent = (id) => { setSelectedId(id); setPage("student"); };

  return (
    <div style={S.app}>
      <Header page={page} alerts={alerts} saving={saving}
        setPage={setPage} setSubPage={setSubPage} setSelectedId={setSelectedId} />
      <div style={{maxWidth:880, margin:"0 auto", padding:"18px 12px"}}>
        {page==="home" && subPage==="list" && (
          <HomePage students={students} sessions={sessions} attendance={attendance}
            payments={payments} alerts={alerts} addStudent={addStudent}
            setPage={setPage} setSubPage={setSubPage} openStudent={openStudent} />
        )}
        {page==="home" && subPage==="dashboard" && (
          <Dashboard students={students} sessions={sessions} attendance={attendance}
            payments={payments} openStudent={openStudent} />
        )}
        {page==="home" && subPage==="alerts" && (
          <AlertsPage alerts={alerts} payments={payments} upsertPayment={upsertPayment} />
        )}
        {page==="session" && (
          <SessionPage students={students} sessions={sessions} attendance={attendance}
            addSession={addSession} upsertAttendance={upsertAttendance}
            setPage={setPage} setSubPage={setSubPage} />
        )}
        {page==="student" && selectedId && (
          <StudentPage
            student={students.find(s=>s.id===selectedId)}
            sessions={sessions} attendance={attendance}
            grades={grades} quran={quran} payments={payments}
            upsertGrade={upsertGrade} upsertQuran={upsertQuran} upsertPayment={upsertPayment} />
        )}
      </div>
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────
function Header({ page, alerts, saving, setPage, setSubPage, setSelectedId }) {
  const now = new Date();
  const tg  = todayGroups();
  return (
    <div style={{background:"linear-gradient(135deg,#0a1628,#111827)", borderBottom:"1px solid rgba(56,189,248,0.15)", padding:"14px 18px", position:"sticky", top:0, zIndex:100}}>
      <div style={{maxWidth:880, margin:"0 auto"}}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8}}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            {page!=="home" && (
              <button onClick={()=>{setPage("home");setSubPage("list");setSelectedId(null);}}
                style={{...S.btn("rgba(255,255,255,0.08)"), padding:"7px 14px", fontSize:12}}>← رجوع</button>
            )}
            <div>
              <div style={{fontSize:17, fontWeight:900, background:"linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
                📚 دروس الدعم
              </div>
              <div style={{fontSize:11, color:"#475569", marginTop:2}}>
                {DAYS_AR[now.getDay()]} {now.getDate()} {MONTHS_AR[now.getMonth()]} {now.getFullYear()}
              </div>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
            {tg.map(g=>(
              <span key={g.id} style={{...S.badge(g.color,`${g.color}20`), fontSize:10}}>🟢 {g.name} {g.slot}</span>
            ))}
            {alerts.length>0 && (
              <span style={{...S.badge("#ef4444","rgba(239,68,68,0.15)"), cursor:"pointer"}}
                onClick={()=>{setPage("home");setSubPage("alerts");}}>
                🔔 {alerts.length}
              </span>
            )}
            {saving && <span style={{...S.badge("#38bdf8","rgba(56,189,248,0.15)"), fontSize:10}}>⏳ حفظ...</span>}
          </div>
        </div>
        {page==="home" && (
          <div style={{display:"flex", gap:2, marginTop:10, borderBottom:"1px solid rgba(255,255,255,0.06)", paddingBottom:2}}>
            {[["list","🏠 الرئيسية"],["dashboard","📊 لوحة التحكم"],["alerts",`🔔 التنبيهات${alerts.length>0?` (${alerts.length})`:""}`]].map(([k,l])=>(
              <button key={k} onClick={()=>setSubPage(k)} style={S.tab(false)}>{l}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME PAGE ───────────────────────────────────────────────
function HomePage({ students, sessions, attendance, payments, alerts, addStudent, setPage, setSubPage, openStudent }) {
  const [search, setSearch]     = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [showAdd, setShowAdd]   = useState(false);
  const [newS, setNewS]         = useState({name:"",level:"1",group_id:"1",phone:"",fee:""});
  const [adding, setAdding]     = useState(false);

  const handleAdd = async () => {
    if (!newS.name.trim()) return;
    setAdding(true);
    await addStudent({name:newS.name.trim(), level:parseInt(newS.level), group_id:newS.group_id, phone:newS.phone, fee:parseFloat(newS.fee)||0});
    setNewS({name:"",level:"1",group_id:"1",phone:"",fee:""});
    setShowAdd(false);
    setAdding(false);
  };

  const mk = curMonth();
  const filtered = students.filter(s=>{
    const ms = s.name.includes(search);
    const mg = filterGroup==="all" || s.group_id===filterGroup;
    return ms && mg;
  });

  const getRate = (s) => {
    const ss = sessions.filter(se=>se.group_id===s.group_id);
    if (!ss.length) return null;
    const present = ss.filter(se=>attendance.find(a=>a.session_id===se.id&&a.student_id===s.id&&a.status==="present")).length;
    return Math.round((present/ss.length)*100);
  };

  return (
    <div>
      {alerts.length>0 && (
        <div onClick={()=>setSubPage("alerts")} style={{...S.card, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <span style={{color:"#f87171", fontWeight:700}}>🔔 {alerts.length} تنبيه يحتاج انتباهك</span>
          <span style={{color:"#64748b"}}>›</span>
        </div>
      )}

      <div style={{display:"flex", gap:10, marginBottom:16}}>
        <button onClick={()=>setPage("session")} style={{...S.btn("linear-gradient(135deg,#0ea5e9,#6366f1)"), flex:1, padding:13}}>
          ➕ جلسة جديدة
        </button>
        <button onClick={()=>setShowAdd(!showAdd)} style={{...S.btn("rgba(255,255,255,0.07)"), flex:1, padding:13}}>
          👤 إضافة تلميذ
        </button>
      </div>

      {showAdd && (
        <div style={{...S.card, marginBottom:16}}>
          <div style={{fontWeight:700, marginBottom:14, color:"#38bdf8"}}>✏️ تلميذ جديد</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10}}>
            <input placeholder="الاسم الكامل *" value={newS.name} onChange={e=>setNewS({...newS,name:e.target.value})} style={S.input} />
            <input placeholder="رقم هاتف ولي الأمر" value={newS.phone} onChange={e=>setNewS({...newS,phone:e.target.value})} style={S.input} />
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14}}>
            <select value={newS.level} onChange={e=>setNewS({...newS,level:e.target.value})} style={S.input}>
              {Object.entries(LEVEL_NAMES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
            <select value={newS.group_id} onChange={e=>setNewS({...newS,group_id:e.target.value})} style={S.input}>
              {GROUPS.map(g=><option key={g.id} value={g.id}>{g.name} — {g.slot}</option>)}
            </select>
            <input placeholder="المبلغ الشهري (درهم)" type="number" value={newS.fee} onChange={e=>setNewS({...newS,fee:e.target.value})} style={S.input} />
          </div>
          <div style={{display:"flex", gap:8}}>
            <button onClick={handleAdd} disabled={adding} style={S.btn("#16a34a")}>{adding?"جارٍ الحفظ...":"✓ حفظ"}</button>
            <button onClick={()=>setShowAdd(false)} style={S.btn("rgba(255,255,255,0.07)")}>إلغاء</button>
          </div>
        </div>
      )}

      <div style={{display:"flex", gap:10, marginBottom:14}}>
        <input placeholder="🔍 بحث..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.input, flex:2}} />
        <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)} style={{...S.input, flex:1}}>
          <option value="all">جميع الأفواج</option>
          {GROUPS.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div style={{fontSize:12, color:"#475569", marginBottom:10}}>{filtered.length} تلميذ</div>

      {filtered.length===0 && (
        <div style={{...S.card, textAlign:"center", color:"#475569", padding:40}}>لا يوجد تلاميذ. أضف أول تلميذ!</div>
      )}

      {filtered.map(s=>{
        const group = GROUPS.find(g=>g.id===s.group_id);
        const rate  = getRate(s);
        const rateColor = rate===null?"#64748b":rate>=75?"#16a34a":rate>=50?"#f59e0b":"#dc2626";
        const paid  = payments.find(p=>p.student_id===s.id&&p.month===mk&&p.paid);
        const hasAlert = alerts.some(a=>a.student.id===s.id);
        return (
          <div key={s.id} style={{...S.card, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer",
            borderColor:hasAlert?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.07)",
            transition:"all 0.2s"}}
            onClick={()=>openStudent(s.id)}>
            <div style={{display:"flex", alignItems:"center", gap:12}}>
              <div style={{width:44, height:44, borderRadius:"50%", background:`${group?.color||"#0ea5e9"}15`, border:`2px solid ${group?.color||"#0ea5e9"}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0}}>
                👤
              </div>
              <div>
                <div style={{fontWeight:700, fontSize:14, display:"flex", alignItems:"center", gap:6}}>
                  {s.name}
                  {hasAlert && <span style={{fontSize:11}}>🔔</span>}
                </div>
                <div style={{fontSize:11, color:"#64748b", marginTop:3}}>
                  {LEVEL_NAMES[s.level]} • <span style={{color:group?.color}}>{group?.name}</span>
                  {s.fee>0 && <span> • {s.fee} د</span>}
                </div>
              </div>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <span style={{...S.badge(paid?"#16a34a":"#dc2626", paid?"rgba(22,163,74,0.12)":"rgba(220,38,38,0.1)"), fontSize:10}}>
                {paid?"✓ مدفوع":"✗ غير مدفوع"}
              </span>
              {rate!==null && <div style={{fontWeight:800, fontSize:14, color:rateColor, minWidth:38, textAlign:"center"}}>{rate}%</div>}
              <span style={{color:"#475569"}}>›</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ students, sessions, attendance, payments, openStudent }) {
  const mk  = curMonth();
  const now = new Date();
  const totalIncome    = students.filter(s=>payments.find(p=>p.student_id===s.id&&p.month===mk&&p.paid)).reduce((sum,s)=>sum+(s.fee||0),0);
  const expectedIncome = students.reduce((sum,s)=>sum+(s.fee||0),0);
  const unpaidCount    = students.filter(s=>!payments.find(p=>p.student_id===s.id&&p.month===mk&&p.paid)).length;

  const allRates = students.map(s=>{
    const ss = sessions.filter(se=>se.group_id===s.group_id);
    if (!ss.length) return null;
    const p = ss.filter(se=>attendance.find(a=>a.session_id===se.id&&a.student_id===s.id&&a.status==="present")).length;
    return { student:s, rate:Math.round((p/ss.length)*100) };
  }).filter(Boolean);
  const avgRate = allRates.length ? Math.round(allRates.reduce((a,b)=>a+b.rate,0)/allRates.length) : 0;
  const best    = [...allRates].sort((a,b)=>b.rate-a.rate).slice(0,3);
  const worst   = [...allRates].sort((a,b)=>a.rate-b.rate).slice(0,3);

  return (
    <div>
      <div style={{fontWeight:800, fontSize:17, marginBottom:16, color:"#38bdf8"}}>
        📊 لوحة التحكم — {MONTHS_AR[now.getMonth()]} {now.getFullYear()}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16}}>
        {[
          ["💰",`${totalIncome} د`,"المحصَّل","#16a34a"],
          ["📋",`${expectedIncome} د`,"المتوقع","#38bdf8"],
          ["❌",unpaidCount,"لم يدفعوا","#dc2626"],
          ["📅",`${avgRate}%`,"معدل الحضور","#818cf8"],
        ].map(([ic,v,l,c])=>(
          <div key={l} style={{...S.card, textAlign:"center", marginBottom:0}}>
            <div style={{fontSize:22}}>{ic}</div>
            <div style={{fontSize:24, fontWeight:900, color:c}}>{v}</div>
            <div style={{fontSize:11, color:"#64748b", marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{...S.card, marginBottom:16}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8}}>
          <span>نسبة التحصيل المالي</span>
          <span style={{color:"#16a34a", fontWeight:700}}>{expectedIncome>0?Math.round((totalIncome/expectedIncome)*100):0}%</span>
        </div>
        <div style={{height:8, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden"}}>
          <div style={{height:"100%", width:`${expectedIncome>0?(totalIncome/expectedIncome)*100:0}%`, background:"linear-gradient(90deg,#16a34a,#22c55e)", borderRadius:4, transition:"width 0.6s"}} />
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12}}>
        <div style={S.card}>
          <div style={{fontWeight:700, marginBottom:12, color:"#16a34a"}}>🏆 الأكثر حضوراً</div>
          {best.map(({student,rate})=>(
            <div key={student.id} style={{display:"flex", justifyContent:"space-between", marginBottom:8, cursor:"pointer"}} onClick={()=>openStudent(student.id)}>
              <span style={{fontSize:13}}>{student.name}</span>
              <span style={{color:"#16a34a", fontWeight:700}}>{rate}%</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{fontWeight:700, marginBottom:12, color:"#dc2626"}}>⚠️ الأكثر غياباً</div>
          {worst.map(({student,rate})=>(
            <div key={student.id} style={{display:"flex", justifyContent:"space-between", marginBottom:8, cursor:"pointer"}} onClick={()=>openStudent(student.id)}>
              <span style={{fontSize:13}}>{student.name}</span>
              <span style={{color:"#dc2626", fontWeight:700}}>{rate}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={{fontWeight:700, marginBottom:12}}>توزيع التلاميذ حسب الأفواج</div>
        {GROUPS.map(g=>{
          const count = students.filter(s=>s.group_id===g.id).length;
          const pct   = students.length ? Math.round((count/students.length)*100) : 0;
          return (
            <div key={g.id} style={{marginBottom:10}}>
              <div style={{display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4}}>
                <span style={{color:g.color, fontWeight:600}}>{g.name} — {g.slot}</span>
                <span>{count} تلاميذ</span>
              </div>
              <div style={{height:6, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden"}}>
                <div style={{height:"100%", width:`${pct}%`, background:g.color, borderRadius:3, transition:"width 0.5s"}} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ALERTS PAGE ─────────────────────────────────────────────
function AlertsPage({ alerts, payments, upsertPayment }) {
  const mk = curMonth();
  const markPaid = async (sid, fee) => {
    await upsertPayment({ student_id:sid, month:mk, paid:true, amount:fee||0 });
  };
  return (
    <div>
      <div style={{fontWeight:800, fontSize:17, marginBottom:16}}>🔔 التنبيهات</div>
      {alerts.length===0 && (
        <div style={{...S.card, textAlign:"center", color:"#64748b", padding:40}}>✅ لا توجد تنبيهات</div>
      )}
      {alerts.map((a,i)=>(
        <div key={i} style={{...S.card, borderColor:a.type==="payment"?"rgba(220,38,38,0.3)":"rgba(217,119,6,0.3)", background:a.type==="payment"?"rgba(220,38,38,0.06)":"rgba(217,119,6,0.06)"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10}}>
            <div style={{display:"flex", alignItems:"center", gap:12}}>
              <span style={{fontSize:26}}>{a.type==="payment"?"💰":"📅"}</span>
              <div>
                <div style={{fontWeight:700}}>{a.student.name}</div>
                <div style={{fontSize:12, color:"#94a3b8", marginTop:2}}>{a.msg} • {LEVEL_NAMES[a.student.level]}</div>
              </div>
            </div>
            {a.type==="payment" && (
              <div style={{display:"flex", gap:8}}>
                {a.student.phone && (
                  <a href={`https://wa.me/212${a.student.phone.replace(/^0/,"")}`} target="_blank" rel="noreferrer"
                    style={{...S.btn("#25d366"), textDecoration:"none", fontSize:12, padding:"7px 14px"}}>
                    📱 واتساب
                  </a>
                )}
                <button onClick={()=>markPaid(a.student.id, a.student.fee)} style={{...S.btn("#16a34a"), fontSize:12, padding:"7px 14px"}}>
                  ✓ تسجيل الدفع
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SESSION PAGE ─────────────────────────────────────────────
function SessionPage({ students, sessions, attendance, addSession, upsertAttendance, setPage, setSubPage }) {
  const tg = todayGroups();
  const [selGroup, setSelGroup] = useState(tg[0]?.id||GROUPS[0].id);
  const [sessAtt, setSessAtt]   = useState({});
  const [saving, setSaving]     = useState(false);
  const [done, setDone]         = useState(false);

  const group    = GROUPS.find(g=>g.id===selGroup);
  const gStudents = students.filter(s=>s.group_id===selGroup);

  const markAll = (status) => {
    const u = {};
    gStudents.forEach(s=>u[s.id]=status);
    setSessAtt(u);
  };

  const saveSession = async () => {
    setSaving(true);
    const session = await addSession({ date:todayStr(), group_id:selGroup });
    if (session) {
      const records = gStudents.map(s=>({ session_id:session.id, student_id:s.id, status:sessAtt[s.id]||"none" }));
      await upsertAttendance(records);
    }
    setDone(true);
    setTimeout(()=>{ setPage("home"); setSubPage("list"); }, 1500);
  };

  const now = new Date();

  if (done) return (
    <div style={{textAlign:"center", padding:60}}>
      <div style={{fontSize:60}}>✅</div>
      <div style={{fontSize:20, fontWeight:700, color:"#16a34a", marginTop:16}}>تم حفظ الجلسة في Supabase!</div>
    </div>
  );

  return (
    <div>
      <div style={{fontWeight:800, fontSize:17, marginBottom:18, color:"#38bdf8"}}>
        📅 جلسة جديدة — {DAYS_AR[now.getDay()]} {now.getDate()} {MONTHS_AR[now.getMonth()]}
      </div>

      <div style={{marginBottom:18}}>
        <div style={{fontSize:12, color:"#64748b", marginBottom:8}}>اختر الفوج:</div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          {GROUPS.map(g=>(
            <button key={g.id} onClick={()=>{setSelGroup(g.id);setSessAtt({});}}
              style={{...S.btn(selGroup===g.id?g.color:"rgba(255,255,255,0.06)"), fontSize:12, padding:"8px 14px",
                outline:tg.find(t=>t.id===g.id)?`2px solid ${g.color}`:"none", outlineOffset:2}}>
              {g.name} {tg.find(t=>t.id===g.id)?"🟢":""}
            </button>
          ))}
        </div>
        {group && <div style={{fontSize:11, color:"#64748b", marginTop:6}}>⏰ {group.slot} — {group.levels.map(l=>LEVEL_NAMES[l]).join("، ")}</div>}
      </div>

      {gStudents.length===0 ? (
        <div style={{...S.card, textAlign:"center", color:"#64748b", padding:30}}>لا يوجد تلاميذ في هذا الفوج</div>
      ) : (
        <>
          <div style={{display:"flex", gap:8, marginBottom:14}}>
            <button onClick={()=>markAll("present")} style={{...S.btn("rgba(22,163,74,0.2)","#16a34a"), fontSize:12}}>✓ الكل حاضر</button>
            <button onClick={()=>markAll("absent")}  style={{...S.btn("rgba(220,38,38,0.2)","#dc2626"), fontSize:12}}>✗ الكل غائب</button>
            <button onClick={()=>markAll("none")}    style={{...S.btn("rgba(255,255,255,0.07)"), fontSize:12}}>إعادة ضبط</button>
          </div>
          {gStudents.map(s=>{
            const status = sessAtt[s.id]||"none";
            return (
              <div key={s.id} style={{...S.card, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px"}}>
                <div style={{fontWeight:600, fontSize:14}}>{s.name}
                  <span style={{fontSize:11, color:"#64748b", marginRight:8}}>{LEVEL_NAMES[s.level]}</span>
                </div>
                <div style={{display:"flex", gap:6}}>
                  {STATUS_CYCLE.filter(k=>k!=="none").map(k=>{
                    const info = STATUS_INFO[k];
                    return (
                      <button key={k} onClick={()=>setSessAtt({...sessAtt,[s.id]:k})}
                        style={{padding:"6px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
                          background:status===k?info.bg:"rgba(255,255,255,0.04)",
                          color:status===k?info.color:"#64748b",
                          outline:status===k?`1px solid ${info.color}`:"none"}}>
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <button onClick={saveSession} disabled={saving}
            style={{...S.btn("linear-gradient(135deg,#16a34a,#15803d)"), width:"100%", padding:14, fontSize:15, marginTop:8}}>
            {saving?"جارٍ الحفظ...":"✓ حفظ الجلسة في Supabase"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── STUDENT PAGE ─────────────────────────────────────────────
function StudentPage({ student, sessions, attendance, grades, quran, payments, upsertGrade, upsertQuran, upsertPayment }) {
  const [tab, setTab] = useState("attendance");
  if (!student) return null;
  const group = GROUPS.find(g=>g.id===student.group_id);
  const sSessions = sessions.filter(s=>s.group_id===student.group_id);
  const stats = {present:0, absent:0, late:0};
  sSessions.forEach(s=>{
    const v = attendance.find(a=>a.session_id===s.id&&a.student_id===student.id)?.status||"none";
    if (stats[v]!==undefined) stats[v]++;
  });
  const total = sSessions.length;
  const rate  = total>0?Math.round((stats.present/total)*100):null;
  const rateColor = rate===null?"#64748b":rate>=75?"#16a34a":rate>=50?"#f59e0b":"#dc2626";

  return (
    <div>
      <div style={{...S.card, display:"flex", alignItems:"center", gap:14, marginBottom:18, background:"rgba(56,189,248,0.04)", borderColor:"rgba(56,189,248,0.15)"}}>
        <div style={{width:58, height:58, borderRadius:"50%", background:`${group?.color||"#0ea5e9"}15`, border:`3px solid ${group?.color||"#0ea5e9"}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0}}>👤</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:900, fontSize:18}}>{student.name}</div>
          <div style={{fontSize:12, color:"#64748b", marginTop:3}}>
            {LEVEL_NAMES[student.level]} — <span style={{color:group?.color}}>{group?.name}</span> — {group?.slot}
          </div>
          {student.phone && (
            <a href={`https://wa.me/212${student.phone.replace(/^0/,"")}`} target="_blank" rel="noreferrer"
              style={{fontSize:11, color:"#25d366", textDecoration:"none", marginTop:4, display:"inline-block"}}>
              📱 {student.phone}
            </a>
          )}
        </div>
        <div style={{textAlign:"center"}}>
          {rate!==null && <div style={{fontSize:28, fontWeight:900, color:rateColor}}>{rate}%</div>}
          <div style={{fontSize:10, color:"#64748b"}}>الحضور</div>
          {student.fee>0 && <div style={{fontSize:11, color:"#38bdf8", fontWeight:700, marginTop:4}}>{student.fee} د/شهر</div>}
        </div>
      </div>

      <div style={{display:"flex", gap:2, marginBottom:18, borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:2, overflowX:"auto"}}>
        {[["attendance","📅 الحضور"],["grades","📊 النتائج"],["payment","💰 المدفوعات"],["quran","🕌 القرآن"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={S.tab(tab===k)}>{l}</button>
        ))}
      </div>

      {tab==="attendance" && <AttendanceTab student={student} sessions={sSessions} attendance={attendance} stats={stats} total={total} />}
      {tab==="grades"     && <GradesTab student={student} grades={grades} upsertGrade={upsertGrade} />}
      {tab==="payment"    && <PaymentTab student={student} payments={payments} upsertPayment={upsertPayment} />}
      {tab==="quran"      && <QuranTab student={student} quran={quran} upsertQuran={upsertQuran} />}
    </div>
  );
}

// ─── ATTENDANCE TAB ───────────────────────────────────────────
function AttendanceTab({ student, sessions, attendance, stats, total }) {
  return (
    <div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18}}>
        {[["📋",total,"إجمالي","#64748b"],["✅",stats.present,"حاضر","#16a34a"],["❌",stats.absent,"غائب","#dc2626"],["⏰",stats.late,"متأخر","#d97706"]].map(([ic,v,l,c])=>(
          <div key={l} style={{...S.card, textAlign:"center", marginBottom:0}}>
            <div>{ic}</div>
            <div style={{fontSize:22, fontWeight:800, color:c}}>{v}</div>
            <div style={{fontSize:11, color:"#64748b"}}>{l}</div>
          </div>
        ))}
      </div>
      {sessions.length===0 && <div style={{...S.card, textAlign:"center", color:"#64748b", padding:30}}>لا توجد جلسات بعد</div>}
      {sessions.map(s=>{
        const status = attendance.find(a=>a.session_id===s.id&&a.student_id===student.id)?.status||"none";
        const info   = STATUS_INFO[status];
        return (
          <div key={s.id} style={{...S.card, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px"}}>
            <div style={{fontSize:13}}>📅 {formatDateAr(s.date)}</div>
            <span style={{...S.badge(info.color,info.bg), minWidth:60, textAlign:"center"}}>{info.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── GRADES TAB ───────────────────────────────────────────────
function GradesTab({ student, grades, upsertGrade }) {
  const subjects = getSubjects(student.level);
  const getVal   = (sub) => grades.find(g=>g.student_id===student.id&&g.subject===sub)?.score ?? "";
  const scores   = subjects.map(s=>parseFloat(getVal(s))).filter(v=>!isNaN(v));
  const avg      = scores.length>0?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2):null;
  const avgInfo  = avg?GRADE(parseFloat(avg)):null;

  const handleChange = async (subject, val) => {
    await upsertGrade({ student_id:student.id, subject, score:val====""?null:parseFloat(val) });
  };

  const printCard = () => {
    const rows = subjects.map(sub=>{
      const v  = getVal(sub);
      const gr = GRADE(v);
      return `<tr><td style="padding:10px;border:1px solid #e2e8f0">${sub}</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;font-weight:700">${v||"—"}</td><td style="padding:10px;border:1px solid #e2e8f0;text-align:center;color:${gr.color};font-weight:700">${v?gr.label:"—"}</td></tr>`;
    }).join("");
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>بطاقة نتائج — ${student.name}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;direction:rtl;color:#1e293b}h2{text-align:center;color:#1a3a6e;margin-bottom:5px}.subtitle{text-align:center;color:#64748b;font-size:14px;margin-bottom:20px}table{width:100%;border-collapse:collapse}th{background:#1a3a6e;color:#fff;padding:10px;font-size:14px}.avg{text-align:center;margin-top:24px;padding:16px;background:#f8fafc;border-radius:10px}</style>
    </head><body>
    <h2>📚 بطاقة النتائج</h2>
    <div class="subtitle">التلميذ: <strong>${student.name}</strong> &nbsp;|&nbsp; المستوى: <strong>${LEVEL_NAMES[student.level]}</strong> &nbsp;|&nbsp; التاريخ: ${new Date().toLocaleDateString("ar-MA")}</div>
    <table><thead><tr><th>المادة</th><th>النقطة /10</th><th>التقدير</th></tr></thead><tbody>${rows}</tbody></table>
    ${avg?`<div class="avg"><strong style="font-size:18px;color:${avgInfo.color}">${avg}/10 — ${avgInfo.label}</strong><br><span style="font-size:12px;color:#64748b">المعدل العام</span></div>`:""}
    </body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div>
      {avg && (
        <div style={{...S.card, textAlign:"center", marginBottom:18, background:avgInfo.bg, border:`1px solid ${avgInfo.color}44`}}>
          <div style={{fontSize:12, color:"#94a3b8"}}>المعدل العام</div>
          <div style={{fontSize:42, fontWeight:900, color:avgInfo.color}}>{avg}</div>
          <div style={{fontSize:15, fontWeight:700, color:avgInfo.color}}>{avgInfo.label}</div>
        </div>
      )}
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom:14}}>
        <button onClick={printCard} style={{...S.btn("rgba(255,255,255,0.08)"), fontSize:12}}>🖨️ طباعة البطاقة</button>
      </div>
      {subjects.map(subject=>{
        const val  = getVal(subject);
        const info = GRADE(val);
        return (
          <div key={subject} style={{...S.card, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, padding:"12px 16px"}}>
            <div style={{fontSize:13, fontWeight:600, flex:1}}>{subject}</div>
            <input type="number" min="0" max="10" step="0.25" placeholder="—" value={val}
              onChange={e=>handleChange(subject,e.target.value)}
              style={{...S.input, width:72, textAlign:"center", flex:"none"}} />
            {val!==""&&<span style={{...S.badge(info.color,info.bg), minWidth:80, textAlign:"center"}}>{info.label}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── PAYMENT TAB ─────────────────────────────────────────────
function PaymentTab({ student, payments, upsertPayment }) {
  const now = new Date();
  const months = [];
  for (let i=0;i<6;i++) {
    const d = new Date(now.getFullYear(),now.getMonth()-i,1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    months.push({ key, label:`${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}` });
  }
  const toggle = async (mk) => {
    const cur = payments.find(p=>p.student_id===student.id&&p.month===mk);
    await upsertPayment({ student_id:student.id, month:mk, paid:!cur?.paid, amount:student.fee||0 });
  };
  const paidCount = months.filter(m=>payments.find(p=>p.student_id===student.id&&p.month===m.key&&p.paid)).length;
  return (
    <div>
      <div style={{...S.card, textAlign:"center", marginBottom:18, background:"rgba(56,189,248,0.05)", borderColor:"rgba(56,189,248,0.2)"}}>
        <div style={{fontSize:12, color:"#94a3b8"}}>المبلغ الشهري</div>
        <div style={{fontSize:40, fontWeight:900, color:"#38bdf8"}}>{student.fee||0} <span style={{fontSize:16}}>درهم</span></div>
        <div style={{fontSize:12, color:"#64748b", marginTop:4}}>{paidCount} أشهر مدفوعة من أصل {months.length}</div>
      </div>
      {months.map(m=>{
        const isPaid = !!payments.find(p=>p.student_id===student.id&&p.month===m.key&&p.paid);
        return (
          <div key={m.key} style={{...S.card, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px",
            borderColor:isPaid?"rgba(22,163,74,0.3)":"rgba(220,38,38,0.15)",
            background:isPaid?"rgba(22,163,74,0.06)":"rgba(220,38,38,0.03)"}}>
            <div>
              <div style={{fontWeight:600, fontSize:14}}>{m.label}</div>
              {student.fee>0 && <div style={{fontSize:12, color:"#64748b", marginTop:2}}>{student.fee} درهم</div>}
            </div>
            <button onClick={()=>toggle(m.key)}
              style={{...S.btn(isPaid?"#16a34a":"rgba(220,38,38,0.15)",isPaid?"#fff":"#dc2626"), minWidth:110}}>
              {isPaid?"✓ مدفوع":"✗ لم يُدفع"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── QURAN TAB ────────────────────────────────────────────────
function QuranTab({ student, quran, upsertQuran }) {
  const [search, setSearch] = useState("");
  const getStatus = (i) => quran.find(q=>q.student_id===student.id&&q.surah_index===i)?.status||null;
  const toggle = async (i,val) => {
    const cur = getStatus(i);
    await upsertQuran({ student_id:student.id, surah_index:i, status:cur===val?null:val });
  };
  const fullCount    = quran.filter(q=>q.student_id===student.id&&q.status==="full").length;
  const partialCount = quran.filter(q=>q.student_id===student.id&&q.status==="partial").length;
  const filtered     = SURAHS.map((name,i)=>({name,i})).filter(({name})=>!search||name.includes(search));

  return (
    <div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16}}>
        {[["📖",fullCount,"حفظ كلي","#16a34a"],["📝",partialCount,"حفظ جزئي","#d97706"],["📊",fullCount+partialCount,"المجموع","#38bdf8"]].map(([ic,v,l,c])=>(
          <div key={l} style={{...S.card, textAlign:"center", marginBottom:0}}>
            <div>{ic}</div>
            <div style={{fontSize:22, fontWeight:800, color:c}}>{v}</div>
            <div style={{fontSize:11, color:"#64748b"}}>{l}</div>
          </div>
        ))}
      </div>
      <input placeholder="🔍 ابحث عن سورة..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.input, marginBottom:14}} />
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
        {filtered.map(({name,i})=>{
          const status = getStatus(i);
          return (
            <div key={i} style={{...S.card, padding:"10px 12px", marginBottom:0, display:"flex", alignItems:"center", justifyContent:"space-between",
              background:status==="full"?"rgba(22,163,74,0.1)":status==="partial"?"rgba(217,119,6,0.1)":"rgba(255,255,255,0.02)",
              border:status==="full"?"1px solid rgba(22,163,74,0.3)":status==="partial"?"1px solid rgba(217,119,6,0.3)":"1px solid rgba(255,255,255,0.05)"}}>
              <div>
                <div style={{fontSize:10, color:"#475569"}}>{i+1}</div>
                <div style={{fontSize:13, fontWeight:600}}>{name}</div>
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:4}}>
                <button onClick={()=>toggle(i,"full")}
                  style={{padding:"3px 8px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
                    background:status==="full"?"#16a34a":"rgba(22,163,74,0.1)", color:status==="full"?"#fff":"#16a34a"}}>كلي</button>
                <button onClick={()=>toggle(i,"partial")}
                  style={{padding:"3px 8px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
                    background:status==="partial"?"#d97706":"rgba(217,119,6,0.1)", color:status==="partial"?"#fff":"#d97706"}}>جزئي</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
