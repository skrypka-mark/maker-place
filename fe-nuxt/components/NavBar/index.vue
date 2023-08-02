<script setup>
// import Logo from '~/assets/logo.svg';

const links = [
    { label: 'Home', path: '/' },
    { label: 'Support', path: '/support' },
    { label: 'News', path: '/news' },
    { label: 'Reviews', path: '/reviews' }
];
</script>

<template>
    <header :class='$style.navbar'>
        <img :class='$style.logo' src='../../assets/logo.svg' />
        <nav :class='$style[`nav-links`]'>
            <ul :class='$style[`nav-links-list`]'>
                <li :key=link.label v-for='link in links'>
                    <RouterLink :to=link.path>
                        {{ link.label }}
                    </RouterLink>
                </li>
            </ul>
            <ul :class='$style[`nav-buttons-list`]'>
                <button>Log in</button>
                <button>Sign up</button>
            </ul>
        </nav>
    </header>
</template>

<style module>
.navbar {
    position: fixed;
    inset: 0;
    bottom: auto;

    display: flex;
    flex-direction: row;
    align-items: center;
    height: 3.5rem;

    background-color: rgba(33, 35, 40, .4);
    border-bottom: .5px solid #394147;
    box-shadow: 0px 3px 10px rgba(0, 0, 0, .2);
    backdrop-filter: blur(52px);
}
.logo {
    height: 100%;
}
.nav-links {
    display: flex;
    flex-direction: row;
}
.nav-links,
.nav-links > button {
    font-size: 16px;
    font-weight: 700;
}

.nav-links-list {
    display: flex;
    flex-direction: row;
    column-gap: 50px;
}
.nav-links-list > li > a {
    color: white;
}
.nav-links-list li a.router-link-active {
    color: #7294E9;
}

.nav-buttons-list {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
}
</style>
