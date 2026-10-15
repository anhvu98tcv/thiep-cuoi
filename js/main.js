/* ════════════════════════════════════════════════════════════════
   THIỆP CƯỚI ONLINE — Cấu hình & tương tác
   ════════════════════════════════════════════════════════════════ */

/* ┌──────────────────────────────────────────────────────────────┐
   │  👇 CHỈNH SỬA CÁC THÔNG TIN QUAN TRỌNG Ở ĐÂY                   │
   └──────────────────────────────────────────────────────────────┘ */
const CONFIG = {
  // Ngày & giờ cưới — dùng cho đồng hồ đếm ngược
  // Định dạng: "NĂM-THÁNG-NGÀYTGiờ:Phút:Giây"
  weddingDate: "2026-11-14T18:00:00",

  // Nơi nhận xác nhận tham dự (RSVP).
  // Để trống "" thì form vẫn chạy (hiện lời cảm ơn) nhưng KHÔNG lưu lại.
  // Cách lưu thật: tạo form miễn phí tại https://formspree.io rồi dán link vào đây.
  //   Ví dụ: "https://formspree.io/f/abcdwxyz"
  rsvpEndpoint: "",
};

/* ════════════════════ Dưới đây là phần xử lý, không cần sửa ════════════════════ */

/* ── 1. Đồng hồ đếm ngược ── */
(function countdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  const el = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };
  const pad = (n) => String(Math.max(0, n)).padStart(2, "0");

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      el.days.textContent = el.hours.textContent = el.mins.textContent = el.secs.textContent = "00";
      const sub = document.querySelector(".countdown-sub");
      if (sub) sub.textContent = "Chúng mình đã chính thức về chung một nhà! 💍";
      return;
    }
    el.days.textContent = pad(Math.floor(diff / 86400000));
    el.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    el.mins.textContent = pad(Math.floor((diff % 3600000) / 60000));
    el.secs.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── 2. Hiệu ứng xuất hiện khi cuộn ── */
(function reveals() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((i) => obs.observe(i));
})();

/* ── 3. Thanh điều hướng ── */
(function navbar() {
  const bar = document.getElementById("navbar");
  const toggle = document.getElementById("navToggle");
  const links = document.querySelector(".nav-links");

  const onScroll = () => bar.classList.toggle("scrolled", window.scrollY > 60);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }
})();

/* ── 4. Cánh hoa rơi ── */
(function petals() {
  const container = document.querySelector(".petals");
  if (!container) return;
  const chars = ["🌸", "🌷", "💮", "🍃", "❀"];
  const COUNT = window.innerWidth < 760 ? 10 : 18;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.textContent = chars[Math.floor(Math.random() * chars.length)];
    p.style.left = Math.random() * 100 + "vw";
    p.style.fontSize = 12 + Math.random() * 16 + "px";
    p.style.animationDuration = 8 + Math.random() * 9 + "s";
    p.style.animationDelay = Math.random() * 10 + "s";
    container.appendChild(p);
  }
})();

/* ── 5. Nhạc nền ── */
(function music() {
  const btn = document.getElementById("musicToggle");
  const audio = document.getElementById("bgMusic");
  if (!btn || !audio) return;
  let playing = false;
  btn.addEventListener("click", () => {
    if (playing) {
      audio.pause();
      btn.classList.remove("playing");
    } else {
      audio.play().catch(() => {
        // Chưa có file assets/music.mp3 hoặc trình duyệt chặn — bỏ qua êm ái
      });
      btn.classList.add("playing");
    }
    playing = !playing;
  });
})();

/* ── 6. Hộp quà — nhấn để hiện QR ── */
(function giftBox() {
  const box = document.getElementById("giftBox");
  const reveal = document.getElementById("giftReveal");
  if (!box || !reveal) return;
  box.addEventListener("click", () => {
    const open = reveal.classList.toggle("open");
    box.classList.toggle("opened", open);
    box.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      setTimeout(
        () => reveal.scrollIntoView({ behavior: "smooth", block: "center" }),
        350
      );
    }
  });
})();

/* ── 7. Xác nhận tham dự (RSVP) ── */
(function rsvp() {
  const form = document.getElementById("rsvpForm");
  const status = document.getElementById("formStatus");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector(".btn-submit");
    const data = Object.fromEntries(new FormData(form).entries());

    status.className = "form-status";
    status.textContent = "Đang gửi...";
    btn.disabled = true;

    try {
      if (CONFIG.rsvpEndpoint) {
        const res = await fetch(CONFIG.rsvpEndpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("fail");
      } else {
        // Chưa cấu hình nơi lưu — mô phỏng gửi thành công
        await new Promise((r) => setTimeout(r, 600));
        console.log("RSVP (chưa cấu hình nơi lưu):", data);
      }
      form.reset();
      status.className = "form-status success";
      status.textContent = "Cảm ơn bạn! Chúng mình đã nhận được xác nhận 💕";
    } catch (err) {
      status.className = "form-status error";
      status.textContent = "Có lỗi khi gửi. Bạn thử lại hoặc liên hệ trực tiếp giúp mình nhé!";
    } finally {
      btn.disabled = false;
    }
  });
})();
