
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute.jsx';
import Layout from '../components/layout/Layout.jsx';
import Login from '../pages/Login.jsx';
import SignUp from '../pages/SignUp.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Fruits from '../pages/Fruits.jsx';
import BoxSizes from '../pages/BoxSizes.jsx';
import Suppliers from '../pages/Suppliers.jsx';
import Stock from '../pages/Stock.jsx';
import Vendors from '../pages/Vendors.jsx';
import Orders from '../pages/Orders.jsx';
import OrderDetails from '../pages/OrderDetails.jsx';
import CreateOrder from '../pages/CreateOrder.jsx';
import Reports from '../pages/Reports.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import NotFound from '../pages/NotFound.jsx';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fruits" element={<ProtectedRoute roles={['Admin']}><Fruits /></ProtectedRoute>} />
        <Route path="box-sizes" element={<ProtectedRoute roles={['Admin']}><BoxSizes /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute roles={['Admin']}><Suppliers /></ProtectedRoute>} />
        <Route path="stock" element={<ProtectedRoute roles={['Admin']}><Stock /></ProtectedRoute>} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/new" element={<CreateOrder />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="reports" element={<ProtectedRoute roles={['Admin']}><Reports /></ProtectedRoute>} />
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
