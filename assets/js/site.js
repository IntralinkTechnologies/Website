const c = document.getElementById("net");

if (c) {
  const x = c.getContext("2d");

  function rs() {
    c.width = innerWidth;
    c.height = innerHeight;
  }

  rs();
  addEventListener("resize", rs);

  const p = [...Array(70)].map(() => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35
  }));

  (function a() {
    x.clearRect(0, 0, c.width, c.height);

    p.forEach((o) => {
      o.x += o.vx;
      o.y += o.vy;

      if (o.x < 0 || o.x > c.width) o.vx *= -1;
      if (o.y < 0 || o.y > c.height) o.vy *= -1;

      x.fillStyle = "#2EA8FF";
      x.fillRect(o.x, o.y, 2, 2);
    });

    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const d = Math.hypot(p[i].x - p[j].x, p[i].y - p[j].y);

        if (d < 120) {
          x.strokeStyle = `rgba(46,168,255,${(1 - d / 120) * 0.18})`;
          x.beginPath();
          x.moveTo(p[i].x, p[i].y);
          x.lineTo(p[j].x, p[j].y);
          x.stroke();
        }
      }
    }

    requestAnimationFrame(a);
  })();
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(
  "main>section:not(.hero),.hero>div,.grid>*,.why-grid>*,.stats-grid>*,.process-grid>*,.partners-grid>*,.featured-grid>*,.service-showcase-grid>*,.faq-container>*"
);

const navDropdowns = document.querySelectorAll(".nav-dropdown");

if (navDropdowns.length) {
  navDropdowns.forEach((dropdown) => {
    dropdown.addEventListener("toggle", () => {
      if (!dropdown.open) return;

      navDropdowns.forEach((other) => {
        if (other !== dropdown) other.removeAttribute("open");
      });
    });
  });

  document.addEventListener("click", (event) => {
    navDropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) dropdown.removeAttribute("open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    navDropdowns.forEach((dropdown) => dropdown.removeAttribute("open"));
  });
}

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add("revealed");
        revealObserver.unobserve(el);
        el.addEventListener("animationend", () => el.classList.remove("reveal"), {
          once: true
        });
      }),
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px"
    }
  );

  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
}

const counters = document.querySelectorAll(".stat-number");

if (counters.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      let current = 0;

      const update = () => {
        current += target / 80;

        if (current >= target) {
          el.textContent = target;
        } else {
          el.textContent = target % 1 === 0 ? Math.floor(current) : current.toFixed(1);
          requestAnimationFrame(update);
        }
      };

      update();
      observer.unobserve(el);
    })
  );

  counters.forEach((el) => observer.observe(el));
}

const form = document.getElementById("contactForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Sending...";

    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Thank you! Your enquiry has been sent.");
        form.reset();
      } else {
        alert(result.error || result.message || "Something went wrong.");
      }
    } catch {
      alert("Unable to send your enquiry. Please try again.");
    }

    button.disabled = false;
    button.textContent = "Send Enquiry";
  });
}
