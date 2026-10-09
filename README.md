<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EMD Secretary Desk</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      html, body, #root { height: 100%; }
      body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #0f172a; }
      .status-badge { display:inline-flex; align-items:center; padding:.35rem .6rem; border-radius:9999px; font-size:.68rem; font-weight:700; }
      .status-badge.awaiting_pickup { background:#fef3c7; color:#92400e; }
      .status-badge.out_for_delivery { background:#e0f2fe; color:#075985; }
      .status-badge.delivered { background:#dcfce7; color:#166534; }
      .status-badge.cancelled { background:#fee2e2; color:#991b1b; }
    </style>
  </head>
  <body>
    <div id="root"></div>

    <script type="text/babel">
      const BASE_URL = '/api';
      const { useState, useEffect, useMemo } = React;
      const money = (value) => `GH₵${Number(value || 0).toFixed(2)}`;

      async function apiGet(path) {
        const res = await fetch(`${BASE_URL}${path}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      }

      async function apiPost(path, body) {
        const res = await fetch(`${BASE_URL}${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      }

      async function apiPut(path, body) {
        const res = await fetch(`${BASE_URL}${path}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      }

      function App() {
        const [view, setView] = useState('overview');
        const [products, setProducts] = useState([]);
        const [inventory, setInventory] = useState([]);
        const [sales, setSales] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');

        const loadAll = async () => {
          try {
            setLoading(true);
            setError('');
            const [productsRes, inventoryRes, salesRes] = await Promise.all([
              apiGet('/products'),
              apiGet('/inventory'),
              apiGet('/sales')
            ]);
            setProducts(productsRes);
            setInventory(inventoryRes);
            setSales(salesRes);
          } catch (err) {
            setError('Backend unavailable. Add your POSTGRES_URL in Vercel and redeploy.');
          } finally {
            setLoading(false);
          }
        };

        useEffect(() => { loadAll(); }, []);

        const totalUnits = useMemo(() => inventory.reduce((sum, item) => sum + Number(item.quantityOnHand || 0), 0), [inventory]);
        const outOfStock = products.filter(product => !inventory.some(item => item.productId === product.id && Number(item.quantityOnHand) > 0));
        const today = new Date().toISOString().slice(0, 10);
        const activePickups = sales.filter(sale => ['awaiting_pickup', 'out_for_delivery'].includes(sale.deliveryStage)).length;
        const todayTotal = sales.filter(sale => sale.purchaseDate === today).reduce((sum, sale) => sum + Number(sale.amountPaid || 0), 0);

        const addProduct = async (payload) => {
          try {
            const result = await apiPost('/products', payload);
            setProducts(prev => [result, ...prev]);
            await loadAll();
          } catch (err) {
            setError(err.message);
          }
        };

        const updateInventory = async (productId, quantityOnHand) => {
          try {
            await apiPut('/inventory', { productId, quantityOnHand });
            await loadAll();
          } catch (err) {
            setError(err.message);
          }
        };

        const recordSale = async (payload) => {
          try {
            await apiPost('/sales', payload);
            await loadAll();
          } catch (err) {
            setError(err.message);
          }
        };

        if (loading) {
          return <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-slate-700">Loading EMD Secretary Desk…</div>;
        }

        return (
          <div className="min-h-screen bg-slate-50 flex">
            <aside className="w-64 bg-white border-r border-slate-200 p-5 hidden md:block">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center">E</div>
                <div>
                  <div className="font-bold text-slate-900">EMD Secretary Desk</div>
                  <div className="text-xs text-slate-500">Operations</div>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  ['overview', 'Overview', '📊'],
                  ['inventory', 'Inventory', '📦'],
                  ['sales', 'Sales & Pickup', '🛒'],
                  ['profit', 'Retail Profit', '💰']
                ].map(([key, label, icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setView(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${view === key ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
                <div>Signed in as</div>
                <div className="mt-1 font-semibold text-slate-700">admin</div>
                <span className="mt-2 inline-block px-2 py-1 rounded-full bg-violet-100 text-violet-700 font-bold">admin</span>
              </div>
            </aside>

            <main className="flex-1 p-6 md:p-8">
              <header className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                  {view === 'overview' ? 'Overview' : view === 'inventory' ? 'Inventory' : view === 'sales' ? 'Sales & Pickup' : 'Retail Profit'}
                </h1>
                <div className="text-sm text-slate-600">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              </header>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
              )}

              {view === 'overview' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard label="Units on hand" value={totalUnits} tone="teal" icon="📦" />
                    <StatCard label="Out of stock" value={outOfStock.length} tone="red" icon="⚠️" />
                    <StatCard label="Active pickups" value={activePickups} tone="sky" icon="🚚" />
                    <StatCard label="Today's sales" value={money(todayTotal)} tone="green" icon="💵" />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <Panel title="Recent sales">
                      <ul className="space-y-3">
                        {sales.slice(0, 5).map(sale => {
                          const product = products.find(p => p.id === sale.productId);
                          return (
                            <li key={sale.id} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                              <div>
                                <div className="font-semibold text-slate-900">{product ? product.name : 'Unknown'}</div>
                                <div className="text-xs text-slate-500">{sale.customerName} • {sale.purchaseDate}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-slate-900">{money(sale.amountPaid)}</div>
                                <span className={`status-badge ${sale.deliveryStage}`}>{sale.deliveryStage.replace(/_/g, ' ')}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </Panel>

                    <Panel title="Low stock">
                      <ul className="space-y-3">
                        {inventory.filter(item => Number(item.quantityOnHand) > 0 && Number(item.quantityOnHand) <= 5).map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return (
                            <li key={item.id} className="flex justify-between items-center text-sm">
                              <span className="font-medium text-slate-800">{product ? product.name : 'Unknown'}</span>
                              <span className="text-amber-600 font-semibold">{item.quantityOnHand} left</span>
                            </li>
                          );
                        })}
                      </ul>
                    </Panel>
                  </div>
                </div>
              )}

              {view === 'inventory' && (
                <div className="space-y-4">
                  <Panel title="Inventory">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600">
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-left">Package</th>
                            <th className="px-3 py-2 text-left">Retail</th>
                            <th className="px-3 py-2 text-left">Distributor</th>
                            <th className="px-3 py-2 text-left">On hand</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => {
                            const item = inventory.find(inv => inv.productId === product.id) || { quantityOnHand: 0 };
                            return (
                              <tr key={product.id} className="border-b border-slate-100">
                                <td className="px-3 py-3 font-medium text-slate-800">{product.name}</td>
                                <td className="px-3 py-3">{product.packageName || '—'}</td>
                                <td className="px-3 py-3">{money(product.retailPrice)}</td>
                                <td className="px-3 py-3">{money(product.distributorPrice)}</td>
                                <td className="px-3 py-3 font-semibold">{item.quantityOnHand}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Panel>
                </div>
              )}

              {view === 'sales' && (
                <Panel title="Sales & Pickup">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600">
                          <th className="px-3 py-2 text-left">Customer</th>
                          <th className="px-3 py-2 text-left">Product</th>
                          <th className="px-3 py-2 text-left">Amount</th>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Stage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map(sale => {
                          const product = products.find(p => p.id === sale.productId);
                          return (
                            <tr key={sale.id} className="border-b border-slate-100">
                              <td className="px-3 py-3">{sale.customerName}</td>
                              <td className="px-3 py-3">{product ? product.name : '—'}</td>
                              <td className="px-3 py-3">{money(sale.amountPaid)}</td>
                              <td className="px-3 py-3">{sale.purchaseDate}</td>
                              <td className="px-3 py-3"><span className={`status-badge ${sale.deliveryStage}`}>{sale.deliveryStage.replace(/_/g, ' ')}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              )}

              {view === 'profit' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <StatBox label="Total sales" value={money(sales.reduce((sum, sale) => sum + Number(sale.amountPaid || 0), 0))} />
                  <StatBox label="Units on hand" value={totalUnits} />
                  <StatBox label="Inventory value" value={money(products.reduce((sum, product) => {
                    const item = inventory.find(inv => inv.productId === product.id);
                    return sum + ((Number(item?.quantityOnHand) || 0) * Number(product.retailPrice || 0));
                  }, 0))} />
                </div>
              )}
            </main>
          </div>
        );
      }

      function StatCard({ label, value, icon, tone }) {
        const toneMap = {
          teal: 'bg-teal-50 text-teal-700',
          red: 'bg-red-50 text-red-700',
          sky: 'bg-sky-50 text-sky-700',
          green: 'bg-emerald-50 text-emerald-700'
        };

        return (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>{icon}</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
          </div>
        );
      }

      function Panel({ title, children }) {
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{title}</h2>
            {children}
          </div>
        );
      }

      function StatBox({ label, value }) {
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">{label}</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
          </div>
        );
      }

      ReactDOM.createRoot(document.getElementById('root')).render(<App />);
    </script>
  </body>
</html>
