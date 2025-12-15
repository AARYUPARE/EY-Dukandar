import ChatInterface from './components/ChatInterface';
import ProductDisplay from './components/ProductDisplay';
import Login from './components/Login';
import StoreStaffLayout from './components/StoreStaffLayout';
import StoreStaffDashboard from './components/StoreStaffDashboard';
import AddStockForm from './components/AddStockForm';
import InventoryTable from './components/InventoryTable';
import SaleProduct from './components/SaleProduct';
import SendOrder from './components/SendOrder';
import KioskInterface from './components/KioskInterface';
import ProtectedRoute from './components/ProtectedRoute';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import ChatContainer from './components/ChatContainer';
import Sales from './components/Sales';
import OffersContainer from './components/OfferContainer';
import Profile from './components/Profile';
import Orders from './components/Orders';
import CreateAccount from './components/CreateAccount';
import Cart from './components/Cart';

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/create-account",
    element: <CreateAccount />
  },
  {
    path: "/chat",
    element: <>
      <ProductDisplay />
      <ChatInterface />
    </>,
    children:[
      {
        path: "",
        element:<ChatContainer />
      },
      {
        path: "profile",
        element:<Profile />
      },
      {
        path: "orders",
        element:<Orders/>
      },
      {
        path: "cart",
        element: <Cart />
      }
    ]

  },
  {
    path: "/store-staff",
    element: <StoreStaffLayout />,
    children: [
      {
        path: "",
        element: <StoreStaffDashboard />
      },
      {
        path: "add-stock",
        element: <AddStockForm />
      },
      {
        path: "check-stock",
        element: <InventoryTable />
      },
      {
        path: "send-order",
        element: <SendOrder />
      },
      {
        path: "sale-product",
        element: <SaleProduct />
      },
      {
        path:"sales",
        element:<Sales></Sales>
      },
      {
        path:"offers",
        element:<OffersContainer />
      }
    ]
  },
  {
    path: "/kiosk-interface",
    element: <>
      <ProductDisplay />
      <KioskInterface />
    </>,
    children: [
      {
        path: "",
        element: <Login />
      },
      {
        path: "chat",
        element: <ChatContainer />
      }
    ]
  },
])

const App = () => {

  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
};

export default App;