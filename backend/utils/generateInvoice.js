// pdfkit loads on first use, not when the server starts.

const { COMPANY: C } = require('../constants/chatbotKnowledge');

// Seller details on the invoice (same source as the site footer and chatbot).
const COMPANY = {
    name: C.name,
    tagline: `${C.product} · AI Digital Business Card Platform`,
    addressLines: C.addressLines,
    email: C.email,
    phone: C.phone,
    gstin: C.gstin,
};

const ACCENT = '#db2777';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const formatMoney = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 })}`;

// Streams a one-page invoice PDF for a completed transaction directly to the given writable stream (e.g. an Express response).
function generateInvoice(txn, user, res) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor(ACCENT).font('Helvetica-Bold').text(COMPANY.name, 50, 50);
    doc.fontSize(9).fillColor('#6b7280').font('Helvetica').text(COMPANY.tagline, 50, 74);
    doc.fontSize(8.5).fillColor('#374151')
        .text(COMPANY.addressLines.join(' '), 50, 88, { width: 280 })
        .text(`${COMPANY.email} · ${COMPANY.phone}`, 50, 101)
        .font('Helvetica-Bold').text(`GSTIN: ${COMPANY.gstin}`, 50, 114);

    doc.fontSize(22).fillColor('#111827').font('Helvetica-Bold').text('INVOICE', 350, 50, { align: 'right', width: 195 });
    doc.fontSize(9).fillColor('#6b7280').font('Helvetica')
        .text(`Invoice #: ${txn.invoiceNumber}`, 350, 80, { align: 'right', width: 195 })
        .text(`Date: ${formatDate(txn.createdAt)}`, 350, 93, { align: 'right', width: 195 })
        .text(`Status: PAID`, 350, 106, { align: 'right', width: 195 })
        .fontSize(7).fillColor('#9ca3af')
        .text(`Payment ref: ${txn.cfOrderId || txn._id}`, 350, 119, { align: 'right', width: 195 });

    doc.moveTo(50, 140).lineTo(545, 140).strokeColor('#e5e7eb').stroke();

    // Bill to
    doc.fontSize(10).fillColor('#6b7280').font('Helvetica-Bold').text('BILLED TO', 50, 155);
    doc.fontSize(11).fillColor('#111827').font('Helvetica').text(user?.name || 'Customer', 50, 170);
    doc.fontSize(9).fillColor('#6b7280').text(user?.email || '', 50, 186);
    if (user?.phone) doc.text(user.phone, 50, 199);

    // Line items table
    const tableTop = 240;
    doc.fontSize(9).fillColor('#ffffff').rect(50, tableTop, 495, 24).fill(ACCENT);
    doc.fillColor('#ffffff').font('Helvetica-Bold')
        .text('DESCRIPTION', 62, tableTop + 7)
        .text('BILLING', 330, tableTop + 7)
        .text('AMOUNT', 460, tableTop + 7, { width: 75, align: 'right' });

    const rowY = tableTop + 24;
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text(`${txn.plan} Plan`, 62, rowY + 12);
    const start = new Date(txn.updatedAt || txn.createdAt);
    const end = new Date(start);
    end.setDate(end.getDate() + (txn.expireDays || 365));
    doc.fillColor('#6b7280').font('Helvetica').fontSize(9)
        .text(`Aicardly subscription · ${txn.expireDays || 365} days (${formatDate(start)} – ${formatDate(end)})`, 62, rowY + 27, { width: 260 });
    // Payments since GST was added keep the plan price (base) and the GST apart; older ones
    // only have the total.
    const base = txn.base ?? txn.amount;
    const gst = txn.base != null ? txn.gst || 0 : 0;
    doc.fillColor('#374151').font('Helvetica').fontSize(9).text(txn.billingType || 'Yearly', 330, rowY + 12);
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text(formatMoney(base), 460, rowY + 12, { width: 75, align: 'right' });

    doc.moveTo(50, rowY + 55).lineTo(545, rowY + 55).strokeColor('#e5e7eb').stroke();

    // Totals
    const totalsY = rowY + 70;
    doc.fontSize(10).fillColor('#6b7280').font('Helvetica').text('Subtotal', 380, totalsY, { width: 90, align: 'right' });
    doc.fillColor('#111827').font('Helvetica-Bold').text(formatMoney(base), 460, totalsY, { width: 75, align: 'right' });
    let y = totalsY;
    if (gst) {
        y += 18;
        doc.fontSize(10).fillColor('#6b7280').font('Helvetica').text('GST @ 18%', 380, y, { width: 90, align: 'right' });
        doc.fillColor('#111827').font('Helvetica-Bold').text(formatMoney(gst), 460, y, { width: 75, align: 'right' });
    }

    doc.fontSize(12).fillColor(ACCENT).font('Helvetica-Bold')
        .text('Total Paid', 380, y + 22, { width: 90, align: 'right' })
        .text(formatMoney(txn.amount), 460, y + 22, { width: 75, align: 'right' });

    // Footer
    doc.fontSize(8).fillColor('#9ca3af').font('Helvetica')
        .text('This is a system-generated invoice and does not require a signature.', 50, 720, { width: 495, align: 'center' })
        .text(`Questions? Reach us at ${COMPANY.email}`, 50, 733, { width: 495, align: 'center' });

    doc.end();
}

module.exports = { generateInvoice };
