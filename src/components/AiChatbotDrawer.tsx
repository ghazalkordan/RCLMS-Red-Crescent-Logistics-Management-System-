import React, { useState } from 'react';
import { ChatMessage, Language } from '../types';
import { getTranslation } from '../locales/i18n';
import { Bot, Send, X, User, Sparkles, MessageSquare } from 'lucide-react';

interface AiChatbotDrawerProps {
  language: Language;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (messageText: string) => Promise<void>;
}

export const AiChatbotDrawer: React.FC<AiChatbotDrawerProps> = ({
  language,
  isOpen,
  onOpen,
  onClose,
  messages,
  onSendMessage,
}) => {
  const isRtl = language === 'fa' || language === 'ar';
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPromptsFa = [
    'چرا انبار شماره ۱ برای ارسال دارو انتخاب شد؟',
    'قیمت سایه (Shadow Price) داروها به چه معناست؟',
    'اگر جاده پاوه مسدود شود چه تغییری در سیستم رخ می‌دهد؟',
    'تفاوت روش ژنتیک با روش پایه Greedy چیست؟',
  ];

  const quickPromptsAr = [
    'لماذا تم إعطاء الأولوية للمستودع رقم ۱ للأدوية؟',
    'ماذا يعني سعر الظل (Shadow Price) للإمدادات الطبية؟',
    'ماذا يحدث إذا تم إغلاق طريق باوة؟',
    'قارن بين الخوارزمية الجينية والنهج الأساسي.',
  ];

  const quickPromptsEn = [
    'Why was Warehouse 1 prioritized for medicine?',
    'What does the Shadow Price of medical supply mean?',
    'What happens if Paveh road is blocked?',
    'Compare Genetic Algorithm performance against Greedy benchmark.',
  ];

  const quickPrompts =
    language === 'fa'
      ? quickPromptsFa
      : language === 'ar'
      ? quickPromptsAr
      : quickPromptsEn;

  const handleSend = async (textToSend?: string) => {
    const msg = textToSend || inputText;
    if (!msg.trim() || isLoading) return;

    setInputText('');
    setIsLoading(true);

    try {
      await onSendMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Assistant Button at corner of screen (#3) */}
      {!isOpen && (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed bottom-6 start-6 z-50 flex items-center gap-3 animate-bounce"
        >
          <button
            onClick={onOpen}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#D6001C] to-red-700 text-white font-extrabold text-xs shadow-2xl hover:scale-105 border-2 border-white/20 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span>دستیار هوشمند (AI)</span>
          </button>
        </div>
      )}

      {/* Popup Drawer Modal */}
      {isOpen && (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D6001C] text-white flex items-center justify-center font-bold shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{getTranslation(language, 'nav_aiAssistant')}</span>
                    <span className="text-[10px] bg-red-100 text-[#D6001C] dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      Grounded Gemini AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'fa'
                      ? 'مستند به نتایج ریاضی LP و GA'
                      : language === 'ar'
                      ? 'مستند إلى نتائج تحسين LP و GA'
                      : 'Grounded on LP/MILP & GA Optimization Results'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-2 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D6001C] shrink-0" />
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shrink-0 border border-slate-200 dark:border-slate-700 transition text-[11px] font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs font-normal bg-slate-50/50 dark:bg-slate-900/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-[#D6001C] dark:bg-red-950/80 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5 border border-red-200 dark:border-red-900/40">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#D6001C] text-white font-medium rounded-tr-none shadow-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 whitespace-pre-wrap rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 border border-slate-300 dark:border-slate-700">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-[#D6001C] text-xs italic font-semibold p-2">
                  <Bot className="w-4 h-4 animate-spin text-[#D6001C]" />
                  <span>
                    {language === 'fa'
                      ? 'دستیار در حال تحلیل پاسخ...'
                      : language === 'ar'
                      ? 'جاري التحليل والرد...'
                      : 'Analyzing optimization context...'}
                  </span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  language === 'fa'
                    ? 'پرسش خود را بپرسید...'
                    : language === 'ar'
                    ? 'اكتب سؤالك هنا...'
                    : 'Ask about allocation, shadow prices, or routing...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D6001C]"
              />

              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputText.trim()}
                className="bg-[#D6001C] hover:bg-red-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
