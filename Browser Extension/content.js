const isABFRL = window.location.hostname.includes("abfrl.in");

/* =======================
   Typing animation helper
=======================*/
function typeWriter(element, text, speed = 10) {
  let i = 0;
  element.innerHTML = "";

  function typing() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}

/* =======================
   Overlay only on ABFRL
=======================*/
if (isABFRL && !document.getElementById("dukandar-btn")) {

  /* ===== Inject animation styles ===== */
  const style = document.createElement("style");
  style.innerHTML = `
  @keyframes dukandarPulse {
    0% { box-shadow: 0 0 0 0 rgba(17, 16, 36, 0.7); }
    70% { box-shadow: 0 0 0 12px rgba(108, 99, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(108, 99, 255, 0); }
  }

  @keyframes glow {
    0% { transform: scale(1); }
    50% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  `;
  document.head.appendChild(style);

  /* ===== Create button ===== */
  const btn = document.createElement("div");
  btn.id = "dukandar-btn";
  btn.innerText = "D";

  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    background: "#000000",
    color: "white",
    fontSize: "26px",
    fontWeight: "bold",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    zIndex: "999999",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease",
    animation: "dukandarPulse 1.8s infinite, glow 2.5s infinite"
  });

  btn.title = "Open Dukandar Companion";

  /* ===== Create bubble ===== */
  const bubble = document.createElement("div");

  Object.assign(bubble.style, {
    position: "fixed",
    bottom: "95px",
    right: "20px",
    width: "230px",
    background: "white",
    color: "#333",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    lineHeight: "1.4",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    zIndex: "999999",
    opacity: "0",
    transform: "translateY(10px)",
    transition: "all 0.4s ease"
  });

  const message = `Hi 👋 I’m Dukandar
Your AI shopping companion

✨ Personalized recommendations
💸 Hidden deals & loyalty offers
📦 Inventory & store insights
🧠 Smart buying guidance`;

  /* ===== Button behavior ===== */
  btn.onclick = () => {
    chrome.runtime.sendMessage({ type: "SAVE_TAB" });
    window.open("http://localhost:5173", "_blank");
  };

  btn.onmouseover = () => {
    btn.style.transform = "scale(1.1)";
    bubble.style.opacity = "1";
  };

  btn.onmouseout = () => {
    btn.style.transform = "scale(1)";
  };

  /* ===== Add elements ===== */
  document.body.appendChild(btn);
  document.body.appendChild(bubble);

  /* ===== Bubble animation ===== */
  setTimeout(() => {
    bubble.style.opacity = "1";
    bubble.style.transform = "translateY(0)";
    typeWriter(bubble, message, 18);
  }, 2000);

  setTimeout(() => {
    bubble.style.opacity = "0";
  }, 9000);
}

window.addEventListener("message", (event) => {
if (!event.data || !event.data.type) return;

console.log("Filtered message:", event.data);
});

/* ===== Listen webpage → extension ===== */
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (!event.data || !event.data.type) return;


  if (event.data.type === "REDIRECT_TAB") {
    chrome.runtime.sendMessage({
      type: "REDIRECT_TAB",
      url: event.data.url
    });
  }

  if (event.data.type === "GET_BRAND") {
    chrome.storage.local.get(["brandName"], (result) => {
      window.postMessage({
        type: "BRAND_CONTEXT",
        brand: result.brandName
      }, "*");
    });
  }
});