import { useEffect, useState } from "react";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./api.js";

const EMPTY = { name: "", description: "", price: "", quantity: "" };

export default function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      setProducts(await listProducts());
      setError("");
    } catch (e) {
      setError("Impossible de joindre l'API : " + e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity || "0", 10),
    };
    try {
      if (editingId) await updateProduct(editingId, payload);
      else await createProduct(payload);
      setForm(EMPTY);
      setEditingId(null);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function onView(id) {
    try {
      setSelected(await getProduct(id));
    } catch (e) {
      setError(e.message);
    }
  }

  function onEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      quantity: String(p.quantity),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id) {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduct(id);
      if (selected?.id === id) setSelected(null);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  function onCancel() {
    setEditingId(null);
    setForm(EMPTY);
  }

  return (
    <main>
      <h1>Gestion des produits</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={onSubmit} className="card">
        <h2>{editingId ? `Modifier le produit #${editingId}` : "Ajouter un produit"}</h2>
        <input name="name" placeholder="Nom" value={form.name} onChange={onChange} required />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={onChange}
        />
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Prix"
          value={form.price}
          onChange={onChange}
          required
        />
        <input
          name="quantity"
          type="number"
          min="0"
          placeholder="Quantité"
          value={form.quantity}
          onChange={onChange}
        />
        <div className="row">
          <button type="submit">{editingId ? "Enregistrer" : "Ajouter"}</button>
          {editingId && (
            <button type="button" className="secondary" onClick={onCancel}>
              Annuler
            </button>
          )}
        </div>
      </form>

      {selected && (
        <section className="card detail">
          <h2>Détails du produit #{selected.id}</h2>
          <p><b>Nom :</b> {selected.name}</p>
          <p><b>Description :</b> {selected.description || "—"}</p>
          <p><b>Prix :</b> {selected.price.toFixed(2)}</p>
          <p><b>Quantité :</b> {selected.quantity}</p>
          <p><b>Créé le :</b> {new Date(selected.created_at).toLocaleString()}</p>
          <button className="secondary" onClick={() => setSelected(null)}>Fermer</button>
        </section>
      )}

      <section className="card">
        <h2>Liste des produits ({products.length})</h2>
        {products.length === 0 ? (
          <p>Aucun produit pour le moment.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Nom</th><th>Prix</th><th>Qté</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price.toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td className="actions">
                    <button onClick={() => onView(p.id)}>Voir</button>
                    <button onClick={() => onEdit(p)}>Modifier</button>
                    <button className="danger" onClick={() => onDelete(p.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
