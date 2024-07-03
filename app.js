// Mendaftarkan service worker untuk mendukung PWA dan caching
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah prompt default
    e.preventDefault();
    // Simpan event untuk digunakan nanti
    deferredPrompt = e;
    // Tampilkan UI untuk menginstal PWA
    const installButton = document.createElement('button');
    installButton.innerText = 'Install App';
    installButton.style.position = 'fixed';
    installButton.style.bottom = '10px';
    installButton.style.right = '10px';
    document.body.appendChild(installButton);

    installButton.addEventListener('click', () => {
        // Tampilkan prompt instalasi
        deferredPrompt.prompt();
        // Tunggu pengguna untuk memilih
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            // Hapus prompt yang disimpan
            deferredPrompt = null;
            // Hapus tombol install
            document.body.removeChild(installButton);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('city-select');
    
    // Event listener untuk menangani perubahan kota yang dipilih oleh pengguna
    citySelect.addEventListener('change', () => {
        const city = citySelect.value;
        localStorage.setItem('selectedCity', city); // Simpan kota yang dipilih di localStorage
        fetchJadwalSholat(city); // Ambil jadwal sholat untuk kota yang dipilih
    });

    // Coba dapatkan kota dari localStorage jika ada
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        citySelect.value = savedCity;
        fetchJadwalSholat(savedCity);
    } else {
        fetchJadwalSholat(citySelect.value); // Ambil jadwal sholat untuk kota default
    }

    updateTime();
    setInterval(updateTime, 1000); // Perbarui waktu setiap detik

    // Sembunyikan splash screen setelah 1 detik
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
    }, 1000);
});

function fetchJadwalSholat(city) {
    const apiURL = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Indonesia&method=2`;

    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            const jadwal = data.data.timings;
            const jadwalContainer = document.getElementById('jadwal-sholat');
            jadwalContainer.innerHTML = `
                <div class="jadwal-item">
                    <p>Subuh</p>
                    <p>${jadwal.Fajr}</p>
                </div>
                <div class="jadwal-item">
                    <p>Dzuhur</p>
                    <p>${jadwal.Dhuhr}</p>
                </div>
                <div class="jadwal-item">
                    <p>Ashar</p>
                    <p>${jadwal.Asr}</p>
                </div>
                <div class="jadwal-item">
                    <p>Maghrib</p>
                    <p>${jadwal.Maghrib}</p>
                </div>
                <div class="jadwal-item">
                    <p>Isya</p>
                    <p>${jadwal.Isha}</p>
                </div>
            `;
        })
        .catch(error => {
            console.log('Error fetching jadwal sholat:', error);
            // Coba ambil data dari cache jika fetch gagal
            caches.open('jadwal-sholat-data-cache-v1').then(cache => {
                cache.match(apiURL).then(response => {
                    if (response) {
                        response.json().then(data => {
                            const jadwal = data.data.timings;
                            const jadwalContainer = document.getElementById('jadwal-sholat');
                            jadwalContainer.innerHTML = `
                                <div class="jadwal-item">
                                    <p>Subuh</p>
                                    <p>${jadwal.Fajr}</p>
                                </div>
                                <div class="jadwal-item">
                                    <p>Dzuhur</p>
                                    <p>${jadwal.Dhuhr}</p>
                                </div>
                                <div class="jadwal-item">
                                    <p>Ashar</p>
                                    <p>${jadwal.Asr}</p>
                                </div>
                                <div class="jadwal-item">
                                    <p>Maghrib</p>
                                    <p>${jadwal.Maghrib}</p>
                                </div>
                                <div class="jadwal-item">
                                    <p>Isya</p>
                                    <p>${jadwal.Isha}</p>
                                </div>
                            `;
                        });
                    }
                });
            });
        });
}

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('current-time').textContent = `Sekarang: ${timeString}`;
}