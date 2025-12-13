import { useEffect, useMemo, useState } from "react";
import css from "../styles/Profile.module.css";
import { useSelector } from "react-redux";

export default function Profile() {

  const user = useSelector(store => store.user);

  const sampleUser = {
    id: 1,
    name: "Amit Sharma",
    gender: "M",
    DOB: "1995-06-18",
    email: "amit.sharma@example.com",
    phone: "+91 98765 43210",
    loyaltyPoints: 1,
    imageUrl: "https://i.pravatar.cc/300?img=12",
    pass: "",
  };

  const sampleWishlist = [
    { grn: "GRN101", title: "Virat Kohli Shirt", price: 499, addedOn: "2025-11-18", notes: "Size M" },
    { grn: "GRN205", title: "Noise Cancelling Headphones", price: 2999, addedOn: "2025-11-20", notes: "Check warranty" },
    { grn: "GRN334", title: "Running Shoes", price: 2499, addedOn: "2025-12-01", notes: "Size 9" },
    { grn: "GRN412", title: "External SSD 512GB", price: 4999, addedOn: "2025-10-05", notes: "USB-C" },
    { grn: "GRN599", title: "Gaming Mouse", price: 799, addedOn: "2025-12-03", notes: "RGB" }
  ];

  const [wishlist] = useState(sampleWishlist);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "addedOn", dir: "desc" });
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const filtered = useMemo(() => {
    const q = (query ?? "").trim().toLowerCase();
    const arr = wishlist.filter((it) => {
      if (!q) return true;
      return (
        String(it.grn).toLowerCase().includes(q) ||
        String(it.title ?? "").toLowerCase().includes(q) ||
        String(it.notes ?? "").toLowerCase().includes(q)
      );
    }).slice();

    arr.sort((a, b) => {
      const k = sortBy.key;
      const av = a[k] ?? "";
      const bv = b[k] ?? "";
      if (k === "price") {
        return sortBy.dir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
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
    setSortBy(s => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  function exportCsv(rows) {
    if (!rows || rows.length === 0) return;
    const headers = ["grn","title","price","addedOn","notes"];
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wishlist_${user.id || "user"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={css.root}>
      <div className="container-fluid p-3">
        <div className="row g-3">
          <div className="col-12 col-lg-4">
            <div className={css.profileCard}>
              <div className={css.avatarWrap}>
                <img src={user.imageUrl} alt={user.name} className={css.avatar} />
              </div>
              <h4 className={css.name}>{user.name}</h4>
              <div className={css.meta}><span className={css.label}>User ID</span><span className={css.value}>{user.id}</span></div>
              <div className={css.meta}><span className={css.label}>Email</span><span className={css.value}>{user.email}</span></div>
              <div className={css.meta}><span className={css.label}>Phone</span><span className={css.value}>{user.phone}</span></div>
              <div className={css.meta}><span className={css.label}>DOB</span><span className={css.value}>{user.DOB}</span></div>
              <div className={css.meta}><span className={css.label}>Address</span><span className={css.value}>{user.address}</span></div>

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-outline-light" onClick={() => exportCsv(filtered)}>Export Wishlist</button>
                <button className="btn" style={{ background: "linear-gradient(90deg,#8e24ff,#39e6ff)", color: "#001219" }}>Edit Profile</button>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className={css.tablePanel}>
              <div className={css.headerRow}>
                <h5 className={css.title}>Wishlist</h5>
                <div className="d-flex align-items-center gap-2">
                  <input className={css.search} placeholder="Search GRN, name or notes..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
                  <button className="btn btn-outline-light" onClick={() => { setQuery(""); setPage(1); }}>Reset</button>
                </div>
              </div>

              <div className={css.tableWrap}>
                <table className={css.table}>
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort("grn")}>GRN <span className={css.sort}>{sortBy.key==="grn" ? (sortBy.dir==="asc" ? "▲" : "▼") : "↕"}</span></th>
                      <th onClick={() => toggleSort("title")}>Item <span className={css.sort}>{sortBy.key==="title" ? (sortBy.dir==="asc" ? "▲" : "▼") : "↕"}</span></th>
                      <th onClick={() => toggleSort("price")}>Price <span className={css.sort}>{sortBy.key==="price" ? (sortBy.dir==="asc" ? "▲" : "▼") : "↕"}</span></th>
                      <th onClick={() => toggleSort("addedOn")}>Added On <span className={css.sort}>{sortBy.key==="addedOn" ? (sortBy.dir==="asc" ? "▲" : "▼") : "↕"}</span></th>
                      <th>Notes</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageItems.length === 0 ? (
                      <tr><td colSpan="5" className={css.empty}>No items found</td></tr>
                    ) : pageItems.map(it => (
                      <tr key={it.grn}>
                        <td className={css.center}>{it.grn}</td>
                        <td>{it.title}</td>
                        <td className={css.center}>₹{Number(it.price ?? 0).toLocaleString()}</td>
                        <td className={css.center}>{it.addedOn}</td>
                        <td className={css.specs}>{it.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={css.footerRow}>
                <div className={css.pageInfo}>Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}</div>
                <div className={css.pager}>
                  <button className={css.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>«</button>
                  <button className={css.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                  <span className={css.pageNumber}>{page}/{totalPages}</span>
                  <button className={css.pageBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                  <button className={css.pageBtn} onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
