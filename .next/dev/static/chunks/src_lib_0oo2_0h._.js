(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/client-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "audit",
    ()=>audit,
    "auth",
    ()=>auth,
    "bills",
    ()=>bills,
    "customers",
    ()=>customers,
    "dashboard",
    ()=>dashboard,
    "deletedBills",
    ()=>deletedBills,
    "expenses",
    ()=>expenses,
    "license",
    ()=>license,
    "menu",
    ()=>menu,
    "moneyIn",
    ()=>moneyIn,
    "moneyOut",
    ()=>moneyOut,
    "orders",
    ()=>orders,
    "purchases",
    ()=>purchases,
    "reports",
    ()=>reports,
    "settings",
    ()=>settings,
    "shops",
    ()=>shops,
    "suppliers",
    ()=>suppliers,
    "syncQueue",
    ()=>syncQueue,
    "tables",
    ()=>tables,
    "users",
    ()=>users,
    "zomato",
    ()=>zomato
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/client-db.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$license$2d$keys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/license-keys.ts [app-client] (ecmascript)");
'use client';
;
;
// Offline-only: no-op stubs for the old sync tracking.
// The app is fully offline now — no Supabase, no sync outbox.
// These stubs keep the existing call sites working without changes.
const trackUpsert = (_table, _row)=>{};
const trackDelete = (_table, _id)=>{};
const auth = {
    login (email, password) {
        const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM AppUser WHERE email = ? AND password = ? AND active = 1', [
            email.toLowerCase().trim(),
            password
        ]);
        if (!user) return null;
        const shops = user.shopId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Shop WHERE id = ?', [
            user.shopId
        ]) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Shop WHERE active = 1 ORDER BY name');
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopId: user.shopId
            },
            shops: shops.map(convertShop)
        };
    }
};
const license = {
    /**
   * Validate a license key. Uses the HARDCODED list FIRST (no DB needed),
   * so validation works even if the SQLite WASM failed to load (e.g. on a
   * fresh APK install before the DB has been initialized).
   */ validate (key) {
        const normalized = key.trim().toUpperCase();
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$license$2d$keys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidKey"])(normalized);
        if (!result.valid) return {
            valid: false,
            reason: result.reason
        };
        // Hardcoded key is valid — but check DB for activation status IF DB is ready.
        // If DB isn't initialized yet, just return valid (the activate() flow will
        // initialize the DB and store the activation).
        try {
            const activation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM LicenseActivation WHERE key = ?', [
                normalized
            ]);
            if (activation) {
                const now = new Date();
                const expiry = new Date(activation.expiresAt);
                if (expiry > now) {
                    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return {
                        valid: true,
                        duration: result.duration,
                        alreadyActivated: true,
                        daysLeft
                    };
                }
                return {
                    valid: false,
                    reason: 'expired'
                };
            }
            // Check if marked as used
            const dbKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM LicenseKey WHERE key = ?', [
                normalized
            ]);
            if (dbKey?.used) return {
                valid: false,
                reason: 'already_used'
            };
        } catch (e) {
            // DB not initialized yet — that's OK, the key is still valid per the hardcoded list.
            // The activate() call will initialize the DB.
            console.warn('[license.validate] DB not ready, using hardcoded validation only:', e);
        }
        return {
            valid: true,
            duration: result.duration
        };
    },
    /**
   * Activate a license key. Initializes the DB if needed (async).
   * Returns { active, activatedAt, expiresAt, daysLeft } on success,
   * or { error } on failure.
   */ async activate (key) {
        const normalized = key.trim().toUpperCase();
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$license$2d$keys$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidKey"])(normalized);
        if (!result.valid) return {
            error: 'Invalid license key'
        };
        // Make sure DB is initialized before we touch it.
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initDB"])();
        } catch (e) {
            console.error('[license.activate] DB init failed:', e);
            return {
                error: 'Failed to initialize local database. Please restart the app.'
            };
        }
        // Check existing activation
        const existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM LicenseActivation WHERE key = ?', [
            normalized
        ]);
        if (existing) {
            const now = new Date();
            const expiry = new Date(existing.expiresAt);
            if (expiry > now) {
                return {
                    active: true,
                    activatedAt: existing.activatedAt,
                    expiresAt: existing.expiresAt,
                    daysLeft: Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                };
            }
            return {
                error: 'License expired'
            };
        }
        // Check if used
        const dbKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM LicenseKey WHERE key = ?', [
            normalized
        ]);
        if (dbKey?.used) return {
            error: 'This key has already been used'
        };
        // Activate
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + result.duration);
        if (dbKey) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE LicenseKey SET used = 1 WHERE id = ?', [
                dbKey.id
            ]);
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO LicenseKey (id, key, duration, used) VALUES (?,?,?,?)', [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])(),
                normalized,
                result.duration,
                1
            ]);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO LicenseActivation (id, key, activatedAt, expiresAt) VALUES (?,?,?,?)', [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])(),
            normalized,
            now.toISOString(),
            expiresAt.toISOString()
        ]);
        return {
            active: true,
            activatedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            daysLeft: result.duration
        };
    },
    status () {
        try {
            const activation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM LicenseActivation LIMIT 1');
            if (!activation) return {
                active: false,
                reason: 'not_activated'
            };
            const now = new Date();
            const expiry = new Date(activation.expiresAt);
            if (expiry < now) return {
                active: false,
                reason: 'expired',
                expiresAt: activation.expiresAt
            };
            return {
                active: true,
                activatedAt: activation.activatedAt,
                expiresAt: activation.expiresAt,
                daysLeft: Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            };
        } catch  {
            // DB not ready — caller should treat as not_activated
            return {
                active: false,
                reason: 'not_activated'
            };
        }
    }
};
const menu = {
    list (shopId, category) {
        const sql = category ? 'SELECT * FROM MenuItem WHERE shopId = ? AND category = ? ORDER BY category, name' : 'SELECT * FROM MenuItem WHERE shopId = ? ORDER BY category, name';
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, category ? [
            shopId,
            category
        ] : [
            shopId
        ]).map(convertMenuItem);
    },
    create (shopId, data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO MenuItem (id, shopId, name, category, price, cost, stock, unit, image, available)
      VALUES (?,?,?,?,?,?,?,?,?,?)`, [
            id,
            shopId,
            data.name,
            data.category || 'General',
            Number(data.price),
            Number(data.cost || 0),
            Number(data.stock || 0),
            data.unit || 'Pcs',
            data.image || null,
            data.available !== false ? 1 : 0
        ]);
        const created = this.getById(id);
        if (created) trackUpsert('MenuItem', created);
        return created;
    },
    update (id, data) {
        const sets = [];
        const params = [];
        if (data.name != null) {
            sets.push('name = ?');
            params.push(data.name);
        }
        if (data.category != null) {
            sets.push('category = ?');
            params.push(data.category);
        }
        if (data.price != null) {
            sets.push('price = ?');
            params.push(Number(data.price));
        }
        if (data.cost != null) {
            sets.push('cost = ?');
            params.push(Number(data.cost));
        }
        if (data.stock != null) {
            sets.push('stock = ?');
            params.push(Number(data.stock));
        }
        if (data.unit != null) {
            sets.push('unit = ?');
            params.push(data.unit);
        }
        if (data.image !== undefined) {
            sets.push('image = ?');
            params.push(data.image);
        }
        if (data.available != null) {
            sets.push('available = ?');
            params.push(data.available ? 1 : 0);
        }
        if (sets.length === 0) return null;
        params.push(id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`UPDATE MenuItem SET ${sets.join(', ')} WHERE id = ?`, params);
        const updated = this.getById(id);
        if (updated) trackUpsert('MenuItem', updated);
        return updated;
    },
    getById (id) {
        return convertMenuItem((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM MenuItem WHERE id = ?', [
            id
        ]));
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM MenuItem WHERE id = ?', [
            id
        ]);
        trackDelete('MenuItem', id);
    }
};
const tables = {
    list (shopId) {
        const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM RestaurantTable WHERE shopId = ? ORDER BY number', [
            shopId
        ]);
        return t.map((row)=>{
            const table = convertTable(row);
            if (row.currentOrderId) {
                const order = orders.getById(row.currentOrderId);
                table.currentOrder = order;
            }
            return table;
        });
    },
    seed (shopId) {
        const count = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c FROM RestaurantTable WHERE shopId = ?', [
            shopId
        ]);
        if (count?.c > 0) return {
            seeded: false
        };
        const seededIds = [];
        const directId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO RestaurantTable (id, shopId, number, name, capacity, status) VALUES (?,?,?,?,?,?)', [
            directId,
            shopId,
            0,
            'Direct Counter',
            0,
            'available'
        ]);
        seededIds.push(directId);
        for(let i = 1; i <= 10; i++){
            const tid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO RestaurantTable (id, shopId, number, name, capacity, status) VALUES (?,?,?,?,?,?)', [
                tid,
                shopId,
                i,
                `Table ${i}`,
                4,
                'available'
            ]);
            seededIds.push(tid);
        }
        // Sync seeded tables to Supabase
        for (const tid of seededIds){
            const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM RestaurantTable WHERE id = ?', [
                tid
            ]);
            if (t) trackUpsert('RestaurantTable', convertTable(t));
        }
        return {
            seeded: true
        };
    },
    update (id, data) {
        const sets = [];
        const params = [];
        if (data.status != null) {
            sets.push('status = ?');
            params.push(data.status);
        }
        if (data.currentOrderId !== undefined) {
            sets.push('currentOrderId = ?');
            params.push(data.currentOrderId || null);
        }
        if (sets.length === 0) return null;
        params.push(id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`UPDATE RestaurantTable SET ${sets.join(', ')} WHERE id = ?`, params);
        const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM RestaurantTable WHERE id = ?', [
            id
        ]);
        if (t) trackUpsert('RestaurantTable', convertTable(t));
        return t ? convertTable(t) : null;
    }
};
const orders = {
    list (shopId, status) {
        const sql = status ? 'SELECT * FROM Orders WHERE shopId = ? AND status = ? ORDER BY createdAt DESC' : 'SELECT * FROM Orders WHERE shopId = ? ORDER BY createdAt DESC';
        const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, status ? [
            shopId,
            status
        ] : [
            shopId
        ]);
        return rows.map((row)=>{
            const order = convertOrder(row);
            order.items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM OrderItem WHERE orderId = ?', [
                row.id
            ]).map(convertOrderItem);
            const table = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM RestaurantTable WHERE id = ?', [
                row.tableId
            ]);
            order.table = table ? convertTable(table) : null;
            return order;
        });
    },
    getById (id) {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Orders WHERE id = ?', [
            id
        ]);
        if (!row) return null;
        const order = convertOrder(row);
        order.items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM OrderItem WHERE orderId = ?', [
            id
        ]).map(convertOrderItem);
        const table = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM RestaurantTable WHERE id = ?', [
            row.tableId
        ]);
        order.table = table ? convertTable(table) : null;
        return order;
    },
    create (shopId, tableId, type = 'dine_in', guests = 1, waiterName, customerName, notes) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO Orders (id, shopId, tableId, status, type, guests, waiterName, customerName, notes)
      VALUES (?,?,?,?,?,?,?,?,?)`, [
            id,
            shopId,
            tableId,
            'open',
            type,
            guests,
            waiterName || null,
            customerName || null,
            notes || null
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE RestaurantTable SET status = ?, currentOrderId = ? WHERE id = ?', [
            'occupied',
            id,
            tableId
        ]);
        const created = this.getById(id);
        if (created) trackUpsert('Orders', created);
        // The table's status changed too — sync that.
        const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM RestaurantTable WHERE id = ?', [
            tableId
        ]);
        if (t) trackUpsert('RestaurantTable', convertTable(t));
        return created;
    },
    delete (id) {
        // Capture tableId before deleting so we can sync the freed table.
        const order = this.getById(id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM OrderItem WHERE orderId = ?', [
            id
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM Bill WHERE orderId = ?', [
            id
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM Orders WHERE id = ?', [
            id
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE RestaurantTable SET status = ?, currentOrderId = NULL WHERE currentOrderId = ?', [
            'available',
            id
        ]);
        trackDelete('Orders', id);
        if (order?.tableId) {
            const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM RestaurantTable WHERE id = ?', [
                order.tableId
            ]);
            if (t) trackUpsert('RestaurantTable', convertTable(t));
        }
    },
    sendKOT (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE Orders SET status = ?, kotPrinted = 1 WHERE id = ?', [
            'sent',
            id
        ]);
        const updated = this.getById(id);
        if (updated) trackUpsert('Orders', updated);
        return updated;
    },
    updateStatus (id, status) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE Orders SET status = ? WHERE id = ?', [
            status,
            id
        ]);
        const updated = this.getById(id);
        if (updated) trackUpsert('Orders', updated);
        return updated;
    },
    freeTable (id) {
        const order = this.getById(id);
        if (!order) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE Orders SET status = ? WHERE id = ?', [
            'billed',
            id
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE RestaurantTable SET status = ?, currentOrderId = NULL WHERE id = ?', [
            'available',
            order.tableId
        ]);
        const updated = this.getById(id);
        if (updated) trackUpsert('Orders', updated);
        const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM RestaurantTable WHERE id = ?', [
            order.tableId
        ]);
        if (t) trackUpsert('RestaurantTable', convertTable(t));
        return order.table?.number;
    },
    // ─── Order Items ───
    addItem (orderId, menuItemId, name, price, quantity, notes) {
        // Check if there's an existing pending item with same menu item
        const existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM OrderItem WHERE orderId = ? AND menuItemId = ? AND status = ? AND notes IS ?', [
            orderId,
            menuItemId,
            'pending',
            notes || null
        ]);
        let itemId;
        if (existing) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE OrderItem SET quantity = quantity + ? WHERE id = ?', [
                quantity,
                existing.id
            ]);
            itemId = existing.id;
        } else {
            itemId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO OrderItem (id, orderId, menuItemId, name, price, quantity, status, notes) VALUES (?,?,?,?,?,?,?,?)', [
                itemId,
                orderId,
                menuItemId,
                name,
                price,
                quantity,
                'pending',
                notes || null
            ]);
        }
        const item = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM OrderItem WHERE id = ?', [
            itemId
        ]);
        if (item) trackUpsert('OrderItem', item);
        return orders.getById(orderId);
    },
    updateItem (itemId, data) {
        const sets = [];
        const params = [];
        if (data.status != null) {
            sets.push('status = ?');
            params.push(data.status);
        }
        if (data.quantity != null) {
            sets.push('quantity = ?');
            params.push(Number(data.quantity));
        }
        if (data.notes != null) {
            sets.push('notes = ?');
            params.push(data.notes);
        }
        if (sets.length === 0) return null;
        params.push(itemId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`UPDATE OrderItem SET ${sets.join(', ')} WHERE id = ?`, params);
        const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM OrderItem WHERE id = ?', [
            itemId
        ]);
        if (updated) trackUpsert('OrderItem', updated);
        return updated;
    },
    deleteItem (itemId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM OrderItem WHERE id = ?', [
            itemId
        ]);
        trackDelete('OrderItem', itemId);
    }
};
const bills = {
    list (shopId, filters) {
        let sql = 'SELECT * FROM Bill WHERE shopId = ?';
        const params = [
            shopId
        ];
        if (filters?.from) {
            sql += ' AND paidAt >= ?';
            params.push(filters.from);
        }
        if (filters?.to) {
            sql += ' AND paidAt <= ?';
            params.push(filters.to);
        }
        if (filters?.table) {
            sql += ' AND tableNumber = ?';
            params.push(filters.table);
        }
        sql += ' ORDER BY paidAt DESC';
        let result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, params);
        if (filters?.q) {
            const term = filters.q.toLowerCase();
            result = result.filter((b)=>String(b.billNo).includes(term));
        }
        return result.map((b)=>{
            const bill = convertBill(b);
            const order = orders.getById(b.orderId);
            bill.order = order;
            return bill;
        });
    },
    getById (id) {
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Bill WHERE id = ?', [
            id
        ]);
        if (!row) return null;
        const bill = convertBill(row);
        bill.order = orders.getById(row.orderId);
        return bill;
    },
    nextNo (shopId) {
        const last = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT billNo FROM Bill WHERE shopId = ? ORDER BY billNo DESC LIMIT 1', [
            shopId
        ]);
        return last?.billNo ? last.billNo + 1 : 1001;
    },
    create (shopId, orderId, tableNumber, subtotal, taxRate, taxAmount, discount, serviceCharge, total, paymentMode) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        const billNo = this.nextNo(shopId);
        // ─── BUG FIX: Many callers (e.g. CounterMode.confirmBill) only pass
        // { taxRate, discount, serviceCharge, paymentMode } in the POST body —
        // they do NOT pass subtotal / taxAmount / total. The use-shop-fetch
        // shim falls back to 0 for those missing fields, which means bills were
        // being saved with subtotal=0, taxAmount=0, total=0.
        //
        // To make this bullet-proof, we ALWAYS recompute the amounts here from
        // the live order items, then fall back to the caller-supplied values
        // only if the recomputed subtotal is also 0 (defensive, shouldn't happen
        // for a real order). The caller's taxRate / discount / serviceCharge are
        // still honored.
        const order = orders.getById(orderId);
        const activeItems = (order?.items || []).filter((i)=>i.status !== 'cancelled');
        const computedSubtotal = activeItems.reduce((s, i)=>s + Number(i.price) * Number(i.quantity), 0);
        const safeSubtotal = computedSubtotal > 0 ? computedSubtotal : Number(subtotal) || 0;
        const safeTaxRate = Number(taxRate) || 0;
        const computedTaxAmount = Math.round(safeSubtotal * safeTaxRate) / 100;
        const safeTaxAmount = computedTaxAmount || Number(taxAmount) || 0;
        const safeDiscount = Number(discount) || 0;
        const safeServiceCharge = Number(serviceCharge) || 0;
        const computedTotal = Math.max(0, safeSubtotal + safeTaxAmount + safeServiceCharge - safeDiscount);
        const safeTotal = computedTotal > 0 ? computedTotal : Number(total) || 0;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO Bill (id, shopId, billNo, orderId, tableNumber, subtotal, taxRate, taxAmount, discount, serviceCharge, total, paymentMode, paymentStatus, paidAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            id,
            shopId,
            billNo,
            orderId,
            tableNumber,
            safeSubtotal,
            safeTaxRate,
            safeTaxAmount,
            safeDiscount,
            safeServiceCharge,
            safeTotal,
            paymentMode,
            'paid',
            new Date().toISOString()
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE Orders SET status = ?, billPrinted = 1 WHERE id = ?', [
            'paid',
            orderId
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE RestaurantTable SET status = ?, currentOrderId = NULL WHERE currentOrderId = ?', [
            'available',
            orderId
        ]);
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO MoneyIn (id, shopId, amount, source, description, partyName, paymentMode, date)
        VALUES (?,?,?,?,?,?,?,?)`, [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])(),
                shopId,
                safeTotal,
                'Sale',
                `Bill #${billNo} (Table ${tableNumber})`,
                null,
                paymentMode,
                new Date().toISOString()
            ]);
        } catch (e) {
            console.warn('[bills.create] MoneyIn auto-add failed:', e);
        }
        const created = this.getById(id);
        // Sync the new bill, the paid order, and any auto-added MoneyIn to Supabase.
        if (created) trackUpsert('Bill', created);
        const paidOrder = orders.getById(orderId);
        if (paidOrder) trackUpsert('Orders', paidOrder);
        return created;
    },
    /**
   * Delete (void) a bill.
   *
   * Before removing the Bill row we capture a full snapshot into the
   * DeletedBill table — this preserves an audit trail and lets the
   * dashboard / reports show "Deleted Bill Amount" as its own metric
   * and the Money Out page list every voided bill.
   *
   * We also:
   *   • reverse the auto-added MoneyIn row that bills.create() inserted
   *     (matched by description "Bill #<billNo> (Table <n>)") so the
   *     cash flow ties out — otherwise the deleted sale would still be
   *     counted as income
   *   • free the table if it was still tied to this order
   *   • track the deletion in the audit log
   */ delete (id, opts) {
        const bill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Bill WHERE id = ?', [
            id
        ]);
        if (!bill) return false;
        const now = new Date().toISOString();
        const deletedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        // 1) Archive a full snapshot into DeletedBill BEFORE deleting the bill.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO DeletedBill
        (id, shopId, originalBillId, billNo, orderId, tableNumber, subtotal, taxRate, taxAmount, discount, serviceCharge, total, paymentMode, paymentStatus, originalPaidAt, originalCreatedAt, reason, deletedBy, deletedById, deletedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            deletedId,
            bill.shopId,
            bill.id,
            bill.billNo,
            bill.orderId,
            bill.tableNumber,
            bill.subtotal || 0,
            bill.taxRate || 0,
            bill.taxAmount || 0,
            bill.discount || 0,
            bill.serviceCharge || 0,
            bill.total || 0,
            bill.paymentMode || 'cash',
            bill.paymentStatus || 'paid',
            bill.paidAt,
            bill.createdAt,
            opts?.reason || null,
            opts?.deletedBy || null,
            opts?.deletedById || null,
            now
        ]);
        // 2) Reverse the auto-added MoneyIn row from when the bill was created.
        //    bills.create() inserts a MoneyIn with description `Bill #<n> (Table <n>)`
        //    and source = 'Sale'. We match on that description so we only remove
        //    the income that was tied to THIS bill, nothing else.
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`DELETE FROM MoneyIn
         WHERE shopId = ? AND source = 'Sale'
           AND description = ?
           AND date >= ?`, [
                bill.shopId,
                `Bill #${bill.billNo} (Table ${bill.tableNumber})`,
                bill.paidAt
            ]);
        } catch (e) {
            console.warn('[bills.delete] MoneyIn reversal failed (non-fatal):', e);
        }
        // 3) Free the table if it still points at this order.
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE RestaurantTable SET status = ?, currentOrderId = NULL WHERE currentOrderId = ?', [
                'available',
                bill.orderId
            ]);
        } catch (e) {
            console.warn('[bills.delete] table free failed (non-fatal):', e);
        }
        // 4) Delete the bill itself. OrderItem + Order cascade via FK ON DELETE CASCADE.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM Bill WHERE id = ?', [
            id
        ]);
        // 5) Audit log entry.
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO AuditLog (id, shopId, userId, userName, action, details, createdAt)
         VALUES (?,?,?,?,?,?,?)`, [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])(),
                bill.shopId,
                opts?.deletedById || null,
                opts?.deletedBy || null,
                'bill_delete',
                JSON.stringify({
                    billId: bill.id,
                    billNo: bill.billNo,
                    total: bill.total,
                    tableNumber: bill.tableNumber,
                    paymentMode: bill.paymentMode,
                    reason: opts?.reason || null
                }),
                now
            ]);
        } catch (e) {
            console.warn('[bills.delete] audit log failed (non-fatal):', e);
        }
        // 6) Track sync. We push the deleted bill row to Supabase so other
        //    devices converge, and also push the DeletedBill snapshot.
        trackDelete('Bill', id);
        const snap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM DeletedBill WHERE id = ?', [
            deletedId
        ]);
        if (snap) trackUpsert('DeletedBill', snap);
        return true;
    }
};
const deletedBills = {
    /**
   * List all deleted bills for a shop, newest deletion first.
   * Optionally filter by date range (matched on originalPaidAt so the
   * bill is attributed to the day it was actually paid, not deleted).
   */ list (shopId, filters) {
        let sql = 'SELECT * FROM DeletedBill WHERE shopId = ?';
        const params = [
            shopId
        ];
        if (filters?.from) {
            sql += ' AND originalPaidAt >= ?';
            params.push(filters.from);
        }
        if (filters?.to) {
            sql += ' AND originalPaidAt <= ?';
            params.push(filters.to);
        }
        sql += ' ORDER BY deletedAt DESC';
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, params);
    },
    /** Aggregate totals for a shop, optionally filtered by date range. */ totals (shopId, filters) {
        let sql = 'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM DeletedBill WHERE shopId = ?';
        const params = [
            shopId
        ];
        if (filters?.from) {
            sql += ' AND originalPaidAt >= ?';
            params.push(filters.from);
        }
        if (filters?.to) {
            sql += ' AND originalPaidAt <= ?';
            params.push(filters.to);
        }
        const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])(sql, params);
        return {
            count: row?.count || 0,
            total: row?.total || 0
        };
    }
};
const settings = {
    get (shopId) {
        let row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM ShopSetting WHERE shopId = ?', [
            shopId
        ]);
        if (!row) {
            const shop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Shop WHERE id = ?', [
                shopId
            ]);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO ShopSetting (id, shopId, shopName) VALUES (?,?)', [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])(),
                shopId,
                shop?.name || 'Restaurant'
            ]);
            row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM ShopSetting WHERE shopId = ?', [
                shopId
            ]);
        }
        return convertSettings(row);
    },
    update (shopId, data) {
        let row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM ShopSetting WHERE shopId = ?', [
            shopId
        ]);
        if (!row) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO ShopSetting (id, shopId) VALUES (?,?)', [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])(),
                shopId
            ]);
            row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM ShopSetting WHERE shopId = ?', [
                shopId
            ]);
        }
        const sets = [];
        const params = [];
        for (const [key, value] of Object.entries(data)){
            if (value != null) {
                sets.push(`${key} = ?`);
                params.push(typeof value === 'boolean' ? value ? 1 : 0 : value);
            }
        }
        if (sets.length === 0) return this.get(shopId);
        params.push(shopId);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`UPDATE ShopSetting SET ${sets.join(', ')} WHERE shopId = ?`, params);
        // Note: ShopSetting is intentionally NOT synced to Supabase — settings
        // are per-device (printer config, etc.) and shouldn't clobber another
        // device's settings.
        return this.get(shopId);
    }
};
const users = {
    list () {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT id, name, email, role, active, shopId, createdAt FROM AppUser ORDER BY createdAt DESC').map(convertUser);
    },
    create (data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO AppUser (id, name, email, password, role, active, shopId) VALUES (?,?,?,?,?,?,?)', [
            id,
            data.name,
            data.email.toLowerCase(),
            data.password,
            data.role || 'staff',
            data.active !== false ? 1 : 0,
            data.shopId || null
        ]);
        return {
            id,
            name: data.name,
            email: data.email,
            role: data.role || 'staff'
        };
    },
    update (id, data) {
        const sets = [];
        const params = [];
        if (data.name != null) {
            sets.push('name = ?');
            params.push(data.name);
        }
        if (data.email != null) {
            sets.push('email = ?');
            params.push(data.email.toLowerCase());
        }
        if (data.role != null) {
            sets.push('role = ?');
            params.push(data.role);
        }
        if (data.active != null) {
            sets.push('active = ?');
            params.push(data.active ? 1 : 0);
        }
        if (data.password) {
            sets.push('password = ?');
            params.push(data.password);
        }
        if (data.shopId !== undefined) {
            sets.push('shopId = ?');
            params.push(data.shopId || null);
        }
        if (sets.length === 0) return null;
        params.push(id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`UPDATE AppUser SET ${sets.join(', ')} WHERE id = ?`, params);
        return {
            id,
            name: data.name,
            email: data.email,
            role: data.role
        };
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM AppUser WHERE id = ?', [
            id
        ]);
    }
};
const dashboard = {
    get (shopId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const todayBills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as s FROM Bill WHERE shopId = ? AND paidAt >= ?', [
            shopId,
            today.toISOString()
        ]);
        const monthBills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as s FROM Bill WHERE shopId = ? AND paidAt >= ?', [
            shopId,
            monthStart.toISOString()
        ]);
        const allBills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as s FROM Bill WHERE shopId = ?', [
            shopId
        ]);
        const menuCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c FROM MenuItem WHERE shopId = ?', [
            shopId
        ]);
        const customerCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c FROM Customer WHERE shopId = ?', [
            shopId
        ]);
        const supplierCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c FROM Supplier WHERE shopId = ?', [
            shopId
        ]);
        const occupiedTables = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c FROM RestaurantTable WHERE shopId = ? AND status = ? AND number > 0', [
            shopId,
            'occupied'
        ]);
        const totalTables = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c FROM RestaurantTable WHERE shopId = ? AND number > 0', [
            shopId
        ]);
        const recentBills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Bill WHERE shopId = ? ORDER BY paidAt DESC LIMIT 5', [
            shopId
        ]);
        const topItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(`
      SELECT oi.name, SUM(oi.quantity) as qty, SUM(oi.quantity * oi.price) as revenue
      FROM OrderItem oi
      JOIN Orders o ON oi.orderId = o.id
      WHERE o.shopId = ? AND o.createdAt >= ?
      GROUP BY oi.name
      ORDER BY qty DESC
      LIMIT 5
    `, [
            shopId,
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        ]);
        const lowStock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT name, stock, unit FROM MenuItem WHERE shopId = ? AND stock < 10 AND stock >= 0 ORDER BY stock ASC LIMIT 5', [
            shopId
        ]);
        const salesInRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COALESCE(SUM(total), 0) as s FROM Bill WHERE shopId = ? AND paidAt >= ?', [
            shopId,
            today.toISOString()
        ]);
        const otherInRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COALESCE(SUM(amount), 0) as s FROM MoneyIn WHERE shopId = ? AND date >= ?', [
            shopId,
            today.toISOString()
        ]);
        const expensesRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COALESCE(SUM(amount), 0) as s FROM Expense WHERE shopId = ? AND date >= ?', [
            shopId,
            today.toISOString()
        ]);
        const purchasesRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COALESCE(SUM(total), 0) as s FROM Purchase WHERE shopId = ? AND createdAt >= ?', [
            shopId,
            today.toISOString()
        ]);
        const otherOutRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COALESCE(SUM(amount), 0) as s FROM MoneyOut WHERE shopId = ? AND date >= ?', [
            shopId,
            today.toISOString()
        ]);
        // Deleted bills today (attributed by original paidAt, so a bill paid
        // yesterday but deleted today still counts against yesterday). This is
        // exposed as its own metric AND subtracted from net cash flow because
        // a voided sale is effectively money that left the till.
        const deletedTodayRow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c, COALESCE(SUM(total), 0) as s FROM DeletedBill WHERE shopId = ? AND originalPaidAt >= ?', [
            shopId,
            today.toISOString()
        ]);
        const salesIn = salesInRow?.s || 0;
        const otherIn = otherInRow?.s || 0;
        const expenses = expensesRow?.s || 0;
        const purchases = purchasesRow?.s || 0;
        const otherOut = otherOutRow?.s || 0;
        const deletedBillAmount = deletedTodayRow?.s || 0;
        const deletedBillCount = deletedTodayRow?.c || 0;
        const chartData = [];
        for(let i = 6; i >= 0; i--){
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            const row = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COALESCE(SUM(total), 0) as s FROM Bill WHERE shopId = ? AND paidAt >= ? AND paidAt < ?', [
                shopId,
                d.toISOString(),
                next.toISOString()
            ]);
            chartData.push({
                date: d.toISOString().slice(0, 10),
                revenue: row?.s || 0
            });
        }
        return {
            today: {
                revenue: todayBills?.s || 0,
                count: todayBills?.c || 0
            },
            month: {
                revenue: monthBills?.s || 0,
                count: monthBills?.c || 0
            },
            allTime: {
                revenue: allBills?.s || 0,
                count: allBills?.c || 0
            },
            catalog: {
                menuItems: menuCount?.c || 0,
                customers: customerCount?.c || 0,
                suppliers: supplierCount?.c || 0
            },
            tables: {
                occupied: occupiedTables?.c || 0,
                total: totalTables?.c || 0
            },
            recentBills: recentBills || [],
            topItems: topItems || [],
            lowStock: lowStock || [],
            // Exposed as its own block so the dashboard UI can render a
            // "Deleted Bills" stat card. The amount is also rolled into the
            // cashFlow.net calculation below as an outflow.
            deletedBills: {
                amount: deletedBillAmount,
                count: deletedBillCount
            },
            cashFlow: {
                salesIn,
                otherIn,
                expenses,
                purchases,
                otherOut,
                deletedBills: deletedBillAmount,
                net: salesIn + otherIn - expenses - purchases - otherOut - deletedBillAmount
            },
            chartData
        };
    }
};
const zomato = {
    list (shopId, status) {
        const sql = status ? 'SELECT * FROM ZomatoOrder WHERE shopId = ? AND status = ? ORDER BY createdAt DESC' : 'SELECT * FROM ZomatoOrder WHERE shopId = ? ORDER BY createdAt DESC';
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, status ? [
            shopId,
            status
        ] : [
            shopId
        ]).map(convertZomatoOrder);
    },
    create (shopId, data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        const last = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT zomatoOrderId FROM ZomatoOrder WHERE shopId = ? ORDER BY zomatoOrderId DESC LIMIT 1', [
            shopId
        ]);
        const nextNum = last ? (parseInt(last.zomatoOrderId.replace(/\D/g, '')) || 1000) + 1 : 1001;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO ZomatoOrder (id, shopId, zomatoOrderId, customerName, customerPhone, deliveryType, address, items, subtotal, taxAmount, packagingCharge, deliveryFee, discount, total, paymentMode, status, notes)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
            id,
            shopId,
            `ZOM-${nextNum}`,
            data.customerName,
            data.customerPhone || null,
            data.deliveryType || 'delivery',
            data.address || null,
            JSON.stringify(data.items),
            data.subtotal,
            data.taxAmount || 0,
            data.packagingCharge || 0,
            data.deliveryFee || 0,
            data.discount || 0,
            data.total,
            data.paymentMode || 'prepaid',
            'new',
            data.notes || null
        ]);
        return this.getById(id);
    },
    getById (id) {
        return convertZomatoOrder((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM ZomatoOrder WHERE id = ?', [
            id
        ]));
    },
    updateStatus (id, status) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE ZomatoOrder SET status = ? WHERE id = ?', [
            status,
            id
        ]);
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM ZomatoOrder WHERE id = ?', [
            id
        ]);
    },
    pushToKitchen (shopId, zomatoOrderId) {
        const zomato = this.getById(zomatoOrderId);
        if (!zomato || zomato.internalOrderId) return null;
        const items = JSON.parse(zomato.items || '[]');
        // Find Direct Counter table
        let directTable = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM RestaurantTable WHERE shopId = ? AND number = 0', [
            shopId
        ]);
        if (!directTable) {
            directTable = {
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])()
            };
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO RestaurantTable (id, shopId, number, name, capacity, status) VALUES (?,?,?,?,?,?)', [
                directTable.id,
                shopId,
                0,
                'Direct Counter',
                0,
                'available'
            ]);
        }
        const order = orders.create(shopId, directTable.id, zomato.deliveryType === 'pickup' ? 'takeaway' : 'direct', 1, undefined, zomato.customerName, `Zomato Order ${zomato.zomatoOrderId}`);
        for (const it of items){
            const menuMatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM MenuItem WHERE shopId = ? AND name = ?', [
                shopId,
                it.name
            ]);
            let menuItemId = menuMatch?.id;
            if (!menuItemId) {
                menuItemId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO MenuItem (id, shopId, name, category, price, cost, stock, unit, available) VALUES (?,?,?,?,?,?,?,?,?)', [
                    menuItemId,
                    shopId,
                    it.name,
                    'General',
                    it.price,
                    0,
                    0,
                    'Pcs',
                    1
                ]);
            }
            orders.addItem(order.id, menuItemId, it.name, it.price, it.qty);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE Orders SET status = ?, kotPrinted = 1 WHERE id = ?', [
            'sent',
            order.id
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE RestaurantTable SET status = ?, currentOrderId = ? WHERE id = ?', [
            'occupied',
            order.id,
            directTable.id
        ]);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE ZomatoOrder SET internalOrderId = ?, status = ? WHERE id = ?', [
            order.id,
            'accepted',
            zomatoOrderId
        ]);
        return order;
    }
};
const audit = {
    log (action, details, shopId, userName) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO AuditLog (id, shopId, userName, action, details) VALUES (?,?,?,?,?)', [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])(),
            shopId || null,
            userName || null,
            action,
            details ? JSON.stringify(details) : null
        ]);
    },
    list (shopId, action) {
        let sql = 'SELECT * FROM AuditLog';
        const params = [];
        const conditions = [];
        if (shopId) {
            conditions.push('shopId = ?');
            params.push(shopId);
        }
        if (action) {
            conditions.push('action = ?');
            params.push(action);
        }
        if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY createdAt DESC LIMIT 500';
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(sql, params);
    }
};
const syncQueue = {
    add (eventType, payload) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO SyncOutbox (id, eventType, payload) VALUES (?,?,?)', [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])(),
            eventType,
            JSON.stringify(payload)
        ]);
    },
    getPending () {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM SyncOutbox WHERE status = ? ORDER BY createdAt ASC', [
            'pending'
        ]);
    },
    markSynced (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE SyncOutbox SET status = ?, syncedAt = ? WHERE id = ?', [
            'synced',
            new Date().toISOString(),
            id
        ]);
    },
    markFailed (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE SyncOutbox SET attempts = attempts + 1 WHERE id = ?', [
            id
        ]);
    }
};
const shops = {
    list () {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Shop ORDER BY name').map(convertShop);
    },
    listActive () {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Shop WHERE active = 1 ORDER BY name').map(convertShop);
    },
    getById (id) {
        return convertShop((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Shop WHERE id = ?', [
            id
        ]));
    },
    create (data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO Shop (id, name, code, color, address, phone, gstin, taxRate, currency) VALUES (?,?,?,?,?,?,?,?,?)', [
            id,
            data.name,
            (data.code || data.name.substring(0, 4)).toUpperCase(),
            data.color || 'orange',
            data.address || null,
            data.phone || null,
            data.gstin || null,
            data.taxRate ?? 0,
            data.currency || 'Rs.'
        ]);
        const created = this.getById(id);
        if (created) trackUpsert('Shop', created);
        return created;
    },
    update (id, data) {
        const sets = [];
        const params = [];
        if (data.name) {
            sets.push('name = ?');
            params.push(data.name);
        }
        if (data.code) {
            sets.push('code = ?');
            params.push(data.code);
        }
        if (data.color) {
            sets.push('color = ?');
            params.push(data.color);
        }
        if (data.address !== undefined) {
            sets.push('address = ?');
            params.push(data.address);
        }
        if (data.phone !== undefined) {
            sets.push('phone = ?');
            params.push(data.phone);
        }
        if (data.gstin !== undefined) {
            sets.push('gstin = ?');
            params.push(data.gstin);
        }
        if (data.taxRate !== undefined) {
            sets.push('taxRate = ?');
            params.push(data.taxRate);
        }
        if (data.currency) {
            sets.push('currency = ?');
            params.push(data.currency);
        }
        if (data.active !== undefined) {
            sets.push('active = ?');
            params.push(data.active ? 1 : 0);
        }
        if (!sets.length) return this.getById(id);
        params.push(id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`UPDATE Shop SET ${sets.join(', ')}, updatedAt = datetime('now') WHERE id = ?`, params);
        const updated = this.getById(id);
        if (updated) trackUpsert('Shop', updated);
        return updated;
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM Shop WHERE id = ?', [
            id
        ]);
        trackDelete('Shop', id);
    }
};
const customers = {
    list (shopId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Customer WHERE shopId = ? ORDER BY createdAt DESC', [
            shopId
        ]);
    },
    create (shopId, data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO Customer (id, shopId, name, phone, email, address, notes) VALUES (?,?,?,?,?,?,?)', [
            id,
            shopId,
            data.name,
            data.phone || null,
            data.email || null,
            data.address || null,
            data.notes || null
        ]);
        const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Customer WHERE id = ?', [
            id
        ]);
        if (created) trackUpsert('Customer', created);
        return created;
    },
    update (id, data) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`UPDATE Customer SET name = ?, phone = ?, email = ?, address = ?, notes = ?, updatedAt = datetime('now') WHERE id = ?`, [
            data.name,
            data.phone || null,
            data.email || null,
            data.address || null,
            data.notes || null,
            id
        ]);
        const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Customer WHERE id = ?', [
            id
        ]);
        if (updated) trackUpsert('Customer', updated);
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM Customer WHERE id = ?', [
            id
        ]);
        trackDelete('Customer', id);
    }
};
const suppliers = {
    list (shopId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Supplier WHERE shopId = ? ORDER BY createdAt DESC', [
            shopId
        ]);
    },
    create (shopId, data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO Supplier (id, shopId, name, phone, email, address, notes) VALUES (?,?,?,?,?,?,?)', [
            id,
            shopId,
            data.name,
            data.phone || null,
            data.email || null,
            data.address || null,
            data.notes || null
        ]);
        const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Supplier WHERE id = ?', [
            id
        ]);
        if (created) trackUpsert('Supplier', created);
        return created;
    },
    update (id, data) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`UPDATE Supplier SET name = ?, phone = ?, email = ?, address = ?, notes = ?, updatedAt = datetime('now') WHERE id = ?`, [
            data.name,
            data.phone || null,
            data.email || null,
            data.address || null,
            data.notes || null,
            id
        ]);
        const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Supplier WHERE id = ?', [
            id
        ]);
        if (updated) trackUpsert('Supplier', updated);
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM Supplier WHERE id = ?', [
            id
        ]);
        trackDelete('Supplier', id);
    }
};
const purchases = {
    list (shopId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Purchase WHERE shopId = ? ORDER BY createdAt DESC', [
            shopId
        ]);
    },
    create (shopId, data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        const items = JSON.stringify(data.items || []);
        const total = data.items?.reduce((s, it)=>s + (it.total || 0), 0) || data.total || 0;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])(`INSERT INTO Purchase (id, shopId, invoiceNumber, supplierId, supplierName, subtotal, taxAmount, total, paymentMode, notes, items)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`, [
            id,
            shopId,
            data.invoiceNumber || `INV-${Date.now()}`,
            data.supplierId || null,
            data.supplierName || null,
            data.subtotal || total,
            data.taxAmount || 0,
            total,
            data.paymentMode || 'cash',
            data.notes || null,
            items
        ]);
        for (const it of data.items || []){
            if (it.menuItemId) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('UPDATE MenuItem SET stock = stock + ? WHERE id = ?', [
                    Number(it.qty) || 0,
                    it.menuItemId
                ]);
                const mi = menu.getById(it.menuItemId);
                if (mi) trackUpsert('MenuItem', mi);
            }
        }
        const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Purchase WHERE id = ?', [
            id
        ]);
        if (created) trackUpsert('Purchase', created);
        return created;
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM Purchase WHERE id = ?', [
            id
        ]);
        trackDelete('Purchase', id);
    }
};
const expenses = {
    list (shopId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Expense WHERE shopId = ? ORDER BY date DESC', [
            shopId
        ]);
    },
    create (shopId, data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO Expense (id, shopId, category, description, amount, paymentMode, date) VALUES (?,?,?,?,?,?,?)', [
            id,
            shopId,
            data.category,
            data.description,
            data.amount,
            data.paymentMode || 'cash',
            data.date || new Date().toISOString()
        ]);
        const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM Expense WHERE id = ?', [
            id
        ]);
        if (created) trackUpsert('Expense', created);
        return created;
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM Expense WHERE id = ?', [
            id
        ]);
        trackDelete('Expense', id);
    }
};
const moneyIn = {
    list (shopId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM MoneyIn WHERE shopId = ? ORDER BY date DESC', [
            shopId
        ]);
    },
    create (shopId, data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO MoneyIn (id, shopId, amount, source, description, partyName, paymentMode, date) VALUES (?,?,?,?,?,?,?,?)', [
            id,
            shopId,
            data.amount,
            data.source || data.category || 'Investment',
            data.description || null,
            data.partyName || null,
            data.paymentMode || 'cash',
            data.date || new Date().toISOString()
        ]);
        const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM MoneyIn WHERE id = ?', [
            id
        ]);
        if (created) trackUpsert('MoneyIn', created);
        return created;
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM MoneyIn WHERE id = ?', [
            id
        ]);
        trackDelete('MoneyIn', id);
    }
};
const moneyOut = {
    list (shopId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM MoneyOut WHERE shopId = ? ORDER BY date DESC', [
            shopId
        ]);
    },
    create (shopId, data) {
        const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["genId"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO MoneyOut (id, shopId, amount, purpose, description, partyName, paymentMode, date) VALUES (?,?,?,?,?,?,?,?)', [
            id,
            shopId,
            data.amount,
            data.purpose || data.category || 'Owner Draw',
            data.description || null,
            data.partyName || null,
            data.paymentMode || 'cash',
            data.date || new Date().toISOString()
        ]);
        const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM MoneyOut WHERE id = ?', [
            id
        ]);
        if (created) trackUpsert('MoneyOut', created);
        return created;
    },
    delete (id) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM MoneyOut WHERE id = ?', [
            id
        ]);
        trackDelete('MoneyOut', id);
    }
};
const reports = {
    get (shopId, filtersOrFrom, maybeTo) {
        // Backward-compat: callers can still pass (shopId, from, to) directly.
        // New callers should pass (shopId, { from, to, paymentMode, ... }).
        const filters = typeof filtersOrFrom === 'string' ? {
            from: filtersOrFrom,
            to: maybeTo
        } : filtersOrFrom || {};
        const fromIso = filters.from ? new Date(filters.from).toISOString() : new Date(0).toISOString();
        const toIso = filters.to ? new Date(filters.to).toISOString() : new Date().toISOString();
        // Pull all bills in the date window, then attach their orders + items
        // so we can filter by item/category/waiter client-side. SQLite on the
        // client doesn't have great JOIN support via sql.js, so we do it in JS.
        const billRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Bill WHERE shopId = ? AND paidAt >= ? AND paidAt <= ? ORDER BY paidAt DESC', [
            shopId,
            fromIso,
            toIso
        ]);
        // Attach order + items to each bill (needed for itemized table + filters)
        const bills = billRows.map((b)=>{
            const order = orders.getById(b.orderId);
            return {
                ...b,
                order
            };
        });
        const expensesList = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Expense WHERE shopId = ? AND date >= ? AND date <= ?', [
            shopId,
            fromIso,
            toIso
        ]);
        const purchasesList = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM Purchase WHERE shopId = ? AND createdAt >= ? AND createdAt <= ?', [
            shopId,
            fromIso,
            toIso
        ]);
        // Deleted bills in the same window — attributed by originalPaidAt so
        // the report for a given day/month correctly shows what was voided
        // from that period's sales.
        const deletedBillsList = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM DeletedBill WHERE shopId = ? AND originalPaidAt >= ? AND originalPaidAt <= ? ORDER BY deletedAt DESC', [
            shopId,
            fromIso,
            toIso
        ]);
        // ─── Apply advanced filters ──────────────────────────────────────────
        let filteredBills = bills;
        if (filters.paymentMode && filters.paymentMode !== 'all') {
            filteredBills = filteredBills.filter((b)=>b.paymentMode === filters.paymentMode);
        }
        if (filters.tableNumber != null && !Number.isNaN(filters.tableNumber)) {
            filteredBills = filteredBills.filter((b)=>b.tableNumber === filters.tableNumber);
        }
        if (filters.billNoSearch) {
            const term = String(filters.billNoSearch).toLowerCase();
            filteredBills = filteredBills.filter((b)=>String(b.billNo).includes(term));
        }
        if (filters.itemSearch) {
            const term = String(filters.itemSearch).toLowerCase();
            filteredBills = filteredBills.filter((b)=>(b.order?.items || []).some((it)=>String(it.name || '').toLowerCase().includes(term)));
        }
        if (filters.category && filters.category !== 'all') {
            filteredBills = filteredBills.filter((b)=>(b.order?.items || []).some((it)=>{
                    // OrderItem doesn't store category directly; we look it up from
                    // the menu by menuItemId if available, else by name match.
                    const mi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT category FROM MenuItem WHERE id = ?', [
                        it.menuItemId
                    ]);
                    return mi?.category === filters.category;
                }));
        }
        if (filters.waiter) {
            const term = String(filters.waiter).toLowerCase();
            filteredBills = filteredBills.filter((b)=>String(b.order?.waiterName || '').toLowerCase().includes(term));
        }
        if (filters.minAmount != null && !Number.isNaN(filters.minAmount)) {
            filteredBills = filteredBills.filter((b)=>Number(b.total) >= filters.minAmount);
        }
        if (filters.maxAmount != null && !Number.isNaN(filters.maxAmount)) {
            filteredBills = filteredBills.filter((b)=>Number(b.total) <= filters.maxAmount);
        }
        // ─── Build itemized rows (one row per line item across all filtered bills) ───
        // This powers the detailed sales table and the per-item breakdown.
        const itemizedRows = [];
        for (const b of filteredBills){
            const items = (b.order?.items || []).filter((it)=>it.status !== 'cancelled');
            for (const it of items){
                const mi = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["queryOne"])('SELECT category FROM MenuItem WHERE id = ?', [
                    it.menuItemId
                ]);
                itemizedRows.push({
                    billNo: b.billNo,
                    paidAt: b.paidAt,
                    tableNumber: b.tableNumber,
                    waiterName: b.order?.waiterName || null,
                    customerName: b.order?.customerName || null,
                    paymentMode: b.paymentMode,
                    itemName: it.name,
                    category: mi?.category || 'General',
                    quantity: Number(it.quantity) || 0,
                    price: Number(it.price) || 0,
                    lineTotal: (Number(it.quantity) || 0) * (Number(it.price) || 0),
                    billTotal: Number(b.total) || 0
                });
            }
        }
        // ─── Aggregates from FILTERED bills ──────────────────────────────────
        const salesRevenue = filteredBills.reduce((s, b)=>s + (b.total || 0), 0);
        const totalExpenses = expensesList.reduce((s, e)=>s + (e.amount || 0), 0);
        const totalPurchases = purchasesList.reduce((s, p)=>s + (p.total || 0), 0);
        const deletedBillAmount = deletedBillsList.reduce((s, d)=>s + (d.total || 0), 0);
        const totalItemsSold = itemizedRows.reduce((s, r)=>s + (r.quantity || 0), 0);
        // Payment breakdown — count + total
        const byPaymentMap = {};
        for (const b of filteredBills){
            const m = b.paymentMode || 'other';
            if (!byPaymentMap[m]) byPaymentMap[m] = {
                count: 0,
                total: 0
            };
            byPaymentMap[m].count++;
            byPaymentMap[m].total += b.total || 0;
        }
        // Top items (by qty) — computed from itemizedRows.
        // Includes category so the UI can show it in the item-wise table.
        const topItemsMap = {};
        for (const r of itemizedRows){
            if (!topItemsMap[r.itemName]) topItemsMap[r.itemName] = {
                name: r.itemName,
                category: r.category,
                qty: 0,
                revenue: 0
            };
            topItemsMap[r.itemName].qty += r.quantity;
            topItemsMap[r.itemName].revenue += r.lineTotal;
        }
        const topItems = Object.values(topItemsMap).sort((a, b)=>b.qty - a.qty).slice(0, 100);
        // Category breakdown
        const categoryMap = {};
        for (const r of itemizedRows){
            if (!categoryMap[r.category]) categoryMap[r.category] = {
                qty: 0,
                revenue: 0
            };
            categoryMap[r.category].qty += r.quantity;
            categoryMap[r.category].revenue += r.lineTotal;
        }
        const byCategory = Object.entries(categoryMap).map(([name, v])=>({
                name,
                qty: v.qty,
                revenue: v.revenue
            })).sort((a, b)=>b.revenue - a.revenue);
        // Expense breakdown
        const expenseByCategory = {};
        for (const e of expensesList)expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + (e.amount || 0);
        // Daily breakdown (sales per day)
        const dailyMap = {};
        for (const b of filteredBills){
            const day = (b.paidAt || '').slice(0, 10);
            if (!day) continue;
            if (!dailyMap[day]) dailyMap[day] = {
                sales: 0,
                expenses: 0,
                count: 0
            };
            dailyMap[day].sales += b.total || 0;
            dailyMap[day].count++;
        }
        for (const e of expensesList){
            const day = (e.date || '').slice(0, 10);
            if (!day) continue;
            if (!dailyMap[day]) dailyMap[day] = {
                sales: 0,
                expenses: 0,
                count: 0
            };
            dailyMap[day].expenses += e.amount || 0;
        }
        const dailyBreakdown = Object.entries(dailyMap).map(([date, v])=>({
                date,
                sales: v.sales,
                expenses: v.expenses,
                count: v.count
            })).sort((a, b)=>a.date.localeCompare(b.date));
        // Hourly breakdown (sales by hour of day) — useful for staffing decisions
        const hourlyMap = {};
        for(let h = 0; h < 24; h++)hourlyMap[h] = {
            sales: 0,
            count: 0
        };
        for (const b of filteredBills){
            const d = new Date(b.paidAt);
            const h = d.getHours();
            hourlyMap[h].sales += b.total || 0;
            hourlyMap[h].count++;
        }
        const hourlyBreakdown = Object.entries(hourlyMap).map(([hour, v])=>({
                hour: Number(hour),
                label: `${String(hour).padStart(2, '0')}:00`,
                sales: v.sales,
                count: v.count
            }));
        return {
            summary: {
                salesRevenue,
                totalExpenses,
                totalPurchases,
                deletedBillAmount,
                deletedBillCount: deletedBillsList.length,
                netProfit: salesRevenue - totalExpenses - totalPurchases - deletedBillAmount,
                cashFlow: salesRevenue - totalExpenses - totalPurchases - deletedBillAmount,
                billCount: filteredBills.length,
                avgBill: filteredBills.length ? salesRevenue / filteredBills.length : 0,
                totalItemsSold
            },
            byPayment: byPaymentMap,
            byCategory,
            topItems,
            expenseByCategory,
            dailyBreakdown,
            hourlyBreakdown,
            // bills now have .order attached so the UI can show itemized rows
            bills: filteredBills,
            // Flat one-row-per-line-item table — for the detailed sales report
            itemizedRows,
            deletedBills: deletedBillsList
        };
    }
};
// ═══════════════════════════════════════
//  CONVERTERS (SQLite integer → JS boolean/types)
// ═══════════════════════════════════════
function convertShop(row) {
    return {
        ...row,
        active: !!row.active
    };
}
function convertMenuItem(row) {
    return {
        ...row,
        available: !!row.available
    };
}
function convertTable(row) {
    return {
        ...row,
        status: row.status
    };
}
function convertOrder(row) {
    return {
        ...row,
        kotPrinted: !!row.kotPrinted,
        billPrinted: !!row.billPrinted
    };
}
function convertOrderItem(row) {
    return {
        ...row
    };
}
function convertBill(row) {
    return {
        ...row
    };
}
function convertSettings(row) {
    if (!row) return null;
    const boolKeys = [
        'billShowLogo',
        'billShowGstin',
        'billShowPhone',
        'billShowAddress',
        'billShowEmail',
        'billShowDateTime',
        'billShowWaiter',
        'billShowCustomer',
        'billShowKotNo',
        'kotShowLogo',
        'kotShowWaiter',
        'kotShowDateTime',
        'kotShowTable',
        'kotShowGuests',
        'zomatoEnabled'
    ];
    const result = {
        ...row
    };
    for (const key of boolKeys){
        if (key in result) result[key] = !!result[key];
    }
    return result;
}
function convertUser(row) {
    return {
        ...row,
        active: !!row.active
    };
}
function convertZomatoOrder(row) {
    if (!row) return null;
    return {
        ...row
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/client-db.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "downloadLatestExcel",
    ()=>downloadLatestExcel,
    "execute",
    ()=>execute,
    "genId",
    ()=>genId,
    "getDB",
    ()=>getDB,
    "initDB",
    ()=>initDB,
    "isDbReady",
    ()=>isDbReady,
    "persistDB",
    ()=>persistDB,
    "persistDBSync",
    ()=>persistDBSync,
    "query",
    ()=>query,
    "queryOne",
    ()=>queryOne,
    "startPeriodicSave",
    ()=>startPeriodicSave
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sql$2e$js$2f$dist$2f$sql$2d$wasm$2d$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sql.js/dist/sql-wasm-browser.js [app-client] (ecmascript)");
'use client';
;
/**
 * ClientSideDB — Offline-first SQLite in the browser via WebAssembly
 *
 * Architecture:
 * - sql.js loads SQLite as WebAssembly in the browser
 * - Database file persisted in IndexedDB (survives page reload)
 * - ALL data operations happen client-side — NO server needed
 * - Works in APK (Capacitor), EXE (Tauri/Electron), and browser
 * - Supabase used ONLY for KOT event sync (not data storage)
 */ let db = null;
let initialized = false;
const DB_KEY = 'thuso-database';
const DB_VERSION = 1;
// ─── IndexedDB helpers (for persisting SQLite file) ───
function openIDB() {
    return new Promise((resolve, reject)=>{
        const req = indexedDB.open('thuso', DB_VERSION);
        req.onupgradeneeded = ()=>{
            req.result.createObjectStore('database');
        };
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error);
    });
}
async function saveDB(database) {
    const idb = await openIDB();
    const data = database.export();
    return new Promise((resolve, reject)=>{
        const tx = idb.transaction('database', 'readwrite');
        tx.objectStore('database').put(data, DB_KEY);
        tx.oncomplete = ()=>{
            idb.close();
            resolve();
        };
        tx.onerror = ()=>{
            idb.close();
            reject(tx.error);
        };
    });
}
async function loadDB() {
    const idb = await openIDB();
    return new Promise((resolve, reject)=>{
        const tx = idb.transaction('database', 'readonly');
        const req = tx.objectStore('database').get(DB_KEY);
        req.onsuccess = ()=>{
            idb.close();
            resolve(req.result || null);
        };
        req.onerror = ()=>{
            idb.close();
            reject(req.error);
        };
    });
}
// ─── Schema creation ───
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS Shop (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  gstin TEXT,
  taxRate REAL NOT NULL DEFAULT 0,
  serviceRate REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'Rs.',
  color TEXT NOT NULL DEFAULT 'orange',
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS MenuItem (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  price REAL NOT NULL,
  cost REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'Pcs',
  image TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_menuitem_shop_cat ON MenuItem(shopId, category);

CREATE TABLE IF NOT EXISTS RestaurantTable (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  number INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT 'Table',
  capacity INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'available',
  currentOrderId TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_table_shop_num ON RestaurantTable(shopId, number);

CREATE TABLE IF NOT EXISTS Orders (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  tableId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  type TEXT NOT NULL DEFAULT 'dine_in',
  guests INTEGER NOT NULL DEFAULT 1,
  waiterName TEXT,
  customerName TEXT,
  notes TEXT,
  kotPrinted INTEGER NOT NULL DEFAULT 0,
  billPrinted INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE,
  FOREIGN KEY (tableId) REFERENCES RestaurantTable(id)
);
CREATE INDEX IF NOT EXISTS idx_order_shop_status ON Orders(shopId, status);

CREATE TABLE IF NOT EXISTS OrderItem (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  menuItemId TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menuItemId) REFERENCES MenuItem(id)
);
CREATE INDEX IF NOT EXISTS idx_orderitem_order ON OrderItem(orderId);

CREATE TABLE IF NOT EXISTS Bill (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  billNo INTEGER NOT NULL,
  orderId TEXT NOT NULL UNIQUE,
  tableNumber INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  taxRate REAL NOT NULL DEFAULT 0,
  taxAmount REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  serviceCharge REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  paymentMode TEXT NOT NULL DEFAULT 'cash',
  paymentStatus TEXT NOT NULL DEFAULT 'paid',
  paidAt TEXT NOT NULL DEFAULT (datetime('now')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE,
  FOREIGN KEY (orderId) REFERENCES Orders(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bill_shop_no ON Bill(shopId, billNo);

CREATE TABLE IF NOT EXISTS AppUser (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  active INTEGER NOT NULL DEFAULT 1,
  shopId TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ShopSetting (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL UNIQUE,
  shopName TEXT NOT NULL DEFAULT 'Thuso',
  address TEXT, phone TEXT, email TEXT, gstin TEXT,
  taxRate REAL NOT NULL DEFAULT 0,
  serviceRate REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'Rs.',
  invoicePrefix TEXT NOT NULL DEFAULT 'INV',
  kotPrefix TEXT NOT NULL DEFAULT 'KOT',
  footerNote TEXT NOT NULL DEFAULT 'Thank you for dining with us!',
  billShowLogo INTEGER NOT NULL DEFAULT 1,
  billShowGstin INTEGER NOT NULL DEFAULT 1,
  billShowPhone INTEGER NOT NULL DEFAULT 1,
  billShowAddress INTEGER NOT NULL DEFAULT 1,
  billShowEmail INTEGER NOT NULL DEFAULT 0,
  billShowDateTime INTEGER NOT NULL DEFAULT 1,
  billShowWaiter INTEGER NOT NULL DEFAULT 1,
  billShowCustomer INTEGER NOT NULL DEFAULT 1,
  billShowKotNo INTEGER NOT NULL DEFAULT 1,
  billFontSize INTEGER NOT NULL DEFAULT 11,
  billHeaderAlign TEXT NOT NULL DEFAULT 'center',
  billExtraNote TEXT,
  billAccentColor TEXT NOT NULL DEFAULT '#f97316',
  kotShowLogo INTEGER NOT NULL DEFAULT 1,
  kotShowWaiter INTEGER NOT NULL DEFAULT 1,
  kotShowDateTime INTEGER NOT NULL DEFAULT 1,
  kotShowTable INTEGER NOT NULL DEFAULT 1,
  kotShowGuests INTEGER NOT NULL DEFAULT 1,
  kotFontSize INTEGER NOT NULL DEFAULT 12,
  kotHeaderAlign TEXT NOT NULL DEFAULT 'center',
  kotAccentColor TEXT NOT NULL DEFAULT '#f97316',
  kotExtraNote TEXT,
  zomatoEnabled INTEGER NOT NULL DEFAULT 0,
  zomatoApiKey TEXT,
  zomatoRestaurantId TEXT,
  zomatoApiBaseUrl TEXT,
  zomatoWebhookSecret TEXT,
  paperWidth INTEGER NOT NULL DEFAULT 80,
  printFontSize INTEGER NOT NULL DEFAULT 11,
  printMargin INTEGER NOT NULL DEFAULT 4,
  autoPrint INTEGER NOT NULL DEFAULT 1,
  billCopies INTEGER NOT NULL DEFAULT 1,
  silentPrint INTEGER NOT NULL DEFAULT 0,
  printHeaderText TEXT,
  printFooterText TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Customer (
  id TEXT PRIMARY KEY, shopId TEXT NOT NULL, name TEXT NOT NULL,
  phone TEXT, email TEXT, address TEXT, notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Supplier (
  id TEXT PRIMARY KEY, shopId TEXT NOT NULL, name TEXT NOT NULL,
  phone TEXT, email TEXT, address TEXT, notes TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Purchase (
  id TEXT PRIMARY KEY, shopId TEXT NOT NULL,
  invoiceNumber TEXT NOT NULL UNIQUE,
  supplierId TEXT, supplierName TEXT,
  subtotal REAL NOT NULL, taxAmount REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL, paymentMode TEXT NOT NULL DEFAULT 'cash',
  notes TEXT, items TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Expense (
  id TEXT PRIMARY KEY, shopId TEXT NOT NULL,
  category TEXT NOT NULL, description TEXT NOT NULL,
  amount REAL NOT NULL, paymentMode TEXT NOT NULL DEFAULT 'cash',
  date TEXT NOT NULL DEFAULT (datetime('now')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS MoneyIn (
  id TEXT PRIMARY KEY, shopId TEXT NOT NULL,
  amount REAL NOT NULL, source TEXT NOT NULL,
  description TEXT, partyName TEXT,
  paymentMode TEXT NOT NULL DEFAULT 'cash',
  date TEXT NOT NULL DEFAULT (datetime('now')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS MoneyOut (
  id TEXT PRIMARY KEY, shopId TEXT NOT NULL,
  amount REAL NOT NULL, purpose TEXT NOT NULL,
  description TEXT, partyName TEXT,
  paymentMode TEXT NOT NULL DEFAULT 'cash',
  date TEXT NOT NULL DEFAULT (datetime('now')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ZomatoOrder (
  id TEXT PRIMARY KEY, shopId TEXT NOT NULL,
  zomatoOrderId TEXT NOT NULL UNIQUE,
  customerName TEXT NOT NULL, customerPhone TEXT,
  deliveryType TEXT NOT NULL DEFAULT 'delivery',
  address TEXT, items TEXT NOT NULL,
  subtotal REAL NOT NULL, taxAmount REAL NOT NULL DEFAULT 0,
  packagingCharge REAL NOT NULL DEFAULT 0, deliveryFee REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0, total REAL NOT NULL,
  paymentMode TEXT NOT NULL DEFAULT 'prepaid',
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT, internalOrderId TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS LicenseKey (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  duration INTEGER NOT NULL DEFAULT 365,
  used INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS LicenseActivation (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  activatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  expiresAt TEXT NOT NULL,
  machineId TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS AuditLog (
  id TEXT PRIMARY KEY, shopId TEXT, userId TEXT, userName TEXT, userRole TEXT,
  action TEXT NOT NULL, details TEXT, ipAddress TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS SyncOutbox (
  id TEXT PRIMARY KEY,
  eventType TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  syncedAt TEXT
);

-- Deleted bills archive. When a bill is deleted (voided) we capture a
-- full snapshot here BEFORE the Bill row is removed, so:
--   • the dashboard / reports can show "Deleted Bill Amount" as its own
--     metric and subtract it from the net cash flow
--   • the Money Out page can list every deleted bill with reason + user
--   • an audit trail survives even after the original Bill row is gone
CREATE TABLE IF NOT EXISTS DeletedBill (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  originalBillId TEXT NOT NULL,
  billNo INTEGER NOT NULL,
  orderId TEXT NOT NULL,
  tableNumber INTEGER NOT NULL,
  subtotal REAL NOT NULL DEFAULT 0,
  taxRate REAL NOT NULL DEFAULT 0,
  taxAmount REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  serviceCharge REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL,
  paymentMode TEXT NOT NULL DEFAULT 'cash',
  paymentStatus TEXT NOT NULL DEFAULT 'paid',
  originalPaidAt TEXT NOT NULL,
  originalCreatedAt TEXT NOT NULL,
  reason TEXT,
  deletedBy TEXT,
  deletedById TEXT,
  deletedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_deletedbill_shop_deletedAt ON DeletedBill(shopId, deletedAt);
CREATE INDEX IF NOT EXISTS idx_deletedbill_shop_originalPaidAt ON DeletedBill(shopId, originalPaidAt);
CREATE INDEX IF NOT EXISTS idx_deletedbill_deletedById ON DeletedBill(deletedById);

-- Menu categories (per-shop, user-manageable). Mirrors the Prisma model
-- added for the server-side / Supabase migration. The client UI reads &
-- writes through here via the use-shop-fetch shim.
CREATE TABLE IF NOT EXISTS MenuCategory (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'slate',
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_menucategory_shop_name ON MenuCategory(shopId, name);
CREATE INDEX IF NOT EXISTS idx_menucategory_shop_sort ON MenuCategory(shopId, sortOrder);
`;
// ─── Seed data ───
const MENU_ITEMS = [
    {
        name: 'Maha Jumbo Sandwich',
        category: 'Sandwich',
        price: 150
    },
    {
        name: 'Cheese Chutney Sandwich',
        category: 'Sandwich',
        price: 90
    },
    {
        name: 'Ultimate Cheese Burst Pizza',
        category: 'Pizza',
        price: 250
    },
    {
        name: 'Royal Paneer Tandoori Pizza',
        category: 'Pizza',
        price: 200
    },
    {
        name: 'Classic Veg Delight Pizza',
        category: 'Pizza',
        price: 180
    },
    {
        name: 'Cheesy Corn Burst Pizza',
        category: 'Pizza',
        price: 180
    },
    {
        name: 'Thuso Special Loaded Maggie',
        category: 'Maggie',
        price: 180
    },
    {
        name: 'Tandoori Paneer Maggie',
        category: 'Maggie',
        price: 150
    },
    {
        name: 'Double Masala Cheese Maggie',
        category: 'Maggie',
        price: 100
    },
    {
        name: 'Cheese Corn Momos',
        category: 'Momos',
        price: 90
    },
    {
        name: 'Paneer Momos',
        category: 'Momos',
        price: 80
    },
    {
        name: 'Veg Momos',
        category: 'Momos',
        price: 70
    },
    {
        name: 'Double Tikki Cheese Royale Burger',
        category: 'Burgers',
        price: 130
    },
    {
        name: 'Classic Veg Cheese Burger',
        category: 'Burgers',
        price: 90
    },
    {
        name: 'Cheese Ling Chips',
        category: 'Chips & Fries',
        price: 100
    },
    {
        name: 'Peri Peri Fries',
        category: 'Chips & Fries',
        price: 90
    },
    {
        name: 'Salted Fries',
        category: 'Chips & Fries',
        price: 90
    },
    {
        name: 'Cold Coffee',
        category: 'Drinks',
        price: 80
    },
    {
        name: 'Classic Mojito',
        category: 'Drinks',
        price: 80
    },
    {
        name: 'Watermelon Juice',
        category: 'Juices',
        price: 70
    },
    {
        name: 'Papaya Juice',
        category: 'Juices',
        price: 70
    },
    {
        name: 'Muskmelon Juice',
        category: 'Juices',
        price: 80
    },
    {
        name: 'Pink Guava Juice',
        category: 'Juices',
        price: 80
    },
    {
        name: 'Chikoo Juice',
        category: 'Juices',
        price: 80
    },
    {
        name: 'Pineapple Juice',
        category: 'Juices',
        price: 90
    },
    {
        name: 'Alphonso Mango Juice',
        category: 'Juices',
        price: 90
    },
    {
        name: 'Custard Apple Juice',
        category: 'Juices',
        price: 90
    },
    {
        name: 'Oreo Shake',
        category: 'Shakes',
        price: 100
    },
    {
        name: 'KitKat Shake',
        category: 'Shakes',
        price: 100
    },
    {
        name: 'Watermelon Shake',
        category: 'Shakes',
        price: 100
    },
    {
        name: 'Papaya Shake',
        category: 'Shakes',
        price: 100
    },
    {
        name: 'Muskmelon Shake',
        category: 'Shakes',
        price: 110
    },
    {
        name: 'Pink Guava Shake',
        category: 'Shakes',
        price: 110
    },
    {
        name: 'Chikoo Shake',
        category: 'Shakes',
        price: 110
    },
    {
        name: 'Pineapple Shake',
        category: 'Shakes',
        price: 120
    },
    {
        name: 'Alphonso Mango Shake',
        category: 'Shakes',
        price: 120
    },
    {
        name: 'Custard Apple Shake',
        category: 'Shakes',
        price: 120
    }
];
const LICENSE_KEYS = [
    'SSYNC-PVKN-9U9R-HDCR',
    'SSYNC-L2U4-6QND-DZ2D',
    'SSYNC-QNQG-25HG-LMXK',
    'SSYNC-4GTM-DJ4T-TQ5H',
    'SSYNC-VZ4Y-7XAD-6JJF',
    'SSYNC-3H2E-RUFH-5YEE',
    'SSYNC-EPNX-49ZJ-ZUNP',
    'SSYNC-CQ26-NQ4P-EXHG',
    'SSYNC-NYM5-UHGD-257M',
    'SSYNC-8E6P-CPJ8-SH6Q',
    'SSYNC-CW5J-CJY2-4N35',
    'SSYNC-DV2E-YNQB-UESS',
    'SSYNC-RW8Y-2X3R-QAK5',
    'SSYNC-YX9E-VAFG-A438',
    'SSYNC-YBBG-AWF4-8SJB',
    'SSYNC-JLFC-KR6V-7HE3',
    'SSYNC-L2XC-NJMB-U7EG',
    'SSYNC-H36K-RD2Y-5XGW',
    'SSYNC-JFF9-N789-YGJ2',
    'SSYNC-3PAZ-HBEE-WAYR'
];
function genId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function seedDatabase(database) {
    // Check if already seeded
    const result = database.exec('SELECT COUNT(*) as count FROM Shop');
    if (result[0]?.values[0]?.[0] > 0) return;
    // ─── Single-shop setup ────────────────────────────────────────────────
    // This POS is configured for ONE shop only. The shop-picker screen is
    // skipped automatically because session.tsx auto-selects when the user
    // has exactly one shop. If you ever need multi-shop, re-add a second
    // INSERT here and the picker will reappear.
    const shopId = genId();
    database.run('INSERT INTO Shop (id, name, code, color, address, phone, gstin, taxRate, currency) VALUES (?,?,?,?,?,?,?,?,?)', [
        shopId,
        'Spice Garden',
        'SPICE',
        'orange',
        '12 Marine Drive, Mumbai',
        '+91 98200 11223',
        '27SPICE2024G1Z9',
        5,
        'Rs.'
    ]);
    // Seed settings for the single shop
    database.run(`INSERT INTO ShopSetting (id, shopId, shopName, billAccentColor, kotAccentColor) VALUES (?,?,?,?,?)`, [
        genId(),
        shopId,
        'Spice Garden',
        '#f97316',
        '#f97316'
    ]);
    // Seed tables (0=Direct Counter + 1-10)
    database.run('INSERT INTO RestaurantTable (id, shopId, number, name, capacity, status) VALUES (?,?,?,?,?,?)', [
        genId(),
        shopId,
        0,
        'Direct Counter',
        0,
        'available'
    ]);
    for(let i = 1; i <= 10; i++){
        database.run('INSERT INTO RestaurantTable (id, shopId, number, name, capacity, status) VALUES (?,?,?,?,?,?)', [
            genId(),
            shopId,
            i,
            `Table ${i}`,
            4,
            'available'
        ]);
    }
    // Seed menu items for the single shop
    for (const item of MENU_ITEMS){
        database.run('INSERT INTO MenuItem (id, shopId, name, category, price, cost, stock, unit, available) VALUES (?,?,?,?,?,?,?,?,?)', [
            genId(),
            shopId,
            item.name,
            item.category,
            item.price,
            Math.round(item.price * 0.4),
            100,
            'Pcs',
            1
        ]);
    }
    // Seed super admin
    database.run('INSERT INTO AppUser (id, name, email, password, role, active) VALUES (?,?,?,?,?,?)', [
        genId(),
        'Super Admin',
        'super@thuso.com',
        'admin123',
        'admin',
        1
    ]);
    // Seed license keys
    for (const key of LICENSE_KEYS){
        database.run('INSERT INTO LicenseKey (id, key, duration, used) VALUES (?,?,?,?)', [
            genId(),
            key,
            365,
            0
        ]);
    }
}
async function initDB() {
    if (db && initialized) return db;
    // Load sql.js WASM. Try local bundle FIRST (works offline + in APK/EXE),
    // fall back to CDN only if local file is missing (e.g. dev server misconfig).
    const wasmLocators = [
        (file)=>`./${file}`,
        (file)=>`/${file}`,
        (file)=>`https://sql.js.org/dist/${file}`
    ];
    let SQL = null;
    let lastErr = null;
    for (const locate of wasmLocators){
        try {
            SQL = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sql$2e$js$2f$dist$2f$sql$2d$wasm$2d$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                locateFile: locate
            });
            break;
        } catch (e) {
            lastErr = e;
        // try next locator
        }
    }
    if (!SQL) {
        console.error('[client-db] All sql.js WASM loaders failed:', lastErr);
        throw lastErr || new Error('Failed to load sql.js WASM');
    }
    // Try to load existing database from IndexedDB
    const existingData = await loadDB();
    if (existingData) {
        db = new SQL.Database(existingData);
        migrateSchema(db);
    } else {
        db = new SQL.Database();
        db.run(SCHEMA_SQL);
        seedDatabase(db);
        await saveDB(db);
    }
    initialized = true;
    return db;
}
// ─── Schema migrations (idempotent ALTER TABLE for missing columns) ───
function migrateSchema(database) {
    const getColumns = (table)=>{
        const result = database.exec(`PRAGMA table_info(${table})`);
        if (!result[0]) return [];
        return result[0].values.map((row)=>String(row[1]));
    };
    const addColumn = (table, column, defn)=>{
        const cols = getColumns(table);
        if (!cols.includes(column)) {
            try {
                database.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${defn}`);
            } catch (e) {
                console.warn(`[migrate] could not add ${table}.${column}:`, e);
            }
        }
    };
    addColumn('ShopSetting', 'paperWidth', 'INTEGER NOT NULL DEFAULT 80');
    addColumn('ShopSetting', 'printFontSize', 'INTEGER NOT NULL DEFAULT 11');
    addColumn('ShopSetting', 'printMargin', 'INTEGER NOT NULL DEFAULT 4');
    addColumn('ShopSetting', 'autoPrint', 'INTEGER NOT NULL DEFAULT 1');
    addColumn('ShopSetting', 'billCopies', 'INTEGER NOT NULL DEFAULT 1');
    addColumn('ShopSetting', 'silentPrint', 'INTEGER NOT NULL DEFAULT 0');
    addColumn('ShopSetting', 'printHeaderText', 'TEXT');
    addColumn('ShopSetting', 'printFooterText', 'TEXT');
    addColumn('Orders', 'customerName', 'TEXT');
    addColumn('Orders', 'type', "TEXT NOT NULL DEFAULT 'dine_in'");
    addColumn('MenuItem', 'image', 'TEXT');
    addColumn('MenuItem', 'cost', 'REAL NOT NULL DEFAULT 0');
    addColumn('MenuItem', 'stock', 'INTEGER NOT NULL DEFAULT 0');
    addColumn('MenuItem', 'unit', "TEXT NOT NULL DEFAULT 'Pcs'");
    addColumn('MenuItem', 'available', 'INTEGER NOT NULL DEFAULT 1');
    // ─── Idempotent table creation for upgrades ───────────────────────────
    // Existing user databases (in IndexedDB) won't have the DeletedBill or
    // MenuCategory tables because they were created before these features
    // existed. CREATE TABLE IF NOT EXISTS is safe to re-run on every boot.
    const ensureTable = (ddl)=>{
        try {
            database.run(ddl);
        } catch (e) {
            console.warn('[migrate] could not ensure table:', e);
        }
    };
    ensureTable(`CREATE TABLE IF NOT EXISTS DeletedBill (
    id TEXT PRIMARY KEY,
    shopId TEXT NOT NULL,
    originalBillId TEXT NOT NULL,
    billNo INTEGER NOT NULL,
    orderId TEXT NOT NULL,
    tableNumber INTEGER NOT NULL,
    subtotal REAL NOT NULL DEFAULT 0,
    taxRate REAL NOT NULL DEFAULT 0,
    taxAmount REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    serviceCharge REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    paymentMode TEXT NOT NULL DEFAULT 'cash',
    paymentStatus TEXT NOT NULL DEFAULT 'paid',
    originalPaidAt TEXT NOT NULL,
    originalCreatedAt TEXT NOT NULL,
    reason TEXT,
    deletedBy TEXT,
    deletedById TEXT,
    deletedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
  )`);
    ensureTable('CREATE INDEX IF NOT EXISTS idx_deletedbill_shop_deletedAt ON DeletedBill(shopId, deletedAt)');
    ensureTable('CREATE INDEX IF NOT EXISTS idx_deletedbill_shop_originalPaidAt ON DeletedBill(shopId, originalPaidAt)');
    ensureTable('CREATE INDEX IF NOT EXISTS idx_deletedbill_deletedById ON DeletedBill(deletedById)');
    ensureTable(`CREATE TABLE IF NOT EXISTS MenuCategory (
    id TEXT PRIMARY KEY,
    shopId TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'slate',
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
  )`);
    ensureTable('CREATE UNIQUE INDEX IF NOT EXISTS idx_menucategory_shop_name ON MenuCategory(shopId, name)');
    ensureTable('CREATE INDEX IF NOT EXISTS idx_menucategory_shop_sort ON MenuCategory(shopId, sortOrder)');
    // ─── Single-shop enforcement ──────────────────────────────────────────
    // This POS is configured for ONE shop only. Existing user databases
    // (created before this change) have 2 seeded shops ("Spice Garden" +
    // "Belly Bytes"). We keep the first shop (alphabetically by code, which
    // is "SPICE" → Spice Garden) and delete the rest. Cascade rules on all
    // child tables (MenuItem, RestaurantTable, Orders, Bill, etc.) clean
    // up the second shop's data automatically.
    //
    // Safe to re-run: if the shop count is already 1, this is a no-op.
    try {
        const shopCount = database.exec('SELECT COUNT(*) as c FROM Shop');
        const count = shopCount[0]?.values[0]?.[0];
        if (count && count > 1) {
            // Keep the shop with the smallest rowid (i.e. the first one inserted,
            // which is Spice Garden in the original seed). Delete the rest.
            database.run(`DELETE FROM Shop WHERE id NOT IN (
        SELECT id FROM Shop ORDER BY rowid ASC LIMIT 1
      )`);
            console.warn('[migrate] single-shop enforcement: removed extra shops');
        }
    } catch (e) {
        console.warn('[migrate] single-shop enforcement failed (non-fatal):', e);
    }
}
function getDB() {
    if (!db) throw new Error('Database not initialized. Call initDB() first.');
    return db;
}
function isDbReady() {
    return !!db && initialized;
}
// ─── Save after writes ───
let saveTimer = null;
let periodicSaveTimer = null;
function persistDB() {
    if (!db) return;
    if (saveTimer) clearTimeout(saveTimer);
    // Debounce writes (500ms) so rapid mutations don't spam IndexedDB.
    saveTimer = setTimeout(async ()=>{
        await saveDB(db);
        // Update the persistent Excel blob in IndexedDB (NOT a download —
        // just stores the latest .xls file in IndexedDB so it accumulates
        // over time. The user can download it anytime via the Export button
        // in Management → Backup).
        updateExcelBlob();
    }, 500);
}
function persistDBSync() {
    if (!db) return;
    try {
        const data = db.export();
        if (data.length <= MAX_BACKUP_SIZE) {
            const b64 = uint8ToBase64(data);
            localStorage.setItem(DB_BACKUP_KEY, b64);
        }
        saveDB(db).catch(()=>{});
    } catch (e) {
        console.warn('[client-db] sync save failed:', e);
    }
}
// ─── Persistent Excel file (stored in IndexedDB, NOT auto-downloaded) ──
//
// The user wants "Excel as database" — a single .xls file that accumulates
// ALL data over time, stored persistently, and downloadable on demand.
//
// How it works:
//   1. After every DB write, we rebuild the .xls blob from ALL tables
//      and store it in a SEPARATE IndexedDB store called 'excel-backup'.
//   2. This does NOT trigger a download — the blob just sits in
//      IndexedDB, always up-to-date.
//   3. When the user clicks "Export to Excel" in Management → Backup,
//      we read the blob from IndexedDB and trigger a single download.
//
// This gives the user a real-time, always-fresh Excel file without
// spamming their Downloads folder every 5 seconds.
const EXCEL_IDB_NAME = 'thuso-excel';
const EXCEL_IDB_STORE = 'file';
let excelUpdateTimer = null;
function openExcelIDB() {
    return new Promise((resolve, reject)=>{
        const req = indexedDB.open(EXCEL_IDB_NAME, 1);
        req.onupgradeneeded = ()=>req.result.createObjectStore(EXCEL_IDB_STORE);
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error);
    });
}
// Build the .xls blob from ALL tables in the SQLite DB
function buildExcelBlob() {
    if (!db) return null;
    const tableDefs = [
        {
            name: 'Shop',
            sql: 'SELECT * FROM Shop'
        },
        {
            name: 'MenuItems',
            sql: 'SELECT * FROM MenuItem ORDER BY category, name'
        },
        {
            name: 'Tables',
            sql: 'SELECT * FROM RestaurantTable ORDER BY number'
        },
        {
            name: 'Orders',
            sql: 'SELECT * FROM Orders ORDER BY createdAt DESC'
        },
        {
            name: 'OrderItems',
            sql: 'SELECT * FROM OrderItem ORDER BY orderId'
        },
        {
            name: 'Bills',
            sql: 'SELECT * FROM Bill ORDER BY paidAt DESC'
        },
        {
            name: 'DeletedBills',
            sql: 'SELECT * FROM DeletedBill ORDER BY deletedAt DESC'
        },
        {
            name: 'Customers',
            sql: 'SELECT * FROM Customer ORDER BY name'
        },
        {
            name: 'Suppliers',
            sql: 'SELECT * FROM Supplier ORDER BY name'
        },
        {
            name: 'Purchases',
            sql: 'SELECT * FROM Purchase ORDER BY createdAt DESC'
        },
        {
            name: 'Expenses',
            sql: 'SELECT * FROM Expense ORDER BY date DESC'
        },
        {
            name: 'MoneyIn',
            sql: 'SELECT * FROM MoneyIn ORDER BY date DESC'
        },
        {
            name: 'MoneyOut',
            sql: 'SELECT * FROM MoneyOut ORDER BY date DESC'
        },
        {
            name: 'Users',
            sql: 'SELECT id, name, email, role, active, shopId, createdAt FROM AppUser ORDER BY name'
        },
        {
            name: 'Settings',
            sql: 'SELECT * FROM ShopSetting'
        },
        {
            name: 'AuditLog',
            sql: 'SELECT * FROM AuditLog ORDER BY createdAt DESC'
        },
        {
            name: 'MenuCategories',
            sql: 'SELECT * FROM MenuCategory ORDER BY sortOrder'
        }
    ];
    const sheets = [];
    for (const t of tableDefs){
        try {
            const rows = query(t.sql);
            if (rows.length === 0) continue;
            const columns = Object.keys(rows[0]);
            const sheetRows = rows.map((r)=>columns.map((c)=>{
                    const v = r[c];
                    if (v == null) return '';
                    if (typeof v === 'number') return v;
                    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
                    return String(v);
                }));
            sheets.push({
                name: t.name,
                columns,
                rows: sheetRows
            });
        } catch  {}
    }
    if (sheets.length === 0) return null;
    // Use the sync buildXlsBlob (no download, just returns the Blob)
    // We can't use dynamic import here because this is called from a
    // sync context sometimes. Instead, inline the HTML-table builder.
    return buildXlsBlobInline(sheets);
}
// Inline .xls blob builder (same as excel-export.ts but without import)
function buildXlsBlobInline(sheets) {
    const html = [];
    html.push('<?xml version="1.0" encoding="UTF-8"?>');
    html.push('<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">');
    html.push('<head><meta charset="UTF-8">');
    html.push('<style>td, th { font-family: Calibri, Arial, sans-serif; font-size: 11pt; } th { background: #f3f4f6; font-weight: bold; text-align: left; padding: 4px; } td { padding: 4px; vertical-align: top; }</style>');
    html.push('</head><body>');
    for (const sheet of sheets){
        const safeName = sheet.name.replace(/[\\/?*[\]:]/g, '_').slice(0, 31);
        html.push(`<table border="1"><thead><tr>`);
        for (const col of sheet.columns)html.push(`<th>${escapeXmlInline(String(col))}</th>`);
        html.push('</tr></thead><tbody>');
        for (const row of sheet.rows){
            html.push('<tr>');
            for(let i = 0; i < sheet.columns.length; i++){
                const cell = row[i];
                if (typeof cell === 'number') html.push(`<td>${cell}</td>`);
                else html.push(`<td>${escapeXmlInline(String(cell || ''))}</td>`);
            }
            html.push('</tr>');
        }
        html.push('</tbody></table><br/><br/>');
    }
    html.push('</body></html>');
    return new Blob([
        html.join('\n')
    ], {
        type: 'application/vnd.ms-excel'
    });
}
function escapeXmlInline(value) {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
// Update the Excel blob in IndexedDB (debounced to 3s so we don't
// rebuild the .xls on every single keystroke)
function updateExcelBlob() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (excelUpdateTimer) clearTimeout(excelUpdateTimer);
    excelUpdateTimer = setTimeout(async ()=>{
        try {
            const blob = buildExcelBlob();
            if (!blob) return;
            const idb = await openExcelIDB();
            await new Promise((resolve, reject)=>{
                const tx = idb.transaction(EXCEL_IDB_STORE, 'readwrite');
                tx.objectStore(EXCEL_IDB_STORE).put(blob, 'latest');
                tx.oncomplete = ()=>{
                    idb.close();
                    resolve();
                };
                tx.onerror = ()=>{
                    idb.close();
                    reject(tx.error);
                };
            });
            console.log('[client-db] ✓ Excel blob updated in IndexedDB');
        } catch (e) {
            console.warn('[client-db] Excel blob update failed:', e);
        }
    }, 3000);
}
async function downloadLatestExcel() {
    try {
        const idb = await openExcelIDB();
        const blob = await new Promise((resolve, reject)=>{
            const tx = idb.transaction(EXCEL_IDB_STORE, 'readonly');
            const req = tx.objectStore(EXCEL_IDB_STORE).get('latest');
            req.onsuccess = ()=>{
                idb.close();
                resolve(req.result || null);
            };
            req.onerror = ()=>{
                idb.close();
                reject(req.error);
            };
        });
        if (!blob) {
            // No blob yet — build one on the fly
            const freshBlob = buildExcelBlob();
            if (!freshBlob) {
                console.warn('[client-db] No data to export');
                return;
            }
            triggerDownload(freshBlob);
        } else {
            triggerDownload(blob);
        }
    } catch (e) {
        console.warn('[client-db] Excel download failed:', e);
        // Fallback: build + download directly
        const blob = buildExcelBlob();
        if (blob) triggerDownload(blob);
    }
}
function triggerDownload(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `thuso-data-${dateStr}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function startPeriodicSave() {
    if (periodicSaveTimer) clearInterval(periodicSaveTimer);
    periodicSaveTimer = setInterval(async ()=>{
        if (db) {
            try {
                await saveDB(db);
            } catch (e) {
                console.warn('[client-db] periodic save failed:', e);
            }
        }
    }, 30_000);
}
function query(sql, params = []) {
    const database = getDB();
    const stmt = database.prepare(sql);
    stmt.bind(params);
    const results = [];
    while(stmt.step()){
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}
function queryOne(sql, params = []) {
    const results = query(sql, params);
    return results[0] || null;
}
function execute(sql, params = []) {
    const database = getDB();
    database.run(sql, params);
    persistDB();
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/format.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Format helpers for currency, dates and labels
__turbopack_context__.s([
    "ITEM_STATUS_COLORS",
    ()=>ITEM_STATUS_COLORS,
    "ITEM_STATUS_LABELS",
    ()=>ITEM_STATUS_LABELS,
    "ORDER_STATUS_COLORS",
    ()=>ORDER_STATUS_COLORS,
    "ORDER_STATUS_LABELS",
    ()=>ORDER_STATUS_LABELS,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDateTime",
    ()=>formatDateTime,
    "formatTime",
    ()=>formatTime,
    "timeAgo",
    ()=>timeAgo
]);
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount || 0);
}
function formatTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
function formatDateTime(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function timeAgo(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    return `${day}d ago`;
}
const ORDER_STATUS_LABELS = {
    open: 'Open',
    sent: 'Sent to Kitchen',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    billed: 'Billed',
    paid: 'Paid'
};
const ITEM_STATUS_LABELS = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    cancelled: 'Cancelled'
};
const ORDER_STATUS_COLORS = {
    open: 'bg-slate-100 text-slate-700 border-slate-200',
    sent: 'bg-amber-100 text-amber-800 border-amber-200',
    preparing: 'bg-blue-100 text-blue-800 border-blue-200',
    ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    served: 'bg-violet-100 text-violet-800 border-violet-200',
    billed: 'bg-orange-100 text-orange-800 border-orange-200',
    paid: 'bg-slate-100 text-slate-600 border-slate-200'
};
const ITEM_STATUS_COLORS = {
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
    preparing: 'bg-blue-100 text-blue-800 border-blue-200',
    ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    served: 'bg-violet-100 text-violet-800 border-violet-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/license-keys.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * License keys — hardcoded so they work on Vercel (ephemeral filesystem)
 * AND on local/Electron (persistent SQLite).
 *
 * These keys are checked FIRST (before DB lookup), so they always work
 * regardless of whether the database has been seeded.
 */ __turbopack_context__.s([
    "VALID_LICENSE_KEYS",
    ()=>VALID_LICENSE_KEYS,
    "isValidKey",
    ()=>isValidKey
]);
const VALID_LICENSE_KEYS = {
    'SSYNC-PVKN-9U9R-HDCR': 365,
    'SSYNC-L2U4-6QND-DZ2D': 365,
    'SSYNC-QNQG-25HG-LMXK': 365,
    'SSYNC-4GTM-DJ4T-TQ5H': 365,
    'SSYNC-VZ4Y-7XAD-6JJF': 365,
    'SSYNC-3H2E-RUFH-5YEE': 365,
    'SSYNC-EPNX-49ZJ-ZUNP': 365,
    'SSYNC-CQ26-NQ4P-EXHG': 365,
    'SSYNC-NYM5-UHGD-257M': 365,
    'SSYNC-8E6P-CPJ8-SH6Q': 365,
    'SSYNC-CW5J-CJY2-4N35': 365,
    'SSYNC-DV2E-YNQB-UESS': 365,
    'SSYNC-RW8Y-2X3R-QAK5': 365,
    'SSYNC-YX9E-VAFG-A438': 365,
    'SSYNC-YBBG-AWF4-8SJB': 365,
    'SSYNC-JLFC-KR6V-7HE3': 365,
    'SSYNC-L2XC-NJMB-U7EG': 365,
    'SSYNC-H36K-RD2Y-5XGW': 365,
    'SSYNC-JFF9-N789-YGJ2': 365,
    'SSYNC-3PAZ-HBEE-WAYR': 365,
    // Also keep the old demo keys for backward compat
    'SSYNC-DEMO-2025-365': 365,
    'SSYNC-DEMO-2025-030': 30,
    'SSYNC-DEMO-2025-007': 7,
    'SSYNC-FULL-2025-365': 365,
    'SSYNC-TEST-2025-001': 1
};
function isValidKey(key) {
    const normalized = key.trim().toUpperCase();
    if (VALID_LICENSE_KEYS[normalized]) {
        return {
            valid: true,
            duration: VALID_LICENSE_KEYS[normalized]
        };
    }
    return {
        valid: false,
        duration: 0,
        reason: 'invalid_key'
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/menu-images.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Returns an emoji representation of a menu item based on its name.
// Used as a fallback when no real image is uploaded.
__turbopack_context__.s([
    "getItemEmoji",
    ()=>getItemEmoji
]);
function getItemEmoji(name) {
    const n = name.toLowerCase();
    if (n.includes('chicken') || n.includes('mutton')) return '🍗';
    if (n.includes('fish')) return '🐟';
    if (n.includes('paneer') || n.includes('tikka')) return '🧀';
    if (n.includes('biryani') || n.includes('rice')) return '🍚';
    if (n.includes('naan') || n.includes('roti') || n.includes('paratha') || n.includes('bread')) return '🍞';
    if (n.includes('chai') || n.includes('tea') || n.includes('coffee')) return '☕';
    if (n.includes('lassi') || n.includes('juice') || n.includes('soda') || n.includes('water')) return '🥤';
    if (n.includes('ice cream') || n.includes('brownie') || n.includes('dessert')) return '🍨';
    if (n.includes('gulab') || n.includes('rasmalai') || n.includes('jamun')) return '🍮';
    if (n.includes('dal')) return '🍲';
    if (n.includes('spring') || n.includes('fingers') || n.includes('crispy') || n.includes('corn')) return '🍟';
    if (n.includes('pasta') || n.includes('noodle')) return '🍝';
    if (n.includes('pizza')) return '🍕';
    if (n.includes('burger') || n.includes('sandwich')) return '🍔';
    if (n.includes('salad')) return '🥗';
    if (n.includes('soup')) return '🍜';
    if (n.includes('egg') || n.includes('omelette')) return '🍳';
    if (n.includes('dosa') || n.includes('idli') || n.includes('uttapam')) return '🥞';
    if (n.includes('samosa') || n.includes('kachori')) return '🥟';
    if (n.includes('cake') || n.includes('pastry')) return '🍰';
    if (n.includes('cookie') || n.includes('biscuit')) return '🍪';
    if (n.includes('chocolate')) return '🍫';
    if (n.includes('fruit')) return '🍎';
    return '🍽️';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabase",
    ()=>getSupabase,
    "shopChannel",
    ()=>shopChannel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
'use client';
;
/**
 * Supabase client for real-time cross-device sync.
 *
 * The user wants counter and kitchen on DIFFERENT devices to sync in real-time.
 * Supabase Realtime channels work across any network (internet), unlike
 * socket.io which only works on localhost / same WiFi.
 *
 * We use Supabase ONLY for realtime event broadcasting (not data storage).
 * Each device keeps its own local SQLite database; Supabase channels carry
 * the "hey, a new KOT was created" / "item status changed" events between
 * devices.
 */ const SUPABASE_URL = ("TURBOPACK compile-time value", "https://bepwybrooyosdlkajrro.supabase.co") || '';
const SUPABASE_KEY = ("TURBOPACK compile-time value", "sb_publishable_tMersYw5hCcLpS4fjNHzYA_kzNjCrgO") || '';
let client = null;
function getSupabase() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (!client) {
        client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_KEY, {
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        });
    }
    return client;
}
function shopChannel(shopId) {
    return `shop-${shopId}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_0oo2_0h._.js.map