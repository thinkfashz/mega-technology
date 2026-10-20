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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.LocalShipping
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material.icons.outlined.VerifiedUser
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import cl.megatechnology.shop.data.model.Product
import cl.megatechnology.shop.ui.ShopUiState
import cl.megatechnology.shop.ui.components.MegaCardShape
import cl.megatechnology.shop.ui.components.MegaPill
import cl.megatechnology.shop.ui.components.ProductArt
import cl.megatechnology.shop.ui.components.ProductCard
import cl.megatechnology.shop.ui.theme.MegaGold
import cl.megatechnology.shop.ui.theme.MegaInk
import cl.megatechnology.shop.ui.theme.MegaInk2
import cl.megatechnology.shop.ui.theme.MegaInk3
import cl.megatechnology.shop.ui.theme.MegaLine
import cl.megatechnology.shop.ui.theme.MegaLime
import cl.megatechnology.shop.ui.theme.MegaLimeSoft
import cl.megatechnology.shop.ui.theme.MegaOnLime
import cl.megatechnology.shop.ui.theme.MegaSurface
import cl.megatechnology.shop.ui.theme.MegaSurface2
import cl.megatechnology.shop.util.asClp

@Composable
fun HomeScreen(
    state: ShopUiState,
    onOpenProduct: (String) -> Unit,
    onOpenCatalog: () -> Unit,
    onOpenCategory: (String) -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            HeroBanner(onClick = onOpenCatalog)
        }
        item {
            SectionTitle("Categorías", action = "Ver todas", onAction = onOpenCatalog)
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(state.categories) { category ->
                    Column(
                        modifier = Modifier
                            .width(96.dp)
                            .clip(MegaCardShape)
                            .background(MegaSurface)
                            .clickable { onOpenCategory(category.id) }
                            .padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        ProductArt(
                            art = category.art,
                            contentDescription = category.name,
                            modifier = Modifier.fillMaxWidth().aspectRatio(1f / 1.25f),
                        )
                        Text(
                            text = category.name,
                            style = MaterialTheme.typography.labelMedium,
                            color = MegaInk,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(top = 6.dp),
                        )
                        Text(
                            text = "${category.count} artículos",
                            style = MaterialTheme.typography.labelSmall,
                            color = MegaGold,
                        )
                    }
                }
            }
        }
        item {
            SectionTitle("Más vendidos", action = "Ver todo", onAction = onOpenCatalog)
        }
        items(state.products.sortedByDescending { it.sold }.take(6)) { product ->
            ProductCard(
                product = product,
                favorite = product.id in state.favorites,
                onOpen = { onOpenProduct(product.id) },
                onToggleFavorite = {},
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        item { ServiceBanner() }
        item { TrustRow() }
    }
}

@Composable
private fun HeroBanner(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .clip(RoundedCornerShape(26.dp))
            .background(
                androidx.compose.ui.graphics.Brush.linearGradient(
                    listOf(Color(0xFF151515), Color(0xFF0A0A0A)),
                ),
            )
            .padding(20.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
                text = "NUEVA COLECCIÓN 2026",
                style = MaterialTheme.typography.labelSmall,
                color = MegaLime,
                modifier = Modifier
                    .clip(MegaPill)
                    .background(MegaLimeSoft)
                    .padding(horizontal = 10.dp, vertical = 5.dp),
            )
            Text(
                text = "NUEVA SERIE\nIPHONE 15",
                style = MaterialTheme.typography.displayMedium,
                color = MegaInk,
            )
            Text(
                text = "Última tecnología. Accesorios premium.",
                style = MaterialTheme.typography.bodyMedium,
                color = MegaInk2,
            )
            Button(
                onClick = onClick,
                colors = ButtonDefaults.buttonColors(containerColor = MegaLime, contentColor = MegaOnLime),
                shape = MegaPill,
            ) {
                Text("Comprar ahora →", fontWeight = FontWeight.ExtraBold)
            }
        }
    }
}

@Composable
fun SectionTitle(title: String, action: String? = null, onAction: () -> Unit = {}) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(title.uppercase(), style = MaterialTheme.typography.titleLarge, color = MegaInk)
            Box(
                modifier = Modifier
                    .padding(top = 5.dp)
                    .size(width = 34.dp, height = 3.dp)
                    .clip(MegaPill)
                    .background(MegaLime),
            )
        }
        action?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.labelLarge,
                color = MegaGold,
                modifier = Modifier.clickable(onClick = onAction),
            )
        }
    }
}

@Composable
private fun ServiceBanner() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(MegaCardShape)
            .background(MegaSurface)
            .padding(16.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text("Servicio técnico", style = MaterialTheme.typography.titleMedium, color = MegaInk)
            Text(
                "Reparaciones rápidas y garantía incluida. Diagnóstico gratis.",
                style = MaterialTheme.typography.bodySmall,
                color = MegaInk3,
            )
        }
    }
}

@Composable
private fun TrustRow() {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
    ) {
        Trust(Icon(Icons.Outlined.Lock, null, tint = MegaLime), "Pago seguro")
        Trust(Icon(Icons.Outlined.LocalShipping, null, tint = MegaLime), "Despacho 24 h")
        Trust(Icon(Icons.Outlined.VerifiedUser, null, tint = MegaLime), "Garantía 90 días")
    }
}

@Composable
private fun Trust(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        icon
        Text(label, style = MaterialTheme.typography.labelSmall, color = MegaInk3)
    }
}

@Composable
fun CatalogScreen(
    state: ShopUiState,
    category: String?,
    onOpenProduct: (String) -> Unit,
    onToggleFavorite: (String) -> Unit,
    onOpenCart: () -> Unit,
    categoriesOnly: Boolean = false,
) {
    val products = state.byCategory(category)
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("CATÁLOGO", style = MaterialTheme.typography.displayMedium, color = MegaInk)
                OutlinedButton(
                    onClick = onOpenCart,
                    shape = MegaPill,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MegaGold),
                ) {
                    Icon(Icons.Outlined.ShoppingBag, null, modifier = Modifier.size(16.dp))
                    Text("  ${state.cartCount}")
                }
            }
        }
        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                item {
                    Chip(text = "Todo", active = category == null)
                }
                items(state.categories) { cat ->
                    Chip(text = cat.name, active = category == cat.id)
                }
            }
        }
        if (categoriesOnly) {
            item {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    state.categories.forEach { cat ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(MegaCardShape)
                                .background(MegaSurface)
                                .clickable { onOpenProduct(cat.id) }
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(cat.name, style = MaterialTheme.typography.titleMedium, color = MegaInk)
                            Text("${cat.count}", style = MaterialTheme.typography.labelLarge, color = MegaGold)
                        }
                    }
                }
            }
        } else {
            item {
                Text(
                    text = "${products.size} artículos encontrados",
                    style = MaterialTheme.typography.labelMedium,
                    color = MegaInk3,
                    modifier = Modifier.padding(horizontal = 16.dp),
                )
            }
            item {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.height(((products.size + 1) / 2 * 300).dp),
                    userScrollEnabled = false,
                ) {
                    items(products) { product ->
                        ProductCard(
                            product = product,
                            favorite = product.id in state.favorites,
                            onOpen = { onOpenProduct(product.id) },
                            onToggleFavorite = { onToggleFavorite(product.id) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun Chip(text: String, active: Boolean) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelMedium,
        color = if (active) MegaLime else MegaInk2,
        modifier = Modifier
            .clip(MegaPill)
            .background(if (active) MegaLimeSoft else MegaSurface2)
            .clickable { }
            .padding(horizontal = 12.dp, vertical = 7.dp),
    )
}

@Composable
fun FavoritesScreen(
    state: ShopUiState,
    onOpenProduct: (String) -> Unit,
    onToggleFavorite: (String) -> Unit,
    onAddAll: () -> Unit,
) {
    val favorites = state.products.filter { it.id in state.favorites }
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom,
            ) {
                Column {
                    Text("FAVORITOS", style = MaterialTheme.typography.displayMedium, color = MegaInk)
                    Text(
                        "${favorites.size} productos guardados",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MegaInk2,
                    )
                }
                OutlinedButton(onClick = onAddAll, shape = MegaPill) {
                    Text("Agregar todo", color = MegaGold)
                }
            }
        }
        if (favorites.isEmpty()) {
            item {
                Text(
                    "Todavía no guardaste nada. Toca el corazón de un producto.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MegaInk3,
                    modifier = Modifier.padding(top = 30.dp),
                )
            }
        }
        items(favorites) { product ->
            ProductCard(
                product = product,
                favorite = true,
                onOpen = { onOpenProduct(product.id) },
                onToggleFavorite = { onToggleFavorite(product.id) },
            )
        }
    }
}

@Composable
fun ProfileScreen(
    state: ShopUiState,
    onOpenOrders: () -> Unit,
    onOpenAdmin: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column {
                    Text("PERFIL", style = MaterialTheme.typography.displayMedium, color = MegaInk)
                    Text("MEGA PRO · ${state.orders.size} pedidos", style = MaterialTheme.typography.bodyMedium, color = MegaInk2)
                }
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(MegaPill)
                        .background(MegaGold),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("M", style = MaterialTheme.typography.titleLarge, color = Color(0xFF1B1203))
                }
            }
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth().clip(MegaCardShape).background(MegaSurface),
                horizontalArrangement = Arrangement.SpaceEvenly,
            ) {
                ProfileStat("${state.orders.size}", "Pedidos")
                ProfileStat("${state.favoritesCount}", "Favoritos")
                ProfileStat(state.orders.sumOf { it.total }.asClp(), "Comprado")
            }
        }
        item { ProfileRow("Mis pedidos", "${state.orders.size}", onOpenOrders) }
        item { ProfileRow("Panel administrador", "LIVE", onOpenAdmin, badge = true) }
    }
}

@Composable
private fun ProfileStat(value: String, label: String) {
    Column(
        modifier = Modifier.padding(vertical = 14.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(value, style = MaterialTheme.typography.titleLarge, color = MegaLime)
        Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = MegaInk3)
    }
}

@Composable
private fun ProfileRow(
    label: String,
    value: String,
    onClick: () -> Unit,
    badge: Boolean = false,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(MegaCardShape)
            .background(MegaSurface)
            .clickable(onClick = onClick)
            .padding(14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.titleMedium, color = MegaInk)
        Text(
            value,
            style = MaterialTheme.typography.labelMedium,
            color = if (badge) MegaLime else MegaInk3,
        )
    }
}
