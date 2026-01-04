import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ✅ HELPER: Use "Rs." instead of symbol to ensure PDF compatibility
function formatCurrency(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}
// Sanitize strings for safe filenames
function sanitizeName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

/* =========================================================
   1. HISTORY EXPORT (Detailed - For History Page)
   ========================================================= */
export const exportHistoryCyclePDF = ({
  cycle,
  summary,
  weekly,
  puja,
  donations,
  expenses,
}) => {
  const doc = new jsPDF();
  let y = 15;

  doc.setFontSize(18);
  doc.text("Financial Report", 105, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.text(`${cycle.name}`, 105, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.text(
    `${new Date(cycle.startDate).toLocaleDateString()} - ${new Date(cycle.endDate).toLocaleDateString()}`,
    105,
    y,
    { align: "center" }
  );
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Opening", "Collections", "Expenses", "Closing"]],
    body: [[
      formatCurrency(summary.openingBalance),
      formatCurrency(summary.collections),
      formatCurrency(summary.expenses),
      formatCurrency(summary.closingBalance),
    ]],
    theme: "grid",
    headStyles: { fillColor: [63, 81, 181] },
    styles: { halign: "center" },
  });

  y = doc.lastAutoTable.finalY + 10;

  if (weekly?.length) {
    doc.text("Weekly Contributions", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Member Name", "Amount"]],
      body: weekly.map((w) => [w.memberName, formatCurrency(w.total)]),
      theme: "striped",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (puja?.length) {
    doc.text("Puja Contributions", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Member Name", "Amount"]],
      body: puja.map((p) => [p.memberName, formatCurrency(p.total)]),
      theme: "striped",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (donations?.length) {
    doc.text("Donations", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Donor", "Date", "Amount"]],
      body: donations.map((d) => [d.donorName, d.date, formatCurrency(d.amount)]),
      theme: "striped",
      headStyles: { fillColor: [245, 158, 11] },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (expenses?.length) {
    doc.addPage();
    y = 20;
    doc.text("Expenses Breakdown", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Title", "Date", "Amount"]],
      body: expenses.map((e) => [e.title, e.date, formatCurrency(e.amount)]),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] },
    });
  }

  doc.save(`History_${cycle.name}.pdf`);
};

/* =========================================================
   2. FINANCE EXPORT (Snapshot)
   ========================================================= */
export const exportFinancePDF = ({
  clubName = "Club",
  summary,
  contributions,
  expenses,
}) => {
  const doc = new jsPDF();
  let y = 15;

  doc.setFontSize(18);
  doc.text(clubName, 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(14);
  doc.text("Current Financial Snapshot", 105, y, { align: "center" });
  y += 15;

  doc.text("Summary", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Category", "Amount"]],
    body: summary.map((s) => [s.label, formatCurrency(s.value)]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] },
  });

  y = doc.lastAutoTable.finalY + 10;

  doc.text("Contributions Overview", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Source", "Total Amount"]],
    body: contributions.map((c) => [c.type, formatCurrency(c.amount)]),
    theme: "striped",
  });

  y = doc.lastAutoTable.finalY + 10;

  if (expenses?.length) {
    doc.text("Recent Expenses", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Title", "Status", "Amount"]],
      body: expenses.map((e) => [e.title, e.status, formatCurrency(e.amount)]),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] },
    });
  }

  const clubSlug = sanitizeName(clubName);
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`${clubSlug}_Finance_Snapshot_${dateSlug}.pdf`);
};

/* =========================================================
   3. DONATIONS LIST EXPORT (Improved)
   ========================================================= */
export const exportDonationsPDF = ({ clubName, cycleName, donations }) => {
  const doc = new jsPDF();
  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  // --- HEADER BANNER ---
  doc.setFillColor(63, 81, 181); // Indigo color
  doc.rect(0, 0, 210, 40, "F"); 

  // Club Name (White Text)
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(clubName || "Club Committee", 105, 18, { align: "center" });

  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor(220, 220, 255);
  doc.text("Donation Receipt Report", 105, 28, { align: "center" });

  // --- INFO ROW ---
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Financial Cycle: ${cycleName || "N/A"}`, 14, 50);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 55);

  // Total Badge (Right Aligned)
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Collected: ${formatCurrency(total)}`, 195, 50, { align: "right" });

  // --- TABLE ---
  autoTable(doc, {
    startY: 60,
    head: [["Date", "Receipt No", "Donor Name", "Contact", "Amount"]],
    body: donations.map((d) => [
      new Date(d.date).toLocaleDateString(),
      d.receiptNo || "-",
      d.donorName,
      d.phone || d.address || "-",
      formatCurrency(d.amount), // Uses "Rs."
    ]),
    theme: "grid",
    headStyles: { fillColor: [245, 158, 11], textColor: 255 }, // Amber Header
    alternateRowStyles: { fillColor: [255, 251, 235] }, // Light Amber Row
    columnStyles: { 4: { halign: "right", fontStyle: "bold" } }, // Align Amount Right
  });

  const clubSlug = sanitizeName(clubName || "club");
  const cycleSlug = sanitizeName(cycleName || "list");
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`${clubSlug}_Donations_${cycleSlug}_${dateSlug}.pdf`);
};