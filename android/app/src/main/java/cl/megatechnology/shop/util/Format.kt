package cl.megatechnology.shop.util

import java.text.NumberFormat
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

private val clp: NumberFormat = NumberFormat.getCurrencyInstance(Locale("es", "CL")).apply {
    maximumFractionDigits = 0
    minimumFractionDigits = 0
}

fun Int.asClp(): String = clp.format(this)

fun String.asShortDate(): String = runCatching {
    val formatter = DateTimeFormatter.ofPattern("d MMM · HH:mm", Locale("es", "CL"))
    Instant.parse(this).atZone(ZoneId.of("America/Santiago")).format(formatter)
}.getOrDefault(this)

/** Próximo estado del flujo, usado por el panel. */
fun nextStatus(current: String): String? = when (current) {
    "pending" -> "paid"
    "paid" -> "shipped"
    "shipped" -> "delivered"
    else -> null
}
