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
      // A4 PDF generation with proper styling
      const printWindow = window.open('', '_blank');
      if (printWindow && printRef.current) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${jobCard.id}</title>
              <style>
                @page {
                  size: A4;
                  margin: 1cm;
                }
                
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  line-height: 1.4;
                  color: #2d3748;
                  font-size: 12px;
                }
                
                .invoice-container { 
                  width: 100%;
                  max-width: 21cm;
                  margin: 0 auto;
                  background: white;
                }
                
                .header { 
                  text-align: center; 
                  margin-bottom: 25px; 
                  border-bottom: 3px solid #4299e1; 
                  padding-bottom: 20px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 20px;
                  border-radius: 8px;
                }
                
                .company-name { 
                  font-size: 28px; 
                  font-weight: 700; 
                  margin-bottom: 8px;
                  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .company-details { 
                  font-size: 14px;
                  opacity: 0.95;
                }
                
                .invoice-info { 
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  margin-bottom: 25px; 
                }
                
                .customer-info, .job-info { 
                  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                  padding: 18px; 
                  border-radius: 12px;
                  border: 1px solid #e2e8f0;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                
                .section-title { 
                  font-weight: 700; 
                  color: #2d3748; 
                  margin-bottom: 12px; 
                  border-bottom: 2px solid #4299e1; 
                  padding-bottom: 6px;
                  font-size: 14px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                }
                
                .table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 20px;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                
                .table th, .table td { 
                  border: 1px solid #e2e8f0; 
                  padding: 12px; 
                  text-align: left; 
                }
                
                .table th { 
                  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                  color: white;
                  font-weight: 600;
                  font-size: 13px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                
                .table tbody tr:nth-child(even) {
                  background-color: #f7fafc;
                }
                
                .table tbody tr:hover {
                  background-color: #edf2f7;
                }
                
                .text-right { 
                  text-align: right; 
                }
                
                .total-section { 
                  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                  padding: 20px; 
                  border-radius: 12px;
                  border: 2px solid #4299e1;
                  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.1);
                }
                
                .grand-total { 
                  font-size: 20px; 
                  font-weight: 700; 
                  color: #2d3748;
                  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                }
                
                .subtotal-row {
                  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%) !important;
                  font-weight: 600;
                }
                
                .footer {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 2px solid #e2e8f0;
                  text-align: center;
                  color: #4a5568;
                }
                
                .signature-section {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 40px;
                  margin-top: 25px;
                  padding-top: 20px;
                  border-top: 1px solid #e2e8f0;
                }
                
                .signature-box {
                  text-align: center;
                }
                
                .signature-line {
                  border-bottom: 2px solid #4a5568;
                  height: 40px;
                  margin-top: 10px;
                }
                
                .info-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
                  margin-top: 20px;
                  font-size: 11px;
                }
                
                .info-item {
                  background: #f7fafc;
                  padding: 12px;
                  border-radius: 6px;
                  border-left: 4px solid #4299e1;
                }
                
                @media print {
                  body { 
                    margin: 0;
                    font-size: 11px;
                  }
                  .invoice-container {
                    width: 100%;
                    max-width: none;
                  }
                  .print-hide { 
                    display: none !important; 
                  }
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
      <div className=" shadow-lg border-b print:hidden backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-3 px-6 py-3 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Job Card
            </button>
            
            <div className="flex gap-4">
              <button disabled
                onClick={handlePrint}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg font-medium"
              >
                <Printer className="w-5 h-5" />
                Print Invoice
              </button>
              
              <button
                onClick={handleDownloadPDF}
                disabled
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 shadow-lg font-medium"
              >
                <Download className="w-5 h-5" />
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 print:bg-white print:min-h-0">
        <div className="container mx-auto px-6 py-8 print:px-0 print:py-0">
          <div ref={printRef} className="invoice-container bg-white print:bg-transparent shadow-2xl print:shadow-none rounded-2xl print:rounded-none p-10 print:p-0 max-w-5xl mx-auto border border-slate-200 print:border-none">
            
            {/* Header */}
            <div className="header text-center mb-10 print:mb-8 bg-gradient-to-r from-slate-800 to-slate-700 text-white p-8 rounded-2xl print:rounded-none">
              <div className="company-name text-4xl print:text-3xl font-bold mb-3">
                GT Automech
              </div>
              <div className="company-details text-lg print:text-base">
                <div className="mb-1">Raigama Junction, Bandaragama</div>
                <div>076 879 8983 / 071 906 0450 / 077 409 8580</div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="invoice-info grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 print:mb-8">
              <div className="customer-info bg-gradient-to-br from-blue-50 to-indigo-50 print:bg-gray-50 p-6 rounded-2xl print:rounded-lg border border-blue-200 print:border-gray-200">
                <div className="section-title flex items-center gap-3 text-xl print:text-lg font-bold text-slate-800 mb-4">
                  <User className="w-6 h-6 text-blue-600" />
                  Customer Information
                </div>
                {jobCard.customer && (
                  <div className="space-y-3 text-slate-700 print:text-slate-900">
                    <div className="flex justify-between">
                      <span className="font-semibold">Name:</span>
                      <span>{jobCard.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Mobile:</span>
                      <span>{jobCard.customer.mobile}</span>
                    </div>
                    {jobCard.customer.email && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Email:</span>
                        <span className="text-sm">{jobCard.customer.email}</span>
                      </div>
                    )}
                    {jobCard.customer.address && (
                      <div>
                        <span className="font-semibold">Address:</span>
                        <div className="text-sm mt-1">{jobCard.customer.address}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="job-info bg-gradient-to-br from-emerald-50 to-green-50 print:bg-gray-50 p-6 rounded-2xl print:rounded-lg border border-emerald-200 print:border-gray-200">
                <div className="section-title flex items-center gap-3 text-xl print:text-lg font-bold text-slate-800 mb-4">
                  <Hash className="w-6 h-6 text-emerald-600" />
                  Job Card Information
                </div>
                <div className="space-y-3 text-slate-700 print:text-slate-900">
                  <div className="flex justify-between">
                    <span className="font-semibold">Job Card #:</span>
                    <span className="font-mono font-bold text-emerald-600">{jobCard.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Date:</span>
                    <span>{jobCard.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Time:</span>
                    <span>{jobCard.time}</span>
                  </div>
                  {jobCard.vehicle && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-semibold">Vehicle:</span>
                        <span className="font-mono font-bold">{jobCard.vehicle.vehicle_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Make/Model:</span>
                        <span>{jobCard.vehicle.make} {jobCard.vehicle.model}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Parts & Materials */}
            <div className="mb-8 print:mb-6">
              <div className="section-title text-2xl print:text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Car className="w-7 h-7 text-blue-600" />
                Parts & Materials
              </div>
              <table className="table w-full border-collapse rounded-xl overflow-hidden shadow-lg print:shadow-none">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="border-0 px-6 py-4 text-left font-semibold">Description</th>
                    <th className="border-0 px-6 py-4 text-right font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {jobCard.oil && (
                    <tr className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="border border-slate-200 px-6 py-4">
                        <div className="font-semibold text-slate-800">{jobCard.oilBrand?.name}</div>
                        <div className="text-sm text-slate-600 print:text-slate-800 mt-1">{jobCard.oil.name}</div>
                      </td>
                      <td className="border border-slate-200 px-6 py-4 text-right font-bold text-emerald-600">
                        {formatCurrency(jobCard.oil.price)}
                      </td>
                    </tr>
                  )}
                  
                  {jobCard.oilFilter && (
                    <tr className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="border border-slate-200 px-6 py-4">
                        <div className="font-semibold text-slate-800">{jobCard.oilFilter.name}</div>
                      </td>
                      <td className="border border-slate-200 px-6 py-4 text-right font-bold text-emerald-600">
                        {formatCurrency(jobCard.oilFilter.price)}
                      </td>
                    </tr>
                  )}
                  
                  {jobCard.drainPlugSeal && (
                    <tr className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="border border-slate-200 px-6 py-4">
                        <div className="font-semibold text-slate-800">{jobCard.drainPlugSeal.name}</div>
                      </td>
                      <td className="border border-slate-200 px-6 py-4 text-right font-bold text-emerald-600">
                        {formatCurrency(jobCard.drainPlugSeal.price)}
                      </td>
                    </tr>
                  )}
                  
                  <tr className="subtotal-row bg-gradient-to-r from-slate-100 to-slate-200">
                    <td className="border border-slate-300 px-6 py-4 font-bold text-slate-800">Parts Subtotal</td>
                    <td className="border border-slate-300 px-6 py-4 text-right font-bold text-slate-800">
                      {formatCurrency(getPartsTotal())}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Services */}
            <div className="mb-8 print:mb-6">
              <div className="section-title text-2xl print:text-xl font-bold text-slate-800 mb-6">Services Performed</div>
              <table className="table w-full border-collapse rounded-xl overflow-hidden shadow-lg print:shadow-none">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                    <th className="border-0 px-6 py-4 text-left font-semibold">Service</th>
                    <th className="border-0 px-6 py-4 text-left font-semibold">Option</th>
                    <th className="border-0 px-6 py-4 text-right font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {jobCard.services
                    .filter(item => !item.ignored)
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-emerald-50 transition-colors duration-200">
                        <td className="border border-slate-200 px-6 py-4 font-semibold text-slate-800">
                          {item.service.name}
                        </td>
                        <td className="border border-slate-200 px-6 py-4 text-slate-600 print:text-slate-800">
                          {item.option?.name || 'Standard'}
                        </td>
                        <td className="border border-slate-200 px-6 py-4 text-right font-bold text-emerald-600">
                          {item.option ? formatCurrency(item.option.price) : formatCurrency(item.service.base_price)}
                        </td>
                      </tr>
                    ))}
                  
                  <tr className="subtotal-row bg-gradient-to-r from-slate-100 to-slate-200">
                    <td className="border border-slate-300 px-6 py-4 font-bold text-slate-800" colSpan={2}>Services Subtotal</td>
                    <td className="border border-slate-300 px-6 py-4 text-right font-bold text-slate-800">
                      {formatCurrency(getServicesTotal())}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="total-section bg-gradient-to-br from-slate-50 to-blue-50 print:bg-gray-50 p-8 rounded-2xl print:rounded-lg border-2 border-blue-200 print:border-gray-300">
              <div className="flex justify-between items-center mb-4 text-lg">
                <span className="font-semibold text-slate-700">Parts Total:</span>
                <span className="font-bold text-slate-800">{formatCurrency(getPartsTotal())}</span>
              </div>
              
              <div className="flex justify-between items-center mb-6 text-lg">
                <span className="font-semibold text-slate-700">Services Total:</span>
                <span className="font-bold text-slate-800">{formatCurrency(getServicesTotal())}</span>
              </div>
              
              <div className="border-t-2 border-slate-300 pt-6">
                <div className="flex justify-between items-center">
                  <span className="grand-total text-3xl print:text-2xl font-bold text-slate-800">Grand Total:</span>
                  <span className="grand-total text-3xl print:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                    {formatCurrency(getTotalAmount())}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer mt-10 print:mt-8 text-center text-slate-600 print:text-slate-800 border-t-2 border-slate-200 pt-8 print:pt-6">
              <div className="mb-6">
                <p className="text-lg font-semibold text-slate-800 mb-2">Thank you for choosing GT Automech!</p>
                <p className="text-sm">For any queries, please contact us at the above numbers.</p>
              </div>
              
              <div className="info-grid grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-8">
                <div className="bg-blue-50 print:bg-gray-100 p-4 rounded-lg border border-blue-200 print:border-gray-300">
                  <strong className="text-blue-800 print:text-gray-800">Payment Methods:</strong>
                  <br />
                  Cash / Card / Bank Transfer
                </div>
                <div className="bg-green-50 print:bg-gray-100 p-4 rounded-lg border border-green-200 print:border-gray-300">
                  <strong className="text-green-800 print:text-gray-800">Service Quality:</strong>
                  <br />
                  Premium parts & expert technicians
                </div>
              </div>
              
              <div className="signature-section grid grid-cols-2 gap-12 print:gap-8">
                <div className="signature-box">
                  <div className="text-sm font-semibold mb-3 text-slate-700">Customer Signature</div>
                  <div className="signature-line border-b-2 border-slate-400 h-12"></div>
                </div>
                <div className="signature-box">
                  <div className="text-sm font-semibold mb-3 text-slate-700">Service Advisor</div>
                  <div className="signature-line border-b-2 border-slate-400 h-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}