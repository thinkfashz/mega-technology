package cl.megatechnology.shop.data

import cl.megatechnology.shop.data.remote.NetworkModule
import cl.megatechnology.shop.data.repository.ShopRepository

/**
 * Service locator mínimo para el scaffolding. En un proyecto real se reemplaza
 * por Hilt/Koin sin tocar las pantallas.
 */
object ServiceLocator {
    val repository: ShopRepository by lazy { ShopRepository(NetworkModule.api) }
}
