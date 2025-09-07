// pages/admin/reports.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminReports() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper sales-reports page
    router.replace('/admin/sales-reports');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <p className="text-gray-600 font-medium">Redirecting to Sales Reports...</p>
      </div>
    </div>
  );
}