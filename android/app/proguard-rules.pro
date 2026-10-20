# Modelos serializados
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}

-keep,includedescriptorclasses class cl.megatechnology.shop.**$$serializer { *; }
-keepclassmembers class cl.megatechnology.shop.** {
    *** Companion;
}
-keepclasseswithmembers class cl.megatechnology.shop.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Retrofit
-keepattributes Signature, RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
