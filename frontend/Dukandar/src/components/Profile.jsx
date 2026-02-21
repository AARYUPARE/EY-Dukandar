import { useEffect, useMemo, useState } from "react";
import css from "../styles/Profile.module.css";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_BACKEND_URL } from "../store/store";

export default function Profile() {
  const user = useSelector(store => store.user);

  // 🔹 wishlist comes from backend
  const [wishlist, setWishlist] = useState(user.wishlist);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const rowsPerPage = 9;

  // ==============================
  // FETCH WISHLIST
  // ==============================
  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(`${BASE_BACKEND_URL}/wishlist/user/${user.id}`)
      .then(res => setWishlist(res.data))
      .catch(err => console.error("Wishlist fetch error:", err));
  });

  // ==============================
  // REMOVE ITEM
  // ==============================
  function handleRemove(wishlistId) {
    axios
      .delete(`${BASE_BACKEND_URL}/wishlist/${wishlistId}`)
      .then(() => {
        setWishlist(prev => prev.filter(w => w.id !== wishlistId));
      })
      .catch(err => console.error("Remove failed:", err));
  }

  // ==============================
  // FILTER + SORT
  // ==============================
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let arr = wishlist.filter(w => {
      if (!q) return true;
      return (
        w.product?.name?.toLowerCase().includes(q) ||
        w.product?.brand?.toLowerCase().includes(q) ||
        w.size?.toLowerCase().includes(q)
      );
    });

    arr.sort((a, b) => {
      let av, bv;
      switch (sortBy.key) {
        case "price":
          av = a.product?.price ?? 0;
          bv = b.product?.price ?? 0;
          break;
        default:
          av = a.product?.name ?? "";
          bv = b.product?.name ?? "";
      }

      return sortBy.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return arr;
  }, [wishlist, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function toggleSort(key) {
    setSortBy(s =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }

  // ==============================
  // UI
  // ==============================
  return (
    <div className={css.root}>
      <div className="container-fluid p-3" id={css.container}>
        <div className="row g-3" id={`${css["main-row"]}`}>
          {/* ================= PROFILE CARD ================= */}
          <div className="col-12 col-lg-4" id={`${css["left-col"]}`}>
            <div className={css.profileCard}>
              <div className={css.avatarWrap}>
                <img src={user.imageUrl} alt={user.name} className={css.avatar} />
              </div>

              <h4 className={css.name}>{user.name}</h4>

              <div className={css.meta}><span>User ID</span><span>{user.id}</span></div>
              <div className={css.meta}><span>Email</span><span>{user.email}</span></div>
              <div className={css.meta}><span>Phone</span><span>{user.phone}</span></div>
            </div>
          </div>

          {/* ================= WISHLIST ================= */}
          <div className="col-12 col-lg-8" id={`${css["right-col"]}`}> 
            <div className={css.tablePanel}>
              <div className={css.headerRow}>
                <h5 className={css.title}>Wishlist</h5>
                <input
                  className={css.search}
                  placeholder="Search product / brand / size"
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className={css.tableWrap}>
                <table className={css.table}>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort("name")}>Product</th>
                      <th>Brand</th>
                      <th onClick={() => toggleSort("price")}>Price</th>
                      <th>Size</th>
                      <th className={css.center}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageItems.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={css.empty}>
                          No wishlist items
                        </td>
                      </tr>
                    ) : (
                      pageItems.map(w => (
                        <tr key={w.id}>
                          <td>{w.product?.name}</td>
                          <td>{w.product?.brand}</td>
                          <td className={css.center}>
                            ₹{Number(w.product?.price ?? 0).toLocaleString()}
                          </td>
                          <td className={css.center}>{w.size}</td>
                          <td className={css.center}>
                            <button
                              className="btn btn-sm"
                              id={`${css["remove-button"]}`}
                              onClick={() => handleRemove(w.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>


              <div className={css.footerRow}>
                <span>
                  Page {page} / {totalPages}
                </span>
                <div>
                  <button
                    className={css.pageBtn}
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ‹
                  </button>
                  <button
                    className={css.pageBtn}
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
