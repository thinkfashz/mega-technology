package cl.megatechnology.shop.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Favorite
import androidx.compose.material.icons.outlined.GridView
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.navigation.NavType
import cl.megatechnology.shop.ui.screens.AdminScreen
import cl.megatechnology.shop.ui.screens.CartScreen
import cl.megatechnology.shop.ui.screens.CatalogScreen
import cl.megatechnology.shop.ui.screens.CheckoutScreen
import cl.megatechnology.shop.ui.screens.FavoritesScreen
import cl.megatechnology.shop.ui.screens.HomeScreen
import cl.megatechnology.shop.ui.screens.OrdersScreen
import cl.megatechnology.shop.ui.screens.ProductScreen
import cl.megatechnology.shop.ui.screens.ProfileScreen
import cl.megatechnology.shop.ui.screens.ServiceScreen
import cl.megatechnology.shop.ui.theme.MegaBg
import cl.megatechnology.shop.ui.theme.MegaInk2
import cl.megatechnology.shop.ui.theme.MegaLime
import cl.megatechnology.shop.ui.theme.MegaSurface

sealed class TopTab(val route: String, val label: String, val icon: ImageVector) {
    data object Home : TopTab("home", "Inicio", Icons.Outlined.Home)
    data object Catalog : TopTab("catalog", "Tienda", Icons.Outlined.Storefront)
    data object Categories : TopTab("categories", "Categorías", Icons.Outlined.GridView)
    data object Favorites : TopTab("favorites", "Favoritos", Icons.Outlined.Favorite)
    data object Profile : TopTab("profile", "Perfil", Icons.Outlined.Person)
}

val TOP_TABS = listOf(TopTab.Home, TopTab.Catalog, TopTab.Categories, TopTab.Favorites, TopTab.Profile)

/** Raíz de la app: barra inferior + NavHost. Equivale a chrome.js + router.js. */
@Composable
fun MegaRoot(
    state: ShopUiState,
    viewModel: ShopViewModel,
    contentPadding: androidx.compose.foundation.layout.PaddingValues,
) {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val current = backStack?.destination
    val showBar = TOP_TABS.any { tab ->
        current?.hierarchy?.any { it.route == tab.route } == true
    }

    Scaffold(
        containerColor = MegaBg,
        bottomBar = {
            if (showBar) {
                NavigationBar(containerColor = MegaSurface, tonalElevation = 0.dp) {
                    TOP_TABS.forEach { tab ->
                        val selected = current?.hierarchy?.any { it.route == tab.route } == true
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(tab.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, contentDescription = null) },
                            label = { Text(tab.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = MegaLime,
                                selectedTextColor = MegaLime,
                                indicatorColor = MegaLime.copy(alpha = 0.12f),
                                unselectedIconColor = MegaInk2,
                                unselectedTextColor = MegaInk2,
                            ),
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = TopTab.Home.route,
            modifier = Modifier.padding(bottom = padding.calculateBottomPadding()),
        ) {
            composable(TopTab.Home.route) {
                HomeScreen(
                    state = state,
                    onOpenProduct = { id -> navController.navigate("product/$id") },
                    onOpenCatalog = { navController.navigate(TopTab.Catalog.route) },
                    onOpenCategory = { cat -> navController.navigate("catalog?category=$cat") },
                )
            }
            composable(TopTab.Catalog.route) { entry ->
                CatalogScreen(
                    state = state,
                    category = entry.arguments?.getString("category"),
                    onOpenProduct = { id -> navController.navigate("product/$id") },
                    onToggleFavorite = viewModel::toggleFavorite,
                    onOpenCart = { navController.navigate("cart") },
                )
            }
            composable(TopTab.Categories.route) {
                CatalogScreen(
                    state = state,
                    category = null,
                    categoriesOnly = true,
                    onOpenProduct = { id -> navController.navigate("product/$id") },
                    onToggleFavorite = viewModel::toggleFavorite,
                    onOpenCart = { navController.navigate("cart") },
                )
            }
            composable(TopTab.Favorites.route) {
                FavoritesScreen(
                    state = state,
                    onOpenProduct = { id -> navController.navigate("product/$id") },
                    onToggleFavorite = viewModel::toggleFavorite,
                    onAddAll = {
                        state.products.filter { it.id in state.favorites }.forEach {
                            viewModel.addToCart(it, it.colors.firstOrNull()?.id, 1)
                        }
                        navController.navigate("cart")
                    },
                )
            }
            composable(TopTab.Profile.route) {
                ProfileScreen(
                    state = state,
                    onOpenOrders = { navController.navigate("orders") },
                    onOpenAdmin = { navController.navigate("admin") },
                )
            }
            composable(
                route = "product/{id}",
                arguments = listOf(navArgument("id") { type = NavType.StringType }),
            ) { entry ->
                val id = entry.arguments?.getString("id").orEmpty()
                ProductScreen(
                    state = state,
                    product = state.products.firstOrNull { it.id == id || it.slug == id },
                    onBack = { navController.popBackStack() },
                    onAddToCart = { product, colorId, qty ->
                        viewModel.addToCart(product, colorId, qty)
                    },
                    onBuyNow = { product, colorId, qty ->
                        viewModel.addToCart(product, colorId, qty)
                        navController.navigate("checkout")
                    },
                    onToggleFavorite = viewModel::toggleFavorite,
                )
            }
            composable("cart") {
                CartScreen(
                    state = state,
                    onSetQty = viewModel::setQty,
                    onRemove = viewModel::removeLine,
                    onCheckout = { navController.navigate("checkout") },
                    onContinueShopping = { navController.navigate(TopTab.Catalog.route) },
                )
            }
            composable("checkout") {
                CheckoutScreen(
                    state = state,
                    onBack = { navController.popBackStack() },
                    onConfirmed = { order ->
                        navController.navigate("orders?created=${order.id}") { popUpTo("cart") { inclusive = true } }
                    },
                )
            }
            composable("orders") { entry ->
                OrdersScreen(
                    state = state,
                    createdId = entry.arguments?.getString("created"),
                    onAdvance = viewModel::advanceOrder,
                )
            }
            composable("service") { ServiceScreen() }
            composable("admin") {
                AdminScreen(state = state, onRefresh = viewModel::refresh, onUpdateStock = viewModel::updateStock)
            }
        }
    }
}
