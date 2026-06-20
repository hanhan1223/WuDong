import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/home";
import Login from "./pages/login";
import ClothingList from "./pages/clothing/list";
import ClothingDetail from "./pages/clothing/detail";
import DiningList from "./pages/dining/list";
import DiningDetail from "./pages/dining/detail";
import HomestayList from "./pages/homestay/list";
import HomestayDetail from "./pages/homestay/detail";
import TravelList from "./pages/travel/list";
import TravelDetail from "./pages/travel/detail";
import CommunityList from "./pages/community/list";
import CommunityDetail from "./pages/community/detail";
import PublishPost from "./pages/community/publish";
import Cart from "./pages/cart";
import OrderList from "./pages/order/list";
import Search from "./pages/search";
import Favorites from "./pages/user/favorites";
import Addresses from "./pages/user/addresses";
import OrderDetail from "./pages/order/detail";
import UserProfile from "./pages/user/profile";

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
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="clothing" element={<ClothingList />} />
          <Route path="clothing/:id" element={<ClothingDetail />} />
          <Route path="dining" element={<DiningList />} />
          <Route path="dining/:id" element={<DiningDetail />} />
          <Route path="homestay" element={<HomestayList />} />
          <Route path="homestay/:id" element={<HomestayDetail />} />
          <Route path="travel" element={<TravelList />} />
          <Route path="travel/:id" element={<TravelDetail />} />
          <Route path="community" element={<CommunityList />} />
          <Route
            path="community/publish"
            element={
              <PrivateRoute>
                <PublishPost />
              </PrivateRoute>
            }
          />
          <Route path="community/:id" element={<CommunityDetail />} />
          <Route
            path="cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route
            path="orders"
            element={
              <PrivateRoute>
                <OrderList />
              </PrivateRoute>
            }
          />
          <Route path="search" element={<Search />} />
          <Route
            path="favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
          <Route
            path="addresses"
            element={
              <PrivateRoute>
                <Addresses />
              </PrivateRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <PrivateRoute>
                <OrderDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="user"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", padding: 80 }}>
                <h2>404 - 页面不存在</h2>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
