package cl.megatechnology.shop

import android.app.Application
import cl.megatechnology.shop.data.ServiceLocator

class MegaApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Calienta el cliente de red para que la primera pantalla no espere.
        ServiceLocator.repository
    }
}
