import React, { useEffect, useState } from "react";
import {useSelector} from "react-redux"
import css from "../styles/StoreStaffDashboard.module.css";
import { useNavigate } from "react-router-dom";
import { connectStore } from "../../web_socket/socketListener";
import { backendEventHandler } from "../store/backendEventHandler";
import {
  FaPlusCircle,
  FaClipboardList,
  FaTruckLoading,
  FaCashRegister,
  FaClock,
  FaShoppingBag,
  FaTshirt,
  FaUser,
  FaTimes,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHourglassHalf
} from "react-icons/fa";

const StoreStaffDashboard = () => {

  let store = useSelector(store => store.kioskStore) 

  useEffect(() => {
    connectStore(store.id, backendEventHandler)
  })  

  const navigate = useNavigate();

  // State for the popup modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'reserved' or 'order'

  // Top Action Buttons
  const actions = [
    { id: "add-stock", title: "Add Stock", icon: <FaPlusCircle /> },
    { id: "check-stock", title: "Check Stock", icon: <FaClipboardList /> },
    { id: "send-order", title: "Send Order to Company", icon: <FaTruckLoading /> },
    { id: "sale-product", title: "Sale Product", icon: <FaCashRegister /> }
  ];

  // Mock Data: Reserved Products (Added Duration & Exact Date)
  const reservedData = [
    {
      id: 1,
      item: "Denim Jacket (M)",
      customer: "Rahul K.",
      time: "2h ago",

      reservedDate: "Feb 5, 2026 - 09:30 AM",
      duration: "48 Hours"
    },
    {
      id: 2,
      item: "Summer Dress (S)",
      customer: "Priya S.",
      time: "4h ago",

      reservedDate: "Feb 2, 2026 - 07:00 PM",
      duration: "24 Hours"
    },
    {
      id: 3,
      item: "Sneakers Air (9)",
      customer: "Amit B.",
      time: "1d ago",

      reservedDate: "Feb 4, 2026 - 06:00 PM",
      duration: "72 Hours"
    },
  ];

  // Mock Data: Live Orders (Added Source & Exact Date)
  const ordersData = [
    {
      id: 101,
      orderId: "#ORD-9921",
      items: "8 Items",
      total: "₹7,996",
      status: "New",
      orderDate: "Feb 5, 2026 - 11:10 AM",
      source: "Mobile App (Mumbai)",
      products: [
        { name: "Denim Jacket (M)", qty: 1, price: "₹1,599" },
        { name: "Sneakers Air (9)", qty: 1, price: "₹900" },
        { name: "Cotton Shirt (L)", qty: 2, price: "₹1,198" },
        { name: "Jeans Slim Fit", qty: 1, price: "₹1,299" },
        { name: "Leather Belt", qty: 1, price: "₹499" },
        { name: "Sports Cap", qty: 1, price: "₹299" },
        { name: "Socks Pack (3)", qty: 1, price: "₹399" },
        { name: "Wallet", qty: 1, price: "₹803" }
      ]
    },
    {
      id: 102,
      orderId: "#ORD-9920",
      items: "1 Item",
      total: "₹899",
      status: "Processing",
      orderDate: "Feb 5, 2026 - 10:45 AM",
      source: "Web Store (Delhi)",
      products: [
        { name: "Headphones", qty: 1, price: "₹899" }
      ]
    }
  ];


  // Handlers
  const handleOpenReserved = (item) => {
    setSelectedItem(item);
    setModalType("reserved");
  };

  const handleOpenOrder = (item) => {
    setSelectedItem(item);
    setModalType("order");
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  return (
    <div className={css.wrapper}>

      <div className={css.contentBox}>
        <h1 className={css.pageTitle}>Store Staff Dashboard</h1>

        {/* TOP ACTION BUTTONS */}
        <div className={css.grid}>
          {actions.map((a) => (
            <div
              key={a.id}
              className={css.card}
              role="button"
              tabIndex={0}
              onClick={() => navigate(a.id)}
            >
              <div className={css.icon}>{a.icon}</div>
              <h3>{a.title}</h3>
            </div>
          ))}
        </div>

        {/* INFO SECTION */}
        <div className={css.infoSection}>

          {/* RESERVED PRODUCTS CARD */}
          <div className={css.infoCard}>
            <div className={css.cardHeader}>
              <div className={css.headerTitle}>
                <span className={`${css.iconCircle} ${css.purpleIcon}`}>
                  <FaClock />
                </span>
                <div>
                  <h4>Reserved Products</h4>
                  <p>Items held for customers</p>
                </div>
              </div>
              <button className={css.viewAllBtn}>View All</button>
            </div>

            <div className={css.listContainer}>
              {reservedData.map((item) => (
                <div
                  key={item.id}
                  className={css.listItem}
                  onClick={() => handleOpenReserved(item)} // Click Event
                >
                  <div className={css.itemIcon}>
                    <FaTshirt />
                  </div>
                  <div className={css.itemDetails}>
                    <span className={css.itemName}>{item.item}</span>
                    <span className={css.itemSub}>
                      <FaUser style={{ fontSize: '10px', marginRight: '4px' }} />
                      {item.customer} • {item.time}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* LIVE ORDERS CARD */}
          <div className={css.infoCard}>
            <div className={css.cardHeader}>
              <div className={css.headerTitle}>
                <span className={`${css.iconCircle} ${css.blueIcon}`}>
                  <FaShoppingBag />
                </span>
                <div>
                  <h4>Live Orders</h4>
                  <p>Recent online purchases</p>
                </div>
              </div>
              <button className={css.viewAllBtn}>View All</button>
            </div>

            <div className={css.listContainer}>
              {ordersData.map((order) => (
                <div
                  key={order.id}
                  className={css.listItem}
                  onClick={() => handleOpenOrder(order)} // Click Event
                >
                  <div className={css.itemIcon}>
                    <FaShoppingBag />
                  </div>
                  <div className={css.itemDetails}>
                    <span className={css.itemName}>{order.orderId}</span>
                    <span className={css.itemSub}>{order.items} • {order.total}</span>
                  </div>
                  <span className={`${css.statusBadge} ${order.status === 'New' ? css.badgeNew : css.badgeProcess
                    }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- POPUP MODAL --- */}
      {selectedItem && (
        <div className={css.modalOverlay} onClick={closeModal}>
          <div
            className={`${css.modalContent} ${modalType === "reserved" ? css.reservedModal : ""
              }`}
            onClick={(e) => e.stopPropagation()}
          >

            <button className={css.closeBtn} onClick={closeModal}>
              <FaTimes />
            </button>

            <div className={css.modalHeader}>
              <h2>
                {modalType === 'reserved' ? 'Reservation Details' : 'Order Details'}
              </h2>
              <div className={css.modalDivider}></div>
            </div>

            <div className={css.modalGrid}>

              {/* LEFT SIDE – ORDER DETAILS */}
              <div className={css.leftPanel}>

                {modalType === 'reserved' && (
                  <>
                    <div className={css.detailRow}>
                      <div className={css.detailIcon}><FaTshirt /></div>
                      <div>
                        <span className={css.label}>Product</span>
                        <p className={css.value}>{selectedItem.item}</p>
                      </div>
                    </div>

                    <div className={css.detailRow}>
                      <div className={css.detailIcon}><FaUser /></div>
                      <div>
                        <span className={css.label}>Customer</span>
                        <p className={css.value}>{selectedItem.customer}</p>
                      </div>
                    </div>

                    <div className={css.detailRow}>
                      <div className={css.detailIcon}><FaCalendarAlt /></div>
                      <div>
                        <span className={css.label}>Reserved Date</span>
                        <p className={css.value}>{selectedItem.reservedDate}</p>
                      </div>
                    </div>

                    <div className={css.detailRow}>
                      <div className={css.detailIcon}><FaHourglassHalf /></div>
                      <div>
                        <span className={css.label}>Duration</span>
                        <p className={css.valueHighlight}>{selectedItem.duration}</p>
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'order' && (
                  <>
                    <div className={css.detailRow}>
                      <div className={css.detailIcon}><FaShoppingBag /></div>
                      <div>
                        <span className={css.label}>Order ID</span>
                        <p className={css.value}>{selectedItem.orderId}</p>
                      </div>
                    </div>

                    <div className={css.detailRow}>
                      <div className={css.detailIcon}><FaMapMarkerAlt /></div>
                      <div>
                        <span className={css.label}>Order Source</span>
                        <p className={css.value}>{selectedItem.source}</p>
                      </div>
                    </div>

                    <div className={css.detailRow}>
                      <div className={css.detailIcon}><FaCalendarAlt /></div>
                      <div>
                        <span className={css.label}>Placed On</span>
                        <p className={css.value}>{selectedItem.orderDate}</p>
                      </div>
                    </div>

                    <div className={css.detailRow}>
                      <div className={css.detailIcon}><FaCashRegister /></div>
                      <div>
                        <span className={css.label}>Total</span>
                        <p className={css.valueHighlight}>{selectedItem.total}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT SIDE – PRODUCTS LIST */}
              {modalType === 'order' && (
                <div className={css.rightPanel}>
                  <h4 className={css.productsTitle}>Products Ordered</h4>

                  <div className={css.productsScroll}>
                    {selectedItem.products.map((p, i) => (
                      <div key={i} className={css.productCard}>
                        <div>
                          <p className={css.productName}>{p.name}</p>
                          <span className={css.productQty}>Qty: {p.qty}</span>
                        </div>
                        <span className={css.productPrice}>{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>


            <button className={css.modalActionBtn} onClick={closeModal}>
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoreStaffDashboard;