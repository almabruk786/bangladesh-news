"use client";
import React from 'react';

const FollowButtons = ({
    whatsappLink = "https://whatsapp.com/channel/YOUR_CHANNEL_ID",
    facebookLink = "https://www.facebook.com/YOUR_PAGE_ID"
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm my-6 select-none">
            {/* Label Section */}
            <div className="bg-[#B91C1C] text-white px-6 py-3 flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
                ফলো করুন
            </div>

            {/* Buttons Section */}
            <div className="flex flex-1 divide-x divide-slate-100">
                {/* WhatsApp Button */}
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 hover:bg-green-50 transition-colors group text-decoration-none"
                    title="Follow on WhatsApp"
                >
                    <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </div>
                    <span className="font-bold text-[#25D366] text-sm sm:text-base">হোয়াটসঅ্যাপ নিউজ চ্যানেল</span>
                </a>

                {/* Messenger/Facebook Button */}
                <a
                    href={facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 hover:bg-blue-50 transition-colors group text-decoration-none"
                    title="Follow on Messenger"
                >
                    <div className="w-8 h-8 rounded-full bg-[#0084FF]/10 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#0084FF]" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.8 1.57 5.25 4.02 6.9c.14.1.22.26.22.42c0 .94-.3 2.1-.55 3.03c-.05.18.15.31.3.19c1.65-1.3 3.32-2.3 4.38-2.67c.23-.08.47-.07.7.02c.98.37 2.02.56 3.1.56c5.52 0 10-4.14 10-9.25S19.52 2 12 2zm1.09 11.4l-2.6-2.77c-.36-.38-.97-.38-1.33 0l-3.66 3.92c-.37.4-.95.12-.76-.37l2.84-7.46c.21-.55.99-.55 1.2 0l2.6 2.77c.36.38.97.38 1.33 0l3.66-3.92c.37-.4.95-.12.76.37l-2.84 7.46c-.21.55-.99.55-1.2 0z" />
                        </svg>
                    </div>
                    <span className="font-bold text-[#0084FF] text-sm sm:text-base">ফেইসবুক পেজ</span>
                </a>
            </div>
        </div>
    );
};

export default FollowButtons;
