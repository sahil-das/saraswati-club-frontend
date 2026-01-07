import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   CONSTANTS & THEME
   ========================================================= */
const COLORS = {
  primary: [79, 70, 229], // Indigo-600
  secondary: [100, 116, 139], // Slate-500
  text: [30, 41, 59], // Slate-800
  success: [22, 163, 74], // Green-600
  danger: [220, 38, 38], // Red-600
  lightBg: [248, 250, 252], // Slate-50
  accent: [245, 158, 11], // Amber
};

const sanitizeName = (s) => String(s || "").trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
const formatCurrency = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

export function exportWeeklyAllMembersPDF({
  clubName = "Saraswati Club",
  members = [],
  cycle = { name: "Current Cycle", totalWeeks: 0, weeklyAmount: 0 },
  frequency = "weekly", 
}) {
  // 1. Setup PDF (Portrait is sufficient for List View)
  const doc = new jsPDF({ orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  const isMonthly = frequency === "monthly";
  const frequencyLabel = isMonthly ? "Monthly" : "Weekly";
  const unitLabel = isMonthly ? "Months" : "Weeks";

  // --- CALCULATIONS ---
  const totalInstallments = Number(cycle.totalWeeks) || (isMonthly ? 12 : 52);
  const amountPerInstallment = Number(cycle.weeklyAmount) || 0;
  const totalExpectedPerMember = totalInstallments * amountPerInstallment;

  let globalTotalPaid = 0;
  let globalTotalExpected = members.length * totalExpectedPerMember;

  const processedMembers = members.map((member) => {
    // Determine paid items safely
    const paidItems = Array.isArray(member.payments) 
      ? member.payments 
      : (Array.isArray(member.subscription?.installments) ? member.subscription.installments.filter(i => i.isPaid) : []);

    const paidCount = paidItems.length;
    const totalPaid = paidCount * amountPerInstallment;
    const dueAmount = totalExpectedPerMember - totalPaid;
    globalTotalPaid += totalPaid;

    return {
      name: member.name,
      progress: `${paidCount} / ${totalInstallments}`,
      totalPaid,
      dueAmount,
      status: dueAmount <= 0 ? "Complete" : "Pending"
    };
  });

  const collectionRate = globalTotalExpected > 0 
    ? ((globalTotalPaid / globalTotalExpected) * 100).toFixed(1) 
    : "0.0";

  let y = 0;
  const toTitleCase = (str) => {
    return String(str || "")
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  // ================= 1. HEADER =================
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Logo (Top Right)
  const logoSize = 10;
  const logoY = 12;
  const logoX = pageWidth - margin - 35; 
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(logoX, logoY, logoSize, logoSize, 2.5, 2.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("CK", logoX + 5, logoY + 6.5, { align: "center" });
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.text("ClubKhata", logoX + 14, logoY + 6.5);

  // Title
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.text(toTitleCase(clubName), margin, 20);

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text(`${frequencyLabel} Collection Report`, margin, 28);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.secondary);
  doc.setFont("helvetica", "normal");
  doc.text(`Cycle: ${cycle.name}  |  Generated: ${new Date().toLocaleDateString()}`, margin, 35);

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 42, pageWidth - margin, 42);
  
  y = 50;

  // ================= 2. SUMMARY CARD (With Rate) =================
  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(margin, y - 5, pageWidth - (margin * 2), 25, 3, 3, "F");

  // Define 4 Columns for the Summary
  const colWidth = (pageWidth - (margin * 2)) / 4;
  const col1 = margin + 5;
  const col2 = margin + colWidth + 5;
  const col3 = margin + (colWidth * 2) + 5;
  const col4 = margin + (colWidth * 3) + 5;

  // Labels
  doc.setFontSize(8); doc.setTextColor(100); doc.setFont(undefined, 'bold');
  doc.text("TOTAL MEMBERS", col1, y + 5);
  doc.text(`TOTAL ${unitLabel.toUpperCase()}`, col2, y + 5);
  doc.text("CONTRIBUTION RATE", col3, y + 5); // ✅ Added Rate Label
  doc.text("COLLECTION RATE", col4, y + 5);

  // Values
  doc.setFontSize(11); doc.setTextColor(...COLORS.text); doc.setFont(undefined, 'normal');
  doc.text(`${members.length}`, col1, y + 13);
  doc.text(`${totalInstallments}`, col2, y + 13);
  
  // ✅ Show Rate (e.g., "Rs. 200 / Week")
  doc.setTextColor(...COLORS.primary);
  doc.text(`${formatCurrency(amountPerInstallment)} / ${isMonthly ? 'Mo' : 'Wk'}`, col3, y + 13);

  // Progress %
  const rateColor = collectionRate === "100.0" ? COLORS.success : (Number(collectionRate) < 50 ? COLORS.danger : COLORS.primary);
  doc.setTextColor(...rateColor);
  doc.text(`${collectionRate}%`, col4, y + 13);

  y += 35;

  // ================= 3. UNIFIED SUMMARY TABLE =================
  doc.setFontSize(12); doc.setTextColor(...COLORS.text); doc.setFont(undefined, 'bold');
  doc.text("Member Collection Summary", margin, y);
  y += 5;

  const tableBody = processedMembers.map(m => [
      m.name,
      m.progress,
      formatCurrency(m.totalPaid),
      formatCurrency(m.dueAmount),
      m.status
  ]);

  autoTable(doc, {
      startY: y,
      head: [["Name", `Progress (${unitLabel})`, "Paid Amount", "Due Amount", "Status"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: COLORS.primary },
      columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right', textColor: COLORS.success },
          3: { halign: 'right', textColor: COLORS.danger, fontStyle: 'bold' },
          4: { halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
           if (data.column.index === 4 && data.section === 'body') {
              if (data.cell.raw === "Complete") data.cell.styles.textColor = COLORS.success;
              else data.cell.styles.textColor = COLORS.secondary;
          }
      }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary);
    doc.text(`Generated by ClubKhata`, margin, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: "right" });
  }

  doc.save(`${sanitizeName(clubName)}_${frequencyLabel}_Report.pdf`);
}