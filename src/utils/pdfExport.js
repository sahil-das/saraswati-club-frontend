import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
