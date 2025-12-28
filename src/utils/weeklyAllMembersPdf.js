import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportWeeklyAllMembersPDF({
  clubName,
  members,
  totalWeeks,
  weekAmount,
}) {
  const doc = new jsPDF();
  let y = 20;

  /* ================= HEADER ================= */
  doc.setFontSize(18);
  doc.text(clubName, 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Weekly Contribution Register", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(
    `Total Weeks: ${totalWeeks} | Amount / Week: ₹${weekAmount}`,
    14,
    y
  );
  y += 6;

  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    14,
    y
  );
  y += 10;

  /* ================= MEMBERS ================= */
  members.forEach((member, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.text(
      `${index + 1}. ${member.name} (${member.email})`,
      14,
      y
    );
    y += 6;

    const totalPaid =
      member.payments.length * weekAmount;

    autoTable(doc, {
      startY: y,
      head: [
        [
          "Total Weeks",
          "Paid Weeks",
          "Amount / Week",
          "Total Paid",
        ],
      ],
      body: [
        [
          totalWeeks,
          member.payments.length,
          `₹ ${weekAmount}`,
          `₹ ${totalPaid}`,
        ],
      ],
      theme: "grid",
      styles: { fontSize: 9 },
    });

    y = doc.lastAutoTable.finalY + 4;

    autoTable(doc, {
      startY: y,
      head: [["Week", "Paid Date"]],
      body:
        member.payments.length > 0
          ? member.payments
              .sort((a, b) => a.week - b.week)
              .map((p) => [
                `Week ${p.week}`,
                p.date,
              ])
          : [["-", "No payments"]],
      theme: "striped",
      styles: { fontSize: 9 },
    });

    y = doc.lastAutoTable.finalY + 10;
  });

  doc.save("weekly_contribution_register.pdf");
}
