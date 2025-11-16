import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Head } from "@inertiajs/react";
import { Shield, Calendar, MapPin, FileText, AlertCircle, Printer } from "lucide-react";

type InsuranceStatus = "pending" | "submitted" | "approved" | "rejected" | "completed";

type InsuranceItem = {
  id: number;
  item_type: string;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  total: number;
  is_approved: boolean;
  approved_amount: number | null;
  rejection_reason: string | null;
};

type Insurance = {
  id: number;
  insurance_no: string;
  insurance_company: string;
  policy_number: string;
  claim_number: string | null;
  claim_date: string;
  accident_date: string | null;
  accident_location: string | null;
  accident_description: string | null;
  damage_assessment: string | null;
  estimated_cost: number;
  approved_amount: number | null;
  excess_amount: number;
  remarks: string | null;
  status: InsuranceStatus;
  customer: {
    name: string;
    mobile: string;
    address: string;
  };
  vehicle: {
    vehicle_no: string;
    brand: { name: string };
    model: { name: string };
  };
  jobCard: {
    job_card_no: string;
  };
  items: InsuranceItem[];
};

type Props = {
  insurance: Insurance;
};

export default function Show({ insurance }: Props) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: InsuranceStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "submitted":
        return "bg-blue-500";
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const groupedItems = {
    services: insurance.items?.filter(item => item.item_type === 'service') || [],
    products: insurance.items?.filter(item => item.item_type === 'product') || [],
    charges: insurance.items?.filter(item => item.item_type === 'charge') || [],
  };

  return (
    <div>
      <Head title={`Insurance Report - ${insurance.insurance_no}`} />

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 15mm 15mm 15mm;
          }
          
          body * {
            visibility: hidden;
          }
          
          #printable-area, #printable-area * {
            visibility: visible;
          }
          
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-header {
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .print-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .print-table th {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
          }
          
          .print-table td {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
            font-size: 9px;
            vertical-align: top;
          }
          
          .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
          }
          
          h1 { 
            font-size: 22px; 
            margin: 0;
          }
          
          h2 { 
            font-size: 16px;
            margin: 0 0 8px 0;
          }
          
          h3 { 
            font-size: 13px;
            margin: 0 0 8px 0;
          }
          
          p { 
            font-size: 10px;
            margin: 3px 0;
          }
          
          .text-sm { 
            font-size: 9px;
          }
          
          .financial-summary {
            border: 2px solid #000;
            padding: 15px;
            margin-top: 20px;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="py-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section with Print Button */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="h-8 w-8 text-orange-600" />
                  {insurance.insurance_no}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Job Card: {insurance.jobCard?.job_card_no || 'N/A'} | Claim Date: {formatDate(insurance.claim_date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(insurance.status)}>
                  {insurance.status.toUpperCase()}
                </Badge>
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{insurance.customer?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">{insurance.customer?.mobile || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{insurance.customer?.address || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Vehicle Number</p>
                  <p className="font-medium text-lg">{insurance.vehicle?.vehicle_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Make & Model</p>
                  <p className="font-medium">
                    {insurance.vehicle?.brand?.name || 'N/A'} {insurance.vehicle?.model?.name || ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insurance Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Insurance Claim Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Insurance Company</p>
                  <p className="font-medium">{insurance.insurance_company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Policy Number</p>
                  <p className="font-medium">{insurance.policy_number}</p>
                </div>
                {insurance.claim_number && (
                  <div>
                    <p className="text-sm text-gray-500">Claim Number</p>
                    <p className="font-medium">{insurance.claim_number}</p>
                  </div>
                )}
                {insurance.accident_date && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Accident Date
                    </p>
                    <p className="font-medium">{formatDate(insurance.accident_date)}</p>
                  </div>
                )}
                {insurance.accident_location && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Accident Location
                    </p>
                    <p className="font-medium">{insurance.accident_location}</p>
                  </div>
                )}
              </div>

              {insurance.accident_description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                    <FileText className="h-4 w-4" />
                    Accident Description
                  </p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {insurance.accident_description}
                  </p>
                </div>
              )}

              {insurance.damage_assessment && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                    <AlertCircle className="h-4 w-4" />
                    Damage Assessment
                  </p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {insurance.damage_assessment}
                  </p>
                </div>
              )}

              {insurance.remarks && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Remarks</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {insurance.remarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Overview */}
          {(groupedItems.services.length > 0 || groupedItems.products.length > 0 || groupedItems.charges.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Services */}
              {groupedItems.services.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {groupedItems.services.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border ${
                            item.is_approved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">{item.item_name}</p>
                            {item.is_approved && (
                              <Badge className="bg-green-600 text-xs">Approved</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold">Rs. {Number(item.total).toLocaleString()}</span>
                          </div>
                          {item.is_approved && item.approved_amount && (
                            <div className="flex justify-between text-sm mt-1 text-green-700">
                              <span>Approved:</span>
                              <span className="font-semibold">Rs. {Number(item.approved_amount).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Products */}
              {groupedItems.products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {groupedItems.products.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border ${
                            item.is_approved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">{item.item_name}</p>
                            {item.is_approved && (
                              <Badge className="bg-green-600 text-xs">Approved</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mb-2">
                            Qty: {item.quantity} × Rs. {Number(item.unit_price).toLocaleString()}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold">Rs. {Number(item.total).toLocaleString()}</span>
                          </div>
                          {item.is_approved && item.approved_amount && (
                            <div className="flex justify-between text-sm mt-1 text-green-700">
                              <span>Approved:</span>
                              <span className="font-semibold">Rs. {Number(item.approved_amount).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Charges */}
              {groupedItems.charges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Charges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {groupedItems.charges.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border ${
                            item.is_approved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">{item.item_name}</p>
                            {item.is_approved && (
                              <Badge className="bg-green-600 text-xs">Approved</Badge>
                            )}
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold">Rs. {Number(item.total).toLocaleString()}</span>
                          </div>
                          {item.is_approved && item.approved_amount && (
                            <div className="flex justify-between text-sm mt-1 text-green-700">
                              <span>Approved:</span>
                              <span className="font-semibold">Rs. {Number(item.approved_amount).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Financial Summary */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Estimated Cost:</span>
                  <span className="text-xl font-bold text-gray-900">
                    Rs. {Number(insurance.estimated_cost).toLocaleString()}
                  </span>
                </div>
                {insurance.excess_amount > 0 && (
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Excess Amount:</span>
                    <span className="font-semibold">Rs. {Number(insurance.excess_amount).toLocaleString()}</span>
                  </div>
                )}
                {insurance.approved_amount && (
                  <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                    <span className="text-lg font-semibold text-green-700">Approved Amount:</span>
                    <span className="text-xl font-bold text-green-700">
                      Rs. {Number(insurance.approved_amount).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable Area */}
      <div id="printable-area" className="hidden print:block">
        {/* Print Header */}
        <div className="print-header">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">INSURANCE CLAIM REPORT</h1>
              <p className="text-sm text-gray-600">Report No: {insurance.insurance_no}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">Date: {formatDate(insurance.claim_date)}</p>
              <p className="text-sm">Job Card: {insurance.jobCard?.job_card_no || 'N/A'}</p>
              <p className="text-sm">Status: {insurance.status.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Section */}
        <div className="print-section grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-2 pb-1 border-b border-gray-300">Customer Information</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 font-semibold w-28">Name:</td>
                  <td className="py-1">{insurance.customer?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Mobile:</td>
                  <td className="py-1">{insurance.customer?.mobile || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Address:</td>
                  <td className="py-1">{insurance.customer?.address || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-bold mb-2 pb-1 border-b border-gray-300">Vehicle Information</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 font-semibold w-28">Vehicle No:</td>
                  <td className="py-1 font-bold">{insurance.vehicle?.vehicle_no || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Make:</td>
                  <td className="py-1">{insurance.vehicle?.brand?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-1 font-semibold">Model:</td>
                  <td className="py-1">{insurance.vehicle?.model?.name || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Insurance Details Section */}
        <div className="print-section">
          <h3 className="font-bold mb-2 pb-1 border-b border-gray-300">Insurance & Claim Details</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="py-1 font-semibold w-40">Insurance Company:</td>
                <td className="py-1">{insurance.insurance_company}</td>
                <td className="py-1 font-semibold w-32">Policy Number:</td>
                <td className="py-1">{insurance.policy_number}</td>
              </tr>
              {insurance.claim_number && (
                <tr>
                  <td className="py-1 font-semibold">Claim Number:</td>
                  <td className="py-1">{insurance.claim_number}</td>
                  <td className="py-1 font-semibold">Claim Date:</td>
                  <td className="py-1">{formatDate(insurance.claim_date)}</td>
                </tr>
              )}
              {insurance.accident_date && (
                <tr>
                  <td className="py-1 font-semibold">Accident Date:</td>
                  <td className="py-1">{formatDate(insurance.accident_date)}</td>
                  <td className="py-1 font-semibold">Location:</td>
                  <td className="py-1">{insurance.accident_location || 'N/A'}</td>
                </tr>
              )}
            </tbody>
          </table>

          {insurance.accident_description && (
            <div className="mt-3">
              <p className="font-semibold text-sm mb-1">Accident Description:</p>
              <p className="text-sm bg-gray-50 p-2 border border-gray-200 whitespace-pre-wrap">
                {insurance.accident_description}
              </p>
            </div>
          )}

          {insurance.damage_assessment && (
            <div className="mt-3">
              <p className="font-semibold text-sm mb-1">Damage Assessment:</p>
              <p className="text-sm bg-gray-50 p-2 border border-gray-200 whitespace-pre-wrap">
                {insurance.damage_assessment}
              </p>
            </div>
          )}
        </div>

        {/* Items Table */}
        {(groupedItems.services.length > 0 || groupedItems.products.length > 0 || groupedItems.charges.length > 0) && (
          <div className="print-section">
            <h3 className="font-bold mb-2 pb-1 border-b border-gray-300">Itemized Breakdown</h3>
            
            <table className="print-table">
              <thead>
                <tr>
                  <th style={{width: '30px'}}>No.</th>
                  <th style={{width: '60px'}}>Type</th>
                  <th>Description</th>
                  <th style={{width: '40px'}} className="text-center">Qty</th>
                  <th style={{width: '70px'}} className="text-right">Unit Price</th>
                  <th style={{width: '70px'}} className="text-right">Subtotal</th>
                  <th style={{width: '55px'}} className="text-right">Discount</th>
                  <th style={{width: '70px'}} className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...groupedItems.services, ...groupedItems.products, ...groupedItems.charges].map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="capitalize">{item.item_type}</td>
                    <td>
                      <div className="font-semibold">{item.item_name}</div>
                      {item.description && <div className="text-xs text-gray-600">{item.description}</div>}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">Rs. {Number(item.unit_price).toLocaleString()}</td>
                    <td className="text-right">Rs. {Number(item.subtotal).toLocaleString()}</td>
                    <td className="text-right">
                      {item.discount_type === 'percentage' && item.discount_value > 0
                        ? `${item.discount_value}%`
                        : item.discount_type === 'amount' && item.discount_value > 0
                        ? `Rs. ${item.discount_value}`
                        : '-'}
                    </td>
                    <td className="text-right font-semibold">Rs. {Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Financial Summary */}
        <div className="financial-summary">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 text-right font-bold text-lg pr-4">Estimated Cost:</td>
                <td className="py-2 text-right font-bold text-lg" style={{width: '150px'}}>
                  Rs. {Number(insurance.estimated_cost).toLocaleString()}
                </td>
              </tr>
              {insurance.excess_amount > 0 && (
                <tr>
                  <td className="py-1 text-right pr-4">Less: Excess Amount:</td>
                  <td className="py-1 text-right" style={{width: '150px'}}>
                    Rs. {Number(insurance.excess_amount).toLocaleString()}
                  </td>
                </tr>
              )}
              {insurance.approved_amount && (
                <tr className="border-t-2 border-gray-800">
                  <td className="py-2 text-right font-bold text-lg pr-4">Approved Amount:</td>
                  <td className="py-2 text-right font-bold text-lg" style={{width: '150px'}}>
                    Rs. {Number(insurance.approved_amount).toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {insurance.remarks && (
          <div className="print-section">
            <h3 className="font-bold mb-2">Additional Remarks:</h3>
            <p className="text-sm bg-gray-50 p-2 border border-gray-200 whitespace-pre-wrap">
              {insurance.remarks}
            </p>
          </div>
        )}

        {/* Signature Section */}
        <div className="signature-section">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="border-t border-black pt-2 mt-12">
                <p className="text-sm font-semibold">Prepared By</p>
                <p className="text-xs text-gray-600">Workshop Representative</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black pt-2 mt-12">
                <p className="text-sm font-semibold">Verified By</p>
                <p className="text-xs text-gray-600">Insurance Assessor</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black pt-2 mt-12">
                <p className="text-sm font-semibold">Approved By</p>
                <p className="text-xs text-gray-600">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}