package cl.megatechnology.shop.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Remove
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import cl.megatechnology.shop.data.model.Customer
import cl.megatechnology.shop.data.model.Order
import cl.megatechnology.shop.data.model.Product
import cl.megatechnology.shop.ui.ShopUiState
import cl.megatechnology.shop.ui.components.MegaCardShape
import cl.megatechnology.shop.ui.components.MegaPill
import cl.megatechnology.shop.ui.components.PriceLine
import cl.megatechnology.shop.ui.components.ProductArt
import cl.megatechnology.shop.ui.theme.MegaGold
import cl.megatechnology.shop.ui.theme.MegaInk
import cl.megatechnology.shop.ui.theme.MegaInk2
import cl.megatechnology.shop.ui.theme.MegaInk3
import cl.megatechnology.shop.ui.theme.MegaLine
import cl.megatechnology.shop.ui.theme.MegaLime
import cl.megatechnology.shop.ui.theme.MegaOnLime
import cl.megatechnology.shop.ui.theme.MegaSurface
import cl.megatechnology.shop.ui.theme.MegaSurface2
import cl.megatechnology.shop.util.asClp

@Composable
fun ProductScreen(
    state: ShopUiState,
    product: Product?,
    onBack: () -> Unit,
    onAddToCart: (Product, String?, Int) -> Unit,
    onBuyNow: (Product, String?, Int) -> Unit,
    onToggleFavorite: (String) -> Unit,
) {
    if (product == null) {
        EmptyState("Producto no encontrado", onBack)
        return
    }
    var colorId by remember(product.id) { mutableStateOf(product.colors.firstOrNull()?.id) }
    var qty by remember(product.id) { mutableStateOf(1) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(bottom = 110.dp),
    ) {
        item {
            Box(modifier = Modifier.fillMaxWidth().height(320.dp), contentAlignment = Alignment.Center) {
                ProductArt(
                    art = product.art,
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxWidth(0.72f).aspectRatio(1f),
                )
                IconButton(
                    onClick = onBack,
                    modifier = Modifier.align(Alignment.TopStart).padding(12.dp),
                ) {
                    Icon(Icons.AutoMirrored.Outlined.ArrowBack, "Volver", tint = MegaInk)
                }
                IconButton(
                    onClick = { onToggleFavorite(product.id) },
                    modifier = Modifier.align(Alignment.TopEnd).padding(12.dp),
                ) {
                    Icon(
                        imageVector = if (product.id in state.favorites) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = "Favorito",
                        tint = if (product.id in state.favorites) MegaLime else MegaInk,
                    )
                }
            }
        }
        item {
            Column(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text(product.name, style = MaterialTheme.typography.headlineMedium, color = MegaInk)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        product.price.asClp(),
                        style = MaterialTheme.typography.headlineLarge,
                        color = MegaLime,
                        fontWeight = FontWeight.ExtraBold,
                    )
                    product.compareAt?.let {
                        Text(
                            it.asClp(),
                            style = MaterialTheme.typography.bodySmall,
                            color = MegaInk3,
                            textDecoration = TextDecoration.LineThrough,
                            modifier = Modifier.padding(start = 8.dp),
                        )
                    }
                }
                Text("★ ${product.rating} · ${product.reviews} reseñas", style = MaterialTheme.typography.bodySmall, color = MegaGold)
                Text("Stock: ${product.stock} unidades", style = MaterialTheme.typography.bodySmall, color = MegaLime)
                Text(product.description, style = MaterialTheme.typography.bodyMedium, color = MegaInk2)
            }
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                product.colors.forEach { color ->
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(Color(android.graphics.Color.parseColor(color.hex)))
                            .clickable { colorId = color.id },
                    )
                }
            }
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                QtyButton(Icons.Outlined.Remove) { if (qty > 1) qty-- }
                Text("$qty", style = MaterialTheme.typography.titleMedium, color = MegaInk)
                QtyButton(Icons.Outlined.Add) { if (qty < product.stock) qty++ }
            }
        }
        item {
            Button(
                onClick = { onAddToCart(product, colorId, qty) },
                enabled = product.stock > 0,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(52.dp),
                shape = MegaPill,
                colors = ButtonDefaults.buttonColors(containerColor = MegaLime, contentColor = MegaOnLime),
            ) {
                Text("Agregar al carrito", fontWeight = FontWeight.ExtraBold)
            }
        }
        item {
            OutlinedButton(
                onClick = { onBuyNow(product, colorId, qty) },
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp).height(48.dp),
                shape = MegaPill,
            ) {
                Text("Comprar ahora", color = MegaGold)
            }
        }
    }
}

@Composable
private fun QtyButton(icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(36.dp)
            .clip(MegaPill)
            .background(MegaSurface2)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, null, tint = MegaInk)
    }
}

@Composable
fun CartScreen(
    state: ShopUiState,
    onSetQty: (String, String?, Int) -> Unit,
    onRemove: (String, String?) -> Unit,
    onCheckout: () -> Unit,
    onContinueShopping: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Text("MI CARRITO", style = MaterialTheme.typography.displayMedium, color = MegaInk)
            Text(
                "${state.cartCount} unidades · ${state.cart.size} productos",
                style = MaterialTheme.typography.bodyMedium,
                color = MegaInk2,
            )
        }
        if (state.cart.isEmpty()) {
            item { EmptyState("Tu carrito está vacío", onContinueShopping) }
        }
        items(state.cart) { line ->
            Row(
                modifier = Modifier.fillMaxWidth().clip(MegaCardShape).background(MegaSurface).padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                ProductArt(
                    art = line.product.art,
                    contentDescription = line.product.name,
                    modifier = Modifier.size(64.dp),
                )
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        line.product.name,
                        style = MaterialTheme.typography.titleSmall,
                        color = MegaInk,
                        maxLines = 2,
                    )
                    Text(
                        "${line.color?.name ?: "Base"} · ${line.product.stock} disponibles",
                        style = MaterialTheme.typography.bodySmall,
                        color = MegaInk3,
                    )
                    Text(
                        line.total.asClp(),
                        style = MaterialTheme.typography.titleMedium,
                        color = MegaLime,
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    QtyButton(Icons.Outlined.Remove) { onSetQty(line.product.id, line.color?.id, line.qty - 1) }
                    Text("  ${line.qty} ", style = MaterialTheme.typography.titleSmall, color = MegaInk)
                    QtyButton(Icons.Outlined.Add) { onSetQty(line.product.id, line.color?.id, line.qty + 1) }
                }
            }
        }
        if (state.cart.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier.fillMaxWidth().clip(MegaCardShape).background(MegaSurface).padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    PriceLine("Subtotal", state.subtotal.asClp())
                    PriceLine("Envío", if (state.shipping == 0) "Gratis" else state.shipping.asClp())
                    PriceLine("Total", state.total.asClp(), emphasis = true)
                }
            }
            item {
                Button(
                    onClick = onCheckout,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = MegaPill,
                    colors = ButtonDefaults.buttonColors(containerColor = MegaLime, contentColor = MegaOnLime),
                ) {
                    Text("Ir a pagar →", fontWeight = FontWeight.ExtraBold)
                }
            }
            item {
                OutlinedButton(onClick = onContinueShopping, modifier = Modifier.fillMaxWidth(), shape = MegaPill) {
                    Text("Seguir comprando", color = MegaGold)
                }
            }
        }
    }
}

@Composable
fun CheckoutScreen(
    state: ShopUiState,
    onBack: () -> Unit,
    onConfirmed: (Order) -> Unit,
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("Santiago") }
    var payment by remember { mutableStateOf("card") }
    var delivery by remember { mutableStateOf("express") }
    var error by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("FORMULARIO DE COMPRA", style = MaterialTheme.typography.headlineLarge, color = MegaInk)
            Text("Completa tus datos para finalizar la compra", style = MaterialTheme.typography.bodyMedium, color = MegaInk2)
        }
        item { MegaField(name, { name = it }, "Nombre completo") }
        item { MegaField(phone, { phone = it }, "Teléfono", KeyboardType.Phone) }
        item { MegaField(address, { address = it }, "Dirección") }
        item { MegaField(city, { city = it }, "Ciudad") }
        item { OptionRow("Tarjeta Crédito / Débito", payment == "card") { payment = "card" } }
        item { OptionRow("Apple Pay", payment == "apple") { payment = "apple" } }
        item { OptionRow("Pago contra entrega", payment == "cash") { payment = "cash" } }
        item { OptionRow("Envío Express ($2.990)", delivery == "express") { delivery = "express" } }
        item { OptionRow("Envío Gratis", delivery == "free") { delivery = "free" } }
        error?.let { message ->
            item { Text(message, style = MaterialTheme.typography.bodySmall, color = Color(0xFFFF6B6B)) }
        }
        item {
            Column(
                modifier = Modifier.fillMaxWidth().clip(MegaCardShape).background(MegaSurface).padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                PriceLine("Subtotal", state.subtotal.asClp())
                PriceLine("Envío", if (state.shipping == 0) "Gratis" else state.shipping.asClp())
                PriceLine("Total", state.total.asClp(), emphasis = true)
            }
        }
        item {
            Button(
                onClick = {
                    when {
                        name.length < 3 -> error = "Ingresa tu nombre completo"
                        phone.filter { it.isDigit() }.length < 8 -> error = "Teléfono inválido"
                        address.length < 5 -> error = "Ingresa una dirección"
                        city.length < 3 -> error = "Ingresa tu ciudad"
                        else -> {
                            error = null
                            onConfirmed(
                                Order(
                                    id = "PENDIENTE",
                                    createdAt = "",
                                    status = "pending",
                                    items = emptyList(),
                                    subtotal = state.subtotal,
                                    shipping = state.shipping,
                                    total = state.total,
                                    customer = Customer(name, phone, "", address, city),
                                    payment = payment,
                                    delivery = delivery,
                                ),
                            )
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = MegaPill,
                colors = ButtonDefaults.buttonColors(containerColor = MegaLime, contentColor = MegaOnLime),
            ) {
                Text("Confirmar Compra", fontWeight = FontWeight.ExtraBold)
            }
        }
    }
}

@Composable
private fun OptionRow(label: String, selected: Boolean, onSelect: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(MegaCardShape)
            .background(if (selected) MegaSurface else MegaSurface2)
            .clickable(onClick = onSelect)
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, style = MaterialTheme.typography.titleSmall, color = MegaInk)
        RadioButton(
            selected = selected,
            onClick = onSelect,
            colors = RadioButtonDefaults.colors(selectedColor = MegaLime, unselectedColor = MegaInk3),
        )
    }
}

@Composable
fun OrdersScreen(
    state: ShopUiState,
    createdId: String?,
    onAdvance: (Order) -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Text("MIS PEDIDOS", style = MaterialTheme.typography.displayMedium, color = MegaInk)
            Text(
                "${state.orders.size} pedidos en este dispositivo",
                style = MaterialTheme.typography.bodyMedium,
                color = MegaInk2,
            )
        }
        if (createdId != null) {
            item {
                Text(
                    "Pedido confirmado. Te avisaremos cuando salga a despacho.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MegaLime,
                )
            }
        }
        if (state.orders.isEmpty()) {
            item { EmptyState("Sin pedidos todavía", {}) }
        }
        items(state.orders) { order ->
            Column(
                modifier = Modifier.fillMaxWidth().clip(MegaCardShape).background(MegaSurface).padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(order.id, style = MaterialTheme.typography.titleSmall, color = MegaInk)
                    Text(order.status.uppercase(), style = MaterialTheme.typography.labelSmall, color = MegaLime)
                }
                Text("${order.items.size} productos", style = MaterialTheme.typography.bodySmall, color = MegaInk3)
                Text(order.total.asClp(), style = MaterialTheme.typography.titleMedium, color = MegaLime)
                onAdvance.let { action ->
                    val next = cl.megatechnology.shop.util.nextStatus(order.status)
                    if (next != null) {
                        OutlinedButton(onClick = { action(order) }, shape = MegaPill) {
                            Text("Avanzar a ${next}", color = MegaGold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ServiceScreen() {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("SERVICIO TÉCNICO", style = MaterialTheme.typography.displayMedium, color = MegaInk)
            Text("Reparaciones rápidas y garantía incluida", style = MaterialTheme.typography.bodyMedium, color = MegaInk2)
        }
        item {
            Text(
                "Diagnóstico gratis · sin compromiso",
                style = MaterialTheme.typography.labelLarge,
                color = MegaLime,
                modifier = Modifier
                    .clip(MegaPill)
                    .background(MegaLimeSoft)
                    .padding(horizontal = 14.dp, vertical = 9.dp),
            )
        }
        listOf(
            "Reparación de pantalla" to "Desde $59.990",
            "Cambio de batería" to "Desde $24.990",
            "Puerto de carga" to "Desde $19.990",
            "Daño por agua" to "Desde $34.990",
        ).forEach { (title, price) ->
            Row(
                modifier = Modifier.fillMaxWidth().clip(MegaCardShape).background(MegaSurface).padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(title, style = MaterialTheme.typography.titleMedium, color = MegaInk)
                Text(price, style = MaterialTheme.typography.labelLarge, color = MegaGold)
            }
        }
    }
}

/** Input del sistema: mismo lenguaje que `field__box` de la web. */
@Composable
fun MegaField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    keyboardType: KeyboardType = KeyboardType.Text,
) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = MegaInk2)
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MegaLime,
                unfocusedBorderColor = MegaLine,
                focusedTextColor = MegaInk,
                unfocusedTextColor = MegaInk,
                cursorColor = MegaLime,
            ),
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
fun EmptyState(message: String, onAction: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(message, style = MaterialTheme.typography.titleMedium, color = MegaInk2)
        OutlinedButton(onClick = onAction, shape = MegaPill) {
            Text("Explorar catálogo", color = MegaGold)
        }
    }
}
