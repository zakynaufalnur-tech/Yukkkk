const CATALOG = {
  ml:{name:"Mobile Legends",item:"Diamonds",zone:true,icon:"ML",packages:[["86 Diamonds",20000],["172 Diamonds",39000],["257 Diamonds",58000],["344 Diamonds",77000],["514 Diamonds",114000],["706 Diamonds",154000]]},
  ff:{name:"Free Fire",item:"Diamonds",zone:false,icon:"FF",packages:[["70 Diamonds",10000],["140 Diamonds",20000],["355 Diamonds",50000],["720 Diamonds",99000],["1450 Diamonds",198000],["2180 Diamonds",295000]]},
  pubg:{name:"PUBG Mobile",item:"UC",zone:false,icon:"P",packages:[["60 UC",15000],["325 UC",75000],["660 UC",149000],["1800 UC",375000],["3850 UC",749000],["8100 UC",1499000]]},
  gi:{name:"Genshin Impact",item:"Genesis Crystal",zone:false,icon:"G",packages:[["60 Crystal",16000],["300 + 30 Crystal",79000],["980 + 110 Crystal",249000],["1980 + 260 Crystal",479000],["3280 + 600 Crystal",799000],["6480 + 1600 Crystal",1599000]]},
  valo:{name:"Valorant",item:"Points",zone:false,icon:"V",packages:[["125 VP",15000],["420 VP",49000],["700 VP",79000],["1375 VP",149000],["2400 VP",249000],["4000 VP",399000]]}
};
let gameKey="ml", packageIndex=0;
const rupiah=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const $=id=>document.getElementById(id);
function renderPackages(){
  const game=CATALOG[gameKey];
  $("packages").innerHTML=game.packages.map((p,i)=>`<button type="button" class="package ${i===packageIndex?"active":""}" data-index="${i}"><b>${p[0]}</b><small>${game.item}</small><strong>${rupiah(p[1])}</strong></button>`).join("");
  document.querySelectorAll(".package").forEach(btn=>btn.addEventListener("click",()=>{packageIndex=Number(btn.dataset.index);renderPackages();updateSummary();}));
  $("selectedGame").value=game.name;$("summaryGame").textContent=game.name;$("summaryIcon").textContent=game.icon;
  $("zoneWrap").style.display=game.zone?"block":"none";
  updateSummary();
}
function updateSummary(){
  const game=CATALOG[gameKey], pack=game.packages[packageIndex];
  $("summaryItem").textContent=pack[0];$("summaryPrice").textContent=rupiah(pack[1]);$("summaryTotal").textContent=rupiah(pack[1]);
  $("summaryUser").textContent=$("userId").value.trim()||"Belum diisi";
  $("summaryZone").textContent=game.zone?($("zoneId").value.trim()||"—"):"Tidak diperlukan";
}
document.querySelectorAll(".game-card").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".game-card").forEach(x=>x.classList.remove("selected"));
  btn.classList.add("selected");gameKey=btn.dataset.game;packageIndex=0;renderPackages();
}));
$("userId").addEventListener("input",updateSummary);$("zoneId").addEventListener("input",updateSummary);
$("payButton").addEventListener("click",async()=>{
  const userId=$("userId").value.trim(), zoneId=$("zoneId").value.trim(), game=CATALOG[gameKey], pack=game.packages[packageIndex];
  $("notice").textContent="";
  if(!/^[0-9A-Za-z_-]{4,30}$/.test(userId)){ $("notice").textContent="Masukkan User ID yang valid (4–30 karakter).";return; }
  if(game.zone&&!/^[0-9]{1,8}$/.test(zoneId)){ $("notice").textContent="Masukkan Zone ID Mobile Legends.";return; }
  const button=$("payButton");button.disabled=true;button.textContent="Membuat transaksi...";
  try{
    const response=await fetch("/api/create-transaction",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gameId:gameKey,packageIndex,userId,zoneId})});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||"Transaksi tidak dapat dibuat.");
    sessionStorage.setItem("topupyuk_last_order",data.orderId);
    window.location.href=data.redirectUrl;
  }catch(error){$("notice").textContent=error.message;button.disabled=false;button.innerHTML='Lanjut ke Pembayaran <span>→</span>';}
});
$("checkButton").addEventListener("click",async()=>{
  const id=$("orderLookup").value.trim(), out=$("statusResult");out.className="status-result";out.textContent="";
  if(!id){out.textContent="Masukkan Order ID terlebih dahulu.";out.classList.add("error");return;}
  out.textContent="Memeriksa status...";
  try{const r=await fetch(`/api/payment-status?order_id=${encodeURIComponent(id)}`);const d=await r.json();if(!r.ok)throw new Error(d.error||"Order tidak ditemukan.");
    const labels={settlement:"Pembayaran berhasil dikonfirmasi.",capture:"Pembayaran berhasil dikonfirmasi.",pending:"Menunggu pembayaran.",deny:"Pembayaran ditolak.",cancel:"Transaksi dibatalkan.",expire:"Waktu pembayaran habis.",failure:"Pembayaran gagal."};
    out.textContent=`${labels[d.transaction_status]||"Status: "+d.transaction_status} Order: ${id}`;out.classList.add(["settlement","capture"].includes(d.transaction_status)?"success":"");
  }catch(e){out.textContent=e.message;out.classList.add("error");}
});
const params=new URLSearchParams(location.search);
if(params.get("order_id")){$("orderLookup").value=params.get("order_id");$("statusResult").textContent="Kembali dari checkout. Sedang memeriksa status pembayaran...";$("checkButton").click();}
renderPackages();