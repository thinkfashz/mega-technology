package cl.megatechnology.shop.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Art(
    val kind: String = "case",
    val color: String = "#b7e33b",
    val clear: Boolean = false,
    val leather: Boolean = false,
    val magsafe: Boolean = false,
)

@Serializable
data class ColorOption(
    val id: String,
    val name: String,
    val hex: String,
)

@Serializable
data class Product(
    val id: String,
    val slug: String,
    val name: String,
    val shortName: String = "",
    val category: String,
    val price: Int,
    val compareAt: Int? = null,
    val stock: Int = 0,
    val sold: Int = 0,
    val rating: Double = 5.0,
    val reviews: Int = 0,
    val badge: String? = null,
    val badgeTone: String? = null,
    val art: Art = Art(),
    val colors: List<ColorOption> = emptyList(),
    val description: String = "",
    val features: List<String> = emptyList(),
    val freeShipping: Boolean = false,
    val express: Int = 2990,
    val tags: List<String> = emptyList(),
)

@Serializable
data class Category(
    val id: String,
    val name: String,
    val count: Int = 0,
    val art: Art = Art(),
)

@Serializable
data class Customer(
    val name: String,
    val phone: String,
    val email: String = "",
    val address: String,
    val city: String,
    val region: String = "Región Metropolitana",
)

@Serializable
data class OrderItem(
    val productId: String,
    val name: String,
    val colorId: String = "base",
    val colorName: String = "Base",
    val price: Int,
    val qty: Int,
    val art: Art = Art(),
)

@Serializable
data class TimelineStep(
    val key: String,
    val title: String,
    val meta: String = "",
    val done: Boolean = false,
    val current: Boolean = false,
)

@Serializable
data class Order(
    val id: String,
    val createdAt: String,
    val status: String,
    val items: List<OrderItem>,
    val subtotal: Int,
    val shipping: Int,
    val total: Int,
    val customer: Customer,
    val payment: String,
    val delivery: String,
    val note: String = "",
    val timeline: List<TimelineStep> = emptyList(),
)

@Serializable
data class CreateOrderItem(
    val productId: String,
    val colorId: String,
    val qty: Int,
)

@Serializable
data class CreateOrderRequest(
    val customer: Customer,
    val items: List<CreateOrderItem>,
    val payment: String,
    val delivery: String,
    val note: String = "",
)

@Serializable
data class UpdateStatusRequest(val status: String)

@Serializable
data class UpdateProductRequest(
    val name: String? = null,
    val price: Int? = null,
    val stock: Int? = null,
    val description: String? = null,
)

@Serializable
data class ServiceRequest(
    val device: String,
    val model: String,
    val issue: String,
    val name: String,
    val phone: String,
)

@Serializable
data class ServiceRequestResponse(
    val id: String,
    val createdAt: String,
    val status: String,
    val device: String,
    val model: String,
    val issue: String,
    val name: String,
    val phone: String,
)

@Serializable
data class DailyPoint(
    val date: String,
    val value: Int,
)

@Serializable
data class Stats(
    val sales: Int = 0,
    val count: Int = 0,
    val avg: Int = 0,
    @SerialName("lowStock") val lowStock: Int = 0,
    val pending: Int = 0,
    val daily: List<DailyPoint> = emptyList(),
    val top: List<Product> = emptyList(),
    val recent: List<Order> = emptyList(),
)

@Serializable
data class ApiError(
    val code: String = "INTERNAL",
    val message: String = "Error inesperado",
)

/** Línea de carrito en memoria (Room la reemplaza en producción). */
data class CartLine(
    val product: Product,
    val color: ColorOption?,
    val qty: Int,
) {
    val unitPrice: Int get() = product.price
    val total: Int get() = product.price * qty
}

enum class OrderStatus(val wire: String, val label: String) {
    PENDING("pending", "Pendiente"),
    PAID("paid", "Pagado"),
    SHIPPED("shipped", "En camino"),
    DELIVERED("delivered", "Entregado"),
    CANCELLED("cancelled", "Cancelado");

    companion object {
        fun from(value: String?): OrderStatus = entries.firstOrNull { it.wire == value } ?: PENDING
    }
}
