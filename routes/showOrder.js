const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust this based on your DB setup

router.get("/orders", async (req, res) => {
    try {
        const [orders] = await db.execute("SELECT order_id, customer_id, total_amount FROM `order`");
        res.json(orders);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
router.get("/RecentOrders", async (req, res) => {
    try {
        const [orders] = await db.execute("SELECT order_id, customer_id, total_amount FROM `order` ORDER BY order_id DESC LIMIT 5");
        res.json(orders);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// Get dashboard statistics
router.get("/dashboard-stats", async (req, res) => {
    try {
        // Total Sales (sum of all final_amount from orders)
        const [totalSalesResult] = await db.execute(
            "SELECT COALESCE(SUM(final_amount), 0) as total_sales FROM `order`"
        );
        
        // Total Sales in last 24 hours
        const [salesLast24h] = await db.execute(
            "SELECT COALESCE(SUM(final_amount), 0) as sales_24h FROM `order` WHERE order_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)"
        );
        
        // Total Orders
        const [totalOrdersResult] = await db.execute(
            "SELECT COUNT(*) as total_orders FROM `order`"
        );
        
        // Orders in last 24 hours
        const [ordersLast24h] = await db.execute(
            "SELECT COUNT(*) as orders_24h FROM `order` WHERE order_date >= DATE_SUB(NOW(), INTERVAL 1 DAY)"
        );
        
        // Total Customers
        const [totalCustomersResult] = await db.execute(
            "SELECT COUNT(*) as total_customers FROM customer"
        );
        
        // New customers today (using registration_date if available, fallback to approximation)
        const [newCustomersToday] = await db.execute(
            `SELECT COUNT(*) as new_customers_today 
             FROM customer 
             WHERE DATE(COALESCE(registration_date, FROM_UNIXTIME(customer_id))) = CURDATE()`
        );
        
        // If registration_date column doesn't exist yet, use a simple approximation
        const newCustomerCount = newCustomersToday[0].new_customers_today || 0;
        
        // Total Products
        const [totalProductsResult] = await db.execute(
            "SELECT COUNT(*) as total_products FROM product"
        );
        
        // Products in stock (not low stock)
        const [inStockProducts] = await db.execute(
            "SELECT COUNT(*) as in_stock FROM inventory WHERE stock_quantity >= 10"
        );
        
        // Low stock products (less than 10 in inventory)
        const [lowStockResult] = await db.execute(
            "SELECT COUNT(*) as low_stock_products FROM inventory WHERE stock_quantity < 10"
        );
        
        // Calculate growth percentages (comparing with previous period)
        const [salesPrevious24h] = await db.execute(
            "SELECT COALESCE(SUM(final_amount), 0) as sales_prev FROM `order` WHERE order_date >= DATE_SUB(NOW(), INTERVAL 2 DAY) AND order_date < DATE_SUB(NOW(), INTERVAL 1 DAY)"
        );
        
        const currentSales = salesLast24h[0].sales_24h;
        const previousSales = salesPrevious24h[0].sales_prev;
        const salesGrowth = previousSales > 0 ? ((currentSales - previousSales) / previousSales * 100).toFixed(1) : (currentSales > 0 ? 100 : 0);
        
        // Calculate meaningful progress percentages
        const totalSales = totalSalesResult[0].total_sales;
        const totalCustomers = totalCustomersResult[0].total_customers;
        const totalOrders = totalOrdersResult[0].total_orders;
        const totalProducts = totalProductsResult[0].total_products;
        
        // Progress calculations
        const salesProgress = Math.min((totalSales / 1000) * 100, 100); // Target: $1000
        const customerProgress = Math.min((totalCustomers / 50) * 100, 100); // Target: 50 customers
        const orderProgress = Math.min((totalOrders / 20) * 100, 100); // Target: 20 orders
        const stockProgress = totalProducts > 0 ? ((inStockProducts[0].in_stock / totalProducts) * 100) : 100;
        
        res.json({
            totalSales: totalSales,
            salesLast24h: currentSales,
            salesGrowth: salesGrowth,
            salesProgress: Math.round(salesProgress),
            totalOrders: totalOrders,
            ordersLast24h: ordersLast24h[0].orders_24h,
            orderProgress: Math.round(orderProgress),
            totalCustomers: totalCustomers,
            newCustomersToday: newCustomerCount,
            customerProgress: Math.round(customerProgress),
            totalProducts: totalProducts,
            lowStockProducts: lowStockResult[0].low_stock_products,
            inStockProducts: inStockProducts[0].in_stock,
            stockProgress: Math.round(stockProgress)
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
});

// Get recent updates (recent orders with customer and product details)
router.get("/recent-updates", async (req, res) => {
    try {
        const [updates] = await db.execute(`
            SELECT 
                o.order_id,
                o.order_date,
                c.first_name,
                c.last_name,
                p.product_name,
                oi.quantity
            FROM \`order\` o
            JOIN customer c ON o.customer_id = c.customer_id
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN product p ON oi.product_id = p.product_id
            ORDER BY o.order_date DESC
            LIMIT 10
        `);
        
        res.json(updates);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch recent updates" });
    }
});

module.exports = router;
