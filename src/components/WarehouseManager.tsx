import React, { useState } from 'react';
import { Warehouse, ReliefItem, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { Building2, Package, FileText, CheckCircle2, AlertTriangle, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { generatePdfReport } from '../lib/pdfGenerator';

interface WarehouseManagerProps {
  language: Language;
  warehouses: Warehouse[];
  items: ReliefItem[];
  onUpdateInventory: (warehouseId: string, itemId: string, quantity: number) => void;
  onToggleWarehouseAvailability: (warehouseId: string) => void;
}

export const WarehouseManager: React.FC<WarehouseManagerProps> = ({
  language,
  warehouses,
  items,
  onUpdateInventory,
  onToggleWarehouseAvailability,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const COLORS = ['#D6001C', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0284c7'];

  // PDF Generator for specific warehouse
  const handleExportWarehousePdf = (wh: Warehouse) => {
    const isEn = language === 'en';
    const isAr = language === 'ar';

    const headers = isEn
      ? ['Item Name', 'Quantity', 'Unit', 'Cold Chain', 'Unit Weight (kg)', 'Unit Volume (m³)']
      : isAr
      ? ['اسم المادة', 'الكمية', 'الوحدة', 'التبريد', 'وزن الوحدة (kg)', 'حجم الوحدة (m³)']
      : ['نام کالا', 'تعداد موجودی', 'واحد', 'نیاز به زنجیره سرد', 'وزن هر واحد (kg)', 'حجم هر واحد (m³)'];

    const rows = items.map((item) => [
      isEn ? item.nameEn : item.nameFa,
      wh.inventory[item.id] || 0,
      item.unit,
      item.requiresColdChain
        ? (isEn ? 'Yes (Cold)' : isAr ? 'نعم (مبرد)' : 'بله (یخچالی)')
        : (isEn ? 'No' : isAr ? 'لا' : 'خیر'),
      `${item.unitWeightKg} kg`,
      `${item.unitVolumeM3} m³`,
    ]);

    const whName = isEn ? wh.nameEn : wh.nameFa;

    generatePdfReport({
      language,
      title: isEn
        ? `Warehouse Inventory & Logistics Report: ${whName} (${wh.code})`
        : isAr
        ? `تقرير المخزون واللوجستيات للمستودع: ${whName} (${wh.code})`
        : `گزارش انبارداری و موجودی: ${wh.nameFa} (${wh.code})`,
      subtitle: isEn
        ? `City: ${wh.city} | Total Capacity: ${wh.capacityM3} m³ | Used: ${wh.usedM3} m³`
        : isAr
        ? `المدينة: ${wh.city} | السعة الإجمالية: ${wh.capacityM3} m³ | المستغل: ${wh.usedM3} m³`
        : `شهر: ${wh.city} | ظرفیت کل: ${wh.capacityM3} m³ | استفاده‌شده: ${wh.usedM3} m³`,
      filename: `warehouse_${wh.code}_inventory.pdf`,
      sections: [
        {
          heading: isEn ? '1. Warehouse Status Overview' : isAr ? '١. ملخص حالة المستودع' : '۱. خلاصه وضعیت انبار',
          keyValues: [
            {
              label: isEn ? 'Warehouse ID Code' : isAr ? 'رمز المستودع' : 'کد شناسایی انبار',
              value: wh.code,
            },
            {
              label: isEn ? 'Location City' : isAr ? 'المدينة' : 'شهر محل استقرار',
              value: wh.city,
            },
            {
              label: isEn ? 'Cold Chain Equipment' : isAr ? 'معدات التبريد' : 'تجهیزات زنجیره سرد',
              value: wh.hasColdChain
                ? (isEn ? 'Available (Active)' : isAr ? 'متوفر (نشط)' : 'دارد (فعال)')
                : (isEn ? 'None' : isAr ? 'غير متوفر' : 'ندارد'),
            },
            {
              label: isEn ? 'Operational Status' : isAr ? 'الحالة التشغيلية' : 'وضعیت فعالیت',
              value: wh.isAvailable
                ? (isEn ? 'Operational' : isAr ? 'تشغيلي' : 'عملیاتی')
                : (isEn ? 'Offline' : isAr ? 'خارج الخدمة' : 'خارج از مدار'),
            },
          ],
        },
        {
          heading: isEn
            ? '2. Warehouse Relief Inventory Table'
            : isAr
            ? '٢. جدول مخزون المواد الإغاثية'
            : '۲. جدول موجودی اقلام امدادی انبار',
          table: { headers, rows },
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0c0c12] p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Building2 className="w-5 h-5 text-[#D6001C]" />
          <span>{getTranslation(language, 'nav_warehouses')}</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
          مدیریت موجودی اقلام امدادی، کارت‌های تفکیکی انبارها، نمودارهای دایره‌ای توزیع اقلام و خروجی گزارش PDF.
        </p>
      </div>

      {/* Warehouse Cards Grid with Pie Charts (#18) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => {
          // Prepare Pie Chart Data for this warehouse
          const pieData = items
            .map((item) => ({
              name: item.nameFa,
              value: wh.inventory[item.id] || 0,
            }))
            .filter((d) => d.value > 0);

          return (
            <div
              key={wh.id}
              className="bg-white dark:bg-[#0c0c12] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D6001C]" />
                    <span>{wh.nameFa}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{wh.city} | {wh.code}</p>
                </div>

                <button
                  onClick={() => handleExportWarehousePdf(wh)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>گزارش PDF</span>
                </button>
              </div>

              {/* Capacity Usage Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1 font-bold">
                  <span>ظرفیت انبارش (m³)</span>
                  <span className="font-mono text-[#D6001C]">
                    {wh.usedM3} / {wh.capacityM3} m³ ({Math.round((wh.usedM3 / wh.capacityM3) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D6001C] h-2 rounded-full transition-all"
                    style={{ width: `${Math.round((wh.usedM3 / wh.capacityM3) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Pie Chart Component inside Warehouse Card (#18) */}
              <div className="h-44 w-full bg-slate-50 dark:bg-slate-950/50 rounded-xl p-2 border border-slate-100 dark:border-slate-800">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    موجودی انبار خالی است
                  </div>
                )}
              </div>

              {/* Item Stocks Input List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-extrabold text-[#D6001C]">تنظیم آنلاین موجودی اقلام:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {items.map((item) => {
                    const currentQty = wh.inventory[item.id] || 0;
                    return (
                      <div key={item.id} className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-bold text-[11px] truncate">{item.nameFa}:</span>
                        <input
                          type="number"
                          value={currentQty}
                          onChange={(e) =>
                            onUpdateInventory(wh.id, item.id, Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
