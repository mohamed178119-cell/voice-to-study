/** يحوّل الإجابة (والصورة إن وجدت) إلى ملف PDF ويُنزّله مباشرة */
export async function downloadAnswerPdf(answer: string, image?: string, fileName = "الإجابة-الدراسية.pdf") {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas-pro")]);

  const box = document.createElement("div");
  box.dir = "rtl";
  box.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;padding:40px;background:#fff;color:#111;font-family:Cairo,system-ui,sans-serif;font-size:16px;line-height:2;white-space:pre-wrap";
  const h = document.createElement("h1");
  h.textContent = "المساعد الدراسي — محمد سعد";
  h.style.cssText = "font-size:22px;color:#0f7a63;margin:0 0 16px";
  const body = document.createElement("div");
  body.textContent = answer;
  box.append(h, body);
  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.style.cssText = "width:100%;margin-top:20px;border-radius:12px";
    box.append(img);
    await new Promise((r) => (img.complete ? r(null) : (img.onload = img.onerror = () => r(null))));
  }
  document.body.append(box);
  try {
    const canvas = await html2canvas(box, { scale: 2, backgroundColor: "#ffffff" });
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const pageCanvasH = Math.floor((canvas.width * ph) / pw);
    for (let y = 0, i = 0; y < canvas.height; y += pageCanvasH, i++) {
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = Math.min(pageCanvasH, canvas.height - y);
      slice.getContext("2d")!.drawImage(canvas, 0, -y);
      if (i) pdf.addPage();
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pw, (slice.height * pw) / canvas.width);
    }
    pdf.save(fileName);
  } finally {
    box.remove();
  }
}
