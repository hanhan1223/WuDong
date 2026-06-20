import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import UserList from "./pages/user";
import MerchantList from "./pages/merchant";
import ClothingList from "./pages/clothing";
import DiningList from "./pages/dining";
import HomestayList from "./pages/homestay";
import TravelList from "./pages/travel";
import CommunityList from "./pages/community";
import OrderList from "./pages/order";
import FinanceList from "./pages/finance";
import ContentManage from "./pages/content";
import SystemSettings from "./pages/system";
import ModerationList from "./pages/moderation";
import ReportList from "./pages/report";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="user" element={<UserList />} />
          <Route path="merchant" element={<MerchantList />} />
          <Route path="clothing/*" element={<ClothingList />} />
          <Route path="dining/*" element={<DiningList />} />
          <Route path="homestay/*" element={<HomestayList />} />
          <Route path="travel/*" element={<TravelList />} />
          <Route path="community/*" element={<CommunityList />} />
          <Route path="order/*" element={<OrderList />} />
          <Route path="finance/*" element={<FinanceList />} />
          <Route path="content/*" element={<ContentManage />} />
          <Route path="system/*" element={<SystemSettings />} />
          <Route path="moderation" element={<ModerationList />} />
          <Route path="report" element={<ReportList />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
