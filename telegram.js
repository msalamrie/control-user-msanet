// ================= CONFIG =================
const TELEGRAM_TOKEN = "8796725829:AAEN1PlCw4FsNuxvg09iKwImgNfZ7ItrbxI";
const TELEGRAM_CHAT_ID = "7863428559";

// ================= KIRIM =================
function kirimTelegram(pesan) {
  fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: pesan,
      parse_mode: "HTML"
    })
  })
  .then(res => res.json())
  .then(data => console.log("Telegram:", data))
  .catch(err => console.error(err));
}

// ================= GENERATE LAPORAN =================
function generateLaporanTelegram(users, bulan) {
  let lunasList = [];
  let belumList = [];

  users.forEach(u => {
    let status = u.status[bulan] || "belum";

    if (status === "lunas") {
      lunasList.push(`✅ ${u.nama}`);
    } else {
      belumList.push(`❌ ${u.nama}`);
    }
  });

  let pesan = `
╔══════════════════════╗
   📊 <b>LAPORAN PEMBAYARAN</b>
╚══════════════════════╝

📅 <b>Periode:</b> ${bulan}

👥 <b>Total User:</b> ${users.length}
✅ <b>Lunas:</b> ${lunasList.length}
❌ <b>Belum:</b> ${belumList.length}

──────────────────────

💰 <b>SUDAH BAYAR</b>
${lunasList.length ? lunasList.join("\n") : "- Tidak ada"}

──────────────────────

⚠️ <b>BELUM BAYAR</b>
${belumList.length ? belumList.join("\n") : "Semua sudah lunas 🎉"}

──────────────────────
🕒 Update: ${new Date().toLocaleString("id-ID")}
`;

  kirimTelegram(pesan);
}
