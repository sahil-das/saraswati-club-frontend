import jsPDF from "jspdf";
import "jspdf-autotable";

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

  /* ================= HEADER ================= */
  doc.setFontSize(16);
  doc.text("Saraswati Puja Committee", 105, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.text(
    `Financial Report – ${cycle.name}`,
    105,
    y,
    { align: "center" }
  );
  y += 6;

  doc.setFontSize(10);
  doc.text(
    `Cycle Period: ${formatDate(cycle.startDate)} → ${formatDate(
      cycle.endDate
    )}`,
    105,
    y,
    { align: "center" }
  );
  y += 10;

  /* ================= SUMMARY ================= */
  doc.autoTable({
    startY: y,
    head: [["Opening", "Collections", "Expenses", "Closing"]],
    body: [[
      rupee(summary.openingBalance),
      rupee(summary.collections),
      rupee(summary.expenses),
      rupee(summary.closingBalance),
    ]],
    theme: "grid",
    styles: { halign: "center" },
  });

  y = doc.lastAutoTable.finalY + 8;

  /* ================= WEEKLY ================= */
  section(
    doc,
    "Weekly Contributions (Per Member)",
    weekly.map(w => [w.memberName, rupee(w.total)]),
    ["Member", "Amount"],
    y
  );

  y = doc.lastAutoTable.finalY + 8;

  /* ================= PUJA ================= */
  section(
    doc,
    "Puja Contributions (Per Member)",
    puja.map(p => [p.memberName, rupee(p.total)]),
    ["Member", "Amount"],
    y
  );

  y = doc.lastAutoTable.finalY + 8;

  /* ================= DONATIONS ================= */
  section(
    doc,
    "Outside Donations",
    donations.map(d => [
      d.donorName,
      d.date,
      rupee(d.amount),
    ]),
    ["Donor", "Date", "Amount"],
    y
  );

  y = doc.lastAutoTable.finalY + 8;

  /* ================= EXPENSES ================= */
  section(
    doc,
    "Approved Expenses",
    expenses.map(e => [
      e.title,
      e.date,
      rupee(e.amount),
    ]),
    ["Title", "Date", "Amount"],
    y
  );

  doc.save(
    `Saraswati_Puja_${cycle.name.replace(/\s+/g, "_")}.pdf`
  );
};

export const exportFinancePDF = ({
  summary,
  weekly,
  puja,
  donations,
  expenses,
}) => {
  const doc = new jsPDF();
  let y = 15;

  /* ================= HEADER ================= */
  doc.setFontSize(16);
  doc.text("Saraswati Puja Committee - Financial Report", 105, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.text(
    "Overall Financial Summary",
    105,
    y,
    { align: "center" }
  );
  y += 10;

  /* ================= SUMMARY ================= */
  doc.autoTable({
    startY: y,
    head: [["Opening Balance", "Total Collections", "Total Expenses", "Closing Balance"]],
    body: [
      [
        rupee(summary.openingBalance),
        rupee(summary.collections),
        rupee(summary.expenses),
        rupee(summary.closingBalance),
      ],
    ],
    theme: "grid",
    styles: { halign: "center" },
  });

  y = doc.lastAutoTable.finalY + 8;

  /* ================= WEEKLY ================= */
  section(
    doc,
    "Weekly Contributions (Per Member)",
    weekly.map((w) => [w.memberName, rupee(w.total)]),
    ["Member", "Amount"],
    y
  );

  y = doc.lastAutoTable.finalY + 8;

  /* ================= PUJA ================= */
  section(
    doc,
    "Puja Contributions (Per Member)",
    puja.map((p) => [p.memberName, rupee(p.total)]),
    ["Member", "Amount"],
    y
  );

  y = doc.lastAutoTable.finalY + 8;

  /* ================= DONATIONS ================= */
  section(
    doc,
    "Outside Donations",
    donations.map((d) => [d.donorName, d.date, rupee(d.amount)]),
    ["Donor", "Date", "Amount"],
    y
  );

  y = doc.lastAutoTable.finalY + 8;

  /* ================= EXPENSES ================= */
  section(
    doc,
    "Approved Expenses",
    expenses.map((e) => [e.title, e.date, rupee(e.amount)]),
    ["Title", "Date", "Amount"],
    y
  );

  doc.save(`Financial-Report-Overall.pdf`);
};

const section = (doc, title, body, head, y) => {
  doc.setFontSize(12);
  doc.text(title, 14, y - 3);

  doc.autoTable({
    startY: y,
    head: [head],
    body,
    theme: "striped",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 70, 229] },
  });
}

function rupee(n) {
  return `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
}

function formatDate(d) {
  return new Date(d).toISOString().slice(0, 10);
}
