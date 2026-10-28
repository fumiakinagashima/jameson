<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
    import { User, Settings } from '@lucide/svelte';
	import './app.scss';
	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header>
    <p>JAMESON</p>
    <div class="menu">
        <button><Settings color="#fbfbfb" size={20} /></button>
        <button><User color="#fbfbfb" size={20} /></button>
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
            gap: 16px;
        }
        & button {
            background: transparent;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0px;
            border: 0;
            width: 32px;
            height: 32px;
            font-weight: 500;
            cursor: pointer;
        }
    }
</style>
