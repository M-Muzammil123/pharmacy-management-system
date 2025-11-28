import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { Printer, Download, X } from "lucide-react";
import html2pdf from "html2pdf.js";
import { numberToWords } from "../utils/numberToWords";

export default function InvoicePrint({ invoice, customer, settings, onClose }) {
  const contentRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Destructure settings with defaults
  const businessName = settings?.businessName || settings?.name || 'PHARMAPRO';
  const address = settings?.address || 'N/A';
  const phone = settings?.phone || 'N/A';
  const license = settings?.license || 'L-123456';

  // Safely calculate totals
  const gross = invoice.items?.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  ) || 0;

  const discount = invoice.items?.reduce((sum, item) => {
    return sum + ((item.price || 0) * (item.quantity || 0) * (item.discount || 0)) / 100;
  }, 0) || 0;

  const invoiceLevelDiscount = invoice.discount || 0;
  const totalDiscount = discount > 0 ? discount : invoiceLevelDiscount;

  const total = gross - totalDiscount;
  const paymentMethod = invoice.payment_method || 'Cash';
  const previousBalance = customer?.balance || 0;
  const totalAmount = total; // Just the invoice total, not including previous balance
  const amountInWords = numberToWords(totalAmount);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const handlePrint = () => {
    try {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.print();
      }, 100);
    } catch (error) {
      console.error("Print failed:", error);
      alert("Failed to open print dialog. Please try again.");
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current) {
      alert("Unable to generate PDF. Please try again.");
      return;
    }

    setIsGenerating(true);

    const element = contentRef.current;

    // Enhanced PDF options for better quality
    const opt = {
      margin: [5, 5, 5, 5],
      filename: `Invoice_${invoice.invoice_number || invoice.id.slice(0, 8)}.pdf`,
      image: {
        type: 'jpeg',
        quality: 1.0
      },
      html2canvas: {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true,
        allowTaint: false,
        removeContainer: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
        precision: 16
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy']
      }
    };

    try {
      await html2pdf().set(opt).from(element).save();

      // Success feedback
      setTimeout(() => {
        if (!isGenerating) {
          alert("✅ Invoice PDF downloaded successfully!");
        }
      }, 500);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("❌ Failed to generate PDF. Please try printing instead (Ctrl/Cmd + P) and save as PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return createPortal(
    <div className="invoice-print-modal fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block print:static">
      {/* Toolbar - Enhanced Buttons */}
      <div className="fixed top-4 right-4 flex gap-3 print:hidden z-50">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-all hover:shadow-xl active:scale-95 font-semibold text-sm"
          title="Print Invoice (Ctrl/Cmd + P)"
        >
          <Printer size={20} />
          <span>🖨️ Print Invoice</span>
        </button>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 active:scale-95 font-semibold text-sm"
          title="Download as PDF"
        >
          <Download size={20} />
          <span>{isGenerating ? "📄 Generating PDF..." : "📥 Download PDF"}</span>
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 shadow-lg transition-all hover:shadow-xl active:scale-95 font-semibold text-sm"
          title="Close (ESC)"
        >
          <X size={20} />
          <span>✖️ Close</span>
        </button>
      </div>

      {/* Invoice Content */}
      <div
        className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl mx-auto overflow-y-auto max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:h-auto print:overflow-visible print:p-6"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div ref={contentRef} className="invoice-print-content" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', padding: '10px' }}>

          {/* HEADER */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #000',
            paddingBottom: '15px',
            marginBottom: '15px'
          }}>
            {/* Left - Estimate Box */}
            <div style={{
              border: '2px solid #000',
              padding: '8px 25px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Estimate
            </div>

            {/* Right - Company Info */}
            <div style={{ textAlign: 'right', fontSize: '11px' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                {businessName}
              </div>
              <div>{address}</div>
              <div>Phone: {phone}</div>
              <div>License: {license}</div>
            </div>
          </div>

          {/* INVOICE INFO - Two Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            border: '2px solid #000',
            padding: '15px',
            marginBottom: '15px',
            fontSize: '11px'
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Invoice #:</span>
                <span>{invoice.invoice_number || invoice.id.slice(0, 8)}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Invoice Date:</span>
                <span>{format(new Date(invoice.date), "dd/MM/yyyy")}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Sale Order #:</span>
                <span>{invoice.invoice_number || invoice.id.slice(0, 8)}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Sale Order Type:</span>
                <span>REGULAR</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Refrence Date:</span>
                <span>{format(new Date(invoice.date), "dd/MM/yyyy")}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Receiving No:</span>
                <span>-</span>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Customer:</span>
                <span>{customer?.name || invoice.customer_name || 'Walk-in'}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Region:</span>
                <span>{customer?.region || '-'}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>License #:</span>
                <span>-</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Delivery Man:</span>
                <span>-</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Remarks:</span>
                <span>{paymentMethod}</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ fontWeight: 'bold', width: '130px' }}>Ship To:</span>
                <span>-</span>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'left', fontWeight: 'bold' }}>Item Code</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'left', fontWeight: 'bold' }}>Item Name</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Batch</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Expiry</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Quantity</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Bonus</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>Rate</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>Gross</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Disc%</th>
                <th style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => {
                  const itemGross = (item.price || 0) * (item.quantity || 0);
                  const itemDiscount = (item.discount || 0);
                  const itemNet = itemGross - (itemGross * itemDiscount / 100);

                  return (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>
                        {item.item_code || item.itemCode || 'N/A'}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'left' }}>
                        {item.name}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                        {item.batch || '-'}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', fontSize: '9px' }}>
                        {item.expiry ? format(new Date(item.expiry), "yyyy-MM-dd") : '-'}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                        {item.quantity}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                        {item.bonus || 0}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                        {(item.price || 0).toFixed(2)}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right' }}>
                        {itemGross.toFixed(2)}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                        {itemDiscount.toFixed(2)}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>
                        {itemNet.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ border: '1px solid #000', padding: '20px', textAlign: 'center' }}>
                    No items found
                  </td>
                </tr>
              )}

              {/* Total Row */}
              <tr style={{ borderTop: '2px solid #000' }}>
                <td colSpan="4" style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>
                  Total Items: {invoice.items?.length || 0}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>
                  {invoice.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                </td>
                <td colSpan="4" style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>
                  {total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* FOOTER SECTION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '11px' }}>
            {/* Left - Previous Balance */}
            <div>
              <strong>Previous Balance: </strong>=Rs. {previousBalance.toFixed(2)}
            </div>

            {/* Right - Totals */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '3px' }}>
                <strong>Gross Amount:</strong> <span style={{ marginLeft: '30px' }}>=Rs. {gross.toFixed(2)}</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                <strong>Discount Amount:</strong> <span style={{ marginLeft: '30px' }}>=Rs. {totalDiscount.toFixed(2)}</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                <strong>Invoice Total:</strong> <span style={{ marginLeft: '30px' }}>{total.toFixed(2)}</span>
              </div>
              <div style={{ marginBottom: '3px' }}>
                <strong>Credit Note:</strong> <span style={{ marginLeft: '30px' }}>0.00</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '5px' }}>
                <strong>Total Amount:</strong> <span style={{ marginLeft: '30px' }}>{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* AMOUNT IN WORDS */}
          <div style={{
            textAlign: 'center',
            marginTop: '30px',
            marginBottom: '15px',
            fontSize: '11px',
            borderTop: '1px solid #000',
            borderBottom: '1px solid #000',
            padding: '8px 0'
          }}>
            --{amountInWords}--
          </div>

          {/* PAGE NUMBER */}
          <div style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>
            Page 1 of 1
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
