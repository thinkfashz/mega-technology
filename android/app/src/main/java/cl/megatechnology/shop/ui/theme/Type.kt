package cl.megatechnology.shop.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Inter se puede empaquetar en res/font/inter_*.ttf y cambiar FontFamily aquí.
// Se usa SansSerif para que el scaffolding compile sin binarios.
private val Ui = FontFamily.SansSerif
private val Brand = FontFamily.Serif

val MegaTypography = Typography(
    displayLarge = TextStyle(fontFamily = Ui, fontWeight = FontWeight.ExtraBold, fontSize = 40.sp, lineHeight = 42.sp, letterSpacing = (-1.6).sp),
    displayMedium = TextStyle(fontFamily = Ui, fontWeight = FontWeight.ExtraBold, fontSize = 32.sp, lineHeight = 34.sp, letterSpacing = (-1.2).sp),
    headlineLarge = TextStyle(fontFamily = Ui, fontWeight = FontWeight.ExtraBold, fontSize = 26.sp, lineHeight = 30.sp, letterSpacing = (-0.8).sp),
    headlineMedium = TextStyle(fontFamily = Ui, fontWeight = FontWeight.Bold, fontSize = 22.sp, lineHeight = 26.sp, letterSpacing = (-0.5).sp),
    titleLarge = TextStyle(fontFamily = Ui, fontWeight = FontWeight.Bold, fontSize = 18.sp, lineHeight = 22.sp),
    titleMedium = TextStyle(fontFamily = Ui, fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 20.sp),
    titleSmall = TextStyle(fontFamily = Ui, fontWeight = FontWeight.SemiBold, fontSize = 13.sp, lineHeight = 18.sp),
    bodyLarge = TextStyle(fontFamily = Ui, fontWeight = FontWeight.Normal, fontSize = 15.sp, lineHeight = 22.sp),
    bodyMedium = TextStyle(fontFamily = Ui, fontWeight = FontWeight.Normal, fontSize = 13.sp, lineHeight = 19.sp),
    bodySmall = TextStyle(fontFamily = Ui, fontWeight = FontWeight.Normal, fontSize = 11.sp, lineHeight = 16.sp),
    labelLarge = TextStyle(fontFamily = Ui, fontWeight = FontWeight.Bold, fontSize = 13.sp, letterSpacing = 0.2.sp),
    labelMedium = TextStyle(fontFamily = Ui, fontWeight = FontWeight.SemiBold, fontSize = 11.sp, letterSpacing = 0.4.sp),
    labelSmall = TextStyle(fontFamily = Ui, fontWeight = FontWeight.Bold, fontSize = 9.sp, letterSpacing = 1.2.sp),
)

val BrandTypography = TextStyle(
    fontFamily = Brand,
    fontWeight = FontWeight.SemiBold,
    fontSize = 15.sp,
    letterSpacing = 2.4.sp,
)
