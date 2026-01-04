import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const sanitizeName = (s) => String(s || "").trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");

export function exportWeeklyAllMembersPDF({
  clubName = "Saraswati Club",
  members = [],
  cycle = { name: "Current Cycle", totalWeeks: 0, weeklyAmount: 0 },
}) {
  const doc = new jsPDF();

  const formatCurrency = (amount) => `Rs. ${Number(amount).toLocaleString('en-IN')}`;
  const totalWeeks = Number(cycle.totalWeeks) || 52; // Default to 52 if missing
  const weekAmount = Number(cycle.weeklyAmount) || 0;
  const totalExpectedPerMember = totalWeeks * weekAmount;

  // --- 1. CALCULATE GLOBAL STATS ---
  let globalTotalPaid = 0;
  let globalTotalExpected = members.length * totalExpectedPerMember;
  
  const memberRows = members.map((member) => {
    const paidWeeksCount = Array.isArray(member.weeks) 
      ? member.weeks.filter((w) => w.paid).length
      : (member.payments?.length || 0);

    const totalPaid = paidWeeksCount * weekAmount;
    const dueAmount = totalExpectedPerMember - totalPaid;
    globalTotalPaid += totalPaid;

    return [
      member.name,
      `${paidWeeksCount} / ${totalWeeks}`,
      formatCurrency(totalPaid),
      formatCurrency(dueAmount),
      dueAmount === 0 ? "All Paid" : "Pending"
    ];
  });

  const collectionRate = globalTotalExpected > 0 
    ? ((globalTotalPaid / globalTotalExpected) * 100).toFixed(1) 
    : "0.0";

  let y = 0;

  // ================= 2. HEADER & SUMMARY (Same as before) =================
  doc.setFillColor(63, 81, 181); 
  doc.rect(0, 0, 210, 40, "F"); 

  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(clubName.toUpperCase(), 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(220, 220, 255);
  doc.text("Annual Contribution Matrix", 14, 30); // Changed Title

  doc.setFontSize(10);
  doc.text(`Cycle: ${cycle.name}`, 195, 20, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 195, 30, { align: "right" });

  y = 55;

  // Summary Card
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(250, 250, 252);
  doc.roundedRect(14, y - 10, 182, 30, 3, 3, "FD");

  const col1 = 24, col2 = 85, col3 = 145;
  doc.setFontSize(9); doc.setTextColor(100); doc.setFont(undefined, 'bold');
  doc.text("TOTAL MEMBERS", col1, y);
  doc.text("TOTAL WEEKS", col2, y);
  doc.text("PROGRESS", col3, y);

  doc.setFontSize(12); doc.setTextColor(40); doc.setFont(undefined, 'normal');
  doc.text(`${members.length}`, col1, y + 8);
  doc.text(`${totalWeeks}`, col2, y + 8);
  // Ensure we pass RGB as separate args to setTextColor
  const collectionColor = collectionRate === "100.0" ? [46, 125, 50] : [198, 40, 40];
  doc.setTextColor(...collectionColor);
  doc.text(`${collectionRate}% Collected`, col3, y + 8);

  y += 35;

  // ================= 3. OVERVIEW TABLE =================
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont(undefined, 'bold');
  doc.text("Member Summary", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Name", "Progress", "Paid", "Due", "Status"]],
    body: memberRows,
    theme: "grid",
    headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      2: { textColor: [46, 125, 50], halign: 'right' },
      3: { textColor: [198, 40, 40], halign: 'right' },
      4: { halign: 'center', fontStyle: 'bold' }
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // ================= 4. COMPACT MATRIX GRID (Best for 50 Weeks) =================
  if (y > 250) { doc.addPage(); y = 20; }

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Detailed Weekly Matrix", 14, y);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("(Green = Paid, White = Pending)", 14, y + 6);
  y += 12;

  // Iterate over each member to create a Grid
  members.forEach((member, index) => {
    // Check if we need a new page
    if (y > 250) { doc.addPage(); y = 20; }

    // 1. Member Header
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y, 182, 8, "F"); // Light gray header bg
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${member.name}`, 18, y + 5.5);
    y += 8;

    // 2. Build the Grid Data (Rows of 10 weeks)
    const paidWeekNumbers = new Set(
        Array.isArray(member.weeks) 
        ? member.weeks.filter(w => w.paid).map(w => w.week) 
        : member.payments?.map(p => p.week) || []
    );

    const gridRows = [];
    let currentRow = [];
    
    // Create rows of 10 columns (e.g. Weeks 1-10, 11-20...)
    for (let w = 1; w <= totalWeeks; w++) {
        currentRow.push({
            content: String(w),
            paid: paidWeekNumbers.has(w)
        });
        if (currentRow.length === 10 || w === totalWeeks) {
            // Fill remaining empty cells if last row is incomplete
            while(currentRow.length < 10) currentRow.push({ content: "", paid: false });
            gridRows.push(currentRow);
            currentRow = [];
        }
    }

    // 3. Draw the Grid using autoTable
    autoTable(doc, {
        startY: y,
        body: gridRows.map(row => row.map(cell => cell.content)), // Just numbers
        theme: 'grid',
        styles: { 
            fontSize: 9, 
            halign: 'center', 
            valign: 'middle', 
            cellPadding: 1,
            lineWidth: 0.1,
            lineColor: [200, 200, 200]
        },
        // IMPORTANT: Color the cells based on status
        didParseCell: (data) => {
            if (data.section === 'body') {
                const rowIndex = data.row.index;
                const colIndex = data.column.index;
                const cellData = gridRows[rowIndex][colIndex];
                
                if (cellData && cellData.paid) {
                    // Paid = Green Background
                    data.cell.styles.fillColor = [220, 255, 220]; 
                    data.cell.styles.textColor = [0, 100, 0];
                    data.cell.styles.fontStyle = 'bold';
                } else if (cellData && cellData.content !== "") {
                    // Unpaid = Default White
                    data.cell.styles.textColor = [150, 150, 150];
                }
            }
        },
        margin: { left: 14, right: 14 },
    });

    y = doc.lastAutoTable.finalY + 8; // Space between members
  });

  // Footer Page Numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: "right" });
  }

  doc.save(`${sanitizeName(clubName)}_Weekly_Matrix_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}