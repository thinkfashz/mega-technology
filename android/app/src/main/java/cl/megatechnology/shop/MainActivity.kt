package cl.megatechnology.shop

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import cl.megatechnology.shop.ui.MegaRoot
import cl.megatechnology.shop.ui.theme.MegaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            MegaTheme {
                val viewModel = androidx.lifecycle.viewmodel.compose.viewModel<cl.megatechnology.shop.ui.ShopViewModel>()
                val state by viewModel.state.collectAsState()
                Scaffold(modifier = Modifier) { padding ->
                    MegaRoot(
                        state = state,
                        viewModel = viewModel,
                        contentPadding = padding,
                    )
                }
            }
        }
    }
}
