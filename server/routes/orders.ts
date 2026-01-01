import { Request, Response } from "express";

// In-memory store (in production, this would be a database)
const ordersStore = new Map();
const paymentsStore = new Map();

export interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  selected_drink?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  items: OrderItem[];
  total: number;
  order_type: "livraison" | "emporter";
  status: string;
  created_at: string;
  payment_id?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: "wave" | "orange-money";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  paydunya_token?: string;
  paydunya_invoice_url?: string;
  customer_name?: string;
  customer_phone?: string;
  paid_at?: string;
  error_message?: string;
  created_at: string;
}

/**
 * Create a new order
 * POST /api/orders
 */
export async function handleCreateOrder(req: Request, res: Response) {
  try {
    const {
      order_number,
      customer_name,
      customer_phone,
      delivery_address,
      items,
      total,
      order_type,
    } = req.body;

    // Validate required fields
    if (
      !order_number ||
      !customer_name ||
      !customer_phone ||
      !items ||
      !total ||
      !order_type
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const order: Order = {
      id: `order-${Date.now()}`,
      order_number,
      customer_name,
      customer_phone,
      delivery_address: delivery_address || "",
      items,
      total,
      order_type,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    ordersStore.set(order.id, order);

    console.log("Creating order with ID:", order.id);
    console.log("Order object being returned:", order);
    return res.json(order);
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
}

/**
 * Get order by ID
 * GET /api/orders/:orderId
 */
export async function handleGetOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID missing",
      });
    }

    const order = ordersStore.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    return res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get order",
    });
  }
}

/**
 * Update order status
 * PUT /api/orders/:orderId
 */
export async function handleUpdateOrder(req: Request, res: Response) {
  try {
    const { orderId } = req.params;
    const updates = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID missing",
      });
    }

    const order = ordersStore.get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    const updatedOrder = {
      ...order,
      ...updates,
    };

    ordersStore.set(orderId, updatedOrder);

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update order",
    });
  }
}

/**
 * Create a new payment record
 * POST /api/payments
 */
export async function handleCreatePayment(req: Request, res: Response) {
  try {
    const { order_id, amount, payment_method, customer_name, customer_phone } =
      req.body;

    if (!order_id || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const payment: Payment = {
      id: `payment-${Date.now()}`,
      order_id,
      amount,
      payment_method,
      status: "pending",
      customer_name: customer_name || "",
      customer_phone: customer_phone || "",
      created_at: new Date().toISOString(),
    };

    paymentsStore.set(payment.id, payment);

    // Also store by order_id for quick lookup
    paymentsStore.set(`payment-for-order-${order_id}`, payment);

    console.log("Creating payment with ID:", payment.id);
    console.log("Payment object being returned:", payment);
    return res.json(payment);
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create payment",
    });
  }
}

/**
 * Get payment by ID
 * GET /api/payments/:paymentId
 */
export async function handleGetPayment(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Payment ID missing",
      });
    }

    const payment = paymentsStore.get(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    return res.json(payment);
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get payment",
    });
  }
}

/**
 * Update payment status
 * PUT /api/payments/:paymentId
 */
export async function handleUpdatePayment(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;
    const updates = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: "Payment ID missing",
      });
    }

    const payment = paymentsStore.get(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    const updatedPayment = {
      ...payment,
      ...updates,
    };

    paymentsStore.set(paymentId, updatedPayment);
    paymentsStore.set(
      `payment-for-order-${updatedPayment.order_id}`,
      updatedPayment,
    );

    return res.json(updatedPayment);
  } catch (error) {
    console.error("Update payment error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update payment",
    });
  }
}

/**
 * Get payment by order ID
 * GET /api/payments/by-order/:orderId
 */
export async function handleGetPaymentByOrderId(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID missing",
      });
    }

    const payment = paymentsStore.get(`payment-for-order-${orderId}`);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found for this order",
      });
    }

    return res.json(payment);
  } catch (error) {
    console.error("Get payment by order error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get payment",
    });
  }
}

export { ordersStore, paymentsStore };
