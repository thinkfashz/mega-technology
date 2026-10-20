package cl.megatechnology.shop.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.BatteryChargingFull
import androidx.compose.material.icons.outlined.Cable
import androidx.compose.material.icons.outlined.Headphones
import androidx.compose.material.icons.outlined.PhoneAndroid
import androidx.compose.material.icons.outlined.PhoneIphone
import androidx.compose.material.icons.outlined.Watch
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.shape.RoundedCornerShape
import cl.megatechnology.shop.data.model.Art
import cl.megatechnology.shop.ui.theme.MegaLine
import cl.megatechnology.shop.ui.theme.MegaLime
import cl.megatechnology.shop.ui.theme.MegaSurface
import cl.megatechnology.shop.ui.theme.MegaSurface3

private fun artIcon(kind: String): ImageVector = when (kind) {
    "phone" -> Icons.Outlined.PhoneIphone
    "buds" -> Icons.Outlined.Headphones
    "watch" -> Icons.Outlined.Watch
    "charger" -> Icons.Outlined.BatteryChargingFull
    "cable" -> Icons.Outlined.Cable
    else -> Icons.Outlined.PhoneAndroid
}

private fun parseHex(hex: String, fallback: Color = MegaLime): Color = runCatching {
    Color(android.graphics.Color.parseColor(hex))
}.getOrDefault(fallback)

/**
 * Arte vectorial de producto. Reemplaza las fotos: usa el mismo `kind` que la web
 * y un fondo radial con el color del producto.
 */
@Composable
fun ProductArt(
    art: Art,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
) {
    val tint = parseHex(art.color)
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(
                Brush.radialGradient(
                    colors = listOf(tint.copy(alpha = 0.22f), MegaSurface, MegaSurface3),
                    radius = 420f,
                ),
            ),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = artIcon(art.kind),
            contentDescription = contentDescription,
            tint = tint,
            modifier = Modifier.fillMaxSize(0.55f),
        )
    }
}

/** Fondo global: negro con halos lima/dorado, equivalente a la web. */
@Composable
fun MegaBackground(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MegaSurface)
            .background(
                Brush.radialGradient(
                    colors = listOf(MegaLime.copy(alpha = 0.05f), Color.Transparent),
                    radius = 900f,
                ),
            )
            .background(
                Brush.radialGradient(
                    colors = listOf(Color(0xFFD3A94F).copy(alpha = 0.07f), Color.Transparent),
                    radius = 700f,
                ),
            ),
    ) {
        content()
    }
}

/** Borde fino reutilizable para tarjetas. */
val MegaCardShape = RoundedCornerShape(18.dp)
val MegaPill = RoundedCornerShape(99.dp)
val MegaBorder = MegaLine
