import { useEffect, useMemo, useState } from "react";
import css from "../styles/InventoryTable.module.css";
import { IoArrowBackCircle } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

export default function InventoryTable() {

  const kioskStore = useSelector(store => store.kioskStore);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState({ key: "grn", dir: "asc" });
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  const navigate = useNavigate();

  const onBack = () => {
    navigate("../")
  }

  useEffect(() => {
    let mounted = true;

    const fetchInventory = async () => {
      setLoading(true);

      try {
        // 1️⃣ Fetch inventory
        const inventoryRes = await axios.get(
          `http://localhost:8080/api/inventory/store/${kioskStore.id}`
        );

        const inventory = inventoryRes.data;

        // 2️⃣ Fetch all products in parallel
        const productRequests = inventory.map((item) =>
          axios.get(`http://localhost:8080/api/products/${item.productId}`)
        );

        const productResponses = await Promise.all(productRequests);
        const products = productResponses.map((p) => p.data);

        // 3️⃣ Merge inventory + product
        const mergedItems = inventory.map((inv, index) => {
          const prod = products[index];

          return {
            grn: prod.sku,
            title: prod.name,
            quantity: inv.stockQuantity,
            price: prod.price,
            specifications: [
              prod.category,
              ...prod.subCategory,
              `Size: ${inv.size}`,
              `Brand: ${prod.brand}`,
            ],
            productId: prod.id,
            storeId: inv.storeId,
            available: inv.available,
          };
        });

        if (mounted) setItems(mergedItems);
      } catch (error) {
        console.error("Inventory merge failed", error);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInventory();

    return () => {
      mounted = false;
    };
  }, []);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = items.filter((it) => {
      return (
        !q ||
        String(it.grn).toLowerCase().includes(q) ||
        String(it.title ?? it.name ?? "").toLowerCase().includes(q) ||
        String(it.specifications ?? "").toLowerCase().includes(q)
      );
    });

    const sorted = arr.sort((a, b) => {
      const k = sortBy.key;
      const av = a[k] ?? "";
      const bv = b[k] ?? "";

      if (typeof av === "number" && typeof bv === "number") {
        return sortBy.dir === "asc" ? av - bv : bv - av;
      }

      return sortBy.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return sorted;
  }, [items, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageItems = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  function toggleSort(key) {
    setSortBy((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  return (
    <div className={css["table-container"]}>
      <div className={css.wrapper}>

        {/* 🔙 Back Button */}
        <button className={css.backBtn} onClick={onBack}>
          <IoArrowBackCircle size={34} />
        </button>

        <div className={css.headerRow}>
          <h3 className={css.title}>Stock Inventory</h3>

          <div className={css.controls}>
            <input
              className={css.search}
              placeholder="Search by GRN, name or specs..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className={css.tableWrap}>
          <table className={css.table}>
            <thead>
              <tr>
                <th onClick={() => toggleSort("grn")}>
                  GRN <span className={css.sort}>{sortBy.key === "grn" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span>
                </th>
                <th onClick={() => toggleSort("title")}>
                  Item Name <span className={css.sort}>{sortBy.key === "title" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span>
                </th>
                <th onClick={() => toggleSort("quantity")}>
                  Quantity <span className={css.sort}>{sortBy.key === "quantity" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span>
                </th>
                <th onClick={() => toggleSort("price")}>
                  Price / Item{" "}
                  <span className={css.sort}>{sortBy.key === "price" ? (sortBy.dir === "asc" ? "▲" : "▼") : "↕"}</span>
                </th>
                <th>Specifications</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className={css.loading}>
                    Loading...
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className={css.empty}>
                    No records found
                  </td>
                </tr>
              ) : (
                pageItems.map((it) => (
                  <tr key={it.grn ?? it.id ?? it.title}>
                    <td className={css.center}>{it.grn}</td>
                    <td>
                      <div className={css.itemName}>
                        <div className={css.itemTitle}>{it.title ?? it.name}</div>
                      </div>
                    </td>
                    <td className={css.center}>{it.quantity ?? 0}</td>
                    <td className={css.center}>₹{Number(it.price ?? it.pricePerItem ?? 0).toLocaleString()}</td>
                    <td className={css.specs}>
                      {Array.isArray(it.specifications)
                        ? it.specifications.join(", ")
                        : it.specifications}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={css.footerRow}>
          <div className={css.pageInfo}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}–
            {Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
          </div>
          <div className={css.pager}>
            <button className={css.pageBtn} onClick={() => setPage(1)} disabled={page === 1}>
              «
            </button>
            <button
              className={css.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            <span className={css.pageNumber}>
              {page}/{totalPages}
            </span>
            <button
              className={css.pageBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
            <button
              className={css.pageBtn}
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
