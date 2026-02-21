// Prevent duplicate injection
if (!document.getElementById("dukandar-btn")) {

    /* =======================
       Inject animation styles
    ========================*/
    const style = document.createElement("style");
    style.innerHTML = `
  @keyframes dukandarPulse {
    0% { box-shadow: 0 0 0 0 rgba(17, 16, 36, 0.7); }
    70% { box-shadow: 0 0 0 12px rgba(108, 99, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(108, 99, 255, 0); }
  }

  .dots span {
    animation: blink 1.4s infinite;
    font-weight: bold;
  }
  .dots span:nth-child(2) { animation-delay: 0.2s; }
  .dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes blink {
    0%, 80%, 100% { opacity: 0; }
    40% { opacity: 1; }
  }
  `;
    document.head.appendChild(style);


    /* =======================
       Create button
    ========================*/
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
        animation: "dukandarPulse 1.8s infinite"
    });

    btn.title = "Open Dukandar Companion";


    /* =======================
       Create bubble
    ========================*/
    const bubble = document.createElement("div");
    bubble.innerHTML = `
  Your digital shopkeeper is here 🤖 <br/>
  Ask Dukandar for product advice,
  offers & smarter choices
  <span class="dots">
    <span>.</span><span>.</span><span>.</span>
  </span>
`;

    Object.assign(bubble.style, {
        position: "fixed",
        bottom: "90px",
        right: "20px",
        background: "white",
        color: "#333",
        padding: "10px 14px",
        borderRadius: "12px",
        fontSize: "14px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        zIndex: "999999",
        opacity: "0",
        transform: "translateY(10px)",
        transition: "all 0.4s ease"
    });


    /* =======================
       Button behavior
    ========================*/
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
        bubble.style.opacity = "0";
    };


    /* =======================
       Add elements to page
    ========================*/
    document.body.appendChild(btn);
    document.body.appendChild(bubble);


    /* =======================
       Bubble timing animation
    ========================*/
    setTimeout(() => {
        bubble.style.opacity = "1";
        bubble.style.transform = "translateY(0)";
    }, 2500);

    setTimeout(() => {
        bubble.style.opacity = "0";
    }, 7000);
}
