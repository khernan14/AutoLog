// src/utils/ToggleSidebar.js
const VAR_NAME = "--SideNavigation-slideIn";

function setSlideIn(value) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty(VAR_NAME, String(value));
  if (value === 1) {
    document.body.classList.add("Sidebar-open");
  } else {
    document.body.classList.remove("Sidebar-open");
  }
}

export function openSidebar() {
  setSlideIn(1);
}

export function closeSidebar() {
  setSlideIn(0);
}

export function toggleSidebar() {
  if (typeof document === "undefined") return;
  const current = getComputedStyle(document.documentElement).getPropertyValue(
    VAR_NAME
  );

  const asNumber = Number((current || "0").trim() || 0);
  if (asNumber === 1) {
    closeSidebar();
  } else {
    openSidebar();
  }
}
