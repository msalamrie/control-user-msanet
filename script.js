let users = JSON.parse(localStorage.getItem("users")) || [];
let userToDelete = null;

/* ================= DATE ================= */
function initDateFilter() {
  const tahun = document.getElementById("filterTahun");
  const bulan = document.getElementById("filterBulan");
  const today = new Date();

  tahun.value = today.getFullYear();

  bulan.innerHTML = "";
  for (let i = 1; i <= 12; i++) {
    const b = String(i).padStart(2, "0");
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    bulan.appendChild(opt);
  }

  bulan.value = String(today.getMonth() + 1).padStart(2, "0");

  tahun.addEventListener("change", render);
  bulan.addEventListener("change", render);
}

function getSelectedMonth() {
  const tahun = document.getElementById("filterTahun").value;
  const bulan = document.getElementById("filterBulan").value;
  return `${tahun}-${bulan}`;
}

/* ================= CRUD ================= */
function tambahUser() {
  const input = document.getElementById("nama");
  const nama = input.value.trim();
  if (!nama) return;

  users.push({ id: Date.now(), nama, status: {} });
  input.value = "";

  simpan();
  render();
}

function toggleStatus(id) {
  const bulan = getSelectedMonth();
  const user = users.find(u => u.id === id);
  if (!user) return;

  user.status[bulan] =
    user.status[bulan] === "lunas" ? "belum" : "lunas";

  simpan();
  render();
}

function hapusUser(id) {
  userToDelete = id;
  const user = users.find(u => u.id === id);
  document.getElementById("userName").textContent = user.nama;

  const modal = document.getElementById("deleteModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  userToDelete = null;
}

function confirmDelete() {
  users = users.filter(u => u.id !== userToDelete);
  simpan();
  closeDeleteModal();
  render();
}

let lastSend = 0;

async function simpan() {
  localStorage.setItem("users", JSON.stringify(users));

  // SIMPAN KE FIREBASE (ANTI DUPLIKAT)
  try {
    for (let u of users) {
      await fb.setDoc(
        fb.doc(db, "users", String(u.id)),
        u
      );
    }
  } catch (e) {
    console.log("Firebase error:", e);
  }

  // TELEGRAM (ANTI SPAM)
  const now = Date.now();
  if (now - lastSend > 0) {
    const bulan = getSelectedMonth();
    generateLaporanTelegram(users, bulan);
    lastSend = now;
  }
}

/* ================= RENDER ================= */
function render() {
  const bulan = getSelectedMonth();
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  let lunas = 0;

  users.forEach(user => {
    const status = user.status[bulan] || "belum";
    if (status === "lunas") lunas++;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="p-4">${user.nama}</td>
      <td class="p-4">
        ${status === "lunas"
          ? `<span class="status-lunas px-3 py-1 text-sm rounded-full">LUNAS</span>`
          : `<span class="status-belum px-3 py-1 text-sm rounded-full">BELUM</span>`
        }
      </td>
      <td class="p-4 flex gap-3">
        <button onclick="toggleStatus(${user.id})"
          class="btn-toggle px-3 py-1 rounded-lg">
          ${status === "lunas" ? "Batal" : "Bayar"}
        </button>
        <button onclick="hapusUser(${user.id})"
          class="btn-delete px-3 py-1 rounded-lg">
          Hapus
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  document.getElementById("totalUser").textContent = users.length;
  document.getElementById("totalLunas").textContent = lunas;
  document.getElementById("totalBelum").textContent =
    users.length - lunas;

  applyTheme();
}

/* ================= THEME ================= */

const themeToggle = document.getElementById("themeToggle");

/* Load saved theme */
if (localStorage.getItem("theme") === "light") {
  document.body.classList.remove("bg-darkbg", "text-white");
  document.body.classList.add("bg-slate-100", "text-black");
  themeToggle.checked = true;
}

/* Toggle event */
themeToggle.addEventListener("change", function () {
  if (this.checked) {
    document.body.classList.remove("bg-darkbg", "text-white");
    document.body.classList.add("bg-slate-100", "text-black");
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.remove("bg-slate-100", "text-black");
    document.body.classList.add("bg-darkbg", "text-white");
    localStorage.setItem("theme", "dark");
  }

  render();
});

/* Apply Theme Styling */
function applyTheme() {
  const isLight = document.body.classList.contains("bg-slate-100");

  const btnTambah = document.querySelector(".btn-add");

  if (isLight) {
    /* Tambah Button */
    if (btnTambah)
      btnTambah.className =
        "btn-add bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold";

    /* Toggle Button */
    document.querySelectorAll(".btn-toggle").forEach(btn => {
      btn.className =
        "btn-toggle bg-green-600 text-white px-3 py-1 rounded-lg";
    });

    /* Delete Button */
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.className =
        "btn-delete bg-red-600 text-white px-3 py-1 rounded-lg";
    });

    /* Status */
    document.querySelectorAll(".status-lunas").forEach(el => {
      el.className =
        "status-lunas bg-green-600 text-white px-3 py-1 rounded-full";
    });

    document.querySelectorAll(".status-belum").forEach(el => {
      el.className =
        "status-belum bg-red-600 text-white px-3 py-1 rounded-full";
    });

  } else {
    /* Tambah Button */
    if (btnTambah)
      btnTambah.className =
        "btn-add bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold";

    /* Toggle Button */
    document.querySelectorAll(".btn-toggle").forEach(btn => {
      btn.className =
        "btn-toggle bg-green-600/20 text-green-400 px-3 py-1 rounded-lg";
    });

    /* Delete Button */
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.className =
        "btn-delete bg-red-600/20 text-red-400 px-3 py-1 rounded-lg";
    });

    /* Status */
    document.querySelectorAll(".status-lunas").forEach(el => {
      el.className =
        "status-lunas bg-green-500/20 text-green-400 px-3 py-1 rounded-full";
    });

    document.querySelectorAll(".status-belum").forEach(el => {
      el.className =
        "status-belum bg-red-500/20 text-red-400 px-3 py-1 rounded-full";
    });
  }

  applyModalTheme();
}

/* Modal theme opposite */
function applyModalTheme() {
  const modalBox = document.getElementById("modalBox");
  const isLight = document.body.classList.contains("bg-slate-100");

  if (!modalBox) return;

  if (isLight) {
    modalBox.className =
      "relative z-10 rounded-2xl p-6 w-80 shadow-2xl bg-gray-900 text-white";
  } else {
    modalBox.className =
      "relative z-10 rounded-2xl p-6 w-80 shadow-2xl bg-white text-black";
  }
}

/* ================= INIT ================= */
initDateFilter();
render();
