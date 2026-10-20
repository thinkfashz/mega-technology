package cl.megatechnology.shop.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import cl.megatechnology.shop.data.ServiceLocator
import cl.megatechnology.shop.data.model.CartLine
import cl.megatechnology.shop.data.model.Category
import cl.megatechnology.shop.data.model.CreateOrderItem
import cl.megatechnology.shop.data.model.CreateOrderRequest
import cl.megatechnology.shop.data.model.Customer
import cl.megatechnology.shop.data.model.Order
import cl.megatechnology.shop.data.model.OrderStatus
import cl.megatechnology.shop.data.model.Product
import cl.megatechnology.shop.data.model.Stats
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ShopUiState(
    val loading: Boolean = true,
    val refreshing: Boolean = false,
    val products: List<Product> = emptyList(),
    val categories: List<Category> = emptyList(),
    val cart: List<CartLine> = emptyList(),
    val favorites: Set<String> = emptySet(),
    val orders: List<Order> = emptyList(),
    val stats: Stats = Stats(),
    val error: String? = null,
    val lastOrder: Order? = null,
) {
    val cartCount: Int get() = cart.sumOf { it.qty }
    val subtotal: Int get() = cart.sumOf { it.total }
    val shipping: Int get() = if (cart.isEmpty() || subtotal >= FREE_THRESHOLD) 0 else EXPRESS_COST
    val total: Int get() = subtotal + shipping
    val favoritesCount: Int get() = favorites.size

    companion object {
        const val EXPRESS_COST = 2990
        const val FREE_THRESHOLD = 50000
    }
}

class ShopViewModel(
    private val repository: cl.megatechnology.shop.data.repository.ShopRepository = ServiceLocator.repository,
) : ViewModel() {

    private val _state = MutableStateFlow(ShopUiState())
    val state: StateFlow<ShopUiState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null) }
            val products = repository.products()
            val categories = repository.categories()
            val orders = repository.orders()
            val stats = repository.adminStats()

            val error = products.exceptionOrNull()?.message
                ?: categories.exceptionOrNull()?.message

            _state.update {
                it.copy(
                    loading = false,
                    products = products.getOrDefault(it.products),
                    categories = categories.getOrDefault(it.categories),
                    orders = orders.getOrDefault(it.orders),
                    stats = stats.getOrDefault(it.stats),
                    error = error,
                )
            }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(refreshing = true, error = null) }
            val products = repository.products()
            val orders = repository.orders()
            val stats = repository.adminStats()
            _state.update {
                it.copy(
                    refreshing = false,
                    products = products.getOrDefault(it.products),
                    orders = orders.getOrDefault(it.orders),
                    stats = stats.getOrDefault(it.stats),
                    error = products.exceptionOrNull()?.message,
                )
            }
        }
    }

    fun addToCart(product: Product, colorId: String? = null, qty: Int = 1) {
        if (product.stock <= 0) return
        val color = product.colors.firstOrNull { it.id == colorId } ?: product.colors.firstOrNull()
        _state.update { current ->
            val key = product.id to color?.id
            val existing = current.cart.firstOrNull { it.product.id to it.color?.id == key }
            val next = if (existing == null) {
                current.cart + CartLine(product, color, qty.coerceIn(1, product.stock))
            } else {
                val capped = (existing.qty + qty).coerceAtMost(product.stock)
                current.cart.map {
                    if (it.product.id to it.color?.id == key) it.copy(qty = capped) else it
                }
            }
            current.copy(cart = next)
        }
    }

    fun setQty(productId: String, colorId: String?, qty: Int) {
        _state.update { current ->
            if (qty <= 0) {
                current.copy(cart = current.cart.filterNot { it.product.id == productId && it.color?.id == colorId })
            } else {
                current.copy(
                    cart = current.cart.map {
                        if (it.product.id == productId && it.color?.id == colorId) {
                            it.copy(qty = qty.coerceAtMost(it.product.stock))
                        } else {
                            it
                        }
                    },
                )
            }
        }
    }

    fun removeLine(productId: String, colorId: String?) = setQty(productId, colorId, 0)

    fun clearCart() = _state.update { it.copy(cart = emptyList()) }

    fun toggleFavorite(productId: String) {
        _state.update { current ->
            val next = if (productId in current.favorites) current.favorites - productId else current.favorites + productId
            current.copy(favorites = next)
        }
    }

    fun checkout(
        customer: Customer,
        payment: String,
        delivery: String,
        onSuccess: (Order) -> Unit,
        onError: (String) -> Unit,
    ) {
        val snapshot = _state.value
        if (snapshot.cart.isEmpty()) {
            onError("El carrito está vacío")
            return
        }
        viewModelScope.launch {
            val request = CreateOrderRequest(
                customer = customer,
                items = snapshot.cart.map {
                    CreateOrderItem(
                        productId = it.product.id,
                        colorId = it.color?.id ?: "base",
                        qty = it.qty,
                    )
                },
                payment = payment,
                delivery = delivery,
            )
            repository.createOrder(request)
                .onSuccess { order ->
                    _state.update {
                        it.copy(cart = emptyList(), orders = listOf(order) + it.orders, lastOrder = order)
                    }
                    refresh()
                    onSuccess(order)
                }
                .onFailure { error -> onError(error.message ?: "No se pudo crear el pedido") }
        }
    }

    fun advanceOrder(order: Order) {
        val next = when (OrderStatus.from(order.status)) {
            OrderStatus.PENDING -> OrderStatus.PAID
            OrderStatus.PAID -> OrderStatus.SHIPPED
            OrderStatus.SHIPPED -> OrderStatus.DELIVERED
            else -> return
        }
        viewModelScope.launch {
            repository.updateOrderStatus(order.id, next.wire)
                .onSuccess { updated ->
                    _state.update { current ->
                        current.copy(orders = current.orders.map { if (it.id == updated.id) updated else it })
                    }
                    refresh()
                }
                .onFailure { error ->
                    _state.update { it.copy(error = error.message) }
                }
        }
    }

    fun updateStock(product: Product, stock: Int) {
        viewModelScope.launch {
            repository.updateProduct(product.id, cl.megatechnology.shop.data.model.UpdateProductRequest(stock = stock.coerceAtLeast(0)))
                .onSuccess { updated ->
                    _state.update { current ->
                        current.copy(products = current.products.map { if (it.id == updated.id) updated else it })
                    }
                }
                .onFailure { error -> _state.update { it.copy(error = error.message) } }
        }
    }

    fun clearError() = _state.update { it.copy(error = null) }

    fun search(query: String): List<Product> {
        val text = query.trim().lowercase()
        if (text.isEmpty()) return _state.value.products
        return _state.value.products.filter { product ->
            listOf(product.name, product.shortName, product.category, product.tags.joinToString(" "))
                .joinToString(" ")
                .lowercase()
                .contains(text)
        }
    }

    fun byCategory(category: String?): List<Product> =
        _state.value.products.filter { category.isNullOrBlank() || it.category == category }
}
