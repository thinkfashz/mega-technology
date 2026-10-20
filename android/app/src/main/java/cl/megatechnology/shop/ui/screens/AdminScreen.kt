package cl.megatechnology.shop.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import cl.megatechnology.shop.data.model.Product
import cl.megatechnology.shop.ui.ShopUiState
import cl.megatechnology.shop.ui.components.MegaCardShape
import cl.megatechnology.shop.ui.components.MegaPill
import cl.megatechnology.shop.ui.components.ProductArt
import cl.megatechnology.shop.ui.theme.MegaGold
import cl.megatechnology.shop.ui.theme.MegaInk
import cl.megatechnology.shop.ui.theme.MegaInk2
import cl.megatechnology.shop.ui.theme.MegaInk3
import cl.megatechnology.shop.ui.theme.MegaLine
import cl.megatechnology.shop.ui.theme.MegaLime
import cl.megatechnology.shop.ui.theme.MegaSurface
import cl.megatechnology.shop.ui.theme.MegaSurface2
import cl.megatechnology.shop.util.asClp

/**
 * Panel de administración. Réplica de `app/src/screens/admin/admin.js`:
 * KPIs, gráfico de ventas, cambio de estado y control de stock.
 */
@Composable
fun AdminScreen(
    state: ShopUiState,
    onRefresh: () -> Unit,
    onUpdateStock: (Product, Int) -> Unit,
) {
    val stats = state.stats
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Color(0xFF060606)),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom,
            ) {
                Column {
                    Text("EN VIVO · ${state.orders.size} pedidos", style = MaterialTheme.typography.labelSmall, color = MegaLime)
                    Text("PANEL", style = MaterialTheme.typography.displayMedium, color = MegaInk)
                }
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(MegaPill)
                        .background(MegaSurface2)
                        .clickable(onClick = onRefresh),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Outlined.Add, "Actualizar", tint = MegaGold)
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Kpi("Ventas", stats.sales.asClp(), MegaLime, Modifier.weight(1f))
                Kpi("Pedidos", stats.count.toString(), MegaInk, Modifier.weight(1f))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Kpi("Ticket prom.", stats.avg.asClp(), MegaInk, Modifier.weight(1f))
                Kpi("Stock bajo", stats.lowStock.toString(), MegaGold, Modifier.weight(1f))
            }
        }
        item {
            Column(
                modifier = Modifier.fillMaxWidth().clip(MegaCardShape).background(MegaSurface).padding(14.dp),
            ) {
                Text("VENTAS ÚLTIMOS ${stats.daily.size} DÍAS", style = MaterialTheme.typography.labelSmall, color = MegaInk3)
                Text(stats.sales.asClp(), style = MaterialTheme.typography.headlineMedium, color = MegaLime)
                SalesChart(
                    values = stats.daily.map { it.value },
                    modifier = Modifier.fillMaxWidth().height(140.dp).padding(top = 10.dp),
                )
            }
        }
        item {
            Text("PRODUCTOS", style = MaterialTheme.typography.titleLarge, color = MegaInk)
        }
        items(state.products) { product ->
            Row(
                modifier = Modifier.fillMaxWidth().clip(MegaCardShape).background(MegaSurface).padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                ProductArt(art = product.art, contentDescription = product.name, modifier = Modifier.size(46.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(product.name, style = MaterialTheme.typography.titleSmall, color = MegaInk, maxLines = 1)
                    Text("${product.stock} un.", style = MaterialTheme.typography.labelSmall, color = MegaInk3)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(product.price.asClp(), style = MaterialTheme.typography.titleSmall, color = MegaLime)
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        SmallButton(Icons.Outlined.Remove) { onUpdateStock(product, product.stock - 1) }
                        SmallButton(Icons.Outlined.Add) { onUpdateStock(product, product.stock + 1) }
                    }
                }
            }
        }
    }
}

@Composable
private fun Kpi(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(MegaCardShape)
            .background(MegaSurface)
            .padding(14.dp),
    ) {
        Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = MegaInk3)
        Text(value, style = MaterialTheme.typography.headlineMedium, color = color)
    }
}

@Composable
private fun SmallButton(icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(26.dp)
            .clip(MegaPill)
            .background(MegaSurface2)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, null, tint = MegaInk2, modifier = Modifier.size(13.dp))
    }
}

/** Gráfico SVG equivalente: área + línea, dibujado con Canvas. */
@Composable
fun SalesChart(values: List<Int>, modifier: Modifier = Modifier) {
    val max = (values.maxOrNull() ?: 1).coerceAtLeast(1)
    Canvas(modifier = modifier) {
        if (values.isEmpty()) return@Canvas
        val stepX = size.width / (values.size - 1).coerceAtLeast(1)
        val points = values.mapIndexed { index, value ->
            androidx.compose.ui.geometry.Offset(
                x = index * stepX,
                y = size.height - (value.toFloat() / max) * size.height,
            )
        }
        val line = Path().apply {
            moveTo(points.first().x, points.first().y)
            points.drop(1).forEach { lineTo(it.x, it.y) }
        }
        val area = Path().apply {
            moveTo(points.first().x, size.height)
            points.forEach { lineTo(it.x, it.y) }
            lineTo(points.last().x, size.height)
            close()
        }
        drawPath(
            path = area,
            brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                listOf(MegaLime.copy(alpha = 0.28f), Color.Transparent),
            ),
        )
        drawPath(path = line, color = MegaLime, style = Stroke(width = 3f))
        points.forEach { drawCircle(MegaLime, radius = 4f, center = it) }
    }
}
