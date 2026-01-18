import { nanoid } from "nanoid";

function generateRandomCode(): string {
  return nanoid(6).toUpperCase();
}

function ensureShakeAnimation() {
  if (document.getElementById("shake-animation-style")) return;
  
  const style = document.createElement("style");
  style.id = "shake-animation-style";
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
}

function createCodeEntryModal(
  code: string,
  onVerify: (enteredCode: string) => void,
  onClose: () => void
): HTMLElement {
  ensureShakeAnimation();
  
  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483648",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    willChange: "opacity",
  });

  const card = document.createElement("div");
  Object.assign(card.style, {
    position: "relative",
    maxWidth: "440px",
    width: "100%",
    margin: "0 24px",
    padding: "48px 40px",
    textAlign: "center",
    backgroundColor: "rgba(30, 30, 35, 0.95)",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
  });

  // Lock icon
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  `;

  // Title
  const title = document.createElement("h2");
  title.textContent = "Enter Code to Continue";
  Object.assign(title.style, {
    fontSize: "24px",
    fontWeight: "600",
    color: "#f5f5f5",
    marginBottom: "12px",
    lineHeight: "1.3",
    textAlign: "center",
  });

  // Description
  const desc = document.createElement("p");
  desc.textContent = "Please enter the following code to continue:";
  Object.assign(desc.style, {
    fontSize: "16px",
    color: "#a1a1aa",
    marginBottom: "24px",
    lineHeight: "1.5",
    textAlign: "center",
  });

  // Code and input wrapper - side by side layout
  const codeInputWrapper = document.createElement("div");
  Object.assign(codeInputWrapper.style, {
    display: "flex",
    gap: "12px",
    marginBottom: "40px",
    alignItems: "flex-end",
  });

  // Code display - more compact
  const codeDisplay = document.createElement("div");
  Object.assign(codeDisplay.style, {
    flex: "1",
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "12px",
    padding: "12px 16px",
    textAlign: "center",
  });
  const codeText = document.createElement("p");
  codeText.textContent = code;
  Object.assign(codeText.style, {
    color: "#a78bfa",
    fontSize: "18px",
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: "0.1em",
    userSelect: "none",
    margin: "0",
  });
  codeDisplay.appendChild(codeText);

  // Input - more compact
  const inputWrapper = document.createElement("div");
  Object.assign(inputWrapper.style, {
    flex: "1",
  });
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter code";
  Object.assign(input.style, {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "rgba(31, 41, 55, 1)",
    color: "#f5f5f5",
    border: "2px solid transparent",
    borderRadius: "12px",
    fontSize: "16px",
    fontFamily: "monospace",
    letterSpacing: "0.1em",
    textAlign: "center",
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  });
  input.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.toUpperCase();
  });
  input.focus();

  let errorTimeout: number | null = null;

  const showError = () => {
    input.style.borderColor = "#ef4444";
    input.style.animation = "shake 0.5s ease-in-out";
    input.style.willChange = "transform";
    
    if (errorTimeout) clearTimeout(errorTimeout);
    errorTimeout = window.setTimeout(() => {
      input.style.borderColor = "transparent";
      input.style.animation = "";
      input.style.willChange = "auto";
    }, 600);
  };

  // Buttons
  const buttonWrapper = document.createElement("div");
  Object.assign(buttonWrapper.style, {
    display: "flex",
    gap: "12px",
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  Object.assign(cancelBtn.style, {
    flex: "1",
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
  cancelBtn.onmouseenter = () => {
    cancelBtn.style.color = "#f5f5f5";
  };
  cancelBtn.onmouseleave = () => {
    cancelBtn.style.color = "#a1a1aa";
  };
  cancelBtn.onclick = () => {
    modal.remove();
    onClose();
  };

  const verifyBtn = document.createElement("button");
  verifyBtn.textContent = "Continue";
  Object.assign(verifyBtn.style, {
    flex: "1",
    padding: "14px 24px",
    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });
  verifyBtn.onmouseenter = () => {
    verifyBtn.style.transform = "translateY(-1px)";
    verifyBtn.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.4)";
  };
  verifyBtn.onmouseleave = () => {
    verifyBtn.style.transform = "translateY(0)";
    verifyBtn.style.boxShadow = "none";
  };
  verifyBtn.onclick = () => {
    const enteredCode = input.value.trim();
    if (enteredCode === code) {
      modal.remove();
      onVerify(enteredCode);
    } else {
      input.value = "";
      showError();
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      verifyBtn.click();
    }
  });

  buttonWrapper.appendChild(cancelBtn);
  buttonWrapper.appendChild(verifyBtn);
  inputWrapper.appendChild(input);
  codeInputWrapper.appendChild(codeDisplay);
  codeInputWrapper.appendChild(inputWrapper);

  card.appendChild(iconWrap);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(codeInputWrapper);
  card.appendChild(buttonWrapper);
  modal.appendChild(card);

  return modal;
}

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
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: "hidden",
      willChange: "opacity",
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
      willChange: "transform",
      transform: "translateZ(0)",
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
      willChange: "transform",
      transform: "translateZ(0)",
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
    backgroundColor: "rgba(30, 30, 35, 0.95)",
    borderRadius: "20px",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    transform: "translateZ(0)",
    willChange: "transform",
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
    continueBtn.onclick = () => {
      overlay!.remove();
      
      const randomCode = generateRandomCode();
      const codeModal = createCodeEntryModal(
        randomCode,
        () => {
        },
        () => {
          const restoredOverlay = injectBlockedSiteOverlay(siteName);
          document.body.appendChild(restoredOverlay);
        }
      );
      document.body.appendChild(codeModal);
    };
  
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
  