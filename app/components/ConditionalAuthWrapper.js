"use client";
import { usePathname } from 'next/navigation';
import { AuthProvider } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import AnalyticsTracker from './AnalyticsTracker';
import NotificationManager from './NotificationManager';
import NotificationListener from './NotificationListener';

export default function ConditionalAuthWrapper({ children, initialCategories }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    // Admin routes: No AuthProvider, no visitor components
    if (isAdminRoute) {
        return <div className="flex-grow">{children}</div>;
    }

    // Visitor routes: Full AuthProvider with all components
    return (
        <AuthProvider>
            <Header initialCategories={initialCategories} />
            <div className="flex-grow">
                {children}
            </div>
            <Footer />
            <CookieConsent />
            <AnalyticsTracker />
            <NotificationManager />
            <NotificationListener />
        </AuthProvider>
    );
}
