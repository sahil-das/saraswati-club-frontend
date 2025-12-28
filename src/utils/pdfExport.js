import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* =====================================================
   EXISTING REPORT EXPORT (DO NOT CHANGE)
===================================================== */
export const exportFinancePDF = ({
  clubName,
  summary,
  contributions,
  expenses,
}) => {
  const doc = new jsPDF();

  // ===== HEADER =====
  doc.setFontSize(18);
  doc.text(clubName, 14, 20);

  doc.setFontSize(12);
  doc.text("Financial Report", 14, 30);

  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    14,
    38
  );

  // ===== SUMMARY TABLE =====
  autoTable(doc, {
    startY: 45,
    head: [["Summary", "Amount (₹)"]],
    body: summary.map((s) => [s.label, s.value]),
    theme: "grid",
  });

  // ===== CONTRIBUTIONS TABLE =====
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Type", "Amount (₹)"]],
    body: contributions.map((c) => [c.type, c.amount]),
    theme: "striped",
  });

  // ===== EXPENSES TABLE =====
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Title", "Amount", "Added By", "Status"]],
    body: expenses.map((e) => [
      e.title,
      e.amount,
      e.addedBy,
      e.status,
    ]),
    theme: "grid",
  });

  doc.save("saraswati-puja-report.pdf");
};

/* =====================================================
   NEW: HISTORY YEAR-WISE PDF EXPORT
===================================================== */
export const exportHistoryYearPDF = (year, data) => {
  const doc = new jsPDF();

  /* ===== HEADER ===== */
  doc.setFontSize(18);
  doc.text("Saraswati Puja Committee", 14, 20);

  doc.setFontSize(12);
  doc.text(`Financial History Report - ${year}`, 14, 30);

  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    14,
    38
  );

  /* ===== SUMMARY ===== */
  autoTable(doc, {
    startY: 45,
    head: [["Summary", "Amount (₹)"]],
    body: [
      ["Opening Balance", data.openingBalance],
      ["Total Collection", data.collections],
      ["Total Expenses", data.expenses],
      ["Closing Balance", data.closingBalance],
    ],
    theme: "grid",
  });

  let nextY = doc.lastAutoTable.finalY + 10;

  /* ===== WEEKLY CONTRIBUTIONS ===== */
  if (data.weekly && data.weekly.length > 0) {
    doc.setFontSize(12);
    doc.text("Weekly Contributions (Member-wise)", 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Member", "Amount (₹)"]],
      body: data.weekly.map((w) => [
        w.member,
        w.amount,
      ]),
      theme: "striped",
    });

    nextY = doc.lastAutoTable.finalY + 10;
  }

  /* ===== PUJA CONTRIBUTIONS ===== */
  if (data.puja && data.puja.length > 0) {
    doc.setFontSize(12);
    doc.text("Puja Time Contributions", 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Member", "Amount (₹)", "Date"]],
      body: data.puja.map((p) => [
        p.member,
        p.amount,
        p.date,
      ]),
      theme: "grid",
    });

    nextY = doc.lastAutoTable.finalY + 10;
  }

  /* ===== OUTSIDE DONATIONS ===== */
  if (data.donations && data.donations.length > 0) {
    doc.setFontSize(12);
    doc.text("Outside Donations", 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Donor", "Amount (₹)", "Date"]],
      body: data.donations.map((d) => [
        d.name,
        d.amount,
        d.date,
      ]),
      theme: "striped",
    });

    nextY = doc.lastAutoTable.finalY + 10;
  }

  /* ===== EXPENSES ===== */
  if (data.expensesList && data.expensesList.length > 0) {
    doc.setFontSize(12);
    doc.text("Expenses", 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Title", "Amount (₹)", "Date"]],
      body: data.expensesList.map((e) => [
        e.title,
        e.amount,
        e.date,
      ]),
      theme: "grid",
    });
  }

  doc.save(`Saraswati_Puja_History_${year}.pdf`);
};
