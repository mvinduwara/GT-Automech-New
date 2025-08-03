import React, { useState, useRef } from 'react';
import { Head } from "@inertiajs/react";
import { Printer, Download, ArrowLeft, Car, User, Calendar, Hash } from 'lucide-react';
import {
  getCustomerById,
  getVehicleById,
  getOilBrandById,
  getOilById,
  getOilFilterById,
  getDrainPlugSealById,
  services,
  formatCurrency
} from '@/lib/db';

// Sample job card data - in real app, this would come from props or API
const sampleJobCardData = {
  id: "JC-2024-001",
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
  customer: getCustomerById(1),
  vehicle: getVehicleById(1),
  oilBrand: getOilBrandById(1),
  oil: getOilById(1),
  oilFilter: getOilFilterById(1),
  drainPlugSeal: getDrainPlugSealById(1),
  services: [
    { service: services[0], option: services[0].options[1], ignored: false },
    { service: services[1], option: services[1].options[0], ignored: false },
    { service: services[2], option: services[2].options[2], ignored: false },
    { service: services[3], option: services[3].options[0], ignored: false },
    { service: services[4], option: services[4].options[0], ignored: true },
    { service: services[5], option: services[5].options[0], ignored: false },
    { service: services[6], option: services[6].options[0], ignored: true },
    { service: services[7], option: services[7].options[0], ignored: true },
    { service: services[8], option: services[8].options[0], ignored: false },
    { service: services[9], option: services[9].options[1], ignored: false }
  ]
};

export default function Invoice() {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const jobCard = sampleJobCardData;

  const getTotalAmount = () => {
    let total = 0;
    if (jobCard.oil) total += jobCard.oil.price;
    if (jobCard.oilFilter) total += jobCard.oilFilter.price;
    if (jobCard.drainPlugSeal) total += jobCard.drainPlugSeal.price;
    
    jobCard.services.forEach(item => {
      if (!item.ignored && item.option) {
        total += item.option.price;
      }
    });
    
    return total;
  };

  const getServicesTotal = () => {
    return jobCard.services
      .filter(item => !item.ignored)
      .reduce((total, item) => {
        return total + (item.option ? item.option.price : 0);
      }, 0);
  };

  const getPartsTotal = () => {
    let total = 0;
    if (jobCard.oil) total += jobCard.oil.price;
    if (jobCard.oilFilter) total += jobCard.oilFilter.price;
    if (jobCard.drainPlugSeal) total += jobCard.drainPlugSeal.price;
    return total;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Simple PDF generation using browser print to PDF
      // In a real app, you might want to use a library like jsPDF or send to backend
      const printWindow = window.open('', '_blank');
      if (printWindow && printRef.current) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${jobCard.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .invoice-container { max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .company-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
                .company-details { color: #666; }
                .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .customer-info, .job-info { background: #f9f9f9; padding: 15px; border-radius: 5px; width: 48%; }
                .section-title { font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .table th { background-color: #f2f2f2; font-weight: bold; }
                .text-right { text-align: right; }
                .total-section { background: #f9f9f9; padding: 15px; border-radius: 5px; }
                .grand-total { font-size: 18px; font-weight: bold; color: #333; }
                .print-hide { display: none; }
                @media print {
                  body { margin: 0; }
                  .print-hide { display: none !important; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div>
      <Head title={`Invoice - ${jobCard.id}`} />
      
      {/* Action Bar - Hidden in print */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Job Card
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
              
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="min-h-screen bg-gray-50 print:bg-white print:min-h-0">
        <div className="container mx-auto px-4 py-8 print:px-0 print:py-0">
          <div ref={printRef} className="invoice-container bg-white print:bg-transparent print:shadow-none shadow-lg rounded-lg print:rounded-none p-8 print:p-0 max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="header text-center mb-8 print:mb-6">
              <div className="company-name text-3xl print:text-2xl font-bold text-gray-800 mb-2">
                GT Automech
              </div>
              <div className="company-details text-gray-600 print:text-gray-800">
                <div>Raigama Junction, Bandaragama</div>
                <div>076 879 8983 / 071 906 0450 / 077 409 8580</div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="invoice-info grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:mb-6">
              <div className="customer-info bg-gray-50 print:bg-gray-100 p-4 rounded-lg print:rounded">
                <div className="section-title flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                  <User className="w-5 h-5" />
                  Customer Information
                </div>
                {jobCard.customer && (
                  <div className="space-y-2 text-gray-700 print:text-gray-900">
                    <div><strong>Name:</strong> {jobCard.customer.name}</div>
                    <div><strong>Mobile:</strong> {jobCard.customer.mobile}</div>
                    {jobCard.customer.email && (
                      <div><strong>Email:</strong> {jobCard.customer.email}</div>
                    )}
                    {jobCard.customer.address && (
                      <div><strong>Address:</strong> {jobCard.customer.address}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="job-info bg-gray-50 print:bg-gray-100 p-4 rounded-lg print:rounded">
                <div className="section-title flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                  <Hash className="w-5 h-5" />
                  Job Card Information
                </div>
                <div className="space-y-2 text-gray-700 print:text-gray-900">
                  <div><strong>Job Card #:</strong> {jobCard.id}</div>
                  <div><strong>Date:</strong> {jobCard.date}</div>
                  <div><strong>Time:</strong> {jobCard.time}</div>
                  {jobCard.vehicle && (
                    <>
                      <div><strong>Vehicle:</strong> {jobCard.vehicle.vehicle_number}</div>
                      <div><strong>Make/Model:</strong> {jobCard.vehicle.make} {jobCard.vehicle.model}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Parts & Materials */}
            <div className="mb-6 print:mb-4">
              <div className="section-title text-xl font-semibold text-gray-800 mb-4">Parts & Materials</div>
              <table className="table w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 print:bg-gray-200">
                    <th className="border border-gray-300 px-4 py-3 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {jobCard.oil && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="font-medium">{jobCard.oilBrand?.name}</div>
                        <div className="text-sm text-gray-600 print:text-gray-800">{jobCard.oil.name}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                        {formatCurrency(jobCard.oil.price)}
                      </td>
                    </tr>
                  )}
                  
                  {jobCard.oilFilter && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="font-medium">{jobCard.oilFilter.name}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                        {formatCurrency(jobCard.oilFilter.price)}
                      </td>
                    </tr>
                  )}
                  
                  {jobCard.drainPlugSeal && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="font-medium">{jobCard.drainPlugSeal.name}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                        {formatCurrency(jobCard.drainPlugSeal.price)}
                      </td>
                    </tr>
                  )}
                  
                  <tr className="bg-gray-50 print:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 font-bold">Parts Subtotal</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-bold">
                      {formatCurrency(getPartsTotal())}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Services */}
            <div className="mb-6 print:mb-4">
              <div className="section-title text-xl font-semibold text-gray-800 mb-4">Services</div>
              <table className="table w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 print:bg-gray-200">
                    <th className="border border-gray-300 px-4 py-3 text-left">Service</th>
                    <th className="border border-gray-300 px-4 py-3 text-left">Option</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {jobCard.services
                    .filter(item => !item.ignored)
                    .map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-3 font-medium">
                          {item.service.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-600 print:text-gray-800">
                          {item.option?.name || 'Standard'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                          {item.option ? formatCurrency(item.option.price) : formatCurrency(item.service.base_price)}
                        </td>
                      </tr>
                    ))}
                  
                  <tr className="bg-gray-50 print:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-3 font-bold" colSpan={2}>Services Subtotal</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-bold">
                      {formatCurrency(getServicesTotal())}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="total-section bg-gray-50 print:bg-gray-100 p-6 rounded-lg print:rounded">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-medium">Parts Total:</span>
                <span className="text-lg font-medium">{formatCurrency(getPartsTotal())}</span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-medium">Services Total:</span>
                <span className="text-lg font-medium">{formatCurrency(getServicesTotal())}</span>
              </div>
              
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="grand-total text-2xl font-bold text-gray-800">Grand Total:</span>
                  <span className="grand-total text-2xl font-bold text-green-600">{formatCurrency(getTotalAmount())}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 print:mt-6 text-center text-gray-600 print:text-gray-800 border-t pt-6 print:pt-4">
              <div className="mb-4">
                <p className="text-sm">Thank you for choosing our service!</p>
                <p className="text-sm">For any queries, please contact us at the above numbers.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <strong>Warranty:</strong>
                  <br />
                  Oil change: 3 months or 5,000km
                </div>
                <div>
                  <strong>Next Service Due:</strong>
                  <br />
                  {new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
                <div>
                  <strong>Payment Method:</strong>
                  <br />
                  Cash / Card / Bank Transfer
                </div>
              </div>
              
              <div className="mt-6 print:mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-sm font-medium mb-2">Customer Signature</div>
                    <div className="border-b border-gray-400 h-8"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Service Advisor</div>
                    <div className="border-b border-gray-400 h-8"></div>
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