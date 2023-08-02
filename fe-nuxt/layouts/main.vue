<template>
    <main :class='$style[`main-layout`]'>
        <slot />
    </main>
</template>

<style module>
.main-layout {
    height: 100%;
}
</style>
