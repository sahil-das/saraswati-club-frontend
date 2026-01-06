import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const sanitizeName = (s) => String(s || "").trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");

export function exportFinancialReportPDF({
  clubName = "Club",
  year,
  openingBalance,
  incomeSources,
  totalIncome,
  totalExpense,
  netBalance,
  frequency = "weekly", // ✅ NEW PARAMETER (Default to weekly)
  details = { expenses: [], donations: [], puja: [] } 
}) {
  const doc = new jsPDF();
  const formatCurrency = (amount) => `Rs. ${Number(amount).toLocaleString('en-IN')}`;

  let y = 0;

  // ================= 1. HEADER =================
  doc.setFillColor(63, 81, 181);
  doc.rect(0, 0, 210, 45, "F");

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(clubName || "CLUB", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(220, 220, 255);
  doc.text("Annual Financial Report", 14, 32);

  doc.setFontSize(10);
  doc.text(`Financial Year: ${year}`, 195, 20, { align: "right" });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 195, 32, { align: "right" });

  y = 60;

  // ================= 2. EXECUTIVE SUMMARY =================
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(14, y - 10, 182, 45, 3, 3, "FD");

  const col1 = 24, col2 = 80, col3 = 140;
  doc.setFontSize(9); doc.setTextColor(100); doc.setFont(undefined, 'bold');
  doc.text("OPENING BALANCE", col1, y);
  doc.text("TOTAL INCOME", col2, y);
  doc.text("TOTAL EXPENSES", col3, y);

  doc.setFontSize(14); doc.setFont(undefined, 'normal');
  doc.setTextColor(63, 81, 181); doc.text(formatCurrency(openingBalance), col1, y + 8);
  doc.setTextColor(46, 125, 50); doc.text(`+ ${formatCurrency(totalIncome)}`, col2, y + 8);
  doc.setTextColor(198, 40, 40); doc.text(`- ${formatCurrency(totalExpense)}`, col3, y + 8);

  doc.setDrawColor(200); doc.line(24, y + 16, 186, y + 16);

  y += 26;
  doc.setFontSize(10); doc.setTextColor(60); doc.text("NET CLOSING BALANCE (Central Fund)", 24, y);
  doc.setFontSize(16); doc.setTextColor(0); doc.setFont(undefined, 'bold');
  doc.text(formatCurrency(netBalance), 140, y);

  y += 30;

  // ================= 3. INCOME BREAKDOWN (Dynamic) =================
  doc.setFontSize(14); doc.setTextColor(0); doc.setFont(undefined, 'bold');
  doc.text("Income & Expense Summary", 14, y);
  y += 5;

  // ✅ BUILD ROWS DYNAMICALLY
  const summaryRows = [
      ["Opening", "Brought forward", formatCurrency(openingBalance), "Asset"]
  ];

  // Only add Subscription row if frequency is NOT 'none'
  if (frequency !== "none") {
      const label = frequency === "monthly" ? "Subscriptions (Monthly)" : "Subscriptions (Weekly)";
      summaryRows.push(["Income", label, formatCurrency(incomeSources.weekly), "Credit"]);
  }

  summaryRows.push(
      ["Income", "Festival Chanda (Member Fees)", formatCurrency(incomeSources.puja), "Credit"],
      ["Income", "Public Donations", formatCurrency(incomeSources.donation), "Credit"],
      ["Expense", "All Expenses", formatCurrency(totalExpense), "Debit"],
      [{ content: "Net Balance", colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } }, { content: formatCurrency(netBalance), styles: { fontStyle: 'bold' } }, "-"]
  );

  autoTable(doc, {
    startY: y,
    head: [["Category", "Description", "Amount", "Type"]],
    body: summaryRows,
    theme: "grid",
    headStyles: { fillColor: [50, 50, 50], textColor: 255 },
    columnStyles: { 2: { halign: "right", fontStyle: "bold" }, 3: { halign: "center" } },
    didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === "Credit") data.cell.styles.textColor = [46, 125, 50];
            else if (data.cell.raw === "Debit") data.cell.styles.textColor = [198, 40, 40];
            else data.cell.styles.textColor = [63, 81, 181];
        }
    }
  });

  y = doc.lastAutoTable.finalY + 20;

  // ================= 4. DETAILED EXPENSES =================
  if (y > 230) { doc.addPage(); y = 20; }
  
  doc.setFontSize(14); doc.setTextColor(198, 40, 40); doc.text("Detailed Expenses", 14, y);
  y += 5;

  const sortedExpenses = details.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedExpenses.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Date", "Title / Description", "Added By", "Amount"]],
        body: sortedExpenses.map(e => [
            new Date(e.date).toLocaleDateString(),
            e.title,
            e.recordedBy?.name || "Member",
            formatCurrency(e.amount)
        ]),
        theme: "striped",
        headStyles: { fillColor: [198, 40, 40] },
        columnStyles: { 3: { halign: "right", fontStyle: "bold" } }
      });
      y = doc.lastAutoTable.finalY + 15;
  } else {
      doc.setFontSize(10); doc.setTextColor(100); doc.text("No expenses recorded.", 14, y + 10); y+=20;
  }

  // ================= 5. FESTIVAL CHANDA LIST =================
  if (y > 230) { doc.addPage(); y = 20; }
  
  doc.setFontSize(14); doc.setTextColor(46, 125, 50); doc.text("Festival Chanda (Member Fees)", 14, y);
  y += 5;

  if (details.puja.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Date", "Member Name", "Notes", "Amount"]],
        body: details.puja.map(p => [
            new Date(p.createdAt).toLocaleDateString(),
            p.user?.name || "Unknown",
            p.notes || "-",
            formatCurrency(p.amount)
        ]),
        theme: "striped",
        headStyles: { fillColor: [76, 175, 80] },
        columnStyles: { 3: { halign: "right", fontStyle: "bold" } }
      });
      y = doc.lastAutoTable.finalY + 20;
  } else {
      doc.setFontSize(10); doc.setTextColor(100); doc.text("No festival chanda recorded.", 14, y + 10); y+=20;
  }

  // ================= 6. PUBLIC DONATIONS =================
  if (y > 230) { doc.addPage(); y = 20; }
  
  doc.setFontSize(14); doc.setTextColor(245, 158, 11); doc.text("Public Donations", 14, y);
  y += 5;

  if (details.donations.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Date", "Donor Name", "Amount"]],
        body: details.donations.map(d => [
            new Date(d.createdAt).toLocaleDateString(),
            d.donorName,
            formatCurrency(d.amount)
        ]),
        theme: "striped",
        headStyles: { fillColor: [245, 158, 11] },
        columnStyles: { 2: { halign: "right", fontStyle: "bold" } }
      });
      y = doc.lastAutoTable.finalY + 15;
  } else {
      doc.setFontSize(10); doc.setTextColor(100); doc.text("No donations recorded.", 14, y + 10); y+=20;
  }

  // ================= 7. SIGNATURE =================
  if (y > 250) { doc.addPage(); y = 20; }
  
  const signatureY = y + 20;
  doc.setDrawColor(150); doc.setLineWidth(0.5);
  doc.line(140, signatureY, 190, signatureY);
  doc.setFontSize(10); doc.setTextColor(100); doc.setFont(undefined, 'normal');
  doc.text("Treasurer Signature", 165, signatureY + 5, { align: "center" });
  doc.text("Committee", 165, signatureY + 10, { align: "center" });

  doc.save(`${sanitizeName(clubName)}_Financial_Report_${year}.pdf`);
}