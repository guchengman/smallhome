export async function loadMermaid() {
  const containers = document.querySelectorAll('.mermaid-container:not(.mermaid-loaded)');
  if (containers.length === 0) return;

  try {
    const mermaid = await import('mermaid');
    mermaid.default.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
    });

    containers.forEach(async (container) => {
      const code = container.textContent?.trim();
      if (!code) return;

      try {
        const { svg } = await mermaid.default.render(
          `mermaid-${Math.random().toString(36).slice(2, 8)}`,
          code,
        );
        container.innerHTML = svg;
        container.classList.add('mermaid-loaded');
      } catch {
        container.innerHTML = `<p style="color:#dc2626">Mermaid 渲染失败</p>`;
      }
    });
  } catch {
    // Mermaid not available, leave placeholders
  }
}

// Auto-load if mermaid containers exist
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.mermaid-container')) {
      loadMermaid();
    }
  });
}