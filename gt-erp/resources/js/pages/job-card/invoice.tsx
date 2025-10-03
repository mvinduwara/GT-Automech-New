import { Button } from '@/components/ui/button';
import { formatCurrency as importedFormatCurrency } from '@/lib/db';
import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Hash, Printer, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/* ----------  currency helper  ---------- */
const formatCurrencyLocal = (v: number | string) => {
  const n = Number(v) || 0;
  try {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(n);
  } catch {
    return `LKR ${n.toFixed(2)}`;
  }
};
const formatCurrency =
  typeof importedFormatCurrency === 'function'
    ? importedFormatCurrency
    : formatCurrencyLocal;

/* ----------  fallback data  ---------- */
const SAMPLE_INVOICE = {
  id: 1,
  invoice_no: 'INV-20250916-0001',
  invoice_date: new Date().toISOString(),
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  customer: {
    id: 101,
    name: 'Kasun Perera',
    phone: '+94 77 123 4567',
    email: 'kasun.perera@example.lk',
    address: '12/3 Beach Road, Colombo 03',
  },
  jobCard: {
    id: 501,
    vehicle: { name: 'Toyota Aqua - WP NA-1234' },
  },
  items: [
    {
      id: 1,
      description: 'Oil: Mobil 1 5W-30 (4L)',
      quantity: 1,
      unit_price: 15000,
      discount_type: null,
      discount_value: null,
      line_total: 15000,
    },
    {
      id: 2,
      description: 'Filter: Oil Filter - Denso',
      quantity: 1,
      unit_price: 3000,
      discount_type: null,
      discount_value: null,
      line_total: 3000,
    },
  ],
  total: 18000,
  discount_total: 0,
  advance_payment: 0,
};

/* ====================================== */
export default function Invoice() {
  const printRef = useRef<HTMLDivElement | null>(null);
  const { invoice: pageInvoice } = usePage().props || {};

  // Function to get advance payment from URL
  const getAdvanceFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const advance = params.get('advance');
    return advance ? parseFloat(advance) : 0;
  };

  // Get initial invoice data
  const getInitialInvoice = () => {
    const initial = pageInvoice || SAMPLE_INVOICE;
    const items = (initial.items || []).map((it: any) => ({
      ...it,
      line_total: Number(it.line_total || 0),
    }));

    // Get advance payment from URL
    const advanceFromURL = getAdvanceFromURL();

    return {
      ...initial,
      items,
      advance_payment: advanceFromURL || initial.advance_payment || 0
    };
  };

  const [invoice, setInvoice] = useState(getInitialInvoice);
  const [editingDiscounts, setEditingDiscounts] = useState<Record<number | string, any>>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update advance payment when URL changes
  useEffect(() => {
    const advanceFromURL = getAdvanceFromURL();
    if (advanceFromURL > 0) {
      setInvoice(prev => ({
        ...prev,
        advance_payment: advanceFromURL
      }));
    }
  }, []);

  /* ----------  helpers  ---------- */
  const getPartsItems = () => invoice.parts || [];
  const getServicesItems = () => invoice.services || [];

  const getPartsTotal = () =>
    getPartsItems().reduce((s, it: any) => s + Number(it.line_total || 0), 0);

  const getServicesTotal = () =>
    getServicesItems().reduce((s, it: any) => s + Number(it.line_total || 0), 0);

  const getTotalAmount = () => {
    // Use the total from backend if available, otherwise calculate
    return Number(invoice.total) || (getPartsTotal() + getServicesTotal());
  };

  const recalcTotals = (items: any[]) => {
    const total = items.reduce((s, it) => s + Number(it.line_total || 0), 0);
    const discountTotal = items.reduce((s, it) => {
      const before = Number(it.quantity || 1) * Number(it.unit_price || 0);
      const lineTotal = Number(it.line_total || 0);
      return s + Math.max(before - lineTotal, 0);
    }, 0);
    setInvoice((prev) => ({ ...prev, items, total, discount_total: discountTotal }));
  };

  /* ----------  discount logic  ---------- */
  const handleApplyDiscounts = () => {
    const updateItems = (items: any[]) => {
      return items.map((item: any) => {
        const d = editingDiscounts[item.id] || {};
        if (!d.type) return item;

        let newLine = Number(item.unit_price || 0) * Number(item.quantity || 1);
        if (d.type === 'foc') newLine = 0;
        else if (d.type === 'percentage') {
          const pct = Number(d.value || 0);
          if (pct < 0 || pct > 100) {
            toast.error(`Invalid percentage for ${item.description}`);
            return item;
          }
          newLine = newLine - (newLine * pct) / 100;
        } else if (d.type === 'amount') {
          const amt = Number(d.value || 0);
          if (amt < 0) {
            toast.error(`Invalid amount for ${item.description}`);
            return item;
          }
          newLine = Math.max(0, newLine - amt);
        }
        return {
          ...item,
          discount_type: d.type,
          discount_value: d.value ?? item.discount_value,
          line_total: Number(newLine),
        };
      });
    };

    const updatedParts = updateItems(invoice.parts || []);
    const updatedServices = updateItems(invoice.services || []);

    const total = [...updatedParts, ...updatedServices].reduce((s, it) => s + Number(it.line_total || 0), 0);
    const discountTotal = [...updatedParts, ...updatedServices].reduce((s, it) => {
      const before = Number(it.quantity || 1) * Number(it.unit_price || 0);
      const lineTotal = Number(it.line_total || 0);
      return s + Math.max(before - lineTotal, 0);
    }, 0);

    setInvoice((prev) => ({
      ...prev,
      parts: updatedParts,
      services: updatedServices,
      items: [...updatedParts, ...updatedServices], // Update combined array
      total,
      discount_total: discountTotal
    }));

    toast.success('Discounts applied');
  };

  const saveInvoice = async () => {
    console.log("saveInvoice async")
    if (isSaving) return;
    console.log("saveInvoice isSaving")
    setIsSaving(true);

    try {
      // Combine parts and services for saving
      const allItems = [...(invoice.parts || []), ...(invoice.services || [])];

      const payload = {
        job_card_id: invoice.jobCard?.id,
        invoice_no: invoice.invoice_no,
        customer_id: invoice.customer?.id,
        items: allItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_type: item.discount_type,
          discount_value: item.discount_value,
          line_total: item.line_total,
        })),
        subtotal: invoice.subtotal || getTotalAmount(),
        total: getTotalAmount(),
        discount_total: invoice.discount_total || 0,
        advance_payment: invoice.advance_payment || 0,
        remarks: invoice.remarks || null,
      };

      const response = await fetch('/dashboard/job-card/invoice/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(payload),
      });

      console.log("saveInvoice response", response)
      const result = await response.json();

      if (result.success) {
        toast.success('Invoice saved successfully!');
        // Update invoice with saved ID
        setInvoice(prev => ({ ...prev, id: result.data.invoice_id }));
        window.location.href = `/dashboard/invoice/${result.data.invoice_id}/view`;
        // return result.data;
      } else {
        throw new Error(result.message || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };


  /* ----------  print / pdf  ---------- */
  const handlePrint = async () => {
    try {
      // Save invoice first
      await saveInvoice();

      // Then print
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      // Print anyway even if save fails
      console.warn('Proceeding with print despite save error');
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Save invoice first
      await saveInvoice();

      // Then generate PDF
      const win = window.open('', '_blank');
      if (!win || !printRef.current) return;

      win.document.write(`
        <html>
          <head>
            <title>Invoice - ${invoice.invoice_no}</title>
            <style>
              @page{size:A4;margin:0.6cm}
              *{margin:0;padding:0;box-sizing:border-box}
              body{font-family:Arial,Helvetica,sans-serif;line-height:1.3;color:#000;font-size:10px}
              .printOnly{display:block}
              .company{text-align:center;margin-bottom:12px;border-bottom:2px solid #000;padding-bottom:8px}
              .company .name{font-size:18px;font-weight:700;margin-bottom:4px}
              .company .addr{font-size:11px;line-height:1.2}
              .twoCol{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
              table{border-collapse:collapse;width:100%}
              th,td{border:1px solid #000;padding:4px 5px;font-size:10px}
              th{background:#f2f2f2;text-align:left;font-weight:600}
              .sectionTitle{font-weight:700;margin-bottom:5px;font-size:11px}
              .remarks{border:1px solid #000;height:50px;margin:12px 0}
              .totals{width:280px;margin-left:auto;font-size:10px}
              .totals th,.totals td{padding:4px 6px}
              .grand{font-weight:700;font-size:11px}
              .footer{margin-top:12px;border-top:2px solid #000;padding-top:8px}
              .ty{text-align:center;font-weight:700;font-size:11px;margin-bottom:8px}
              .sig4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;font-size:9px;text-align:center}
              .sigLine{border-bottom:1px solid #000;height:30px;margin-top:3px}
              .subtotal-row{background:#f2f2f2;font-weight:600}
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
          </body>
        </html>
      `);
      win.document.close();
      win.print();

    } catch (error) {
      console.error('Error in PDF generation:', error);
      toast.error('PDF generation failed, but invoice was saved');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  /* ========================================================= */
  /*                           UI                             */
  /* ========================================================= */
  return (
    <div>
      <Head title={`Invoice ${invoice.invoice_no}`} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="container mx-auto">
          {/* ----------  action bar  ---------- */}
          <div className="mb-8 flex justify-between items-center">
            <a
              href="/dashboard/job-card"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Job Cards
            </a>
            <div className="space-x-4">
              <Button
                onClick={handleApplyDiscounts}
                disabled={isGeneratingPDF || isSaving}
                variant="outline"
              >
                Apply Discounts
              </Button>
              <Button
                onClick={saveInvoice}
                disabled={isGeneratingPDF || isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="w-5 h-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save Invoice'}
              </Button>
              <Button
                hidden
                onClick={handlePrint}
                disabled={isGeneratingPDF || isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="w-5 h-5 mr-2" />
                {isSaving ? 'Saving...' : 'Print'}
              </Button>
              <Button
                hidden
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-5 h-5 mr-2" />
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>

          {/* ----------  content wrapper  ---------- */}
          <div className="invoice-container" ref={printRef}>
            {/* ---------------  SCREEN  --------------- */}
            <div className="print:hidden">
              {/* header */}
              <div className="header text-center mb-6 border-b-2 border-slate-800 pb-4">
                <div className="text-3xl font-bold mb-2">GT Automech</div>
                <div className="text-sm">
                  123 Auto Lane, Colombo, Sri Lanka
                  <br />
                  Phone: +94 11 234 5678 | Email: info@gtautomech.lk
                </div>
              </div>

              {/* customer + invoice info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center mb-3 font-semibold">
                    <User className="w-5 h-5 mr-2" /> Customer Information
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {invoice.customer?.name || 'N/A'}</p>
                    <p><strong>Contact:</strong> {invoice.customer?.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {invoice.customer?.email || 'N/A'}</p>
                    <p><strong>Address:</strong> {invoice.customer?.address || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center mb-3 font-semibold">
                    <Hash className="w-5 h-5 mr-2" /> Invoice Information
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Invoice No:</strong> {invoice.invoice_no}</p>
                    <p><strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                    {invoice.jobCard && (
                      <>
                        <p><strong>Job Card:</strong> {invoice.jobCard.id}</p>
                        <p><strong>Vehicle:</strong> {invoice.jobCard.vehicle?.name || 'N/A'}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* parts */}
              {getPartsItems().length > 0 && (
                <div className="mb-8">
                  <div className="text-xl font-bold mb-3">Parts Used</div>
                  <table className="w-full border-collapse rounded-lg overflow-hidden shadow">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="px-4 py-3 text-left">Item</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Discount</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPartsItems().map((it: any, idx) => (
                        <tr key={it.id || idx} className="border-b hover:bg-emerald-50">
                          <td className="px-4 py-3 font-semibold">{it.description}</td>
                          <td className="px-4 py-3 text-right">{it.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">
                            {formatCurrency(it.unit_price)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="space-y-2">
                              <div className="text-sm">
                                {it.discount_type ? `${it.discount_type} (${it.discount_value})` : 'None'}
                              </div>
                              <select
                                className="text-xs border rounded px-1"
                                value={editingDiscounts[it.id]?.type || ''}
                                onChange={(e) =>
                                  setEditingDiscounts((prev) => ({
                                    ...prev,
                                    [it.id]: { ...prev[it.id], type: e.target.value },
                                  }))
                                }
                              >
                                <option value="">None</option>
                                <option value="percentage">Percentage</option>
                                <option value="amount">Amount</option>
                                <option value="foc">FOC</option>
                              </select>
                              {editingDiscounts[it.id]?.type &&
                                editingDiscounts[it.id]?.type !== 'foc' && (
                                  <input
                                    className="text-xs border rounded px-1 w-16"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={editingDiscounts[it.id]?.type === 'percentage' ? '%' : 'Amount'}
                                    value={editingDiscounts[it.id]?.value || ''}
                                    onChange={(e) =>
                                      setEditingDiscounts((prev) => ({
                                        ...prev,
                                        [it.id]: {
                                          ...prev[it.id],
                                          value: parseFloat(e.target.value) || 0,
                                        },
                                      }))
                                    }
                                  />
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">
                            {formatCurrency(it.line_total)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="px-4 py-3">Parts Subtotal</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(getPartsTotal())}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* services */}
              {getServicesItems().length > 0 && (
                <div className="mb-8">
                  <div className="text-xl font-bold mb-3">Services Performed</div>
                  <table className="w-full border-collapse rounded-lg overflow-hidden shadow">
                    <thead>
                      <tr className="bg-emerald-600 text-white">
                        <th className="px-4 py-3 text-left">Service</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Discount</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getServicesItems().map((it: any, idx) => (
                        <tr key={it.id || idx} className="border-b hover:bg-emerald-50">
                          <td className="px-4 py-3 font-semibold">{it.description}</td>
                          <td className="px-4 py-3 text-right">{it.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">
                            {formatCurrency(it.unit_price)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="space-y-2">
                              <div className="text-sm">
                                {it.discount_type ? `${it.discount_type} (${it.discount_value})` : 'None'}
                              </div>
                              <select
                                className="text-xs border rounded px-1"
                                value={editingDiscounts[it.id]?.type || ''}
                                onChange={(e) =>
                                  setEditingDiscounts((prev) => ({
                                    ...prev,
                                    [it.id]: { ...prev[it.id], type: e.target.value },
                                  }))
                                }
                              >
                                <option value="">None</option>
                                <option value="percentage">Percentage</option>
                                <option value="amount">Amount</option>
                                <option value="foc">FOC</option>
                              </select>
                              {editingDiscounts[it.id]?.type &&
                                editingDiscounts[it.id]?.type !== 'foc' && (
                                  <input
                                    className="text-xs border rounded px-1 w-16"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={editingDiscounts[it.id]?.type === 'percentage' ? '%' : 'Amount'}
                                    value={editingDiscounts[it.id]?.value || ''}
                                    onChange={(e) =>
                                      setEditingDiscounts((prev) => ({
                                        ...prev,
                                        [it.id]: {
                                          ...prev[it.id],
                                          value: parseFloat(e.target.value) || 0,
                                        },
                                      }))
                                    }
                                  />
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">
                            {formatCurrency(it.line_total)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={4} className="px-4 py-3">Services Subtotal</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(getServicesTotal())}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* totals */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl border-2 border-blue-200 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="font-semibold text-slate-700">Parts Total:</span>
                  <span className="font-bold">{formatCurrency(getPartsTotal())}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="font-semibold text-slate-700">Services Total:</span>
                  <span className="font-bold">{formatCurrency(getServicesTotal())}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="font-semibold text-slate-700">Discount Total:</span>
                  <span className="font-bold text-red-600">-{formatCurrency(invoice.discount_total || 0)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-slate-700">Advance Payment:</span>
                  <span className="font-bold text-green-600">{formatCurrency(invoice.advance_payment || 0)}</span>
                </div>
                <div className="border-t-2 border-slate-300 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-slate-800">Grand Total:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                      {formatCurrency(getTotalAmount())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">Amount Due:</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(Math.max(0, getTotalAmount() - (invoice.advance_payment || 0)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="border-t-2 border-slate-200 pt-6 text-center text-slate-600">
                <p className="text-lg font-semibold text-slate-800 mb-2">
                  Thank you for choosing GT Automech!
                </p>
                <p className="text-sm mb-4">For any queries, please contact us at the above numbers.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <strong className="text-blue-800">Payment Methods:</strong>
                    <br />
                    Cash / Card / Bank Transfer
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <strong className="text-green-800">Service Quality:</strong>
                    <br />
                    Premium parts & expert technicians
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-sm font-semibold mb-2 text-slate-700">Customer Signature</div>
                    <div className="border-b-2 border-slate-400 h-12"></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-2 text-slate-700">Service Advisor</div>
                    <div className="border-b-2 border-slate-400 h-12"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------  PRINT  --------------- */}
            <div className="hidden print:block">
              {/* company header */}
              <div className="company">
                <div className="name">GT Automech</div>
                <div className="addr">
                  123 Auto Lane, Colombo, Sri Lanka
                  <br />
                  Phone: +94 11 234 5678 | Email: info@gtautomech.lk
                </div>
              </div>

              {/* side-by-side tables */}
              <div className="twoCol">
                <table>
                  <thead>
                    <tr>
                      <th colSpan={2}>Customer Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Name:</strong></td><td>{invoice.customer?.name || 'N/A'}</td></tr>
                    <tr><td><strong>Contact:</strong></td><td>{invoice.customer?.phone || 'N/A'}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>{invoice.customer?.email || 'N/A'}</td></tr>
                    <tr><td><strong>Address:</strong></td><td>{invoice.customer?.address || 'N/A'}</td></tr>
                  </tbody>
                </table>

                <table>
                  <thead>
                    <tr>
                      <th colSpan={2}>Invoice Information</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Invoice No:</strong></td><td>{invoice.invoice_no}</td></tr>
                    <tr><td><strong>Date:</strong></td><td>{new Date(invoice.invoice_date).toLocaleDateString()}</td></tr>
                    <tr><td><strong>Due Date:</strong></td><td>{new Date(invoice.due_date).toLocaleDateString()}</td></tr>
                    {invoice.jobCard && (
                      <>
                        <tr><td><strong>Job Card:</strong></td><td>{invoice.jobCard.id}</td></tr>
                        <tr><td><strong>Vehicle:</strong></td><td>{invoice.jobCard.vehicle?.name || 'N/A'}</td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* parts */}
              {getPartsItems().length > 0 && (
                <>
                  <div className="sectionTitle">Parts Used</div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ width: '40px' }}>Qty</th>
                        <th style={{ width: '70px' }}>Unit Price</th>
                        <th style={{ width: '60px' }}>Discount</th>
                        <th style={{ width: '70px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPartsItems().map((it: any, idx) => (
                        <tr key={it.id || idx}>
                          <td>{it.description}</td>
                          <td style={{ textAlign: 'right' }}>{it.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(it.unit_price)}</td>
                          <td style={{ textAlign: 'right' }}>
                            {it.discount_type
                              ? `${it.discount_type} (${it.discount_value})`
                              : 'None'}
                          </td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(it.line_total)}</td>
                        </tr>
                      ))}
                      <tr className="subtotal-row">
                        <td colSpan={4}>Parts Subtotal</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(getPartsTotal())}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}

              {/* services */}
              {getServicesItems().length > 0 && (
                <>
                  <div className="sectionTitle" style={{ marginTop: '12px' }}>Services Performed</div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th style={{ width: '40px' }}>Qty</th>
                        <th style={{ width: '70px' }}>Unit Price</th>
                        <th style={{ width: '60px' }}>Discount</th>
                        <th style={{ width: '70px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getServicesItems().map((it: any, idx) => (
                        <tr key={it.id || idx}>
                          <td>{it.description}</td>
                          <td style={{ textAlign: 'right' }}>{it.quantity}</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(it.unit_price)}</td>
                          <td style={{ textAlign: 'right' }}>
                            {it.discount_type
                              ? `${it.discount_type} (${it.discount_value})`
                              : 'None'}
                          </td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(it.line_total)}</td>
                        </tr>
                      ))}
                      <tr className="subtotal-row">
                        <td colSpan={4}>Services Subtotal</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(getServicesTotal())}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}

              {/* remarks */}
              <div className="sectionTitle" style={{ marginTop: '12px' }}>Remarks</div>
              <div className="remarks"></div>

              {/* totals */}
              <table className="totals">
                <tbody>
                  <tr>
                    <th>Parts Total</th>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(getPartsTotal())}</td>
                  </tr>
                  <tr>
                    <th>Services Total</th>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(getServicesTotal())}</td>
                  </tr>
                  <tr>
                    <th>Discount Total</th>
                    <td style={{ textAlign: 'right' }}>-{formatCurrency(invoice.discount_total || 0)}</td>
                  </tr>
                  <tr>
                    <th>Advance Payment</th>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.advance_payment || 0)}</td>
                  </tr>
                  <tr className="grand">
                    <th>Grand Total</th>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(getTotalAmount())}</td>
                  </tr>
                  <tr className="grand">
                    <th>Amount Due</th>
                    <td style={{ textAlign: 'right' }}>
                      {formatCurrency(Math.max(0, getTotalAmount() - (invoice.advance_payment || 0)))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* footer */}
              <div className="footer">
                <div className="ty">Thank you for choosing GT Automech!</div>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  Payment Methods: Cash / Card / Bank Transfer
                </div>
                <div className="sig4">
                  <div className="signature-box">
                    <div>Customer</div>
                    <div className="sigLine"></div>
                  </div>
                  <div className="signature-box">
                    <div>Electric Dep</div>
                    <div className="sigLine"></div>
                  </div>
                  <div className="signature-box">
                    <div>A/C Dep</div>
                    <div className="sigLine"></div>
                  </div>
                  <div className="signature-box">
                    <div>Service Advisor</div>
                    <div className="sigLine"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}