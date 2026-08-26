module.exports = [
"[project]/src/hooks/use-restaurant-sync.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRestaurantSync",
    ()=>useRestaurantSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/client-data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function useRestaurantSync(role, handlers) {
    const { currentShop } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [onlineCount, setOnlineCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [syncMode, setSyncMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('none');
    const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const supabaseChannelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handlersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(handlers);
    handlersRef.current = handlers;
    // ─── 1. SOCKET.IO (Offline — same WiFi) ───
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        (async ()=>{
            try {
                const { io } = await __turbopack_context__.A("[project]/node_modules/socket.io-client/build/esm-debug/index.js [app-ssr] (ecmascript, async loader)");
                // Connect via Caddy gateway (works on same device + same WiFi)
                const socket = io('/?XTransformPort=3005', {
                    transports: [
                        'websocket',
                        'polling'
                    ],
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionAttempts: Infinity
                });
                if (!mounted) {
                    socket.close();
                    return;
                }
                socketRef.current = socket;
                socket.on('connect', ()=>{
                    setConnected(true);
                    socket.emit('join', role);
                    setSyncMode((prev)=>prev === 'online' ? 'both' : 'offline');
                });
                socket.on('disconnect', ()=>{
                    setConnected(false);
                    setSyncMode((prev)=>prev === 'online' ? 'online' : 'none');
                });
                socket.on('joined', ({ online })=>setOnlineCount(online));
                socket.on('kot:new', (p)=>handlersRef.current.onKOTNew?.(p));
                socket.on('kot:item-added', (p)=>handlersRef.current.onKOTItemAdded?.(p));
                socket.on('item:status', (p)=>handlersRef.current.onItemStatus?.(p));
                socket.on('order:status', (p)=>handlersRef.current.onOrderStatus?.(p));
                socket.on('table:released', (p)=>handlersRef.current.onTableReleased?.(p));
                socket.on('table:occupied', (p)=>handlersRef.current.onTableOccupied?.(p));
                socket.on('data:refresh', (p)=>handlersRef.current.onDataRefresh?.(p));
            } catch  {
            // Socket.io not available — that's OK, Supabase will handle it
            }
        })();
        return ()=>{
            mounted = false;
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, [
        role
    ]);
    // ─── 2. SUPABASE REALTIME (Online — internet) ───
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!currentShop?.id) return;
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabase"])();
        if (!supabase) return;
        const channelName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shopChannel"])(currentShop.id);
        const channel = supabase.channel(channelName, {
            config: {
                presence: {
                    key: `${role}-${Math.random().toString(36).slice(2, 8)}`
                }
            }
        });
        const events = [
            {
                name: 'kot:new',
                handler: (p)=>handlersRef.current.onKOTNew?.(p.payload)
            },
            {
                name: 'kot:item-added',
                handler: (p)=>handlersRef.current.onKOTItemAdded?.(p.payload)
            },
            {
                name: 'item:status',
                handler: (p)=>handlersRef.current.onItemStatus?.(p.payload)
            },
            {
                name: 'order:status',
                handler: (p)=>handlersRef.current.onOrderStatus?.(p.payload)
            },
            {
                name: 'table:released',
                handler: (p)=>handlersRef.current.onTableReleased?.(p.payload)
            },
            {
                name: 'table:occupied',
                handler: (p)=>handlersRef.current.onTableOccupied?.(p.payload)
            },
            {
                name: 'data:refresh',
                handler: (p)=>handlersRef.current.onDataRefresh?.(p.payload)
            }
        ];
        events.forEach(({ name, handler })=>{
            channel.on('broadcast', {
                event: name
            }, (msg)=>handler(msg));
        });
        channel.on('presence', {
            event: 'sync'
        }, ()=>{
            const state = channel.presenceState();
            setOnlineCount(Object.keys(state).length);
            setSyncMode((prev)=>prev === 'offline' ? 'both' : 'online');
        }).subscribe(async (status)=>{
            if (status === 'SUBSCRIBED') {
                await channel.track({
                    role,
                    online_at: new Date().toISOString()
                });
            }
        });
        supabaseChannelRef.current = channel;
        return ()=>{
            supabase.removeChannel(channel);
            supabaseChannelRef.current = null;
        };
    }, [
        role,
        currentShop?.id
    ]);
    // ─── Send via BOTH channels ───
    const sendKOT = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((p)=>{
        socketRef.current?.emit('kot:new', p);
        supabaseChannelRef.current?.send({
            type: 'broadcast',
            event: 'kot:new',
            payload: p
        });
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncQueue"].add('kot:new', p);
        } catch  {}
    }, []);
    const sendItemAdded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((p)=>{
        socketRef.current?.emit('kot:item-added', p);
        supabaseChannelRef.current?.send({
            type: 'broadcast',
            event: 'kot:item-added',
            payload: p
        });
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncQueue"].add('kot:item-added', p);
        } catch  {}
    }, []);
    const sendItemStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((p)=>{
        socketRef.current?.emit('item:status', p);
        supabaseChannelRef.current?.send({
            type: 'broadcast',
            event: 'item:status',
            payload: p
        });
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncQueue"].add('item:status', p);
        } catch  {}
    }, []);
    const sendOrderStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((p)=>{
        socketRef.current?.emit('order:status', p);
        supabaseChannelRef.current?.send({
            type: 'broadcast',
            event: 'order:status',
            payload: p
        });
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncQueue"].add('order:status', p);
        } catch  {}
    }, []);
    const sendTableReleased = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((p)=>{
        socketRef.current?.emit('table:released', p);
        supabaseChannelRef.current?.send({
            type: 'broadcast',
            event: 'table:released',
            payload: p
        });
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncQueue"].add('table:released', p);
        } catch  {}
    }, []);
    const sendTableOccupied = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((p)=>{
        socketRef.current?.emit('table:occupied', p);
        supabaseChannelRef.current?.send({
            type: 'broadcast',
            event: 'table:occupied',
            payload: p
        });
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["syncQueue"].add('table:occupied', p);
        } catch  {}
    }, []);
    const requestDataRefresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((p)=>{
        socketRef.current?.emit('data:refresh', p || {});
        supabaseChannelRef.current?.send({
            type: 'broadcast',
            event: 'data:refresh',
            payload: p || {}
        });
    }, []);
    return {
        connected,
        onlineCount,
        syncMode,
        sendKOT,
        sendItemAdded,
        sendItemStatus,
        sendOrderStatus,
        sendTableReleased,
        sendTableOccupied,
        requestDataRefresh
    };
}
}),
"[project]/src/hooks/use-shop-fetch.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useShopFetch",
    ()=>useShopFetch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/client-data.ts [app-ssr] (ecmascript)");
// Direct SQL helpers from client-db — used by the /api/menu-categories
// handlers below (categories are stored in the MenuCategory table, which
// is created in client-db.ts SCHEMA_SQL + migrateSchema).
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/client-db.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function fakeResponse(data, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async ()=>data,
        text: async ()=>JSON.stringify(data)
    };
}
function parseBody(body) {
    if (!body) return {};
    try {
        return JSON.parse(body);
    } catch  {
        return {};
    }
}
function useShopFetch() {
    const { currentShop } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    const shopId = currentShop?.id || '';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (url, options = {})=>{
        const method = options.method || 'GET';
        const body = parseBody(typeof options.body === 'string' ? options.body : undefined);
        // ─── MENU ───
        if (url === '/api/menu' || url === '/api/menu/') {
            if (method === 'GET') return fakeResponse({
                items: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menu"].list(shopId)
            });
            if (method === 'POST') return fakeResponse({
                item: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menu"].create(shopId, body)
            }, 201);
        }
        // /api/menu/[id]
        const menuMatch = url.match(/^\/api\/menu\/([^/]+)$/);
        if (menuMatch) {
            const id = menuMatch[1];
            if (method === 'PUT') return fakeResponse({
                item: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menu"].update(id, body)
            });
            if (method === 'DELETE') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menu"].delete(id);
                return fakeResponse({
                    ok: true
                });
            }
        }
        // ─── MENU CATEGORIES ──────────────────────────────────────────────
        // Per-shop, user-manageable categories. Backed by direct SQL on the
        // MenuCategory table (created in client-db.ts SCHEMA_SQL + migrateSchema).
        if (url === '/api/menu-categories' || url.startsWith('/api/menu-categories?')) {
            if (method === 'GET') {
                // Auto-seed defaults if the shop has no categories yet (mirrors
                // the server-side route's behavior so APK/PWA mode is consistent).
                let cats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM MenuCategory WHERE shopId = ? ORDER BY sortOrder ASC, name ASC', [
                    shopId
                ]);
                if (cats.length === 0) {
                    const DEFAULTS = [
                        {
                            name: 'Starters',
                            color: 'amber',
                            sortOrder: 0
                        },
                        {
                            name: 'Main Course',
                            color: 'rose',
                            sortOrder: 1
                        },
                        {
                            name: 'Breads',
                            color: 'orange',
                            sortOrder: 2
                        },
                        {
                            name: 'Beverages',
                            color: 'sky',
                            sortOrder: 3
                        },
                        {
                            name: 'Desserts',
                            color: 'violet',
                            sortOrder: 4
                        },
                        {
                            name: 'General',
                            color: 'slate',
                            sortOrder: 5
                        }
                    ];
                    for (const c of DEFAULTS){
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO MenuCategory (id, shopId, name, color, sortOrder) VALUES (?,?,?,?,?)', [
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["genId"])(),
                            shopId,
                            c.name,
                            c.color,
                            c.sortOrder
                        ]);
                    }
                    cats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM MenuCategory WHERE shopId = ? ORDER BY sortOrder ASC, name ASC', [
                        shopId
                    ]);
                }
                return fakeResponse({
                    categories: cats
                });
            }
            if (method === 'POST') {
                const name = (body?.name || '').toString().trim();
                if (!name) return fakeResponse({
                    error: 'Category name is required'
                }, 400);
                const existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryOne"])('SELECT id FROM MenuCategory WHERE shopId = ? AND name = ?', [
                    shopId,
                    name
                ]);
                if (existing) return fakeResponse({
                    error: 'Category already exists'
                }, 409);
                const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryOne"])('SELECT COUNT(*) as c FROM MenuCategory WHERE shopId = ?', [
                    shopId
                ])?.c || 0;
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["genId"])();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO MenuCategory (id, shopId, name, color, sortOrder) VALUES (?,?,?,?,?)', [
                    id,
                    shopId,
                    name,
                    body?.color || 'slate',
                    sortOrder
                ]);
                const created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM MenuCategory WHERE id = ?', [
                    id
                ]);
                return fakeResponse({
                    category: created
                }, 201);
            }
        }
        // /api/menu-categories/[id]
        const menuCatMatch = url.match(/^\/api\/menu-categories\/([^/]+)$/);
        if (menuCatMatch) {
            const id = menuCatMatch[1];
            const existing = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM MenuCategory WHERE id = ?', [
                id
            ]);
            if (!existing) return fakeResponse({
                error: 'Category not found'
            }, 404);
            if (method === 'PUT') {
                const newName = body?.name != null ? body.name.toString().trim() : null;
                const newColor = body?.color != null ? body.color.toString() : null;
                if (newName && newName !== existing.name) {
                    const dup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryOne"])('SELECT id FROM MenuCategory WHERE shopId = ? AND name = ? AND id != ?', [
                        existing.shopId,
                        newName,
                        id
                    ]);
                    if (dup) return fakeResponse({
                        error: 'Another category already has that name'
                    }, 409);
                }
                const sets = [];
                const params = [];
                if (newName) {
                    sets.push('name = ?');
                    params.push(newName);
                }
                if (newColor) {
                    sets.push('color = ?');
                    params.push(newColor);
                }
                if (sets.length > 0) {
                    sets.push("updatedAt = datetime('now')");
                    params.push(id);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execute"])(`UPDATE MenuCategory SET ${sets.join(', ')} WHERE id = ?`, params);
                }
                if (newName && newName !== existing.name) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execute"])('UPDATE MenuItem SET category = ? WHERE shopId = ? AND category = ?', [
                        newName,
                        existing.shopId,
                        existing.name
                    ]);
                }
                const updated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM MenuCategory WHERE id = ?', [
                    id
                ]);
                return fakeResponse({
                    category: updated
                });
            }
            if (method === 'DELETE') {
                let general = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM MenuCategory WHERE shopId = ? AND name = ?', [
                    existing.shopId,
                    'General'
                ]);
                if (!general) {
                    general = {
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["genId"])()
                    };
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execute"])('INSERT INTO MenuCategory (id, shopId, name, color, sortOrder) VALUES (?,?,?,?,?)', [
                        general.id,
                        existing.shopId,
                        'General',
                        'slate',
                        999
                    ]);
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execute"])('UPDATE MenuItem SET category = ? WHERE shopId = ? AND category = ?', [
                    'General',
                    existing.shopId,
                    existing.name
                ]);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$db$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["execute"])('DELETE FROM MenuCategory WHERE id = ?', [
                    id
                ]);
                return fakeResponse({
                    ok: true,
                    reassignedTo: 'General'
                });
            }
        }
        // ─── TABLES ───
        if (url === '/api/tables' && method === 'GET') return fakeResponse({
            tables: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tables"].list(shopId)
        });
        if (url === '/api/tables' && method === 'POST') return fakeResponse({
            table: {
                id: 'new'
            }
        }, 201);
        if (url === '/api/tables/seed' && method === 'POST') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tables"].seed(shopId);
            return fakeResponse({
                seeded: true,
                tables: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tables"].list(shopId)
            });
        }
        // ─── ORDERS ───
        if (url.startsWith('/api/orders?')) {
            const status = new URLSearchParams(url.split('?')[1]).get('status');
            return fakeResponse({
                orders: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].list(shopId, status || undefined)
            });
        }
        if (url === '/api/orders' && method === 'POST') {
            return fakeResponse({
                order: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].create(shopId, body.tableId, body.type, body.guests, body.waiterName, body.customerName, body.notes)
            }, 201);
        }
        // /api/orders/[id]
        const orderMatch = url.match(/^\/api\/orders\/([^/]+)$/);
        if (orderMatch) {
            const id = orderMatch[1];
            if (method === 'GET') return fakeResponse({
                order: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].getById(id)
            });
            if (method === 'DELETE') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].delete(id);
                return fakeResponse({
                    ok: true
                });
            }
        }
        // /api/orders/[id]/items
        const itemsMatch = url.match(/^\/api\/orders\/([^/]+)\/items$/);
        if (itemsMatch && method === 'POST') {
            const orderId = itemsMatch[1];
            for (const it of body.items || []){
                const menuItem = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menu"].list(shopId).find((m)=>m.id === it.menuItemId);
                if (menuItem) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].addItem(orderId, it.menuItemId, menuItem.name, menuItem.price, it.quantity, it.notes);
            }
            return fakeResponse({
                order: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].getById(orderId)
            }, 201);
        }
        // /api/orders/[id]/items/[itemId]
        const itemMatch = url.match(/^\/api\/orders\/([^/]+)\/items\/([^/]+)$/);
        if (itemMatch) {
            const [, orderId, itemId] = itemMatch;
            if (method === 'PATCH') return fakeResponse({
                item: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].updateItem(itemId, body),
                order: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].getById(orderId)
            });
            if (method === 'DELETE') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].deleteItem(itemId);
                return fakeResponse({
                    ok: true
                });
            }
        }
        // /api/orders/[id]/send
        const sendMatch = url.match(/^\/api\/orders\/([^/]+)\/send$/);
        if (sendMatch && method === 'POST') {
            const id = sendMatch[1];
            return fakeResponse({
                order: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].sendKOT(id)
            });
        }
        // /api/orders/[id]/status
        const statusMatch = url.match(/^\/api\/orders\/([^/]+)\/status$/);
        if (statusMatch && method === 'PATCH') {
            return fakeResponse({
                order: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].updateStatus(statusMatch[1], body.status)
            });
        }
        // /api/orders/[id]/free-table
        const freeMatch = url.match(/^\/api\/orders\/([^/]+)\/free-table$/);
        if (freeMatch && method === 'POST') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].freeTable(freeMatch[1]);
            return fakeResponse({
                ok: true
            });
        }
        // ─── BILLS ───
        if (url.startsWith('/api/bills?') || url === '/api/bills' && method === 'GET') {
            const params = new URLSearchParams(url.split('?')[1] || '');
            const billsList = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bills"].list(shopId, {
                from: params.get('from') || undefined,
                to: params.get('to') || undefined,
                table: params.get('table') ? Number(params.get('table')) : undefined,
                q: params.get('q') || undefined
            });
            // ─── Compute summary from the filtered bills list ───
            // Previously this was hardcoded to { totalRevenue: 0, totalBills: 0 },
            // which meant the History / Dashboard stat cards always showed ₹0 even
            // when bills existed with correct totals.
            const totalRevenue = billsList.reduce((s, b)=>s + (Number(b.total) || 0), 0);
            const totalBills = billsList.length;
            const byPayment = {};
            for (const b of billsList){
                const mode = b.paymentMode || 'other';
                byPayment[mode] = (byPayment[mode] || 0) + (Number(b.total) || 0);
            }
            return fakeResponse({
                bills: billsList,
                summary: {
                    totalRevenue,
                    totalBills,
                    byPayment
                }
            });
        }
        if (url === '/api/bills' && method === 'POST') {
            const order = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].getById(body.orderId);
            if (!order) return fakeResponse({
                error: 'Order not found'
            }, 404);
            const bill = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bills"].create(shopId, body.orderId, order.table?.number || 0, body.subtotal || 0, body.taxRate || 0, body.taxAmount || 0, body.discount || 0, body.serviceCharge || 0, body.total || 0, body.paymentMode || 'cash');
            return fakeResponse({
                bill
            }, 201);
        }
        if (url === '/api/bills/next-no' && method === 'GET') {
            return fakeResponse({
                nextNo: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bills"].nextNo(shopId)
            });
        }
        // GET /api/bills/deleted — list all voided bills for the current shop.
        // MUST be matched BEFORE the /api/bills/[id] route below, otherwise
        // "deleted" would be treated as a bill id.
        if ((url === '/api/bills/deleted' || url.startsWith('/api/bills/deleted?')) && method === 'GET') {
            const params = new URLSearchParams(url.split('?')[1] || '');
            const list = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deletedBills"].list(shopId, {
                from: params.get('from') || undefined,
                to: params.get('to') || undefined
            });
            const totals = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deletedBills"].totals(shopId, {
                from: params.get('from') || undefined,
                to: params.get('to') || undefined
            });
            return fakeResponse({
                items: list,
                totals
            });
        }
        const billMatch = url.match(/^\/api\/bills\/([^/]+)$/);
        if (billMatch && method === 'GET') return fakeResponse({
            bill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bills"].getById(billMatch[1])
        });
        // DELETE /api/bills/[id] — void a bill. Body: { reason, deletedBy, deletedById }.
        // The bills.delete() helper captures a snapshot into DeletedBill, reverses
        // the auto-added MoneyIn, frees the table, writes an audit log entry, and
        // finally removes the Bill row.
        if (billMatch && method === 'DELETE') {
            const ok = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bills"].delete(billMatch[1], {
                reason: body.reason,
                deletedBy: body.deletedBy,
                deletedById: body.deletedById
            });
            if (!ok) return fakeResponse({
                error: 'Bill not found'
            }, 404);
            return fakeResponse({
                ok: true
            });
        }
        // ─── SETTINGS ───
        if (url === '/api/settings' && method === 'GET') return fakeResponse({
            settings: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["settings"].get(shopId)
        });
        if (url === '/api/settings' && method === 'PUT') return fakeResponse({
            settings: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["settings"].update(shopId, body)
        });
        // ─── DASHBOARD ───
        if (url === '/api/dashboard' && method === 'GET') return fakeResponse(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dashboard"].get(shopId));
        // ─── USERS ───
        if (url === '/api/users' && method === 'GET') return fakeResponse({
            users: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["users"].list()
        });
        if (url === '/api/users' && method === 'POST') return fakeResponse({
            user: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["users"].create(body)
        }, 201);
        if (url === '/api/users' && method === 'PUT') return fakeResponse({
            user: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["users"].update(body.id, body)
        });
        const userDelMatch = url.match(/^\/api\/users\?id=(.+)$/);
        if (userDelMatch && method === 'DELETE') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["users"].delete(userDelMatch[1]);
            return fakeResponse({
                ok: true
            });
        }
        // ─── ZOMATO ───
        if (url.startsWith('/api/zomato?') || url === '/api/zomato' && method === 'GET') {
            const status = new URLSearchParams(url.split('?')[1] || '').get('status');
            return fakeResponse({
                orders: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zomato"].list(shopId, status || undefined)
            });
        }
        if (url === '/api/zomato' && method === 'POST') return fakeResponse({
            order: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zomato"].create(shopId, body)
        }, 201);
        if (url === '/api/zomato/sync' && method === 'POST') return fakeResponse({
            created: [],
            count: 0,
            mode: 'simulation'
        });
        const zomatoMatch = url.match(/^\/api\/zomato\/([^/]+)$/);
        if (zomatoMatch) {
            const id = zomatoMatch[1];
            if (method === 'PATCH') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zomato"].updateStatus(id, body.status);
                return fakeResponse({
                    order: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zomato"].getById(id)
                });
            }
            if (method === 'DELETE') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zomato"].delete(id);
                return fakeResponse({
                    ok: true
                });
            }
        }
        const zomatoPushMatch = url.match(/^\/api\/zomato\/([^/]+)\/push$/);
        if (zomatoPushMatch && method === 'POST') {
            const order = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zomato"].pushToKitchen(shopId, zomatoPushMatch[1]);
            return fakeResponse({
                order,
                zomatoOrderId: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["zomato"].getById(zomatoPushMatch[1])?.zomatoOrderId
            });
        }
        // ─── AUDIT ───
        if ((url === '/api/audit' || url.startsWith('/api/audit?')) && method === 'GET') {
            const params = new URLSearchParams(url.split('?')[1] || '');
            return fakeResponse({
                logs: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["audit"].list(shopId, params.get('action') || undefined)
            });
        }
        if (url === '/api/audit' && method === 'POST') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["audit"].log(body.action, body.details, shopId, body.userName);
            return fakeResponse({
                ok: true
            });
        }
        // ─── AUTO-SEED ───
        if (url === '/api/auto-seed') return fakeResponse({
            seeded: false,
            message: 'Database already initialized'
        });
        // ─── CUSTOMERS ───
        if ((url === '/api/customers' || url.startsWith('/api/customers?')) && method === 'GET') return fakeResponse({
            customers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customers"].list(shopId)
        });
        if (url === '/api/customers' && method === 'POST') return fakeResponse({
            customer: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customers"].create(shopId, body)
        }, 201);
        const custMatch = url.match(/^\/api\/customers\/([^/?]+)$/);
        if (custMatch) {
            if (method === 'PUT') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customers"].update(custMatch[1], body);
                return fakeResponse({
                    ok: true
                });
            }
            if (method === 'DELETE') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customers"].delete(custMatch[1]);
                return fakeResponse({
                    ok: true
                });
            }
        }
        const custDelMatch = url.match(/^\/api\/customers\?id=(.+)$/);
        if (custDelMatch && method === 'DELETE') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customers"].delete(custDelMatch[1]);
            return fakeResponse({
                ok: true
            });
        }
        // ─── SUPPLIERS ───
        if ((url === '/api/suppliers' || url.startsWith('/api/suppliers?')) && method === 'GET') return fakeResponse({
            suppliers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliers"].list(shopId)
        });
        if (url === '/api/suppliers' && method === 'POST') return fakeResponse({
            supplier: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliers"].create(shopId, body)
        }, 201);
        const suppMatch = url.match(/^\/api\/suppliers\/([^/?]+)$/);
        if (suppMatch) {
            if (method === 'PUT') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliers"].update(suppMatch[1], body);
                return fakeResponse({
                    ok: true
                });
            }
            if (method === 'DELETE') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliers"].delete(suppMatch[1]);
                return fakeResponse({
                    ok: true
                });
            }
        }
        const suppDelMatch = url.match(/^\/api\/suppliers\?id=(.+)$/);
        if (suppDelMatch && method === 'DELETE') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliers"].delete(suppDelMatch[1]);
            return fakeResponse({
                ok: true
            });
        }
        // ─── PURCHASES ───
        if (url === '/api/purchases' && method === 'GET') return fakeResponse({
            purchases: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["purchases"].list(shopId)
        });
        if (url === '/api/purchases' && method === 'POST') return fakeResponse({
            purchase: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["purchases"].create(shopId, body)
        }, 201);
        const purchMatch = url.match(/^\/api\/purchases\?id=(.+)$/);
        if (purchMatch && method === 'DELETE') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["purchases"].delete(purchMatch[1]);
            return fakeResponse({
                ok: true
            });
        }
        // ─── EXPENSES ───
        if (url === '/api/expenses' && method === 'GET') return fakeResponse({
            expenses: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["expenses"].list(shopId)
        });
        if (url === '/api/expenses' && method === 'POST') return fakeResponse({
            expense: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["expenses"].create(shopId, body)
        }, 201);
        const expMatch = url.match(/^\/api\/expenses\?id=(.+)$/);
        if (expMatch && method === 'DELETE') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["expenses"].delete(expMatch[1]);
            return fakeResponse({
                ok: true
            });
        }
        // ─── MONEY IN ───
        if (url === '/api/moneyin' && method === 'GET') return fakeResponse({
            items: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moneyIn"].list(shopId)
        });
        if (url === '/api/moneyin' && method === 'POST') return fakeResponse({
            item: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moneyIn"].create(shopId, body)
        }, 201);
        const miMatch = url.match(/^\/api\/moneyin\?id=(.+)$/);
        if (miMatch && method === 'DELETE') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moneyIn"].delete(miMatch[1]);
            return fakeResponse({
                ok: true
            });
        }
        // ─── MONEY OUT ───
        if (url === '/api/moneyout' && method === 'GET') return fakeResponse({
            items: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moneyOut"].list(shopId)
        });
        if (url === '/api/moneyout' && method === 'POST') return fakeResponse({
            item: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moneyOut"].create(shopId, body)
        }, 201);
        const moMatch = url.match(/^\/api\/moneyout\?id=(.+)$/);
        if (moMatch && method === 'DELETE') {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moneyOut"].delete(moMatch[1]);
            return fakeResponse({
                ok: true
            });
        }
        // ─── REPORTS ───
        if (url.startsWith('/api/reports')) {
            const params = new URLSearchParams(url.split('?')[1] || '');
            // Build a filters object from query params. Supports the advanced
            // filter set: from, to, paymentMode, table, billNo, item, category,
            // waiter, minAmount, maxAmount. Old callers passing just from/to
            // still work because reports.get() accepts (shopId, from, to) too.
            const filters = {};
            if (params.get('from')) filters.from = params.get('from');
            if (params.get('to')) filters.to = params.get('to');
            if (params.get('paymentMode') && params.get('paymentMode') !== 'all') filters.paymentMode = params.get('paymentMode');
            if (params.get('table')) filters.tableNumber = Number(params.get('table'));
            if (params.get('billNo')) filters.billNoSearch = params.get('billNo');
            if (params.get('item')) filters.itemSearch = params.get('item');
            if (params.get('category') && params.get('category') !== 'all') filters.category = params.get('category');
            if (params.get('waiter')) filters.waiter = params.get('waiter');
            if (params.get('minAmount')) filters.minAmount = Number(params.get('minAmount'));
            if (params.get('maxAmount')) filters.maxAmount = Number(params.get('maxAmount'));
            return fakeResponse(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["reports"].get(shopId, filters));
        }
        // ─── SHOPS ───
        if (url === '/api/shops' && method === 'GET') return fakeResponse({
            shops: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shops"].list()
        });
        if (url === '/api/shops' && method === 'POST') return fakeResponse({
            shop: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shops"].create(body)
        }, 201);
        const shopMatch = url.match(/^\/api\/shops\/([^/]+)$/);
        if (shopMatch) {
            if (method === 'PUT') return fakeResponse({
                shop: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shops"].update(shopMatch[1], body)
            });
            if (method === 'DELETE') {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shops"].delete(shopMatch[1]);
                return fakeResponse({
                    ok: true
                });
            }
        }
        if (url.startsWith('/api/stats')) return fakeResponse({
            totalRevenue: 0,
            totalBills: 0
        });
        if (url.startsWith('/api/backup')) {
            if (method === 'GET') {
                // Gather ALL local data for backup. Data is collected across every
                // shop in the system so a single backup file fully restores state.
                const allShops = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shops"].list();
                const perShop = (selector)=>allShops.flatMap((s)=>selector(s.id));
                const backup = {
                    version: 2,
                    exportedAt: new Date().toISOString(),
                    shops: allShops,
                    menuItems: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["menu"].list(sid)),
                    tables: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tables"].list(sid)),
                    orders: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orders"].list(sid)),
                    bills: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bills"].list(sid)),
                    customers: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["customers"].list(sid)),
                    suppliers: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliers"].list(sid)),
                    purchases: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["purchases"].list(sid)),
                    expenses: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["expenses"].list(sid)),
                    moneyIn: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moneyIn"].list(sid)),
                    moneyOut: perShop((sid)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["moneyOut"].list(sid)),
                    settings: allShops.map((s)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["settings"].get(s.id)).filter(Boolean),
                    users: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$client$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["users"].list()
                };
                return fakeResponse(backup);
            }
            // POST = restore — handled separately, fall through.
            return fakeResponse({
                ok: true
            });
        }
        console.warn('[shopFetch] Unknown URL:', url, method);
        return fakeResponse({
            error: 'Not found'
        }, 404);
    }, [
        shopId
    ]);
}
}),
];

//# sourceMappingURL=src_hooks_06hlhun._.js.map