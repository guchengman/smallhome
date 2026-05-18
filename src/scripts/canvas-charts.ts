export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

export function drawPieChart(canvas: HTMLCanvasElement, data: PieSlice[], total?: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const displaySize = Math.min(canvas.parentElement?.clientWidth || 300, 400);
  canvas.style.width = displaySize + 'px';
  canvas.style.height = displaySize + 'px';
  canvas.width = displaySize * dpr;
  canvas.height = displaySize * dpr;
  ctx.scale(dpr, dpr);

  const cx = displaySize / 2;
  const cy = displaySize / 2;
  const r = displaySize * 0.4;
  const computedTotal = total || data.reduce((sum, d) => sum + d.value, 0);

  let angle = -Math.PI / 2;
  data.forEach((slice) => {
    const sliceAngle = (slice.value / computedTotal) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    angle += sliceAngle;
  });

  // Center hole
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#292524';
  ctx.font = `bold ${displaySize * 0.06}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`¥${computedTotal.toLocaleString()}`, cx, cy);
}

export function drawBarChart(
  canvas: HTMLCanvasElement,
  data: Array<{ label: string; value: number; color: string }>,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const w = 600, h = 300;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = '100%';
  canvas.style.maxWidth = '600px';
  canvas.style.height = 'auto';
  ctx.scale(dpr, dpr);

  const max = Math.max(...data.map((d) => d.value));
  const barWidth = (w - 100) / data.length - 10;
  const chartH = h - 60;

  // Axes
  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 10);
  ctx.lineTo(50, chartH);
  ctx.lineTo(w - 20, chartH);
  ctx.stroke();

  // Bars
  data.forEach((d, i) => {
    const barH = (d.value / max) * (chartH - 20);
    const x = 60 + i * (barWidth + 10);
    const y = chartH - barH;

    ctx.fillStyle = d.color;
    ctx.fillRect(x, y, barWidth, barH);

    // Label
    ctx.fillStyle = '#292524';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barWidth / 2, chartH + 15);

    // Value
    ctx.fillStyle = '#78716c';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(d.value.toLocaleString(), x + barWidth / 2, y - 5);
  });
}