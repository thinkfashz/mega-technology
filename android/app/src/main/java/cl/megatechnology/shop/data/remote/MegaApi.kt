package cl.megatechnology.shop.data.remote

import cl.megatechnology.shop.data.model.Category
import cl.megatechnology.shop.data.model.CreateOrderRequest
import cl.megatechnology.shop.data.model.Order
import cl.megatechnology.shop.data.model.Product
import cl.megatechnology.shop.data.model.ServiceRequest
import cl.megatechnology.shop.data.model.ServiceRequestResponse
import cl.megatechnology.shop.data.model.Stats
import cl.megatechnology.shop.data.model.UpdateProductRequest
import cl.megatechnology.shop.data.model.UpdateStatusRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** Contrato espejo de api/openapi.yaml. */
interface MegaApi {

    @GET("products")
    suspend fun products(
        @Query("q") query: String? = null,
        @Query("category") category: String? = null,
        @Query("color") color: String? = null,
        @Query("sort") sort: String = "relevance",
        @Query("maxPrice") maxPrice: Int? = null,
    ): List<Product>

    @GET("products/{id}")
    suspend fun product(@Path("id") id: String): Product

    @GET("categories")
    suspend fun categories(): List<Category>

    @GET("orders")
    suspend fun orders(
        @Query("status") status: String? = null,
        @Query("limit") limit: Int = 50,
    ): List<Order>

    @GET("orders/{id}")
    suspend fun order(@Path("id") id: String): Order

    @POST("orders")
    suspend fun createOrder(@Body body: CreateOrderRequest): Order

    @PATCH("orders/{id}")
    suspend fun updateOrderStatus(
        @Path("id") id: String,
        @Body body: UpdateStatusRequest,
    ): Order

    @POST("service-requests")
    suspend fun createServiceRequest(@Body body: ServiceRequest): ServiceRequestResponse

    @GET("admin/stats")
    suspend fun adminStats(@Query("days") days: Int = 7): Stats

    @PATCH("admin/products/{id}")
    suspend fun updateProduct(
        @Path("id") id: String,
        @Body body: UpdateProductRequest,
    ): Product
}
