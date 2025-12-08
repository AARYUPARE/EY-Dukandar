import ChatInterface from './components/ChatInterface';
import ProductDisplay from './components/ProductDisplay';
import Login from './components/Login';
import StoreStaffLayout from './components/StoreStaffLayout';
import KioskInterface from './components/KioskInterface';
import './App.css'

const App = () => {

  return (
    <>
      <ProductDisplay></ProductDisplay>
      {/* <Login></Login> */}
      {/* <ChatInterface></ChatInterface> */}
      <StoreStaffLayout />
      {/* <KioskInterface></KioskInterface> */}
    </>
  );
};

export default App;