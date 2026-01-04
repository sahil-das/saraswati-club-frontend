import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Sanitize strings for safe filenames
const sanitizeName = (s) => String(s || "").trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");

// Alias used by older helpers
function formatCurrency(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}


/* =========================================================
   6. MEMBERS LIST EXPORT (Contact Directory)
   ========================================================= */
export const exportMembersPDF = ({ clubName, members }) => {
  const doc = new jsPDF();

  // --- HEADER ---
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, 210, 40, "F"); 

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(clubName || "Club Committee", 105, 18, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(224, 231, 255);
  doc.text("Member Directory", 105, 28, { align: "center" });

  // --- INFO ROW ---
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Total Members: ${members.length}`, 14, 50);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 195, 50, { align: "right" });

  // --- TABLE ---
  autoTable(doc, {
    startY: 55,
    head: [["#", "Name", "Role", "Phone", "Email", "Joined"]],
    body: members.map((m, index) => [
      index + 1,
      m.name,
      m.role.toUpperCase(),
      m.phone || "-",
      m.email,
      new Date(m.joinedAt).toLocaleDateString()
    ]),
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] }, // Indigo Header
    columnStyles: { 
      0: { halign: "center", fontStyle: "bold", cellWidth: 10 },
      2: { fontStyle: "bold", fontSize: 8 },
    },
  });
  const clubSlug = sanitizeName(clubName || "club");
  doc.save(`${clubSlug}_Members_List.pdf`);
};

/* =========================================================
   1. HISTORY EXPORT (Detailed - For History Page)
   Expects full lists: weekly[], puja[], donations[], expenses[]
   ========================================================= */
export const exportHistoryCyclePDF = ({
  cycle,
  summary,
  weekly,
  puja,
  donations,
  expenses,
  clubName,
}) => {
  const doc = new jsPDF();
  let y = 15;

  // --- HEADER ---
  doc.setFontSize(18);
  doc.text(clubName || "Saraswati Puja Committee", 105, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.text(`Financial Report: ${cycle.name}`, 105, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.text(
    `Period: ${new Date(cycle.startDate).toLocaleDateString()} - ${new Date(
      cycle.endDate
    ).toLocaleDateString()}`,
    105,
    y,
    { align: "center" }
  );
  y += 10;

  // --- SUMMARY TABLE ---
  autoTable(doc, {
    startY: y,
    head: [["Opening", "Collections", "Expenses", "Closing"]],
    body: [
      [
        formatCurrency(summary.openingBalance),
        formatCurrency(summary.collections),
        formatCurrency(summary.expenses),
        formatCurrency(summary.closingBalance),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [63, 81, 181] },
    styles: { halign: "center" },
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- WEEKLY DETAILS ---
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

  // --- PUJA DETAILS ---
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

  // --- DONATIONS DETAILS ---
  if (donations?.length) {
    doc.text("Donations", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Donor", "Date", "Amount"]],
      body: donations.map((d) => [d.donorName, d.date, formatCurrency(d.amount)]),
      theme: "striped",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- EXPENSES DETAILS ---
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

  // filename: <club>_History_<cycle>_<date>.pdf
  const clubSlug = sanitizeName(clubName || "club");
  const cycleSlug = sanitizeName(cycle?.name || "cycle");
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`${clubSlug}_History_${cycleSlug}_${dateSlug}.pdf`);
};

/* =========================================================
   2. FINANCE EXPORT (Snapshot - For Reports Page)
   Expects summary[], contributions[], expenses[] (from Reports.jsx)
   ========================================================= */
export const exportFinancePDF = ({
  clubName = "Club",
  summary, // Array: [{label, value}]
  contributions, // Array: [{type, amount}]
  expenses, // Array: [{title, amount, status}]
}) => {
  const doc = new jsPDF();
  let y = 15;

  // --- HEADER ---
  doc.setFontSize(18);
  doc.text(clubName, 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(14);
  doc.text("Current Financial Snapshot", 105, y, { align: "center" });
  y += 15;

  // --- SUMMARY TABLE (From Summary Cards) ---
  doc.text("Summary", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Category", "Amount"]],
    body: summary.map((s) => [s.label, formatCurrency(s.value)]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] }, // Indigo
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- CONTRIBUTIONS BREAKDOWN ---
  doc.text("Contributions Overview", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Source", "Total Amount"]],
    body: contributions.map((c) => [c.type, formatCurrency(c.amount)]),
    theme: "striped",
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- RECENT EXPENSES ---
  if (expenses?.length) {
    doc.text("Recent Expenses", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Title", "Status", "Amount"]],
      body: expenses.map((e) => [e.title, e.status, formatCurrency(e.amount)]),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] }, // Red
    });
  }

  const clubSlug = sanitizeName(clubName || "club");
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`${clubSlug}_Finance_Report_Snapshot_${dateSlug}.pdf`);
};

/* =========================================================
   3. DONATIONS LIST EXPORT (Standalone)
   ========================================================= */
export const exportDonationsPDF = ({ clubName = "Club", cycleName, donations = [] }) => {
  const doc = new jsPDF();
  const total = (donations || []).reduce((s, d) => s + (d.amount || 0), 0);

  // --- HEADER BANNER ---
  doc.setFillColor(63, 81, 181);
  doc.rect(0, 0, 210, 40, "F");

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(clubName || "Club Committee", 105, 18, { align: "center" });

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
    body: (donations || []).map((d) => [
      new Date(d.date).toLocaleDateString(),
      d.receiptNo || "-",
      d.donorName || "-",
      d.phone || d.address || "-",
      formatCurrency(d.amount),
    ]),
    theme: "grid",
    headStyles: { fillColor: [245, 158, 11], textColor: 255 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    columnStyles: { 4: { halign: "right", fontStyle: "bold" } },
  });

  const clubSlug = sanitizeName(clubName || "club");
  const cycleSlug = sanitizeName(cycleName || "list");
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`${clubSlug}_Donations_${cycleSlug}_${dateSlug}.pdf`);
};


/* =========================================================
   4. EXPENSES LIST EXPORT (Standalone - For Expenses Page)
   ========================================================= */
export const exportExpensesPDF = ({ clubName, cycleName, expenses }) => {
  const doc = new jsPDF();
  const totalApproved = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);

  // --- HEADER BANNER ---
  doc.setFillColor(220, 38, 38); // Red color for Expenses
  doc.rect(0, 0, 210, 40, "F"); 

  // Club Name (White Text)
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(clubName || "Club Committee", 105, 18, { align: "center" });

  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor(254, 202, 202); // Light Red
  doc.text("Expenses Report", 105, 28, { align: "center" });

  // --- INFO ROW ---
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Financial Cycle: ${cycleName || "N/A"}`, 14, 50);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 55);

  // Total Badge (Right Aligned)
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(220, 38, 38); // Red Text
  doc.text(`Total Approved: ${formatCurrency(totalApproved)}`, 195, 50, { align: "right" });

  // --- TABLE ---
  autoTable(doc, {
    startY: 60,
    head: [["Date", "Title", "Category", "Recorded By", "Status", "Amount"]],
    body: expenses.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.title,
      e.category,
      e.recordedBy?.name || "-",
      e.status.toUpperCase(),
      formatCurrency(e.amount),
    ]),
    theme: "grid",
    headStyles: { fillColor: [220, 38, 38], textColor: 255 }, // Red Header
    alternateRowStyles: { fillColor: [255, 241, 242] }, // Light Red Row
    columnStyles: { 
        5: { halign: "right", fontStyle: "bold" },
        4: { fontSize: 8, fontStyle: "bold" }
    },
    didParseCell: function(data) {
        // Color code status column
        if (data.column.index === 4 && data.section === 'body') {
            const status = data.cell.raw;
            if (status === 'APPROVED') data.cell.styles.textColor = [22, 163, 74]; // Green
            else if (status === 'REJECTED') data.cell.styles.textColor = [220, 38, 38]; // Red
            else data.cell.styles.textColor = [217, 119, 6]; // Amber (Pending)
        }
    }
  });

  const clubSlug = sanitizeName(clubName || "club");
  const cycleSlug = sanitizeName(cycleName || "list");
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`${clubSlug}_Expenses_${cycleSlug}_${dateSlug}.pdf`);
};

/* =========================================================
   5. PUJA CONTRIBUTIONS EXPORT (Standalone)
   ========================================================= */
export const exportPujaPDF = ({ clubName, cycleName, data }) => {
  const doc = new jsPDF();
  const total = data.reduce((sum, row) => sum + row.amount, 0);

  // --- HEADER BANNER ---
  doc.setFillColor(16, 185, 129); // Emerald Green
  doc.rect(0, 0, 210, 40, "F"); 

  // Club Name
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(clubName || "Club Committee", 105, 18, { align: "center" });

  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor(209, 250, 229); // Light Green
  doc.text("Festival Chanda Report", 105, 28, { align: "center" });

  // --- INFO ROW ---
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`Financial Cycle: ${cycleName || "N/A"}`, 14, 50);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 55);

  // Total Badge
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(5, 150, 105); // Dark Green
  doc.text(`Total Collected: ${formatCurrency(total)}`, 195, 50, { align: "right" });

  // --- TABLE ---
  autoTable(doc, {
    startY: 60,
    head: [["Date", "Member Name", "Notes", "Amount"]],
    body: data.map((row) => [
      new Date(row.createdAt).toLocaleDateString(),
      row.user?.name || "Unknown",
      row.notes || "-",
      formatCurrency(row.amount),
    ]),
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // Emerald Header
    alternateRowStyles: { fillColor: [236, 253, 245] }, // Mint Row
    columnStyles: { 3: { halign: "right", fontStyle: "bold" } },
  });

  const clubSlug = sanitizeName(clubName || "club");
  const cycleSlug = sanitizeName(cycleName || "report");
  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`${clubSlug}_Puja_Chanda_${cycleSlug}_${dateSlug}.pdf`);
};