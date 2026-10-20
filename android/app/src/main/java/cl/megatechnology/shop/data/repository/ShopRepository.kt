package cl.megatechnology.shop.data.repository

import cl.megatechnology.shop.data.model.Category
import cl.megatechnology.shop.data.model.CreateOrderRequest
import cl.megatechnology.shop.data.model.Order
import cl.megatechnology.shop.data.model.Product
import cl.megatechnology.shop.data.model.ServiceRequest
import cl.megatechnology.shop.data.model.ServiceRequestResponse
import cl.megatechnology.shop.data.model.Stats
import cl.megatechnology.shop.data.model.UpdateProductRequest
import cl.megatechnology.shop.data.model.UpdateStatusRequest
import cl.megatechnology.shop.data.remote.MegaApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.HttpException
import java.io.IOException

/**
 * Único punto de acceso a datos. La UI nunca ve Retrofit.
 * En producción: Room como caché + WorkManager para reintentos offline.
 */
class ShopRepository(private val api: MegaApi) {

    suspend fun products(
        query: String? = null,
        category: String? = null,
        sort: String = "relevance",
    ): Result<List<Product>> = safe {
        api.products(query = query?.takeIf { it.isNotBlank() }, category = category, sort = sort)
    }

    suspend fun product(id: String): Result<Product> = safe { api.product(id) }

    suspend fun categories(): Result<List<Category>> = safe { api.categories() }

    suspend fun orders(): Result<List<Order>> = safe { api.orders() }

    suspend fun createOrder(request: CreateOrderRequest): Result<Order> = safe { api.createOrder(request) }

    suspend fun updateOrderStatus(id: String, status: String): Result<Order> = safe {
        api.updateOrderStatus(id, UpdateStatusRequest(status))
    }

    suspend fun createServiceRequest(request: ServiceRequest): Result<ServiceRequestResponse> = safe {
        api.createServiceRequest(request)
    }

    suspend fun adminStats(days: Int = 7): Result<Stats> = safe { api.adminStats(days) }

    suspend fun updateProduct(id: String, patch: UpdateProductRequest): Result<Product> = safe {
        api.updateProduct(id, patch)
    }

    private suspend fun <T> safe(block: suspend () -> T): Result<T> = withContext(Dispatchers.IO) {
        try {
            Result.success(block())
        } catch (error: HttpException) {
            val message = when (error.code()) {
                401 -> "Sesión expirada. Iniciá sesión de nuevo."
                404 -> "No encontramos ese recurso."
                409 -> "No hay stock suficiente o el estado cambió."
                422 -> "Revisá los datos ingresados."
                in 500..599 -> "El servidor no responde. Intentá en un momento."
                else -> "Error ${error.code()}"
            }
            Result.failure(IllegalStateException(message, error))
        } catch (error: IOException) {
            Result.failure(IllegalStateException("Sin conexión. Revisá tu red.", error))
        } catch (error: Exception) {
            Result.failure(IllegalStateException(error.message ?: "Error inesperado", error))
        }
    }
}
