package cl.megatechnology.shop.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val MegaColorScheme = darkColorScheme(
    primary = MegaLime,
    onPrimary = MegaOnLime,
    primaryContainer = MegaLimeSoft,
    onPrimaryContainer = MegaLime,
    secondary = MegaGold,
    onSecondary = MegaOnGold,
    secondaryContainer = MegaGoldSoft,
    onSecondaryContainer = MegaGoldLight,
    background = MegaBg,
    onBackground = MegaInk,
    surface = MegaSurface,
    onSurface = MegaInk,
    surfaceVariant = MegaSurface2,
    onSurfaceVariant = MegaInk2,
    outline = MegaLine,
    outlineVariant = MegaLineSoft,
    error = MegaRed,
    onError = MegaBg,
    errorContainer = MegaRedSoft,
    onErrorContainer = MegaRed,
    scrim = MegaScrim,
)

@Composable
fun MegaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    // La marca es siempre oscura: no hay variante clara.
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = MegaBg.toArgb()
            window.navigationBarColor = MegaBg.toArgb()
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = false
                isAppearanceLightNavigationBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = MegaColorScheme,
        typography = MegaTypography,
        content = content,
    )
}
