// ══════════════════════════════════════════════════════════════════════════════
//  SOLUMATCH — App.jsx
//  Front end conectado a Supabase con auth real, base de datos y chat en vivo
//  Guardar en: src/App.jsx
// ══════════════════════════════════════════════════════════════════════════════
// ─── MAPA ────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import LogoImg from "./logoAzul.svg";
import LogoBlanco from "./LogoBlanco.svg";
import { supabase, signUp, signIn, signInWithGoogle, signOut, getSession, getProfile, updateProfile, getWorks, getMyWorks, createWork, getSpecialists, getMySpecialistProfile, createSpecialist, createPostulacion, getMyPostulaciones, confirmPostulacion, getMessages, sendMessage, subscribeToMessages, uploadPhoto, resetPassword, getLicitaciones, getMyLicitaciones, createLicitacion, getPropuestas, createPropuesta, adjudicarPropuesta } from "./supabase";
const GMAPS_LIBS=["places"];
function MapPicker({onSelect,center={lat:-34.6037,lng:-58.3816}}){
  const{isLoaded}=useJsApiLoader({googleMapsApiKey:process.env.REACT_APP_GOOGLE_MAPS_KEY,libraries:GMAPS_LIBS});
  const[marker,setMarker]=useState(center);
  const[search,setSearch]=useState("");
  const inputRef=useRef();

  const doSearch=()=>{
    if(!window.google||!search)return;
    const geocoder=new window.google.maps.Geocoder();
    geocoder.geocode({address:search+", Argentina"},(results,status)=>{
      if(status==="OK"&&results[0]){
        const loc=results[0].geometry.location;
        setMarker({lat:loc.lat(),lng:loc.lng()});
        onSelect&&onSelect({lat:loc.lat(),lng:loc.lng(),address:results[0].formatted_address});
      }
    });
  };

  if(!isLoaded)return <div style={{textAlign:"center",padding:20,color:T.tm}}>Cargando mapa...</div>;
  return <div>
    <div style={{display:"flex",gap:8,marginBottom:8}}>
      <input ref={inputRef} className="inp" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="Buscá tu dirección..." style={{flex:1}}/>
      <button className="btn bp bsm" onClick={doSearch}>Buscar</button>
    </div>
    <GoogleMap mapContainerStyle={{width:"100%",height:200,borderRadius:12}} center={marker} zoom={14} onClick={e=>{const pos={lat:e.latLng.lat(),lng:e.latLng.lng()};setMarker(pos);onSelect&&onSelect({...pos,address:""});}}>
      <Marker position={marker}/>
    </GoogleMap>
  </div>;
}

function WorksMap({works}){
  const{isLoaded}=useJsApiLoader({googleMapsApiKey:process.env.REACT_APP_GOOGLE_MAPS_KEY,libraries:GMAPS_LIBS});
  if(!isLoaded||!works?.length)return null;
  const center=works[0]?.lat?{lat:works[0].lat,lng:works[0].lng}:{lat:-34.6037,lng:-58.3816};
  return <GoogleMap mapContainerStyle={{width:"100%",height:260,borderRadius:12}} center={center} zoom={12}>
    {works.filter(w=>w.lat&&w.lng).map(w=><Marker key={w.id} position={{lat:w.lat,lng:w.lng}} title={w.title}/>)}
  </GoogleMap>;
}



function Logo({onNav}){ return <div className="logo" onClick={()=>onNav("home")}><img src={LogoImg} style={{height:36,width:"auto",maxWidth:160}}/></div>; }


// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  navy:"#0B1740", navyMid:"#162257", navyLight:"#1e3a8a",
  orange:"#FF5C00", orangeSoft:"#FF7A2F", orangeGlow:"rgba(255,92,0,0.13)",
  green:"#16C784", greenSoft:"rgba(22,199,132,0.11)",
  red:"#EF4444", redSoft:"rgba(239,68,68,0.09)",
  amber:"#F59E0B", amberSoft:"rgba(245,158,11,0.11)",
  gold:"#EAB308", goldSoft:"rgba(234,179,8,0.11)",
  purple:"#8B5CF6", purpleSoft:"rgba(139,92,246,0.11)",
  white:"#FFFFFF", off:"#F7F8FC", border:"#E8ECF4",
  td:"#0B1740", tm:"#4B5878", tl:"#94A3C0",
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Poppins',sans-serif;background:#b8bfcf;color:${T.td};-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#c5cad8;border-radius:3px;}
.shell{max-width:430px;margin:0 auto;min-height:100vh;background:#fff;box-shadow:0 0 80px rgba(11,23,64,0.2);padding-bottom:68px;overflow-x:hidden;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;border:none;cursor:pointer;font-family:inherit;font-weight:700;border-radius:50px;transition:all .2s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;}
.btn:active{transform:scale(.95)!important;}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;}
.bp{background:${T.orange};color:#fff;padding:11px 22px;font-size:13px;box-shadow:0 4px 14px rgba(255,92,0,.28);}
.bp:hover{background:${T.orangeSoft};transform:translateY(-2px);box-shadow:0 6px 22px rgba(255,92,0,.36);}
.bs{background:${T.navy};color:#fff;padding:11px 22px;font-size:13px;}
.bs:hover{background:${T.navyMid};transform:translateY(-2px);}
.bg{background:transparent;color:${T.td};border:1.5px solid ${T.border};padding:10px 20px;font-size:13px;}
.bg:hover{border-color:${T.navy};background:${T.navy};color:#fff;}
.bsuc{background:${T.green};color:#fff;padding:12px 28px;font-size:14px;box-shadow:0 4px 14px rgba(22,199,132,.28);}
.bsuc:hover{background:#0ea36b;transform:translateY(-2px);}
.bgold{background:linear-gradient(135deg,#EAB308,#f59e0b);color:#fff;padding:11px 22px;font-size:13px;}
.bgold:hover{transform:translateY(-2px);}
.bpur{background:linear-gradient(135deg,${T.purple},#7c3aed);color:#fff;padding:11px 22px;font-size:13px;}
.bpur:hover{transform:translateY(-2px);}
.bred{background:${T.redSoft};color:${T.red};border:1.5px solid rgba(239,68,68,.2);padding:10px 20px;font-size:13px;}
.bred:hover{background:${T.red};color:#fff;}
.bsm{padding:7px 14px!important;font-size:11.5px!important;}
.blg{padding:14px 28px!important;font-size:15px!important;}
.bfull{width:100%;}
.field{margin-bottom:16px;}
.field label{display:block;font-size:11px;font-weight:800;color:${T.tm};margin-bottom:6px;text-transform:uppercase;letter-spacing:.6px;}
.inp{width:100%;border:1.5px solid ${T.border};border-radius:12px;padding:12px 14px;font-size:14px;font-family:inherit;background:${T.off};color:${T.td};outline:none;transition:all .2s;}
.inp:focus{border-color:${T.orange};background:#fff;box-shadow:0 0 0 3px ${T.orangeGlow};}
.inp::placeholder{color:${T.tl};}
textarea.inp{resize:vertical;min-height:88px;}
select.inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234B5878' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;cursor:pointer;}
.badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;}
.bu{background:${T.redSoft};color:${T.red};}
.bc{background:#EEF2FF;color:#4338CA;}
.bi{background:${T.greenSoft};color:#065F46;}
.bpr{background:#EFF6FF;color:#1D4ED8;}
.bpe{background:${T.amberSoft};color:#92400E;}
.bna{background:rgba(11,23,64,.08);color:${T.navy};}
.bor{background:rgba(255,92,0,.10);color:${T.orange};}
.bgold2{background:${T.goldSoft};color:#92400E;}
.bpur2{background:${T.purpleSoft};color:${T.purple};}
.card{background:#fff;border-radius:14px;border:1px solid ${T.border};box-shadow:0 2px 10px rgba(11,23,64,.07);overflow:hidden;transition:all .2s;}
.card:hover{box-shadow:0 6px 24px rgba(11,23,64,.13);transform:translateY(-2px);}
.wc{background:${T.navy};border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:11px;cursor:pointer;transition:all .2s;color:#fff;border:1px solid rgba(255,255,255,.05);}
.wc:hover{background:${T.navyMid};transform:translateY(-2px);box-shadow:0 8px 28px rgba(11,23,64,.22);}
.wca{width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.28);flex-shrink:0;}
.wcb{flex:1;min-width:0;}
.wcc{font-size:9px;color:#93c5fd;text-transform:uppercase;font-weight:800;letter-spacing:.8px;}
.wct{font-size:12.5px;font-weight:700;margin:2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wcbtn{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);color:#fff;border-radius:20px;padding:5px 11px;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;}
.wcbtn:hover{background:rgba(255,255,255,.24);}
.topbar{display:flex;justify-content:space-between;align-items:center;padding:6px 14px;background:${T.navy};font-size:11px;color:rgba(255,255,255,.55);}
.topbar a{color:rgba(255,255,255,.55);text-decoration:none;}
.topbar a:hover{color:#fff;}
.navbar{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#fff;border-bottom:1px solid ${T.border};position:sticky;top:0;z-index:100;box-shadow:0 2px 10px rgba(11,23,64,.07);}
.logo{display:flex;align-items:center;gap:7px;cursor:pointer;user-select:none;}
.logo-t{font-family:'Syne',sans-serif;font-weight:900;font-size:19px;color:${T.navy};letter-spacing:-.5px;}
.logo-t span{color:${T.orange};}
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#fff;border-top:1px solid ${T.border};display:flex;padding:5px 0 10px;z-index:200;box-shadow:0 -4px 20px rgba(11,23,64,.07);}
.bni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;padding:4px 2px;border-radius:10px;transition:all .2s;}
.bni-lbl{font-size:9.5px;font-weight:700;color:${T.tl};}
.bni.on .bni-lbl{color:${T.orange};}
.bni-dot{width:5px;height:5px;border-radius:50%;background:${T.orange};margin-top:1px;}
.sbar{display:flex;align-items:center;gap:8px;padding:10px 16px;font-weight:800;font-size:14px;color:#fff;}
.sbar-or{background:linear-gradient(90deg,${T.orange},#ff8c42);}
.sbar-nv{background:${T.navy};}
.tabbar{display:flex;border-bottom:1px solid ${T.border};}
.tabbtn{flex:1;padding:12px 4px;border:none;background:#fff;font-family:inherit;font-size:12px;font-weight:700;color:${T.tm};border-bottom:3px solid transparent;cursor:pointer;transition:all .2s;}
.tabbtn.on{color:${T.orange};border-bottom-color:${T.orange};}
.fbar{display:flex;align-items:center;gap:6px;padding:9px 14px;overflow-x:auto;border-bottom:1px solid ${T.border};}
.fbar::-webkit-scrollbar{display:none;}
.chip{white-space:nowrap;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;border:1.5px solid ${T.border};color:${T.tm};background:#fff;}
.chip.on{background:${T.navy};color:#fff;border-color:${T.navy};}
.sbar-wrap{padding:9px 14px;border-bottom:1px solid ${T.border};}
.sbar-inner{display:flex;align-items:center;gap:8px;background:${T.off};border:1.5px solid ${T.border};border-radius:12px;padding:9px 13px;}
.sbar-inner input{flex:1;border:none;background:transparent;font-size:13px;font-family:inherit;color:${T.td};outline:none;}
.hero{background:linear-gradient(155deg,${T.navy} 0%,#1a3570 100%);padding:20px 16px 24px;position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(255,92,0,.17) 0%,transparent 70%);}
.htitle{font-family:'Syne',sans-serif;font-weight:900;font-size:26px;color:#fff;line-height:1.1;margin-bottom:16px;}
.htitle em{color:${T.orange};font-style:normal;}
.stat{flex:1;background:${T.off};border-radius:12px;padding:11px 7px;text-align:center;border:1px solid ${T.border};}
.stat-n{font-family:'Syne',sans-serif;font-weight:900;font-size:19px;color:${T.orange};}
.stat-l{font-size:9.5px;color:${T.tm};font-weight:600;margin-top:2px;}
.steps{display:flex;align-items:center;padding:14px 0 18px;}
.sdot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;transition:all .3s;}
.sdone{background:${T.green};color:#fff;}
.sact{background:${T.orange};color:#fff;box-shadow:0 0 0 4px ${T.orangeGlow};}
.spend{background:${T.border};color:${T.tl};}
.slbl{font-size:10px;font-weight:700;}
.sla{color:${T.orange};}.sld{color:${T.green};}.slp{color:${T.tl};}
.sline{flex:1;height:2px;margin:0 4px;border-radius:2px;transition:background .3s;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.46);z-index:400;display:flex;align-items:flex-end;justify-content:center;}
.overlay-c{align-items:center!important;padding:20px;}
.modal{background:#fff;border-radius:22px 22px 0 0;width:100%;max-width:430px;max-height:88vh;overflow-y:auto;padding:18px 16px 30px;}
.modal-c{border-radius:18px!important;max-width:390px!important;width:100%;}
.mhandle{width:36px;height:4px;background:${T.border};border-radius:2px;margin:0 auto 14px;}
.mtitle{font-family:'Syne',sans-serif;font-weight:900;font-size:17px;color:${T.td};margin-bottom:4px;}
.cal-hdr{display:flex;justify-content:space-between;align-items:center;padding:10px 2px;margin-bottom:6px;}
.cal-nav{background:none;border:none;cursor:pointer;font-size:18px;color:${T.tm};padding:4px 10px;border-radius:8px;transition:all .18s;}
.cal-nav:hover{background:${T.off};color:${T.td};}
.cal-title{font-family:'Syne',sans-serif;font-weight:900;font-size:14px;color:${T.td};}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.cal-dl{text-align:center;font-size:9.5px;font-weight:800;color:${T.tl};padding:3px 0;text-transform:uppercase;}
.cal-day{text-align:center;padding:7px 0;font-size:13px;font-weight:600;border-radius:8px;cursor:pointer;transition:all .15s;color:${T.td};}
.cal-day:hover:not(.cal-emp):not(.cal-past){background:${T.off};color:${T.orange};}
.cal-today{font-weight:900;color:${T.orange};}
.cal-sel{background:${T.orange}!important;color:#fff!important;border-radius:50%!important;font-weight:800!important;}
.cal-past{color:${T.border};cursor:default;}
.cal-emp{cursor:default;}
.map-wrap{border-radius:13px;overflow:hidden;border:1.5px solid ${T.border};height:200px;background:#e8ecf4;position:relative;}
.pmode-row{display:flex;gap:7px;margin-bottom:13px;}
.pmode{flex:1;padding:10px 6px;border-radius:11px;border:1.5px solid ${T.border};background:#fff;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit;color:${T.tm};text-align:center;}
.pmode.on{border-color:${T.orange};background:${T.orangeGlow};color:${T.orange};}
.pmode:hover:not(.on){border-color:${T.orange};color:${T.orange};}
.pmode-ic{font-size:18px;display:block;margin-bottom:4px;}
.cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0;}
.cat-item{padding:10px 11px;border-radius:11px;border:1.5px solid ${T.border};background:#fff;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:7px;font-family:inherit;color:${T.td};}
.cat-item:hover,.cat-item.on{border-color:${T.orange};background:${T.orangeGlow};}
.cat-item.on{color:${T.orange};}
.toggle-row{display:flex;background:${T.off};border-radius:11px;padding:4px;border:1px solid ${T.border};margin-bottom:14px;}
.toggle-opt{flex:1;padding:9px;border-radius:9px;font-size:12.5px;font-weight:700;cursor:pointer;transition:all .2s;text-align:center;color:${T.tm};background:transparent;border:none;font-family:inherit;}
.toggle-opt.on{background:#fff;color:${T.navy};box-shadow:0 2px 8px rgba(11,23,64,.08);}
.urg-row{display:flex;gap:7px;margin-bottom:18px;}
.urgbtn{flex:1;padding:10px 5px;border-radius:10px;border:1.5px solid ${T.border};background:#fff;font-size:11.5px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit;color:${T.tm};text-align:center;}
.urgbtn.on{border-color:${T.navy};background:${T.navy};color:#fff;}
.loc-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.alert{border-radius:11px;padding:10px 13px;margin-bottom:13px;font-size:12.5px;font-weight:600;display:flex;align-items:flex-start;gap:7px;line-height:1.5;}
.alert-warn{background:${T.amberSoft};color:#92400E;}
.alert-info{background:${T.purpleSoft};color:${T.purple};}
.alert-suc{background:${T.greenSoft};color:#065F46;}
.alert-or{background:${T.orangeGlow};color:${T.orange};}
.alert-err{background:${T.redSoft};color:${T.red};}
.detcard{margin:11px 14px;background:#fff;border-radius:15px;border:1.5px solid ${T.border};padding:15px;box-shadow:0 4px 22px rgba(11,23,64,.12);}
.det-row{background:${T.off};border-radius:9px;padding:9px 11px;margin-bottom:9px;}
.det-lbl{font-size:9.5px;font-weight:800;color:${T.tl};text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;}
.det-val{font-size:13px;color:${T.td};}
.mwcard{background:#fff;border-radius:13px;border:1.5px solid ${T.border};padding:13px;margin-bottom:11px;box-shadow:0 2px 9px rgba(11,23,64,.07);transition:all .2s;}
.mwcard:hover{box-shadow:0 5px 20px rgba(11,23,64,.12);}
.post-card{background:${T.off};border-radius:10px;padding:10px;display:flex;align-items:center;gap:9px;margin-bottom:7px;}
.specdir-card{background:#fff;border-radius:13px;border:1px solid ${T.border};padding:13px;box-shadow:0 2px 9px rgba(11,23,64,.07);transition:all .2s;cursor:pointer;}
.specdir-card:hover{box-shadow:0 5px 20px rgba(11,23,64,.13);transform:translateY(-2px);}
.prof-hero{background:linear-gradient(155deg,${T.navy} 0%,#1e3a8a 100%);padding:24px 18px 20px;text-align:center;color:#fff;}
.pst{background:rgba(255,255,255,.12);border-radius:11px;padding:8px 12px;text-align:center;min-width:62px;}
.pst-n{font-family:'Syne',sans-serif;font-weight:900;font-size:17px;}
.pst-l{font-size:9px;color:#93c5fd;font-weight:600;margin-top:1px;}
.plan-card{border-radius:15px;padding:18px;margin-bottom:11px;border:2px solid transparent;transition:all .2s;position:relative;overflow:hidden;}
.plan-free{background:${T.off};border-color:${T.border};}
.plan-pro{background:linear-gradient(135deg,rgba(234,179,8,.05),rgba(234,179,8,.13));border-color:${T.gold};}
.plan-plat{background:linear-gradient(135deg,rgba(139,92,246,.05),rgba(139,92,246,.13));border-color:${T.purple};}
.plan-badge{position:absolute;top:14px;right:14px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:800;}
.plan-name{font-family:'Syne',sans-serif;font-weight:900;font-size:17px;margin-bottom:3px;}
.plan-price{font-size:24px;font-weight:900;color:${T.orange};font-family:'Syne',sans-serif;}
.plan-price span{font-size:13px;font-weight:600;color:${T.tm};}
.plan-feat{display:flex;align-items:flex-start;gap:7px;font-size:12px;color:${T.tm};margin-bottom:6px;line-height:1.4;}
.bub-me{background:${T.navy};color:#fff;border-radius:18px 18px 4px 18px;padding:9px 13px;font-size:13px;max-width:78%;}
.bub-them{background:#fff;color:${T.td};border-radius:18px 18px 18px 4px;padding:9px 13px;font-size:13px;max-width:78%;border:1px solid ${T.border};}
.confscr{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:55px 22px;text-align:center;min-height:55vh;}
.conf-ic{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:42px;margin-bottom:22px;animation:popIn .5s cubic-bezier(.34,1.56,.64,1);}
.auth{padding:24px 20px;}
.auth-title{font-family:'Syne',sans-serif;font-weight:900;font-size:26px;color:${T.navy};margin-bottom:4px;}
.auth-sub{font-size:13px;color:${T.tm};margin-bottom:22px;}
.social-row{display:flex;gap:9px;margin-bottom:13px;}
.social-btn{flex:1;padding:11px;border-radius:10px;border:1.5px solid ${T.border};background:#fff;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-family:inherit;transition:all .2s;}
.social-btn:hover{border-color:${T.navy};background:${T.off};}
.divider{text-align:center;color:${T.tl};font-size:12px;margin:13px 0;position:relative;}
.divider::before,.divider::after{content:'';position:absolute;top:50%;width:41%;height:1px;background:${T.border};}
.divider::before{left:0;}.divider::after{right:0;}
.rbtn{flex:1;padding:11px 8px;border-radius:11px;border:1.5px solid ${T.border};background:#fff;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit;color:${T.tm};text-align:center;}
.rbtn.on{border-color:${T.orange};background:${T.orangeGlow};color:${T.orange};}
.uprof-hero{background:linear-gradient(155deg,${T.navy},#1a3570);padding:26px 18px 20px;position:relative;overflow:hidden;}
.uprof-hero::before{content:'';position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,92,0,.18) 0%,transparent 70%);}
.uprof-av{width:76px;height:76px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,.2);}
.uprof-qstat{background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:9px 7px;text-align:center;}
.uprof-qstat-n{font-family:'Syne',sans-serif;font-weight:900;font-size:18px;color:#fff;}
.uprof-qstat-l{font-size:9px;color:rgba(255,255,255,.55);font-weight:600;line-height:1.3;margin-top:1px;}
.data-row{display:flex;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid ${T.border};}
.data-ic{font-size:19px;flex-shrink:0;width:28px;text-align:center;}
.data-lbl{font-size:10px;font-weight:800;color:${T.tl};text-transform:uppercase;letter-spacing:.5px;margin-bottom:1px;}
.data-val{font-size:13.5px;font-weight:600;color:${T.td};}
.av-pick img{width:36px;height:36px;border-radius:50%;object-fit:cover;cursor:pointer;border:2.5px solid ${T.border};transition:all .2s;}
.av-pick img.on{border-color:${T.orange};transform:scale(1.1);}
.faq{border-radius:11px;border:1.5px solid ${T.border};margin-bottom:7px;overflow:hidden;transition:all .2s;}
.faq.open{border-color:${T.orange};box-shadow:0 0 0 3px ${T.orangeGlow};}
.faq-q{display:flex;justify-content:space-between;align-items:center;padding:13px 15px;cursor:pointer;font-size:13px;font-weight:700;}
.faq-arr{color:${T.orange};font-size:17px;transition:transform .22s;flex-shrink:0;}
.faq-arr.open{transform:rotate(180deg);}
.faq-a{padding:0 15px 12px;font-size:13px;color:${T.tm};line-height:1.65;border-top:1px solid ${T.off};}
.pslot{flex:1;height:66px;background:${T.off};border-radius:9px;border:1.5px dashed ${T.border};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;color:${T.tl};font-size:19px;}
.pslot:hover{border-color:${T.orange};color:${T.orange};background:${T.orangeGlow};}
.pslot.filled{border-style:solid;background:${T.navy};color:#fff;}
.footer{background:${T.navy};color:#fff;padding:26px 18px 18px;margin-top:24px;}
.fl{font-family:'Syne',sans-serif;font-weight:900;font-size:17px;margin-bottom:5px;}
.fl span{color:${T.orange};}
.fdesc{font-size:11.5px;color:rgba(255,255,255,.4);line-height:1.6;max-width:175px;}
.fgrid{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px;}
.stbtn{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);border-radius:8px;padding:6px 13px;font-size:11px;color:#fff;cursor:pointer;display:flex;align-items:center;gap:5px;font-family:inherit;transition:all .2s;margin-bottom:5px;}
.stbtn:hover{background:rgba(255,255,255,.15);}
.fsoc{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.09);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;transition:all .2s;}
.fsoc:hover{background:${T.orange};}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;color:${T.tl};}
.spinner{width:36px;height:36px;border-radius:50%;border:3px solid ${T.border};border-top-color:${T.orange};animation:spin .8s linear infinite;margin-bottom:12px;}
@keyframes spin{to{transform:rotate(360deg);}}
.ani{animation:fadeUp .3s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes popIn{from{transform:scale(0);opacity:0;}to{transform:scale(1);opacity:1;}}
`;

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  {icon:"🔧",name:"Reparaciones"},{icon:"🏠",name:"Remodelación"},{icon:"💡",name:"Electricidad"},
  {icon:"🚿",name:"Plomería"},{icon:"🌿",name:"Jardinería"},{icon:"🚛",name:"Mudanza"},
  {icon:"💻",name:"Informático"},{icon:"🎨",name:"Pintura"},{icon:"❄️",name:"Aire acond."},
  {icon:"🔒",name:"Cerrajería"},{icon:"🐾",name:"Mascotas"},{icon:"🧹",name:"Limpieza"},
  {icon:"📦",name:"Otros"},
];
const PROVINCES = ["Buenos Aires","CABA","Córdoba","Santa Fe","Mendoza","Tucumán","Entre Ríos","Salta","Misiones","Chaco","Corrientes","Santiago del Estero","San Juan","Jujuy","Río Negro","Neuquén","Formosa","Chubut","San Luis","Catamarca","La Rioja","La Pampa","Santa Cruz","Tierra del Fuego"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DDAYS  = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];
const DEMO_AVS = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/90.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
  "https://randomuser.me/api/portraits/women/26.jpg",
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/women/55.jpg",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const catIcon = n => CATEGORIES.find(c=>c.name===n)?.icon || "📦";
const avgRat = jobs => jobs?.length ? (jobs.reduce((a,j)=>a+(j.rating||j.cal||0),0)/jobs.length).toFixed(1) : "Nuevo";

const badge = s => {
  const m={"Urgente":["bu","🔴"],"A convenir":["bc","🔵"],"En proceso":["bpr","🔵"],"Pendiente":["bpe","🟡"],"Completado":["bi","✅"]};
  const [cl,ic]=m[s]||["bna",""];
  return <span className={`badge ${cl}`}>{ic} {s}</span>;
};
const priceBadge = w => {
  if(w.price_mode==="fijo"||w.priceMode==="fijo")     return <span className="badge bi">💵 ${(w.price_fijo||w.priceFijo||0).toLocaleString()}</span>;
  if(w.price_mode==="flexible"||w.priceMode==="flexible") return <span className="badge bc">💰 ${(w.price_min||w.priceMin||0).toLocaleString()}–${(w.price_max||w.priceMax||0).toLocaleString()}</span>;
  if(w.price_mode==="ofertas"||w.priceMode==="ofertas")  return <span className="badge bor">🤝 Escucho ofertas</span>;
  return null;
};
const planBadge = p => {
  if(p==="platinum") return <span className="badge bpur2">💎 Platinum</span>;
  if(p==="pro")      return <span className="badge bgold2">⭐ Pro</span>;
  return <span className="badge bna">Free</span>;
};

// ─── LOADING / ERROR ─────────────────────────────────────────────────────────
function Loading({msg="Cargando..."}){
  return <div className="loading"><div className="spinner"/><span style={{fontSize:13}}>{msg}</span></div>;
}
function ErrMsg({msg}){
  return <div className="alert alert-err" style={{margin:16}}><span>⚠️</span><span>{msg}</span></div>;
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────


function TopBar({onNav,user}){
  return <div className="topbar">
    <div style={{display:"flex",gap:9,alignItems:"center"}}>
      <a href="#" onClick={e=>{e.preventDefault();onNav("terms")}}>Condiciones</a>
      <span style={{opacity:.3}}>|</span>
      <a href="#" onClick={e=>{e.preventDefault();onNav("faqs")}}>FAQ</a>
      <span style={{opacity:.3}}>|</span>
      <a href="#" onClick={e=>{e.preventDefault();onNav("licitaciones")}}>Obras</a>
    </div>
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      {user
        ?<div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}} onClick={()=>onNav("userprofile")}>
            <img src={user.avatar_url||DEMO_AVS[0]} style={{width:22,height:22,borderRadius:"50%",objectFit:"cover",border:`1.5px solid ${T.orange}`}}/>
            <span style={{color:"rgba(255,255,255,.85)",fontSize:11,fontWeight:700}}>{(user.name||"Usuario").split(" ")[0]}</span>
          </div>
        :<>
          <button className="btn bs bsm" style={{padding:"5px 11px",fontSize:10.5}} onClick={()=>onNav("login")}>Ingresar</button>
          <button className="btn bp bsm" style={{padding:"5px 11px",fontSize:10.5}} onClick={()=>onNav("register")}>Crear cuenta</button>
        </>
      }
    </div>
  </div>;
}

function Navbar({onNav,user,v="full"}){
  return <div className="navbar">
    <Logo onNav={onNav}/>
    <div style={{display:"flex",gap:7,alignItems:"center"}}>
      {v==="full"&&<button className="btn bp bsm" onClick={()=>onNav("publish1")}>Publicar</button>}
      <button className="btn bs bsm" onClick={()=>onNav("search2")}>Ver trabajos</button>
      {user
        ?<div onClick={()=>onNav("userprofile")} style={{cursor:"pointer",flexShrink:0}}>
            <img src={user.avatar_url||DEMO_AVS[0]} style={{width:30,height:30,borderRadius:"50%",objectFit:"cover",border:`2.5px solid ${T.orange}`}}/>
          </div>
        :<span style={{fontSize:14,cursor:"pointer",color:T.tm}} onClick={()=>onNav("login")}>👤</span>
      }
    </div>
  </div>;
}

function BNav({page,onNav,user}){
  const items=[
    {id:"home",ic:"🏠",lb:"Inicio"},
    {id:"search2",ic:"🔍",lb:"Trabajos"},
    {id:"publish1",ic:"➕",lb:"Publicar"},
    
    {id:"specialists",ic:"👷",lb:"Especialistas"},
    {id:"userprofile",ic:null,lb:"Mi perfil"},
  ];
  return <nav className="bnav">
    {items.map(it=>(
      <div key={it.id} className={`bni ${page===it.id?"on":""}`} onClick={()=>onNav(it.id)}>
        {it.id==="userprofile"
          ?<img src={user?.avatar_url||DEMO_AVS[0]} style={{width:22,height:22,borderRadius:"50%",objectFit:"cover",border:`2px solid ${page===it.id?T.orange:T.border}`}}/>
          :<span style={{fontSize:18,lineHeight:1}}>{it.ic}</span>
        }
        <span className="bni-lbl">{it.lb}</span>
        {page===it.id&&<div className="bni-dot"/>}
      </div>
    ))}
  </nav>;
}

function Footer({onNav}){
  return <footer className="footer">
    <div className="fgrid">
      <div><img src={LogoBlanco} style={{height:36,width:"auto",marginBottom:8}}/><p className="fdesc">Conectamos personas con especialistas para cualquier tarea del hogar.</p></div>
      <div><div style={{fontSize:10.5,color:"rgba(255,255,255,.4)",marginBottom:7,textTransform:"uppercase",letterSpacing:.5}}>Próximamente</div>
        <button className="stbtn">▶ Google Play</button><button className="stbtn">🍎 App Store</button></div>
    </div>
    <div style={{display:"flex",gap:9,justifyContent:"center",marginBottom:13}}>
      {["𝕏","📹","▶","📷","👍"].map((ic,i)=><div key={i} className="fsoc">{ic}</div>)}
    </div>
    <p style={{textAlign:"center",fontSize:10.5,color:"rgba(255,255,255,.25)",paddingTop:13,borderTop:"1px solid rgba(255,255,255,.07)"}}>© 2025 Solumatch · Argentina</p>
  </footer>;
}

function Steps({cur}){
  const steps=["Título","Ubicación","Precio","Detalles"];
  return <div className="steps">
    {steps.map((s,i)=>{
      const st=i<cur?"done":i===cur?"act":"pend";
      return <div key={s} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <div className={`sdot s${st}`}>{st==="done"?"✓":i+1}</div>
          <span className={`slbl sl${st==="done"?"d":st==="act"?"a":"p"}`}>{s}</span>
        </div>
        {i<steps.length-1&&<div className="sline" style={{background:i<cur?T.green:i===cur?T.orange:T.border}}/>}
      </div>;
    })}
  </div>;
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function Calendar({value,onChange,minDate}){
  const today=new Date(); today.setHours(0,0,0,0);
  const [vw,setVw]=useState(value?new Date(value+"T12:00:00"):new Date());
  const y=vw.getFullYear(),m=vw.getMonth();
  const first=new Date(y,m,1).getDay(), days=new Date(y,m+1,0).getDate();
  const cells=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>i+1)];
  const sel=value?new Date(value+"T12:00:00"):null;
  const minD=minDate?new Date(minDate):today;
  const isToday=d=>d&&new Date(y,m,d).toDateString()===today.toDateString();
  const isPast=d=>{if(!d)return true;const dt=new Date(y,m,d);dt.setHours(0,0,0,0);return dt<minD;};
  const isSel=d=>{if(!d||!sel)return false;return sel.getFullYear()===y&&sel.getMonth()===m&&sel.getDate()===d;};
  const pick=d=>{if(!d||isPast(d))return;const dt=new Date(y,m,d);onChange(`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`);};
  return <div>
    <div className="cal-hdr">
      <button className="cal-nav" onClick={()=>setVw(new Date(y,m-1,1))}>‹</button>
      <span className="cal-title">{MONTHS[m]} {y}</span>
      <button className="cal-nav" onClick={()=>setVw(new Date(y,m+1,1))}>›</button>
    </div>
    <div className="cal-grid">
      {DDAYS.map(d=><div key={d} className="cal-dl">{d}</div>)}
      {cells.map((d,i)=><div key={i} className={`cal-day ${!d?"cal-emp":""} ${d&&isToday(d)&&!isSel(d)?"cal-today":""} ${d&&isSel(d)?"cal-sel":""} ${d&&isPast(d)?"cal-past":""}`} onClick={()=>pick(d)}>{d||""}</div>)}
    </div>
  </div>;
}
function CalModal({value,onChange,onClose,title,minDate}){
  return <div className="overlay overlay-c" onClick={onClose}>
    <div className="modal modal-c" style={{padding:20}} onClick={e=>e.stopPropagation()}>
      <div className="mtitle" style={{marginBottom:14}}>{title||"Elegir fecha"}</div>
      <Calendar value={value} onChange={d=>{onChange(d);onClose();}} minDate={minDate}/>
      {value&&<div style={{textAlign:"center",marginTop:12}}><button className="btn bp" onClick={onClose}>Confirmar: {value}</button></div>}
    </div>
  </div>;
}

// ─── CATEGORY PICKER ─────────────────────────────────────────────────────────
function CatPicker({value,onChange}){
  const [open,setOpen]=useState(false);
  const sel=CATEGORIES.find(c=>c.name===value);
  return <>
    <div onClick={()=>setOpen(true)} className="inp" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
      {sel?<><span>{sel.icon}</span><span style={{fontWeight:700}}>{sel.name}</span></>:<span style={{color:T.tl}}>Seleccioná una categoría...</span>}
      <span style={{marginLeft:"auto",color:T.tl,fontSize:12}}>⌄</span>
    </div>
    {open&&<div className="overlay" onClick={()=>setOpen(false)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/><div className="mtitle">Categoría del trabajo</div>
        <div className="cat-grid">
          {CATEGORIES.map(c=><button key={c.name} className={`cat-item ${value===c.name?"on":""}`} onClick={()=>{onChange(c.name);setOpen(false);}}>
            <span style={{fontSize:19}}>{c.icon}</span><span>{c.name}</span>
          </button>)}
        </div>
      </div>
    </div>}
  </>;
}

// ─── MAP ──────────────────────────────────────────────────────────────────────
function MapContainer({onLocChange}){
  const [loaded,setLoaded]=useState(!!window.L);
  const mInst=useRef(null);
  useEffect(()=>{
    if(!window.L){
      const lnk=document.createElement("link");lnk.rel="stylesheet";lnk.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(lnk);
      const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.onload=()=>setLoaded(true);document.head.appendChild(s);
    }
  },[]);
  useEffect(()=>{
    if(!loaded||mInst.current)return;
    const L=window.L;
    const map=L.map("leaflet-map",{zoom:12,center:[-34.6037,-58.3816]});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);
    const mk=L.marker([-34.6037,-58.3816],{draggable:true}).addTo(map);
    mInst.current=map;
    const upd=ll=>{onLocChange&&onLocChange(ll.lat,ll.lng);};
    mk.on("dragend",e=>upd(e.target.getLatLng()));
    map.on("click",e=>{mk.setLatLng(e.latlng);upd(e.latlng);});
    return()=>{map.remove();mInst.current=null;};
  },[loaded]);
  if(!loaded) return <div className="map-wrap" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,color:T.tl}}><span style={{fontSize:30}}>🗺️</span><span style={{fontSize:13}}>Cargando mapa...</span></div>;
  return <div className="map-wrap"><div id="leaflet-map" style={{width:"100%",height:200}}/></div>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAGES
// ══════════════════════════════════════════════════════════════════════════════

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomePage({onNav,user}){
  const [works,setWorks]=useState([]);
  const [specs,setSpecs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("works");

  useEffect(()=>{
    Promise.all([getWorks(),getSpecialists()]).then(([w,s])=>{
      setWorks(w.data||[]);
      setSpecs(s.data||[]);
      setLoading(false);
    });
  },[]);

  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="hero" style={{position:"relative",overflow:"hidden",padding:"0 0 24px",background:T.navy}}>
  {/* Carrusel de fondo */}
  <style>{`
    @keyframes scrollLeft {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .carousel-track {
      display: flex;
      gap: 8px;
      animation: scrollLeft 18s linear infinite;
      width: max-content;
      margin-bottom: 14px;
    }
    .carousel-track img {
      width: 110px;
      height: 80px;
      object-fit: cover;
      border-radius: 10px;
      flex-shrink: 0;
    }
  `}</style>
  <div style={{overflow:"hidden",borderRadius:12,marginBottom:16}}>
    <div className="carousel-track">
      <img src="https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/6196685/pexels-photo-6196685.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/6196685/pexels-photo-6196685.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=220" alt=""/>
      <img src="https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?w=220" alt=""/>
    </div>
  
  </div>
  <div style={{padding:"14px 14px 0",position:"relative",zIndex:1}}>
    <p style={{color:"rgba(255,255,255,.75)",fontSize:13,marginBottom:16,lineHeight:1.5}}>Encontrá el especialista ideal para tu hogar en minutos</p>
    <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:20}}>
      <button className="btn bp blg" style={{width:"100%",justifyContent:"center"}} onClick={()=>onNav("publish1")}>📋 Publicá tu trabajo gratis</button>
      <button className="btn" style={{background:"rgba(255,255,255,.13)",backdropFilter:"blur(8px)",color:"#fff",border:"1px solid rgba(255,255,255,.26)",borderRadius:50,padding:"14px 18px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%"}} onClick={()=>onNav("createSpec")}>💰 Ganá plata con Solumatch</button>
    </div>
    <div style={{display:"flex",gap:9}}>
      {[["50","Especialistas"],["100+","Trabajos"],["4.8★","Calificación"]].map(([n,l])=>(
        <div key={l} className="stat"><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
      ))}
    </div>
  </div>
</div>
    <div style={{padding:"18px 14px 8px"}}>
      <div style={{display:"flex",gap:18,borderBottom:`1px solid ${T.border}`,marginBottom:14}}>
        {[["works","Trabajos disponibles"],["specs","Especialistas"]].map(([id,lb])=>(
          <div key={id} style={{paddingBottom:8,borderBottom:`2.5px solid ${tab===id?T.orange:"transparent"}`,cursor:"pointer",fontWeight:700,fontSize:13,color:tab===id?T.td:T.tm,transition:"all .2s"}} onClick={()=>setTab(id)}>{lb}</div>
        ))}
      </div>
      {loading?<Loading/>:<div style={{display:"flex",flexDirection:"column",gap:8}} className="ani">
        {tab==="works"
          ?works.slice(0,4).map(w=>(
            <div key={w.id} className="wc" onClick={()=>onNav("search1",{work:w})}>
              <img src={w.profiles?.avatar_url||DEMO_AVS[0]} className="wca" alt=""/>
              <div className="wcb">
                <div className="wcc">{w.cat}</div>
                <div className="wct">{w.title}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:2}}>{badge(w.status||"A convenir")}{priceBadge(w)}</div>
              </div>
              <button className="wcbtn">ver</button>
            </div>
          ))
          :specs.slice(0,3).map(s=>(
            <div key={s.id} style={{background:`linear-gradient(135deg,${T.orange},#ff8c42)`,borderRadius:12,padding:"11px 13px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",color:"#fff"}} onClick={()=>onNav("specDetail",{spec:s})}>
              <img src={s.avatar_url||DEMO_AVS[0]} style={{width:44,height:44,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,.4)"}} alt=""/>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:"#fed7aa",textTransform:"uppercase",fontWeight:800}}>{s.cat}</div>
                <div style={{fontSize:13,fontWeight:700,margin:"1px 0"}}>{s.name}</div>
                <div style={{fontSize:11,color:"#fed7aa"}}>⭐ {avgRat(s.specialist_jobs)} · {s.loc}</div>
              </div>
              {planBadge(s.plan)}
            </div>
          ))
        }
        {tab==="works"&&works.length===0&&<div style={{textAlign:"center",padding:28,color:T.tm}}><div style={{fontSize:36,marginBottom:8}}>📭</div><p>Sé el primero en publicar un trabajo</p></div>}
      </div>}
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── PUBLISH FLOW ──────────────────────────────────────────────────────────────
const EMPTY_DRAFT={cat:"",title:"",urgency_type:"A convenir",status:"A convenir",date_fixed:"",max_date:"",modality:"presencial",prov:"",loc:"",address:"",lat:null,lng:null,price_mode:"",price_fijo:null,price_min:null,price_max:null,description:""};

function PubBar({onNav,user}){ return <><TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user} v="search"/><div className="sbar sbar-or"><span>▼</span><span>Publicar trabajo</span></div></>; }

function Publish1({onNav,draft,setDraft,user}){
  const [showCal,setShowCal]=useState(false);
  const [showMaxCal,setShowMaxCal]=useState(false);
  return <div>
    <PubBar onNav={onNav} user={user}/>
    <div style={{padding:16}} className="ani">
      <Steps cur={0}/>
      <div className="field"><label>Categoría</label><CatPicker value={draft.cat} onChange={v=>setDraft({...draft,cat:v})}/></div>
      <div className="field"><label>Descripción del trabajo</label>
        <textarea className="inp" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Ej: Necesito cambiar la llave de paso del baño..."/>
      </div>
      <div className="field"><label>¿Para cuándo?</label>
        <div className="urg-row">
          {[{id:"Urgente",ic:"🔴",lb:"Urgente"},{id:"elegir",ic:"📅",lb:"Elegir fecha"},{id:"A convenir",ic:"🤝",lb:"A convenir"}].map(u=>(
            <button key={u.id} className={`urgbtn ${draft.urgency_type===u.id?"on":""}`} onClick={()=>{setDraft({...draft,urgency_type:u.id,status:u.id==="Urgente"?"Urgente":"A convenir"});if(u.id==="elegir")setShowCal(true);}}>
              {u.ic} {u.lb}
            </button>
          ))}
        </div>
        {draft.urgency_type==="elegir"&&<div style={{background:T.off,borderRadius:9,padding:"8px 12px",fontSize:13,color:T.tm,display:"flex",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setShowCal(true)}>
          <span>📅 {draft.date_fixed||"Sin fecha"}</span><span style={{color:T.orange,fontWeight:700}}>Cambiar</span>
        </div>}
        {draft.urgency_type==="Urgente"&&<>
          <div style={{fontSize:12,color:T.tm,marginBottom:6}}>Fecha máxima:</div>
          <div style={{background:T.off,borderRadius:9,padding:"8px 12px",fontSize:13,color:T.tm,display:"flex",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setShowMaxCal(true)}>
            <span>📅 {draft.max_date||"Sin límite"}</span><span style={{color:T.orange,fontWeight:700}}>Seleccionar</span>
          </div>
        </>}
      </div>
      <button className="btn bs bfull blg" disabled={!draft.cat||!draft.title} onClick={()=>onNav("publish2")}>Siguiente →</button>
    </div>
    {showCal&&<CalModal value={draft.date_fixed} onChange={v=>setDraft({...draft,date_fixed:v})} onClose={()=>setShowCal(false)} title="¿Cuándo necesitás el servicio?"/>}
    {showMaxCal&&<CalModal value={draft.max_date} onChange={v=>setDraft({...draft,max_date:v})} onClose={()=>setShowMaxCal(false)} title="Fecha máxima"/>}
    <Footer onNav={onNav}/>
  </div>;
}

function Publish2({onNav,draft,setDraft,user}){
  return <div>
    <PubBar onNav={onNav} user={user}/>
    <div style={{padding:16}} className="ani">
      <Steps cur={1}/>
      <div className="field"><label>Modalidad</label>
        <div className="toggle-row">
          {["presencial","remoto"].map(m=><button key={m} className={`toggle-opt ${draft.modality===m?"on":""}`} onClick={()=>setDraft({...draft,modality:m})}>{m==="presencial"?"📍 Presencial":"💻 Remoto"}</button>)}
        </div>
      </div>
      {draft.modality==="presencial"&&<>
        <div className="loc-row">
          <div className="field" style={{marginBottom:0}}><label>Provincia</label>
            <select className="inp" value={draft.prov} onChange={e=>setDraft({...draft,prov:e.target.value})}>
              <option value="">Seleccionar...</option>
              {PROVINCES.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="field" style={{marginBottom:0}}><label>Localidad</label>
            <input className="inp" value={draft.loc} onChange={e=>setDraft({...draft,loc:e.target.value})} placeholder="Ej: Palermo"/>
          </div>
        </div>
        <div className="field"><label>Dirección (opcional)</label>
          <input className="inp" value={draft.address||""} onChange={e=>setDraft({...draft,address:e.target.value})} placeholder="Calle y número..."/>
        </div>
        <div className="field"><label>📍 Marcá en el mapa</label>
          <MapPicker onSelect={({lat,lng,address})=>setDraft({...draft,lat,lng,address:address||draft.address})}/>
          <p style={{fontSize:11,color:T.tl,marginTop:5}}>Buscá tu dirección o tocá el mapa para indicar la ubicación exacta.</p>
        </div>



      </>}
      {draft.modality==="remoto"&&<div className="alert alert-info"><span>💡</span><span>Este trabajo puede realizarse de forma remota.</span></div>}
      <button className="btn bs bfull blg" onClick={()=>onNav("publish3")}>Siguiente →</button>
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

function Publish3({onNav,draft,setDraft,user}){
  return <div>
    <PubBar onNav={onNav} user={user}/>
    <div style={{padding:16}} className="ani">
      <Steps cur={2}/>
      <div className="field"><label>¿Cómo querés fijar el precio?</label>
        <div className="pmode-row">
          {[{id:"fijo",ic:"💵",lb:"Precio fijo"},{id:"flexible",ic:"↕️",lb:"Flexible"},{id:"ofertas",ic:"🤝",lb:"Escucho ofertas"}].map(pm=>(
            <button key={pm.id} className={`pmode ${draft.price_mode===pm.id?"on":""}`} onClick={()=>setDraft({...draft,price_mode:pm.id})}>
              <span className="pmode-ic">{pm.ic}</span>{pm.lb}
            </button>
          ))}
        </div>
        {draft.price_mode==="fijo"&&<div className="field"><label>Importe ($)</label>
          <input className="inp" type="number" value={draft.price_fijo||""} onChange={e=>setDraft({...draft,price_fijo:Number(e.target.value)})} placeholder="Ej: 10000"/>
        </div>}
        {draft.price_mode==="flexible"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div className="field"><label>Mínimo ($)</label><input className="inp" type="number" value={draft.price_min||""} onChange={e=>setDraft({...draft,price_min:Number(e.target.value)})} placeholder="5000"/></div>
          <div className="field"><label>Máximo ($)</label><input className="inp" type="number" value={draft.price_max||""} onChange={e=>setDraft({...draft,price_max:Number(e.target.value)})} placeholder="15000"/></div>
        </div>}
        {draft.price_mode==="ofertas"&&<div className="alert alert-suc"><span>✅</span><span>Los especialistas podrán enviarte su precio al postularse.</span></div>}
      </div>
      <button className="btn bs bfull blg" disabled={!draft.price_mode} onClick={()=>onNav("publish4")}>Siguiente →</button>
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

function Publish4({onNav,draft,setDraft,onPublish,user,saving}){
  return <div>
    <PubBar onNav={onNav} user={user}/>
    <div style={{padding:16}} className="ani">
      <Steps cur={3}/>
      <div className="field"><label>Comentarios adicionales</label>
        <textarea className="inp" value={draft.description||""} onChange={e=>setDraft({...draft,description:e.target.value})} placeholder="Herramientas, acceso al lugar, preferencias..."/>
      </div>
      <div style={{background:T.off,borderRadius:13,padding:13,marginBottom:18,border:`1px solid ${T.border}`}}>
        <div style={{fontSize:10,fontWeight:800,color:T.tl,textTransform:"uppercase",letterSpacing:.5,marginBottom:9}}>Vista previa</div>
        <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:7}}>
          <img src={user?.avatar_url||DEMO_AVS[0]} style={{width:38,height:38,borderRadius:"50%",objectFit:"cover"}} alt=""/>
          <div><div style={{fontWeight:800,fontSize:14,color:T.navy}}>{draft.title||"Sin título"}</div>
            <div style={{fontSize:11,color:T.tm}}>{user?.name} · {draft.loc||user?.loc||"Argentina"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {draft.cat&&<span className="badge bna">{catIcon(draft.cat)} {draft.cat}</span>}
          {badge(draft.status||"A convenir")}
          {priceBadge(draft)}
          {draft.modality==="remoto"&&<span className="badge bc">💻 Remoto</span>}
        </div>
      </div>
      <button className="btn bsuc bfull blg" disabled={saving} onClick={onPublish}>{saving?"Publicando...":"✓ Publicar trabajo"}</button>
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── CONFIRM ───────────────────────────────────────────────────────────────────
function Confirm({onNav,user,confirmType}){
  const msgs={
    work:{ic:"✓",bg:T.green,shadow:"rgba(22,199,132,.34)",title:"¡Trabajo publicado!",sub:"Tu solicitud ya está visible para todos los especialistas en Solumatch."},
    postulate:{ic:"✋",bg:T.orange,shadow:"rgba(255,92,0,.3)",title:"¡Postulación enviada!",sub:"El publicador recibirá tu postulación y podrá contactarte."},
    spec:{ic:"🔧",bg:T.purple,shadow:"rgba(139,92,246,.3)",title:"¡Perfil creado!",sub:"Tu perfil profesional ya aparece en el directorio de especialistas."},
  };
  const c=msgs[confirmType||"work"];
  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="confscr">
      <div className="conf-ic" style={{background:c.bg,boxShadow:`0 8px 36px ${c.shadow}`}}>{c.ic}</div>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:24,color:T.navy,marginBottom:9}}>{c.title}</h2>
      <p style={{fontSize:13.5,color:T.tm,lineHeight:1.65,marginBottom:26}}>{c.sub}</p>
      <div style={{display:"flex",gap:11,flexWrap:"wrap",justifyContent:"center"}}>
        <button className="btn bs" onClick={()=>onNav("myworks")}>📋 Mis trabajos</button>
        <button className="btn bp" onClick={()=>onNav("userprofile")}>👤 Mi perfil</button>
        <button className="btn bg" onClick={()=>onNav("home")}>🏠 Inicio</button>
      </div>
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── VER TRABAJOS ──────────────────────────────────────────────────────────────
function Search2({onNav,user}){
  const [works,setWorks]=useState([]);
  const [loading,setLoading]=useState(true);
  const [chip,setChip]=useState("Todos");
  const [query,setQuery]=useState("");

  const load=useCallback(async()=>{
    setLoading(true);
    const {data}=await getWorks({cat:chip==="Todos"?null:chip,search:query||null});
    setWorks(data||[]);
    setLoading(false);
  },[chip,query]);

  useEffect(()=>{load();},[load]);

  const cats=["Todos",...CATEGORIES.map(c=>c.name)];

  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="sbar sbar-nv"><span>▼</span><span>Ver trabajos</span></div>
    <div className="sbar-wrap"><div className="sbar-inner"><span>🔍</span><input placeholder="Buscar trabajos..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div>
    <div className="fbar">{cats.map(c=><button key={c} className={`chip ${chip===c?"on":""}`} onClick={()=>setChip(c)}>{c}</button>)}</div>
    {loading?<Loading/>:works.length===0
      ?<div style={{textAlign:"center",padding:40,color:T.tm}}><div style={{fontSize:40,marginBottom:11}}>🔍</div><p>No hay trabajos para esta búsqueda</p></div>
      :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,padding:"10px 13px 8px"}}>
        {works.map(w=>(
          <div key={w.id} className="wc" style={{flexDirection:"column",alignItems:"flex-start",gap:7,padding:11}} onClick={()=>onNav("search1",{work:w})}>
            <img src={w.profiles?.avatar_url||DEMO_AVS[0]} className="wca" alt=""/>
            <div className="wcb" style={{width:"100%"}}>
              <div className="wcc">{w.cat}</div>
              <div className="wct" style={{fontSize:12}}>{w.title}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:3}}>{badge(w.status||"A convenir")}{priceBadge(w)}</div>
            </div>
            <button className="wcbtn" style={{fontSize:10,width:"100%",textAlign:"center"}}>Postularme →</button>
          </div>
        ))}
      </div>
    }
    <Footer onNav={onNav}/>
  </div>;
}

// ── WORK DETAIL ───────────────────────────────────────────────────────────────
function Search1({onNav,params,user,userPlan,onPostulate,posting}){
  const w=params?.work;
  const [oferta,setOferta]=useState("");
  const [showLim,setShowLim]=useState(false);
  const [relatedWorks,setRelated]=useState([]);

  useEffect(()=>{
    getWorks().then(({data})=>setRelated((data||[]).filter(x=>x.id!==w?.id).slice(0,4)));
  },[w?.id]);

  if(!w) return <div><TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/><Loading msg="Cargando trabajo..."/></div>;

  const FREE_LIM=3;
  const postMes=user?.postulaciones_mes||0;
  const alreadyPosted=w.postulaciones?.some(p=>p.user_id===user?.id);
  const canPost=userPlan==="platinum"||userPlan==="pro"||postMes<FREE_LIM;
  const isOwn=w.user_id===user?.id;

  const handlePost=()=>{
    if(!user){onNav("login");return;}
    if(isOwn)return;
    if(!canPost){setShowLim(true);return;}
    if(alreadyPosted)return;
    onPostulate(w.id, w.price_mode==="ofertas"?oferta:null);
  };

  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="sbar sbar-nv"><span>▼</span><span>Ver trabajos</span></div>
    <div className="fbar">{["Todos","Más recientes","Urgentes"].map(c=><button key={c} className={`chip ${c==="Todos"?"on":""}`}>{c}</button>)}</div>
    <div className="detcard">
      <button onClick={()=>onNav("search2")} style={{position:"absolute",top:12,right:12,background:T.off,border:"none",borderRadius:"50%",width:27,height:27,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:13,paddingBottom:13,borderBottom:`1px solid ${T.border}`}}>
        <div style={{position:"relative"}}>
          <img src={w.profiles?.avatar_url||DEMO_AVS[0]} style={{width:50,height:50,borderRadius:"50%",objectFit:"cover",border:`3px solid ${T.orange}`}} alt=""/>
          <div style={{position:"absolute",bottom:1,right:1,width:12,height:12,borderRadius:"50%",background:T.green,border:"2px solid #fff"}}/>
        </div>
        <div>
          <div style={{fontSize:10,color:T.tm,fontWeight:700}}>Publicado por</div>
          <div style={{fontWeight:800,fontSize:14,color:T.navy}}>{w.profiles?.name||"Usuario"}</div>
          <div style={{fontSize:11.5,color:T.tm}}>📍 {w.loc}, {w.prov}</div>
        </div>
      </div>
      <div className="det-row"><div className="det-lbl">Categoría</div>
        <div className="det-val" style={{display:"flex",alignItems:"center",gap:5}}><span>{catIcon(w.cat)}</span><strong>{w.cat}</strong></div>
      </div>
      <div className="det-row"><div className="det-lbl">Trabajo</div><div className="det-val">{w.title}</div></div>
      {w.description&&<div className="det-row"><div className="det-lbl">Comentarios</div><div className="det-val">{w.description}</div></div>}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"9px 0"}}>
        {badge(w.status||"A convenir")}{priceBadge(w)}
        {w.max_date&&<span className="badge bpe">⏰ Hasta: {w.max_date}</span>}
        {w.modality==="remoto"&&<span className="badge bc">💻 Remoto</span>}
        {w.postulaciones?.length>0&&<span className="badge bpr">👷 {w.postulaciones.length} postulante{w.postulaciones.length>1?"s":""}</span>}
      </div>
      {isOwn&&<div className="alert alert-info"><span>📋</span><span>Este es tu propio trabajo publicado.</span></div>}
      {w.price_mode==="ofertas"&&!alreadyPosted&&!isOwn&&<div className="field" style={{marginTop:7}}>
        <label>Tu oferta de precio ($)</label>
        <input className="inp" type="number" value={oferta} onChange={e=>setOferta(e.target.value)} placeholder="Ingresá tu precio..."/>
      </div>}
      {alreadyPosted&&<div className="alert alert-suc"><span>✅</span><span>Ya te postulaste a este trabajo.</span></div>}
      {!canPost&&!alreadyPosted&&!isOwn&&<div className="alert alert-warn"><span>⚠️</span><span>Usaste tus {FREE_LIM} postulaciones gratuitas. Necesitás plan <strong>Pro</strong>.</span></div>}
      {!isOwn&&userPlan==="free"&&!alreadyPosted&&<div style={{fontSize:11,color:T.tm,marginBottom:8,textAlign:"center"}}>
        Postulaciones: <strong style={{color:postMes>=FREE_LIM?T.red:T.green}}>{postMes}/{FREE_LIM}</strong> este mes
        {" · "}<span style={{color:T.orange,fontWeight:700,cursor:"pointer"}} onClick={()=>onNav("membership")}>Ver planes</span>
      </div>}
      <div style={{display:"flex",gap:9}}>
        <button className="btn bs" style={{flex:1}} onClick={()=>onNav("specialists")}>Ver especialistas</button>
        {!isOwn&&<button className={`btn ${canPost&&!alreadyPosted?"bsuc":"bg"}`} style={{flex:1}} disabled={alreadyPosted||(!canPost)||posting} onClick={handlePost}>
          {posting?"Enviando...":alreadyPosted?"Postulado ✓":canPost?"Postularme →":"Upgrade →"}
        </button>}
      </div>
    </div>
    {relatedWorks.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,padding:"8px 13px 6px"}}>
      {relatedWorks.map(x=>(
        <div key={x.id} className="wc" style={{flexDirection:"column",alignItems:"flex-start",gap:6,padding:11}} onClick={()=>onNav("search1",{work:x})}>
          <img src={x.profiles?.avatar_url||DEMO_AVS[0]} className="wca" alt=""/>
          <div className="wcb" style={{width:"100%"}}><div className="wcc">{x.cat}</div><div className="wct" style={{fontSize:12}}>{x.title}</div>{badge(x.status||"A convenir")}</div>
        </div>
      ))}
    </div>}
    <Footer onNav={onNav}/>
    {showLim&&<div className="overlay overlay-c" onClick={()=>setShowLim(false)}>
      <div className="modal modal-c" style={{padding:22,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:44,marginBottom:11}}>⚠️</div>
        <div className="mtitle" style={{marginBottom:7}}>Límite alcanzado</div>
        <p style={{fontSize:13,color:T.tm,marginBottom:18}}>Usaste tus {FREE_LIM} postulaciones gratuitas del mes. Actualizá tu plan.</p>
        <button className="btn bgold bfull" onClick={()=>{setShowLim(false);onNav("membership");}}>Ver membresías ⭐</button>
      </div>
    </div>}
  </div>;
}

// ── MY WORKS ──────────────────────────────────────────────────────────────────
function MyWorks({onNav,user}){
  const [works,setWorks]=useState([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("activos");

  useEffect(()=>{
    if(!user?.id)return;
    getMyWorks(user.id).then(({data})=>setWorks(data||[]));
    setLoading(false);
  },[user?.id]);

  const shown=works.filter(w=>tab==="activos"?w.active:!w.active);

  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="sbar sbar-nv"><span>📋</span><span>Mis trabajos publicados</span></div>
    <div className="tabbar">
      {["activos","completados"].map(t=><button key={t} className={`tabbtn ${tab===t?"on":""}`} onClick={()=>setTab(t)} style={{textTransform:"capitalize"}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
    </div>
    <div style={{padding:14}}>
      {loading?<Loading/>:shown.length===0?<div style={{textAlign:"center",padding:36,color:T.tm}}><div style={{fontSize:40,marginBottom:11}}>📭</div><p style={{fontWeight:700}}>No hay trabajos {tab} aún</p></div>:
        shown.map((w,i)=>(
          <div key={i} className="mwcard ani" style={{animationDelay:`${i*.06}s`}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:9}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:T.tl,textTransform:"uppercase",fontWeight:800}}>{w.cat}</div>
                <div style={{fontWeight:800,fontSize:14,color:T.navy,margin:"2px 0"}}>{w.title}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{priceBadge(w)}{badge(w.postulaciones?.length>0?"En proceso":"Pendiente")}</div>
              </div>
              {w.postulaciones?.length>0&&<div style={{background:T.orange,color:"#fff",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{w.postulaciones.length}</div>}
            </div>
            {w.postulaciones?.map((p,pi)=>(
              <div key={pi} className="post-card">
                <img src={p.profiles?.avatar_url||DEMO_AVS[pi%8]} style={{width:34,height:34,borderRadius:"50%",objectFit:"cover"}} alt=""/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:12}}>{p.profiles?.name||"Usuario"}</div>
                  {p.price_offered&&<div style={{fontSize:11,color:T.green,fontWeight:700}}>💵 ${p.price_offered.toLocaleString()}</div>}
                  {p.message&&<div style={{fontSize:11,color:T.tm}}>{p.message}</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <button className="btn bp bsm" onClick={()=>onNav("chat",{work:w,other:{id:p.user_id,name:p.profiles?.name,avatar_url:p.profiles?.avatar_url}})}>Chat</button>
                  {!p.confirmed&&<button className="btn bsuc bsm" style={{fontSize:10,padding:"4px 8px"}} onClick={()=>confirmPostulacion(p.id)}>✓ OK</button>}
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:7,marginTop:8}}>
              <button className="btn bg bsm" style={{flex:1}} onClick={()=>onNav("search1",{work:w})}>Ver detalle</button>
              <button className="btn bs bsm" style={{flex:1}} onClick={()=>onNav("chat",{work:w})}>💬 Chat</button>
            </div>
          </div>
        ))
      }
      <button className="btn bp bfull" style={{marginTop:7}} onClick={()=>onNav("publish1")}>+ Publicar nuevo trabajo</button>
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── SPECIALISTS ───────────────────────────────────────────────────────────────
function Specialists({onNav,user}){
  const [specs,setSpecs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filterCat,setFilterCat]=useState("Todos");
  const [filterProv,setFilterProv]=useState("");
  const [query,setQuery]=useState("");
  const [mySpec,setMySpec]=useState(null);

  const load=useCallback(async()=>{
    setLoading(true);
    const [{data:s},{data:ms}]=await Promise.all([
      getSpecialists({cat:filterCat==="Todos"?null:filterCat,prov:filterProv||null,search:query||null}),
      user?.id?getMySpecialistProfile(user.id):{data:null},
    ]);
    setSpecs(s||[]);
    setMySpec(ms);
    setLoading(false);
  },[filterCat,filterProv,query,user?.id]);

  useEffect(()=>{load();},[load]);

  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="sbar sbar-or"><span>👷</span><span>Especialistas</span></div>
    {!mySpec&&user&&<div style={{margin:"11px 13px"}}>
      <div style={{background:`linear-gradient(135deg,${T.navy},#1e3a8a)`,borderRadius:13,padding:14,color:"#fff",display:"flex",alignItems:"center",gap:11}}>
        <div style={{fontSize:34}}>🔧</div>
        <div style={{flex:1}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:13.5,marginBottom:2}}>¿Sos especialista?</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.68)"}}>Creá tu perfil gratis y recibí solicitudes.</div></div>
        <button className="btn bp bsm" onClick={()=>onNav("createSpec")}>Crear perfil</button>
      </div>
    </div>}
    <div className="sbar-wrap"><div className="sbar-inner"><span>🔍</span><input placeholder="Buscar especialista..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div>
    <div style={{padding:"9px 13px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:9}}>
      <select className="inp" style={{flex:1,padding:"8px 11px",fontSize:12}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
        <option value="Todos">Todas las categorías</option>
        {CATEGORIES.map(c=><option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
      </select>
      <select className="inp" style={{flex:1,padding:"8px 11px",fontSize:12}} value={filterProv} onChange={e=>setFilterProv(e.target.value)}>
        <option value="">Todas las provincias</option>
        {PROVINCES.map(p=><option key={p}>{p}</option>)}
      </select>
    </div>
    <div style={{padding:"11px 13px",display:"flex",flexDirection:"column",gap:9}}>
      {loading?<Loading/>:specs.length===0?<div style={{textAlign:"center",padding:32,color:T.tm}}><div style={{fontSize:38,marginBottom:9}}>🔍</div><p>Sin resultados</p></div>:
        specs.map(s=>{
          const isLocked=s.plan==="free"&&s.user_id!==user?.id;
          const isMe=s.user_id===user?.id;
          return <div key={s.id} className="specdir-card" onClick={()=>onNav("specDetail",{spec:s})}>
            {isMe&&<div style={{background:T.orangeGlow,border:`1px solid ${T.orange}`,borderRadius:7,padding:"3px 9px",fontSize:10.5,fontWeight:700,color:T.orange,marginBottom:9,display:"inline-block"}}>✏️ Tu perfil profesional</div>}
            <div style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:9}}>
              <div style={{position:"relative"}}>
                <img src={s.avatar_url||DEMO_AVS[0]} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:`2.5px solid ${T.orange}`}} alt=""/>
                <div style={{position:"absolute",bottom:1,right:1,width:13,height:13,borderRadius:"50%",background:T.green,border:"2px solid #fff"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontWeight:800,fontSize:14.5,color:T.navy}}>{s.name}</div>
                    <div style={{fontSize:11.5,color:T.orange,fontWeight:700}}>{s.spec}</div></div>
                  {planBadge(s.plan)}
                </div>
                <div style={{fontSize:11.5,color:T.tm,marginTop:2}}>📍 {s.loc}, {s.prov}</div>
                <div style={{fontSize:11.5,color:T.tm}}>⭐ {avgRat(s.specialist_jobs)} · {s.specialist_jobs?.length||0} trabajos</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
              <span className="badge bna">{catIcon(s.cat)} {s.cat}</span>
              {s.matricula&&<span className="badge bi">📜 Mat. {s.matricula}</span>}
            </div>
            <div style={{display:"flex",gap:7}}>
              <button className="btn bs bsm" style={{flex:1}} onClick={e=>{e.stopPropagation();onNav("specDetail",{spec:s});}}>Ver perfil</button>
              {isLocked
                ?<button className="btn bg bsm" style={{flex:1}} onClick={e=>{e.stopPropagation();onNav("membership");}}>🔒 Contactar</button>
                :<button className="btn bp bsm" style={{flex:1}} onClick={e=>{e.stopPropagation();onNav("chat",{work:null,other:{id:s.user_id,name:s.name,avatar_url:s.avatar_url}});}}>Contactar</button>
              }
            </div>
          </div>;
        })
      }
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── SPECIALIST DETAIL ─────────────────────────────────────────────────────────
function SpecDetail({onNav,params,user}){
  const s=params?.spec;
  const [tab,setTab]=useState("info");
  if(!s) return <Loading/>;
  const isLocked=s.plan==="free"&&s.user_id!==user?.id;
  const isMe=s.user_id===user?.id;
  return <div>
    <TopBar onNav={onNav} user={user}/>
    <div className="navbar">
      <button onClick={()=>onNav("specialists")} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:T.navy}}>←</button>
      <Logo onNav={onNav}/><div style={{width:40}}/>
    </div>
    <div className="prof-hero">
      <div style={{position:"relative",display:"inline-block",marginBottom:9}}>
        <img src={s.avatar_url||DEMO_AVS[0]} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"4px solid #fff",display:"block",margin:"0 auto"}} alt=""/>
        <div style={{position:"absolute",bottom:3,right:3,width:15,height:15,borderRadius:"50%",background:T.green,border:`3px solid ${T.navy}`}}/>
      </div>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:20,marginBottom:2}}>{s.name}</h2>
      <p style={{fontSize:12,color:"#93c5fd",marginBottom:3}}>{s.spec} · {s.loc}, {s.prov}</p>
      <div style={{marginBottom:12}}>{planBadge(s.plan)}</div>
      <div style={{display:"flex",gap:8,justifyContent:"center"}}>
        {[{n:avgRat(s.specialist_jobs)+"⭐",l:"Calificación"},{n:s.specialist_jobs?.length||0,l:"Trabajos"},{n:"✓",l:"Disponible"}].map((st,i)=>(
          <div key={i} className="pst"><div className="pst-n" style={{fontSize:16}}>{st.n}</div><div className="pst-l">{st.l}</div></div>
        ))}
      </div>
    </div>
    <div className="tabbar">
      {["info","trabajos"].map(t=><button key={t} className={`tabbtn ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t==="info"?"Información":"Trabajos realizados"}</button>)}
    </div>
    <div style={{padding:"16px 14px"}}>
      {tab==="info"&&<div className="ani">
        {s.matricula&&<div className="alert alert-suc"><span>📜</span><span>Matrícula verificada: <strong>{s.matricula}</strong></span></div>}
        {isMe&&<div className="alert alert-or"><span>✏️</span><span>Este es tu perfil público tal como lo ven los demás.</span></div>}
        <div style={{marginBottom:13}}><div style={{fontSize:10,fontWeight:800,color:T.tm,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Especialidad</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}><span className="badge bna">{catIcon(s.cat)} {s.cat}</span><span className="badge bna">{s.spec}</span></div>
        </div>
        <div style={{marginBottom:13}}><div style={{fontSize:10,fontWeight:800,color:T.tm,textTransform:"uppercase",letterSpacing:.5,marginBottom:5}}>Zona de trabajo</div>
          <p style={{fontSize:13,color:T.tm}}>📍 {s.loc}, {s.prov}</p>
        </div>
        <div style={{marginBottom:20}}><div style={{fontSize:10,fontWeight:800,color:T.tm,textTransform:"uppercase",letterSpacing:.5,marginBottom:5}}>Sobre mí</div>
          <p style={{fontSize:13,color:T.tm,lineHeight:1.7}}>{s.bio||"Sin descripción."}</p>
        </div>
        {isLocked
          ?<><div className="alert alert-warn"><span>🔒</span><span>Para contactar a este especialista necesitás membresía <strong>Pro</strong>.</span></div>
            <button className="btn bgold bfull" onClick={()=>onNav("membership")}>Desbloquear con Pro ⭐</button></>
          :<button className="btn bp bfull" onClick={()=>onNav("chat",{work:null,other:{id:s.user_id,name:s.name,avatar_url:s.avatar_url}})}>💬 Contactar</button>
        }
      </div>}
      {tab==="trabajos"&&<div className="ani">
        {(!s.specialist_jobs||s.specialist_jobs.length===0)&&<div style={{textAlign:"center",padding:28,color:T.tm}}>Sin trabajos registrados todavía.</div>}
        {s.specialist_jobs?.map((j,i)=>(
          <div key={i} className="card" style={{padding:13,marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontWeight:700,fontSize:13.5,color:T.navy}}>{j.title}</span>
              <span style={{fontSize:13}}>{"⭐".repeat(j.rating||0)}</span>
            </div>
            <div style={{fontSize:11.5,color:T.tm}}>Calificación: {j.rating}/5</div>
          </div>
        ))}
      </div>}
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── CREATE SPEC ───────────────────────────────────────────────────────────────
function CreateSpec({onNav,user,onSaveSpec,saving}){
  const [form,setForm]=useState({spec:"",cat:"",matricula:"",prov:user?.prov||"",loc:user?.loc||"",bio:"",oficios:"",experiencia:"",disponibilidad:""});
  const set=k=>e=>setForm({...form,[k]:e.target.value});
  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="sbar sbar-or"><span>🔧</span><span>Crear perfil profesional</span></div>
    <div style={{padding:16}} className="ani">
      <div className="alert alert-info"><span>ℹ️</span><span>Tu perfil aparecerá automáticamente en el directorio de especialistas.</span></div>
      <div className="field"><label>Tu especialidad</label><input className="inp" value={form.spec} onChange={set("spec")} placeholder="Ej: Gasista, Electricista..."/></div>
      <div className="field"><label>Categoría</label><CatPicker value={form.cat} onChange={v=>setForm({...form,cat:v})}/></div>
      <div className="field"><label>Matrícula (si aplica)</label><input className="inp" value={form.matricula} onChange={set("matricula")} placeholder="Número de matrícula..."/></div>
      <div className="loc-row">
        <div className="field" style={{marginBottom:0}}><label>Provincia</label>
          <select className="inp" value={form.prov} onChange={set("prov")}>
            <option value="">Seleccionar...</option>
            {PROVINCES.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="field" style={{marginBottom:0}}><label>Localidad</label>
          <input className="inp" value={form.loc} onChange={set("loc")} placeholder="Tu zona..."/>
        </div>
      </div>
      <div className="field" style={{marginTop:12}}><label>Descripción profesional</label>
        <textarea className="inp" value={form.bio} onChange={set("bio")} placeholder="Tu experiencia, especialidades, disponibilidad..."/>
      </div>
       <div className="field"><label>Oficios que realizás</label>
        <input className="inp" value={form.oficios} onChange={set("oficios")} placeholder="Ej: Instalación de cañerías, destapaciones, termotanques..."/>
      </div>
      <div className="field"><label>Años de experiencia</label>
        <select className="inp" value={form.experiencia} onChange={set("experiencia")}>
          <option value="">Seleccioná...</option>
          <option>Menos de 1 año</option>
          <option>1 a 3 años</option>
          <option>3 a 5 años</option>
          <option>5 a 10 años</option>
          <option>Más de 10 años</option>
        </select>
      </div>
      <div className="field"><label>Disponibilidad</label>
        <select className="inp" value={form.disponibilidad} onChange={set("disponibilidad")}>
          <option value="">Seleccioná...</option>
          <option>Lunes a viernes</option>
          <option>Fines de semana</option>
          <option>Todos los días</option>
          <option>Solo urgencias</option>
        </select>
      </div>
      <div className="field"><label>Fotos de trabajos realizados (opcional)</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          {(form.fotos||[]).map((f,i)=>(
            <div key={i} style={{position:"relative"}}>
              <img src={f} style={{width:80,height:80,objectFit:"cover",borderRadius:10,border:`2px solid ${T.border}`}}/>
              <div onClick={()=>setForm({...form,fotos:(form.fotos||[]).filter((_,j)=>j!==i)})} style={{position:"absolute",top:-6,right:-6,background:T.red,color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,cursor:"pointer"}}>✕</div>
            </div>
          ))}
          {(form.fotos||[]).length<6&&<label style={{width:80,height:80,border:`2px dashed ${T.border}`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexDirection:"column",gap:4}}>
            <span style={{fontSize:24}}>📷</span>
            <span style={{fontSize:10,color:T.tl}}>Agregar</span>
            <input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{
              const file=e.target.files[0];
              if(!file)return;
              const{data}=await uploadPhoto(file,`specs/${Date.now()}`);
              if(data?.publicUrl) setForm({...form,fotos:[...(form.fotos||[]),data.publicUrl]});
            }}/>
          </label>}
        </div>
      </div>
      <button className="btn bsuc bfull blg" disabled={!form.spec||!form.cat||!form.prov||saving} onClick={()=>onSaveSpec(form)}>
        {saving?"Creando perfil...":"Crear mi perfil profesional ✓"}
      </button>
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── USER PROFILE ──────────────────────────────────────────────────────────────
function UserProfile({onNav,user,setUser,userPlan,setUserPlan}){
  const [tab,setTab]=useState("info");
  const [editing,setEditing]=useState(false);
  const [ef,setEf]=useState({...user});
  const [myWorks,setMyWorks]=useState([]);
  const [myPosts,setMyPosts]=useState([]);
  const [mySpec,setMySpec]=useState(null);
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");
  const set=k=>e=>setEf({...ef,[k]:e.target.value});

  useEffect(()=>{
    if(!user?.id)return;
    Promise.all([
      getMyWorks(user.id),
      getMyPostulaciones(user.id),
      getMySpecialistProfile(user.id),
    ]).then(([w,p,s])=>{
      setMyWorks(w.data||[]);
      setMyPosts(p.data||[]);
      setMySpec(s.data);
    });
  },[user?.id]);

  const save=async()=>{
    setSaving(true);setErr("");
    const{data,error}=await updateProfile(user.id,{name:ef.name,phone:ef.phone,prov:ef.prov,loc:ef.loc,birthdate:ef.birthdate,avatar_url:ef.avatar_url});
    setSaving(false);
    if(error){setErr("Error al guardar. Intentá de nuevo.");return;}
    setUser({...user,...data});
    setEditing(false);
  };

  if(!user) return <div style={{padding:40,textAlign:"center"}}>
    <div style={{fontSize:48,marginBottom:16}}>👤</div>
    <p style={{fontWeight:700,fontSize:16,color:T.navy,marginBottom:12}}>Iniciá sesión para ver tu perfil</p>
    <button className="btn bp blg" onClick={()=>onNav("login")}>Iniciar sesión</button>
  </div>;

  return <div>
    <TopBar onNav={onNav} user={user}/>
    <div className="uprof-hero">
      <div style={{display:"flex",alignItems:"flex-end",gap:14,marginBottom:14,position:"relative",zIndex:1}}>
        <div style={{position:"relative"}}>
          <img src={user.avatar_url||DEMO_AVS[0]} className="uprof-av" alt=""/>
          <div style={{position:"absolute",bottom:2,right:2,width:16,height:16,borderRadius:"50%",background:T.green,border:`3px solid ${T.navy}`}}/>
        </div>
        <div style={{flex:1}}>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:21,color:"#fff",marginBottom:1}}>{user.name||"Usuario"}</h2>
          <div style={{fontSize:11.5,color:"rgba(255,255,255,.6)",marginBottom:5}}>{user.email}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {planBadge(userPlan)}
            {mySpec&&<span className="badge bor">🔧 Especialista</span>}
          </div>
        </div>
        <button className="btn bp bsm" onClick={()=>{setEf({...user});setEditing(true);setTab("info");}}>✏️ Editar</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,position:"relative",zIndex:1}}>
        {[{n:myWorks.length,l:"Publicados",ic:"📋",p:"myworks"},{n:myPosts.length,l:"Postulac.",ic:"✋"},{n:mySpec?.specialist_jobs?.length||0,l:"Como prof.",ic:"⭐"}].map((s,i)=>(
          <div key={i} className="uprof-qstat" style={{cursor:s.p?"pointer":"default"}} onClick={()=>s.p&&onNav(s.p)}>
            <div style={{fontSize:16,marginBottom:2}}>{s.ic}</div>
            <div className="uprof-qstat-n">{s.n}</div>
            <div className="uprof-qstat-l">{s.l}</div>
          </div>
        ))}
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${T.border}`}}>
      {[["info","👤 Perfil"],["works","📋 Trabajos"],["posts","✋ Postulac."],["prof","🔧 Profesional"]].map(([t,lb])=>(
        <button key={t} className={`tabbtn ${tab===t?"on":""}`} style={{fontSize:11,padding:"11px 2px"}} onClick={()=>setTab(t)}>{lb}</button>
      ))}
    </div>

    <div style={{padding:"14px"}}>
      {tab==="info"&&(!editing?<div className="ani">
        {[{ic:"👤",lb:"Nombre",val:user.name||"—"},{ic:"📧",lb:"Email",val:user.email},{ic:"📱",lb:"Teléfono",val:user.phone||"No especificado"},{ic:"📍",lb:"Provincia",val:user.prov||"No especificada"},{ic:"🏘️",lb:"Localidad",val:user.loc||"No especificada"},{ic:"🎂",lb:"Nacimiento",val:user.birthdate||"No especificada"}].map(r=>(
          <div key={r.lb} className="data-row">
            <span className="data-ic">{r.ic}</span>
            <div><div className="data-lbl">{r.lb}</div><div className="data-val">{r.val}</div></div>
          </div>
        ))}
        <div style={{marginTop:18,background:`linear-gradient(135deg,${userPlan==="platinum"?T.purpleSoft:userPlan==="pro"?T.goldSoft:T.off})`,borderRadius:13,padding:14,border:`1.5px solid ${userPlan==="platinum"?T.purple:userPlan==="pro"?T.gold:T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
            <div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:14,color:T.navy}}>Plan actual</div><div style={{marginTop:3}}>{planBadge(userPlan)}</div></div>
            <button className="btn bgold bsm" onClick={()=>onNav("membership")}>Cambiar plan</button>
          </div>
          {userPlan==="free"&&<p style={{fontSize:12,color:T.tm}}>Actualizá a Pro o Platinum para más funciones.</p>}
        </div>
        <div style={{marginTop:18,textAlign:"center"}}>
          <button className="btn bred" onClick={async()=>{await signOut();setUser(null);onNav("home");}}>Cerrar sesión</button>
        </div>
      </div>:<div className="ani">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:15,color:T.navy}}>Editando perfil</h3>
          <button className="btn bg bsm" onClick={()=>setEditing(false)}>Cancelar</button>
        </div>
        <div style={{textAlign:"center",marginBottom:18}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:8}}>
            <img src={ef.avatar_url||DEMO_AVS[0]} style={{width:72,height:72,borderRadius:"50%",objectFit:"cover",border:`3px solid ${T.orange}`}} alt=""/>
          </div>
          <div style={{fontSize:11,color:T.tl,marginBottom:9}}>Elegí tu foto</div>
          <div className="av-pick" style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>
            {DEMO_AVS.map((av,i)=><img key={i} src={av} className={ef.avatar_url===av?"on":""} onClick={()=>setEf({...ef,avatar_url:av})} alt=""/>)}
          </div>
        </div>
        {err&&<ErrMsg msg={err}/>}
        {[["name","Nombre completo","text"],["phone","Teléfono","tel"],["birthdate","Fecha de nacimiento","date"]].map(([k,lb,t])=>(
          <div key={k} className="field"><label>{lb}</label><input className="inp" type={t} value={ef[k]||""} onChange={set(k)} placeholder={lb}/></div>
        ))}
        <div className="loc-row">
          <div className="field" style={{marginBottom:0}}><label>Provincia</label>
            <select className="inp" value={ef.prov||""} onChange={set("prov")}>
              <option value="">Seleccionar...</option>
              {PROVINCES.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="field" style={{marginBottom:0}}><label>Localidad</label>
            <input className="inp" value={ef.loc||""} onChange={set("loc")} placeholder="Tu barrio..."/>
          </div>
        </div>
        <button className="btn bsuc bfull blg" style={{marginTop:18}} disabled={saving} onClick={save}>{saving?"Guardando...":"Guardar cambios ✓"}</button>
      </div>)}

      {tab==="works"&&<div className="ani">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:15,color:T.navy}}>Mis publicaciones ({myWorks.length})</h3>
          <button className="btn bp bsm" onClick={()=>onNav("publish1")}>+ Publicar</button>
        </div>
        {myWorks.length===0?<div style={{textAlign:"center",padding:"32px 16px",color:T.tm}}>
          <div style={{fontSize:44,marginBottom:10}}>📭</div>
          <p style={{fontWeight:700,marginBottom:10}}>Todavía no publicaste trabajos</p>
          <button className="btn bp" onClick={()=>onNav("publish1")}>Publicar mi primer trabajo</button>
        </div>:myWorks.map((w,i)=>(
          <div key={i} className="mwcard" style={{cursor:"pointer"}} onClick={()=>onNav("search1",{work:w})}>
            <div style={{display:"flex",gap:9,alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:9.5,color:T.tl,textTransform:"uppercase",fontWeight:800}}>{w.cat}</div>
                <div style={{fontWeight:800,fontSize:13.5,color:T.navy,margin:"2px 0"}}>{w.title}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:3}}>{priceBadge(w)}{badge(w.postulaciones?.length>0?"En proceso":"Pendiente")}</div>
              </div>
              {w.postulaciones?.length>0&&<div style={{background:T.orange,color:"#fff",borderRadius:"50%",width:23,height:23,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{w.postulaciones.length}</div>}
            </div>
          </div>
        ))}
      </div>}

      {tab==="posts"&&<div className="ani">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:15,color:T.navy}}>Mis postulaciones ({myPosts.length})</h3>
          {userPlan==="free"&&<span style={{fontSize:11,color:T.tm,fontWeight:600}}>{user.postulaciones_mes||0}/3 este mes</span>}
        </div>
        {myPosts.length===0?<div style={{textAlign:"center",padding:"32px 16px",color:T.tm}}>
          <div style={{fontSize:44,marginBottom:10}}>🔍</div>
          <p style={{fontWeight:700,marginBottom:10}}>Todavía no te postulaste a ningún trabajo</p>
          <button className="btn bs" onClick={()=>onNav("search2")}>Ver trabajos disponibles</button>
        </div>:myPosts.map((p,i)=>{
          const w=p.works;
          return <div key={i} className="mwcard" style={{cursor:"pointer"}} onClick={()=>onNav("search1",{work:w})}>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
              <img src={w?.profiles?.avatar_url||DEMO_AVS[i%8]} style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",flexShrink:0}} alt=""/>
              <div style={{flex:1}}>
                <div style={{fontSize:9.5,color:T.tl,textTransform:"uppercase",fontWeight:800}}>{w?.cat}</div>
                <div style={{fontWeight:800,fontSize:13.5,color:T.navy,margin:"1px 0"}}>{w?.title}</div>
                {p.price_offered&&<div style={{fontSize:11.5}}><span className="badge bi">💵 Tu oferta: ${p.price_offered.toLocaleString()}</span></div>}
              <div style={{marginTop:4}}>
                {p.status==="confirmada"
                  ?<span style={{fontSize:11,background:T.greenSoft,color:T.green,padding:"3px 10px",borderRadius:20,fontWeight:700}}>✅ Fuiste elegido</span>
                  :p.status==="rechazada"
                  ?<span style={{fontSize:11,background:T.redSoft,color:T.red,padding:"3px 10px",borderRadius:20,fontWeight:700}}>❌ No fuiste elegido</span>
                  :<span style={{fontSize:11,background:T.amberSoft,color:T.amber,padding:"3px 10px",borderRadius:20,fontWeight:700}}>⏳ En espera</span>
                }
              </div>
              </div>
            </div>
            <button className="btn bs bsm bfull" onClick={e=>{e.stopPropagation();onNav("chat",{work:w,other:{id:w?.user_id,name:w?.profiles?.name,avatar_url:w?.profiles?.avatar_url}});}}>💬 Chat con publicador</button>
          </div>;
        })}
      </div>}

      {tab==="prof"&&<div className="ani">
        {mySpec?<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:15,color:T.navy}}>Mi perfil profesional</h3>
            <button className="btn bp bsm" onClick={()=>onNav("specDetail",{spec:{...mySpec,specialist_jobs:mySpec.specialist_jobs||[]}})}>Ver público →</button>
          </div>
          <div style={{background:T.off,borderRadius:13,padding:14,border:`1px solid ${T.border}`,marginBottom:14}}>
            <div style={{display:"flex",gap:11,alignItems:"center",marginBottom:11}}>
              <img src={user.avatar_url||DEMO_AVS[0]} style={{width:50,height:50,borderRadius:"50%",objectFit:"cover",border:`2.5px solid ${T.orange}`}} alt=""/>
              <div><div style={{fontWeight:800,fontSize:14.5,color:T.navy}}>{mySpec.name}</div>
                <div style={{fontSize:12,color:T.orange,fontWeight:700}}>{mySpec.spec}</div>
                <div style={{fontSize:11.5,color:T.tm}}>📍 {mySpec.loc}, {mySpec.prov}</div>
              </div>
            </div>
            {mySpec.matricula&&<div className="alert alert-suc" style={{marginBottom:7}}><span>📜</span><span>Matrícula: {mySpec.matricula}</span></div>}
            <p style={{fontSize:13,color:T.tm,lineHeight:1.65}}>{mySpec.bio||"Sin descripción."}</p>
          </div>
          <div className="alert alert-or"><span>⭐</span>
            <span>Con membresía <strong>Pro</strong> o <strong>Platinum</strong> recibís más solicitudes. <span style={{fontWeight:800,cursor:"pointer"}} onClick={()=>onNav("membership")}>Ver planes →</span></span>
          </div>
        </>:<div style={{textAlign:"center",padding:"32px 16px",color:T.tm}}>
          <div style={{fontSize:44,marginBottom:10}}>🔧</div>
          <p style={{fontWeight:700,fontSize:14.5,color:T.navy,marginBottom:7}}>¿Sos especialista?</p>
          <p style={{fontSize:13,marginBottom:18}}>Creá tu perfil profesional gratis y empezá a recibir solicitudes.</p>
          <button className="btn bp" onClick={()=>onNav("createSpec")}>Crear perfil profesional</button>
        </div>}
      </div>}
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── MEMBERSHIP ────────────────────────────────────────────────────────────────
function Membership({onNav,user,userPlan,setUserPlan}){
  const plans=[
    {id:"free",name:"Free",color:"#64748B",price:0,feats:[{ic:"✅",tx:"Publicar trabajos ilimitados"},{ic:"✅",tx:"3 postulaciones gratis / mes"},{ic:"✅",tx:"Perfil profesional básico"},{ic:"❌",tx:"Postulaciones ilimitadas"},{ic:"❌",tx:"Contactar especialistas sin límite"}]},
    {id:"pro",name:"Pro",color:T.gold,price:2990,badge:"Más popular ⭐",feats:[{ic:"✅",tx:"Todo lo de Free"},{ic:"⭐",tx:"Postulaciones ilimitadas"},{ic:"⭐",tx:"Hasta 20 solicitudes como profesional"},{ic:"⭐",tx:"Contactar especialistas sin límite"},{ic:"⭐",tx:"Destacado entre los postulados"}]},
    {id:"platinum",name:"Platinum",color:T.purple,price:5990,badge:"Sin límites 💎",feats:[{ic:"✅",tx:"Todo lo de Pro"},{ic:"💎",tx:"Solicitudes ilimitadas como profesional"},{ic:"💎",tx:"Primero en todos los listados"},{ic:"💎",tx:"Sello Platinum verificado"},{ic:"💎",tx:"Estadísticas avanzadas"}]},
  ];
  const handlePlan=async(planId)=>{
    if(planId==="free"){
      setUserPlan("free");
      if(user?.id) await updateProfile(user.id,{plan:"free"});
      return;
    }
    const handlePlan=async(planId)=>{
    if(planId==="free"){
      setUserPlan("free");
      if(user?.id) await updateProfile(user.id,{plan:"free"});
      return;
    }
    // Crear suscripción con Mercado Pago
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `https://lothngcnufgpxgpbjlau.supabase.co/functions/v1/create-subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ plan: planId, user_id: user?.id, email: user?.email }),
      }
    );
    const { init_point, error } = await res.json();
    if (error) { alert("Error al procesar el pago. Intentá de nuevo."); return; }
    if (init_point) window.location.href = init_point;
  };
    setUserPlan(planId);
    if(user?.id) await updateProfile(user.id,{plan:planId});
  };
  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="sbar" style={{background:`linear-gradient(135deg,${T.navy},${T.navyLight})`}}><span>💎</span><span>Membresías Solumatch</span></div>
    <div style={{padding:14}}>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:21,color:T.navy,marginBottom:5}}>Elegí tu plan</h2>
      <p style={{fontSize:13,color:T.tm,marginBottom:18}}>Plan actual: <strong style={{color:T.orange}}>{userPlan.charAt(0).toUpperCase()+userPlan.slice(1)}</strong></p>
      {plans.map(p=>{
        const isAct=userPlan===p.id;
        return <div key={p.id} className={`plan-card plan-${p.id}`} style={{borderColor:isAct?p.color:undefined}}>
          {p.badge&&<span className={`plan-badge ${p.id==="pro"?"bgold2":"bpur2"}`}>{p.badge}</span>}
          <div className="plan-name" style={{color:p.color}}>{p.name}</div>
          {p.price===0?<div className="plan-price">Gratis<span> / mes</span></div>:<div className="plan-price">${p.price.toLocaleString()}<span> / mes</span></div>}
          <div style={{margin:"12px 0 9px"}}>{p.feats.map((f,i)=><div key={i} className="plan-feat"><span style={{flexShrink:0}}>{f.ic}</span><span>{f.tx}</span></div>)}</div>
          {isAct
            ?<button className="btn bg bfull" style={{borderColor:p.color,color:p.color}} disabled>Plan activo ✓</button>
            :<button className={`btn bfull ${p.id==="pro"?"bgold":p.id==="platinum"?"bpur":"bs"}`} onClick={()=>handlePlan(p.id)}>
              {p.id==="free"?"Usar Free":"Suscribirme"}
            </button>
          }
        </div>;
      })}
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

// ── CHAT ──────────────────────────────────────────────────────────────────────
function Chat({onNav,params,user}){
  const work=params?.work;
  const other=params?.other;
  const [msgs,setMsgs]=useState([]);
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(true);
  const endRef=useRef(null);

  useEffect(()=>{
    if(!user?.id||!other?.id)return;
    getMessages(user.id,other.id,work?.id).then(({data})=>{setMsgs(data||[]);setLoading(false);});
    const sub=subscribeToMessages(user.id,other.id,newMsg=>setMsgs(m=>[...m,newMsg]));
    return()=>{sub.unsubscribe();};
  },[user?.id,other?.id,work?.id]);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const send=async()=>{
    if(!msg.trim()||!user?.id||!other?.id)return;
    const txt=msg; setMsg("");
    await sendMessage(user.id,other.id,txt,work?.id);
  };

  const back=()=>work?onNav("myworks"):onNav("specialists");

  return <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#fff"}}>
    <TopBar onNav={onNav} user={user}/>
    <div style={{display:"flex",alignItems:"center",gap:11,padding:"10px 14px",borderBottom:`1px solid ${T.border}`,background:"#fff",position:"sticky",top:0,zIndex:10}}>
      <button onClick={back} style={{background:"none",border:"none",cursor:"pointer",fontSize:19,color:T.navy}}>←</button>
      <img src={other?.avatar_url||DEMO_AVS[0]} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.orange}`}} alt=""/>
      <div style={{flex:1}}><div style={{fontWeight:800,fontSize:14}}>{other?.name||"Usuario"}</div><div style={{fontSize:11,color:T.green,fontWeight:600}}>● En línea</div></div>
      <span style={{fontSize:17,cursor:"pointer"}}>📞</span>
    </div>
    {work&&<div style={{background:T.off,padding:"6px 14px",borderBottom:`1px solid ${T.border}`,fontSize:12,color:T.tm}}>
      <strong>Trabajo:</strong> {work.title} · {priceBadge(work)}
    </div>}
    <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:4,background:T.off}}>
      {loading?<Loading/>:msgs.length===0&&<div style={{textAlign:"center",padding:24,color:T.tl,fontSize:13}}>Empezá la conversación 👋</div>}
      {msgs.map((m,i)=>{
        const isMe=m.sender_id===user?.id;
        return <div key={i} style={{alignSelf:isMe?"flex-end":"flex-start",display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",gap:2}}>
          <div style={{fontSize:9.5,color:T.tl}}>{new Date(m.created_at).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}</div>
          <div className={isMe?"bub-me":"bub-them"}>{m.content}</div>
        </div>;
      })}
      <div ref={endRef}/>
    </div>
    <div style={{display:"flex",gap:7,padding:"9px 13px",background:"#fff",borderTop:`1px solid ${T.border}`,paddingBottom:80}}>
      <input className="inp" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Escribí un mensaje..." style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&send()}/>
      <button className="btn bp" style={{borderRadius:12,padding:"11px 15px"}} onClick={send}>↗</button>
    </div>
  </div>;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onNav,setUser,setSession}){
  const [em,setEm]=useState(""); const [pw,setPw]=useState("");
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
  const [showReset,setShowReset]=useState(false); const [resetSent,setResetSent]=useState(false);

  const doReset=async()=>{
    if(!em){setErr("Ingresá tu email primero");return;}
    setLoading(true);
    await resetPassword(em);
    setLoading(false);
    setResetSent(true);
  };

  const doLogin=async()=>{
    setLoading(true);setErr("");
    const{data,error}=await signIn(em,pw);
    setLoading(false);
    if(error){setErr("Email o contraseña incorrectos.");return;}
    const{data:profile}=await getProfile(data.user.id);
    setUser(profile);
    setSession(data.session);
    onNav("home");
  };

  const doGoogle=async()=>{
    await signInWithGoogle();
    // Supabase redirige automaticamente
  };

  return <div>
    <div className="navbar"><Logo onNav={onNav}/></div>
    <div className="auth ani">
      <h2 className="auth-title">Iniciar Sesión</h2><p className="auth-sub">Bienvenido de nuevo</p>
      <div className="social-row">
        <button className="social-btn" onClick={doGoogle}>🌐 Google</button>
        <button className="social-btn" onClick={doGoogle}>🍎 Apple</button>
      </div>
      <div className="divider">o con tu email</div>
      {err&&<ErrMsg msg={err}/>}
      <div className="field"><label>E-Mail</label><input className="inp" type="email" value={em} onChange={e=>setEm(e.target.value)} placeholder="tu@email.com"/></div>
      <div className="field"><label>Contraseña</label><input className="inp" type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
      <div style={{textAlign:"right",marginBottom:18}}>
  <span style={{fontSize:13,color:T.orange,cursor:"pointer",fontWeight:700}} onClick={()=>setShowReset(true)}>¿Olvidaste tu contraseña?</span>
</div>
{showReset&&<div className="card" style={{padding:14,marginBottom:14}}>
  {resetSent
    ?<p style={{color:T.green,fontWeight:700,textAlign:"center"}}>✅ Te enviamos un email para recuperar tu contraseña</p>
    :<><p style={{fontSize:13,color:T.tm,marginBottom:10}}>Ingresá tu email y te enviamos un link para recuperar tu contraseña</p>
      <button className="btn bp bfull" onClick={doReset} disabled={loading}>{loading?"Enviando...":"Enviar link"}</button>
    </>
  }
</div>}
      <button className="btn bs bfull blg" style={{marginBottom:13}} disabled={loading||!em||!pw} onClick={doLogin}>{loading?"Ingresando...":"Ingresar"}</button>
      <div style={{textAlign:"center",fontSize:13,color:T.tm}}>¿No tenés cuenta? <span style={{color:T.orange,fontWeight:800,cursor:"pointer"}} onClick={()=>onNav("register")}>Crear cuenta</span></div>
    </div><Footer onNav={onNav}/>
  </div>;
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
function Register({onNav,setUser,setSession}){
  const [form,setForm]=useState({name:"",email:"",pass:"",pass2:"",role:""});
  const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
  const set=k=>e=>setForm({...form,[k]:e.target.value});

  const doReg=async()=>{
    if(form.pass!==form.pass2){setErr("Las contraseñas no coinciden.");return;}
    if(form.pass.length<6){setErr("La contraseña debe tener al menos 6 caracteres.");return;}
    setLoading(true);setErr("");
    const{data,error}=await signUp(form.email,form.pass,form.name);
    setLoading(false);
    if(error){setErr(error.message||"Error al crear la cuenta.");return;}
    if(data.session){
      const{data:profile}=await getProfile(data.user.id);
      setUser(profile);setSession(data.session);
      onNav("home");
    } else {
      // Supabase requiere confirmacion de email
      onNav("confirm");
    }
  };

  return <div>
    <div className="navbar"><Logo onNav={onNav}/></div>
    <div className="auth ani">
      <h2 className="auth-title">Crear cuenta</h2><p className="auth-sub">Únete a Solumatch gratis</p>
      <div style={{display:"flex",gap:9,marginBottom:16}}>
        {["🏠 Busco especialistas","🔧 Soy especialista"].map(r=>(
          <button key={r} className={`rbtn ${form.role===r?"on":""}`} onClick={()=>setForm({...form,role:r})}>{r}</button>
        ))}
      </div>
      <div className="social-row">
        <button className="social-btn" onClick={signInWithGoogle}>🌐 Google</button>
      </div>
      <div className="divider">o con tu email</div>
      {err&&<ErrMsg msg={err}/>}
      {[["name","Nombre completo","Tu nombre","text"],["email","E-Mail","tu@email.com","email"],["pass","Contraseña","••••••••","password"],["pass2","Confirmar contraseña","••••••••","password"]].map(([k,lb,ph,t])=>(
        <div key={k} className="field"><label>{lb}</label><input className="inp" type={t} value={form[k]} onChange={set(k)} placeholder={ph}/></div>
      ))}
      <div style={{background:T.off,borderRadius:11,padding:"10px 13px",fontSize:12,color:T.tm,marginBottom:18,border:`1px solid ${T.border}`}}>
        Al registrarte aceptás los <span style={{color:T.orange,cursor:"pointer",fontWeight:700}} onClick={()=>onNav("terms")}>Términos y condiciones</span>.
      </div>
      <button className="btn bp bfull blg" style={{marginBottom:13}} disabled={loading||!form.name||!form.email||!form.pass} onClick={doReg}>{loading?"Creando cuenta...":"Crear mi cuenta →"}</button>
      <div style={{textAlign:"center",fontSize:13,color:T.tm}}>¿Ya tenés cuenta? <span style={{color:T.navy,fontWeight:800,cursor:"pointer"}} onClick={()=>onNav("login")}>Iniciá sesión</span></div>
    </div><Footer onNav={onNav}/>
  </div>;
}

// ── FAQs ─────────────────────────────────────────────────────────────────────
function FAQs({onNav,user}){
  const [open,setOpen]=useState(null);
  const faqs=[
    {q:"¿Cómo publico un trabajo?",a:"Tocá 'Publicar Trabajo', seleccioná la categoría, describí qué necesitás, elegí la urgencia, la ubicación, el precio y publicá."},
    {q:"¿Cuántas postulaciones gratuitas tengo?",a:"En el plan Free tenés 3 postulaciones gratuitas por mes. Con Pro o Platinum podés postularte ilimitadamente."},
    {q:"¿Cómo creo mi perfil de especialista?",a:"Desde la pestaña Especialistas tocá 'Crear perfil', completá tu especialidad, zona y descripción. Es gratis."},
    {q:"¿Qué incluye la membresía Pro?",a:"Postulaciones ilimitadas, perfil verificado, hasta 20 solicitudes por mes y aparecés destacado entre los postulados."},
    {q:"¿Qué incluye la membresía Platinum?",a:"Todo lo de Pro más solicitudes ilimitadas, aparecés primero en todos los listados y obtenés estadísticas avanzadas."},
    {q:"¿Cómo funciona 'Escucho ofertas'?",a:"Los especialistas te envían su precio al postularse. Vos elegís la oferta que más te convenga."},
    {q:"¿En qué zonas está disponible?",a:"Actualmente en el Gran Buenos Aires. Pronto expandimos a más ciudades de Argentina."},
  ];
  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div style={{background:`linear-gradient(155deg,${T.navy},#162257)`,padding:"22px 15px 18px"}}>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:22,color:"#fff",marginBottom:13}}>Preguntas Frecuentes</h1>
      <div style={{background:"#fff",borderRadius:11,padding:"10px 14px",display:"flex",alignItems:"center",gap:9}}>
        <span>🔍</span><input placeholder="Buscá tu pregunta..." style={{border:"none",outline:"none",fontSize:13,flex:1,fontFamily:"inherit"}}/>
      </div>
    </div>
    <div style={{padding:"13px 13px"}}>
      {faqs.map((f,i)=>(
        <div key={i} className={`faq ${open===i?"open":""}`}>
          <div className="faq-q" onClick={()=>setOpen(open===i?null:i)}>
            <span>{f.q}</span><span className={`faq-arr ${open===i?"open":""}`}>⌄</span>
          </div>
          {open===i&&<div className="faq-a ani">{f.a}</div>}
        </div>
      ))}
    </div><Footer onNav={onNav}/>
  </div>;
}

// ── TERMS ─────────────────────────────────────────────────────────────────────
function Terms({onNav,user}){
  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div style={{padding:"22px 18px"}}>
      <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:22,color:T.navy,marginBottom:4}}>Condiciones Generales</h2>
      <p style={{fontSize:12,color:T.tl,marginBottom:18}}>Última actualización: enero 2025</p>
      {[["1. Aceptación","Al usar Solumatch aceptás estos términos. Si no estás de acuerdo, por favor no uses la plataforma."],
        ["2. Uso","Solumatch conecta usuarios y especialistas. No somos empleadores ni intermediarios en los pagos."],
        ["3. Publicaciones","Los usuarios pueden publicar trabajos gratis. Nos reservamos el derecho de moderar contenidos inapropiados."],
        ["4. Responsabilidad","No nos hacemos responsables por acuerdos económicos ni calidad del servicio entre las partes."],
        ["5. Membresías","Los pagos de membresía son mensuales y pueden cancelarse desde el perfil en cualquier momento."],
        ["6. Privacidad","Tus datos son tratados según nuestra Política de Privacidad y no se comparten con terceros sin consentimiento."],
      ].map(([tt,tx])=>(
        <div key={tt} style={{marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:800,color:T.navy,marginBottom:4}}>{tt}</h3>
          <p style={{fontSize:13,color:T.tm,lineHeight:1.7}}>{tx}</p>
        </div>
      ))}
    </div><Footer onNav={onNav}/>
  </div>;
}
// ─── LICITACIONES ─────────────────────────────────────────────────────────────
function Licitaciones({onNav,user}){
  const [lics,setLics]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    getLicitaciones().then(r=>{ setLics(r.data||[]); setLoading(false); });
  },[]);
  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="sbar" style={{background:`linear-gradient(135deg,${T.navy},${T.navyLight})`}}>
      <span>🏗️</span><span>Licitaciones de Obras</span>
    </div>
    <div style={{padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18,color:T.navy}}>Obras disponibles</h2>
        {user&&<button className="btn bp bsm" onClick={()=>onNav("crearLicitacion")}>+ Publicar obra</button>}
      </div>
      {loading?<Loading/>:lics.length===0
        ?<div style={{textAlign:"center",padding:28,color:T.tm}}><div style={{fontSize:36,marginBottom:8}}>🏗️</div><p>No hay licitaciones abiertas</p></div>
        :lics.map(l=>(
          <div key={l.id} className="card" style={{padding:14,marginBottom:10,cursor:"pointer"}} onClick={()=>onNav("licitacionDetail",{lic:l})}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:10,fontWeight:800,color:T.orange,textTransform:"uppercase"}}>{l.category}</span>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:l.status==="abierta"?T.greenSoft:T.amberSoft,color:l.status==="abierta"?T.green:T.amber,fontWeight:700}}>{l.status}</span>
            </div>
            <div style={{fontWeight:700,fontSize:14,color:T.navy,marginBottom:4}}>{l.title}</div>
            <div style={{fontSize:12,color:T.tm,marginBottom:8}}>{l.location}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontWeight:800,fontSize:16,color:T.orange}}>${l.budget.toLocaleString()}</div>
              <div style={{fontSize:11,color:T.tl}}>Vence: {l.deadline}</div>
            </div>
          </div>
        ))
      }
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

function LicitacionDetail({onNav,user,params={}}){
  const l=params.lic||{};
  const [propuestas,setPropuestas]=useState([]);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({company_name:"",description:"",price:""});
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    if(l.id) getPropuestas(l.id).then(r=>setPropuestas(r.data||[]));
  },[l.id]);

  const handlePropuesta=async()=>{
    if(!user){onNav("login");return;}
    if(!form.company_name||!form.price){alert("Completá empresa y precio");return;}
    setSaving(true);
    await createPropuesta({licitacion_id:l.id,user_id:user.id,...form,price:Number(form.price)});
    getPropuestas(l.id).then(r=>setPropuestas(r.data||[]));
    setShowForm(false);
    setSaving(false);
  };

  const handleAdjudicar=async(p)=>{
    await adjudicarPropuesta(l.id,p.id,p.user_id);
    getPropuestas(l.id).then(r=>setPropuestas(r.data||[]));
  };

  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div style={{padding:14}}>
      <button className="btn bs bsm" style={{marginBottom:12}} onClick={()=>onNav("licitaciones")}>← Volver</button>
      <div className="card" style={{padding:16,marginBottom:14}}>
        <span style={{fontSize:10,fontWeight:800,color:T.orange,textTransform:"uppercase"}}>{l.category}</span>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:20,color:T.navy,margin:"6px 0"}}>{l.title}</h2>
        <p style={{fontSize:13,color:T.tm,marginBottom:12}}>{l.description}</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:12,background:T.orangeGlow,color:T.orange,padding:"3px 10px",borderRadius:20,fontWeight:700}}>💰 ${l.budget?.toLocaleString()}</span>
          <span style={{fontSize:12,background:T.greenSoft,color:T.green,padding:"3px 10px",borderRadius:20,fontWeight:700}}>📍 {l.location}</span>
          <span style={{fontSize:12,background:"#f1f5f9",color:T.tm,padding:"3px 10px",borderRadius:20}}>📅 Vence: {l.deadline}</span>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h3 style={{fontWeight:800,fontSize:15,color:T.navy}}>Propuestas ({propuestas.length})</h3>
        {l.status==="abierta"&&<button className="btn bp bsm" onClick={()=>setShowForm(!showForm)}>+ Ofertar</button>}
      </div>
      {showForm&&<div className="card" style={{padding:14,marginBottom:14}}>
        <div className="field"><label>Empresa</label><input className="inp" value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} placeholder="Nombre de tu empresa"/></div>
        <div className="field"><label>Descripción de la propuesta</label><textarea className="inp" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}/></div>
        <div className="field"><label>Precio ofertado (ARS)</label><input className="inp" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="500000"/></div>
        <button className="btn bp bfull" onClick={handlePropuesta} disabled={saving}>{saving?"Enviando...":"Enviar propuesta"}</button>
      </div>}
      {propuestas.map(p=>(
        <div key={p.id} className="card" style={{padding:12,marginBottom:8,borderLeft:`3px solid ${p.status==="ganadora"?T.green:T.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontWeight:700,fontSize:13,color:T.navy}}>{p.company_name}</span>
            <span style={{fontWeight:800,fontSize:14,color:T.orange}}>${Number(p.price).toLocaleString()}</span>
          </div>
          <p style={{fontSize:12,color:T.tm,marginBottom:8}}>{p.description}</p>
          {p.status==="ganadora"&&<span style={{fontSize:11,color:T.green,fontWeight:700}}>✅ Propuesta adjudicada</span>}
          {l.status==="abierta"&&user?.id===l.user_id&&p.status==="pendiente"&&
            <button className="btn" style={{background:T.greenSoft,color:T.green,border:`1px solid ${T.green}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>handleAdjudicar(p)}>Adjudicar obra</button>
          }
        </div>
      ))}
      {propuestas.length===0&&!showForm&&<div style={{textAlign:"center",padding:24,color:T.tm}}><p>Todavía no hay propuestas</p></div>}
    </div>
    <Footer onNav={onNav}/>
  </div>;
}

function CrearLicitacion({onNav,user}){
  const EMPTY={title:"",description:"",category:"",location:"",budget:"",deadline:""};
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const cats=["Construcción","Refacción","Electricidad","Plomería","Pintura","Jardinería","Limpieza","Otro"];

  const handleSave=async()=>{
    if(!user){onNav("login");return;}
    if(!form.title||!form.budget||Number(form.budget)<500000){alert("El presupuesto mínimo es $500.000");return;}
    setSaving(true);
    const r=await createLicitacion({...form,budget:Number(form.budget),user_id:user.id});
    setSaving(false);
    if(r.data) onNav("licitacionDetail",{lic:r.data});
  };

  return <div>
    <TopBar onNav={onNav} user={user}/><Navbar onNav={onNav} user={user}/>
    <div className="sbar" style={{background:`linear-gradient(135deg,${T.navy},${T.navyLight})`}}><span>🏗️</span><span>Publicar Licitación</span></div>
    <div style={{padding:14}}>
      <div className="field"><label>Título de la obra</label><input className="inp" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ej: Construcción de galpón industrial"/></div>
      <div className="field"><label>Categoría</label>
        <select className="inp" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
          <option value="">Seleccioná una categoría</option>
          {cats.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="field"><label>Descripción</label><textarea className="inp" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4} placeholder="Describí el trabajo a realizar"/></div>
      <div className="field"><label>Ubicación</label><input className="inp" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Ej: CABA, Buenos Aires"/></div>
      <div className="field"><label>Presupuesto estimado (ARS)</label><input className="inp" type="number" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder="500000"/></div>
      <div className="field"><label>Fecha límite de propuestas</label><input className="inp" type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></div>
      <button className="btn bp bfull" onClick={handleSave} disabled={saving}>{saving?"Publicando...":"Publicar licitación"}</button>
    </div>
    <Footer onNav={onNav}/>
  </div>;
}
// ══════════════════════════════════════════════════════════════════════════════
//  APP SHELL — gestiona sesión, estado global y routing
// ══════════════════════════════════════════════════════════════════════════════


export default function App(){
  const [page,setPage]=useState("home");
  const [params,setParams]=useState({});
  const [confirmType,setConfirmType]=useState("work");

  // ── AUTH STATE ────────────────────────────────────────────────────────
  const [user,setUser]=useState(null);
  const [session,setSession]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);


const [userPlan,setUserPlan]=useState("free");

  // ── PUBLISH DRAFT ─────────────────────────────────────────────────────
  const [draft,setDraft]=useState(EMPTY_DRAFT);

  // ── LOAD SESSION ON MOUNT ─────────────────────────────────────────────
  useEffect(()=>{
    const timer=setTimeout(()=>setAuthLoading(false),3000);
    getSession().then(async sess=>{
      clearTimeout(timer);
      if(sess){
        setSession(sess);
        const{data:profile}=await getProfile(sess.user.id);
        setUser(profile);
        setUserPlan(profile?.plan||"free");
      }
      setAuthLoading(false);
    });
    // Escuchar cambios de auth (login/logout/google redirect)
    const{data:{subscription}}=supabase.auth.onAuthStateChange(async(event,sess)=>{
      if(sess){
        setSession(sess);
        const{data:profile}=await getProfile(sess.user.id);
        setUser(profile);
        setUserPlan(profile?.plan||"free");
      } else {
        setSession(null);setUser(null);setUserPlan("free");
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  // ── NAVIGATION ────────────────────────────────────────────────────────
  const onNav=(p,pr={})=>{setPage(p);setParams(pr);window.scrollTo({top:0,behavior:"smooth"});};

  // ── PUBLISH WORK ──────────────────────────────────────────────────────
  const [saving,setSaving]=useState(false);
  const onPublish=async()=>{
    if(!user){onNav("login");return;}
    setSaving(true);
    const{error}=await createWork({
      ...draft,
      user_id:user.id,
    });
    setSaving(false);
    if(error){alert("Error al publicar. Intentá de nuevo.");return;}
    setDraft(EMPTY_DRAFT);
    setConfirmType("work");
    onNav("confirm");
  };

  // ── POSTULATE ─────────────────────────────────────────────────────────
  const [posting,setPosting]=useState(false);
  const onPostulate=async(workId,oferta)=>{
    if(!user){onNav("login");return;}
    setPosting(true);
    const{error}=await createPostulacion({
      work_id:workId,
      user_id:user.id,
      price_offered:oferta?Number(oferta):null,
      message:oferta?`Oferta: $${Number(oferta).toLocaleString()}`:"Me postulo para este trabajo",
    });
    setPosting(false);
    if(error){alert("Error al postularse. Intentá de nuevo.");return;}
    // Incrementar contador local
    setUser(u=>({...u,postulaciones_mes:(u.postulaciones_mes||0)+1}));
    setConfirmType("postulate");
    onNav("confirm");
  };

  // ── CREATE SPECIALIST PROFILE ─────────────────────────────────────────
  const [savingSpec,setSavingSpec]=useState(false);
  const onSaveSpec=async(form)=>{
    if(!user){onNav("login");return;}
    setSavingSpec(true);
    const{error}=await createSpecialist({
      user_id:user.id,
      name:user.name,
      spec:form.spec,
      cat:form.cat,
      matricula:form.matricula||"",
      prov:form.prov||user.prov||"",
      loc:form.loc||user.loc||"",
      bio:form.bio||"",
      plan:userPlan,
      avatar_url:user.avatar_url,
    });
    setSavingSpec(false);
    if(error){alert("Error al crear el perfil. Intentá de nuevo.");return;}
    setConfirmType("spec");
    onNav("confirm");
  };

  const C={onNav,user,userPlan,setUserPlan};

  if(authLoading) return <>
    <style>{CSS}</style>
    <div style={{background:"#b8bfcf",minHeight:"100vh",display:"flex",justifyContent:"center"}}>
      <div className="shell" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center"}}>
          <div className="spinner" style={{margin:"0 auto 16px"}}/>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:22,color:T.navy}}>Solu<span style={{color:T.orange}}>match</span></div>
        </div>
      </div>
    </div>
  </>;

  const PAGES={
    home:        <HomePage      {...C}/>,
    publish1:    <Publish1      {...C} draft={draft} setDraft={setDraft}/>,
    publish2:    <Publish2      {...C} draft={draft} setDraft={setDraft}/>,
    publish3:    <Publish3      {...C} draft={draft} setDraft={setDraft}/>,
    publish4:    <Publish4      {...C} draft={draft} setDraft={setDraft} onPublish={onPublish} saving={saving}/>,
    confirm:     <Confirm       {...C} confirmType={confirmType}/>,
    search2:     <Search2       {...C}/>,
    search1:     <Search1       {...C} params={params} onPostulate={onPostulate} posting={posting}/>,
    specialists: <Specialists   {...C}/>,
    specDetail:  <SpecDetail    {...C} params={params}/>,
    createSpec:  <CreateSpec    {...C} onSaveSpec={onSaveSpec} saving={savingSpec}/>,
    myworks:     <MyWorks       {...C}/>,
    userprofile: <UserProfile   {...C} setUser={setUser}/>,
    membership:  <Membership    {...C}/>,
    chat:        <Chat          {...C} params={params}/>,
    login:       <Login         onNav={onNav} setUser={setUser} setSession={setSession}/>,
    register:    <Register      onNav={onNav} setUser={setUser} setSession={setSession}/>,
    faqs:        <FAQs          {...C}/>,
    terms:       <Terms         {...C}/>,
    licitaciones: <Licitaciones {...C}/>,
    licitacionDetail: <LicitacionDetail {...C} params={params}/>,
    crearLicitacion: <CrearLicitacion {...C}/>,
  };

  return <>
    <style>{CSS}</style>
    <div style={{background:"#b8bfcf",minHeight:"100vh",display:"flex",justifyContent:"center"}}>
      <div className="shell">
        {PAGES[page]||PAGES.home}
        {page!=="chat"&&<BNav page={page} onNav={onNav} user={user}/>}
      </div>
    </div>
  </>;
}
