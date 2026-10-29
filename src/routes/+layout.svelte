<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import { m } from '#lib/paraglide/messages.js';
	import type { LayoutProps } from './$types';
    import { User, LogOut } from '@lucide/svelte';
	import './app.scss';

	let { children, data }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
    <title>{m.app_title()}</title>
</svelte:head>

<header>
    <p>JAMESON</p>
    <div class="menu">
        {#if data.user}
            <span class="user"><User size={16} />{data.user.email}</span>
            <!-- A full page load, so the request reaches Access instead of the SvelteKit router. -->
            <a class="logout" href="/cdn-cgi/access/logout" rel="external"><LogOut size={16} />{m.logout()}</a>
        {/if}
    </div>
</header>
{@render children()}

<style lang="scss">
    :global(body) {
        background-color: #fbfbfb;
    }
    header {
        height: 48px;
        background-color: #054;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        & p {
            font-size: 18px;
            color: #f6f6f6;
            line-height: 1;
            font-weight: 600;
            margin: 0;
        }
        & div.menu {
            display: flex;
            align-items: center;
            gap: 24px;
        }
        & .user, & a.logout {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #f6f6f6;
            font-size: 13px;
            line-height: 1;
        }
        & a.logout {
            text-decoration: none;
            &:hover {
                text-decoration: underline;
            }
        }
    }
    
</style>
