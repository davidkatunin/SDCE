export function injectBlockedSiteOverlay(siteName = "this site"): HTMLElement {
    // Return existing overlay if already present
    let overlay = document.getElementById("blocked-site-overlay") as HTMLElement | null;
    if (overlay) return overlay;
  
    // === overlay container ===
    overlay = document.createElement("div");
    overlay.id = "blocked-site-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(15,15,20,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: "hidden",
    });
  
    // === purple blur ===
    const purpleBlur = document.createElement("div");
    Object.assign(purpleBlur.style, {
      position: "absolute",
      top: "-20%",
      right: "-10%",
      width: "500px",
      height: "500px",
      background:
        "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
      filter: "blur(60px)",
      pointerEvents: "none",
    });
  
    // === blue blur ===
    const blueBlur = document.createElement("div");
    Object.assign(blueBlur.style, {
      position: "absolute",
      bottom: "-20%",
      left: "-10%",
      width: "500px",
      height: "500px",
      background:
        "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
      filter: "blur(60px)",
      pointerEvents: "none",
    });
  
    // === card container ===
    const card = document.createElement("div");
    Object.assign(card.style, {
      position: "relative",
      maxWidth: "440px",
      width: "100%",
      margin: "0 24px",
      padding: "48px 40px",
      textAlign: "center",
      backgroundColor: "rgba(30, 30, 35, 0.9)",
      borderRadius: "20px",
      boxShadow:
        "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    });
  
    // === icon ===
    const iconWrap = document.createElement("div");
    Object.assign(iconWrap.style, {
      width: "64px",
      height: "64px",
      margin: "0 auto 32px",
      backgroundColor: "rgba(139, 92, 246, 0.15)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
    iconWrap.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M4.93 4.93l14.14 14.14" />
      </svg>
    `;
  
    // === title ===
    const title = document.createElement("h1");
    title.textContent = "Time to take a break";
    Object.assign(title.style, {
      fontSize: "24px",
      fontWeight: "600",
      color: "#f5f5f5",
      marginBottom: "12px",
      lineHeight: "1.3",
    });
  
    // === description ===
    const desc = document.createElement("p");
    desc.textContent = `You've blocked ${siteName}. Use this moment to do something more meaningful.`;
    Object.assign(desc.style, {
      fontSize: "16px",
      color: "#a1a1aa",
      marginBottom: "40px",
      lineHeight: "1.5",
    });
  
    // === primary button ===
    const goBackBtn = document.createElement("button");
    goBackBtn.textContent = "Go back";
    Object.assign(goBackBtn.style, {
      width: "100%",
      padding: "14px 24px",
      backgroundColor: "#f5f5f5",
      color: "#18181b",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer",
      marginBottom: "12px",
      transition: "all 0.2s ease",
    });
    goBackBtn.onmouseenter = () => {
      goBackBtn.style.backgroundColor = "#ffffff";
      goBackBtn.style.transform = "translateY(-1px)";
    };
    goBackBtn.onmouseleave = () => {
      goBackBtn.style.backgroundColor = "#f5f5f5";
      goBackBtn.style.transform = "translateY(0)";
    };
    goBackBtn.onclick = () => window.history.back();
  
    // === secondary button ===
    const continueBtn = document.createElement("button");
    continueBtn.textContent = "Continue anyway";
    Object.assign(continueBtn.style, {
      width: "100%",
      padding: "14px 24px",
      backgroundColor: "transparent",
      color: "#a1a1aa",
      border: "none",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
    });
    continueBtn.onmouseenter = () => {
      continueBtn.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
      continueBtn.style.color = "#d4d4d8";
    };
    continueBtn.onmouseleave = () => {
      continueBtn.style.backgroundColor = "transparent";
      continueBtn.style.color = "#a1a1aa";
    };
    continueBtn.onclick = () => overlay!.remove();
  
    // === assemble ===
    card.appendChild(iconWrap);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(goBackBtn);
    card.appendChild(continueBtn);
    overlay.appendChild(purpleBlur);
    overlay.appendChild(blueBlur);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  
    return overlay;
  }
  