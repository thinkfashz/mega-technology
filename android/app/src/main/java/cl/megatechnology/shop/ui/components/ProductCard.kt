package cl.megatechnology.shop.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import cl.megatechnology.shop.data.model.Product
import cl.megatechnology.shop.ui.theme.MegaGold
import cl.megatechnology.shop.ui.theme.MegaInk
import cl.megatechnology.shop.ui.theme.MegaInk2
import cl.megatechnology.shop.ui.theme.MegaInk3
import cl.megatechnology.shop.ui.theme.MegaLine
import cl.megatechnology.shop.ui.theme.MegaLime
import cl.megatechnology.shop.ui.theme.MegaLimeSoft
import cl.megatechnology.shop.ui.theme.MegaSurface
import cl.megatechnology.shop.ui.theme.MegaSurface2
import cl.megatechnology.shop.util.asClp

@Composable
fun ProductCard(
    product: Product,
    favorite: Boolean,
    onOpen: () -> Unit,
    onToggleFavorite: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        onClick = onOpen,
        modifier = modifier.fillMaxWidth(),
        shape = MegaCardShape,
        colors = CardDefaults.cardColors(containerColor = MegaSurface),
        border = BorderStroke(1.dp, MegaLine),
    ) {
        Box {
            ProductArt(
                art = product.art,
                contentDescription = product.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f / 1.12f)
                    .padding(8.dp)
                    .clip(RoundedCornerShape(14.dp)),
            )

            if (product.badge != null) {
                Text(
                    text = product.badge,
                    style = MaterialTheme.typography.labelSmall,
                    color = if (product.badgeTone == "gold") MegaGold else MegaLime,
                    modifier = Modifier
                        .padding(10.dp)
                        .clip(MegaPill)
                        .background(if (product.badgeTone == "gold") MegaGold.copy(alpha = 0.14f) else MegaLimeSoft)
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                )
            }

            IconButton(
                onClick = onToggleFavorite,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(6.dp)
                    .size(34.dp)
                    .clip(MegaPill)
                    .background(MegaSurface2.copy(alpha = 0.85f)),
            ) {
                Icon(
                    imageVector = if (favorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                    contentDescription = if (favorite) "Quitar de favoritos" else "Guardar en favoritos",
                    tint = if (favorite) MegaLime else MegaInk2,
                    modifier = Modifier.size(17.dp),
                )
            }
        }

        Column(
            modifier = Modifier.padding(start = 11.dp, end = 11.dp, bottom = 12.dp, top = 2.dp),
            verticalArrangement = Arrangement.spacedBy(3.dp),
        ) {
            Text(
                text = product.name,
                style = MaterialTheme.typography.titleSmall,
                color = MegaInk,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = product.price.asClp(),
                    style = MaterialTheme.typography.titleMedium,
                    color = MegaLime,
                    fontWeight = FontWeight.ExtraBold,
                )
                product.compareAt?.let { before ->
                    Text(
                        text = before.asClp(),
                        style = MaterialTheme.typography.bodySmall,
                        color = MegaInk3,
                        textDecoration = TextDecoration.LineThrough,
                        modifier = Modifier.padding(start = 5.dp),
                    )
                }
            }
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(3.dp),
            ) {
                Text(
                    text = "${product.sold} vendidos",
                    style = MaterialTheme.typography.labelSmall,
                    color = MegaInk3,
                )
                Icon(Icons.Outlined.Star, contentDescription = null, tint = MegaGold, modifier = Modifier.size(11.dp))
                Text(
                    text = product.rating.toString(),
                    style = MaterialTheme.typography.labelSmall,
                    color = MegaInk2,
                )
            }
        }
    }
}

@Composable
fun PriceLine(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    emphasis: Boolean = false,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = if (emphasis) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyMedium,
            color = if (emphasis) MegaInk else MegaInk2,
        )
        Text(
            text = value,
            style = if (emphasis) MaterialTheme.typography.headlineMedium else MaterialTheme.typography.bodyMedium,
            color = if (emphasis) MegaLime else MegaInk,
            fontWeight = if (emphasis) FontWeight.ExtraBold else FontWeight.SemiBold,
        )
    }
}

@Composable
fun DividerLine(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(1.dp)
            .background(MegaLine),
    )
}
