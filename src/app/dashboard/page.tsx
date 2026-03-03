/**
 * Dashboard Page
 * 
 * Main application dashboard for Aragorn AI Construction Intelligence platform.
 * This is a protected route (requires authentication via middleware).
 * 
 * Features:
 * - Real-time construction site monitoring
 * - AI-powered safety analysis
 * - PPE violation detection
 * - Progress tracking
 * - Material verification
 * - Multi-language support (English, Hindi, Urdu)
 * 
 * @page /dashboard
 * @protected Requires authentication
 */

import AragornDashboard from "@/components/AragornDashboard";

/**
 * Dashboard Home Component
 * Simple wrapper that renders the main AragornDashboard component
 */
export default function Home() {
  return <AragornDashboard />;
}
