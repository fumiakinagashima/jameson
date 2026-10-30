<script lang="ts">
    import { Ellipsis, Trophy, CircleX, RotateCcw, Trash2 } from '@lucide/svelte';
    import { m } from '../paraglide/messages.js';

    type Props = {
        // A won or lost project can be reopened but not closed again.
        closed?: boolean;
        onwon?: () => void;
        onlost?: () => void;
        onreopen?: () => void;
        ondelete?: () => void;
    };
    const { closed = false, onwon, onlost, onreopen, ondelete }: Props = $props();

    let open = $state<boolean>(false);
    let root: HTMLElement | undefined = $state();

    const run = (command?: () => void) => {
        open = false;
        command?.();
    };
</script>

<svelte:window
    onclick={(e) => { if (open && !root?.contains(e.target as Node)) open = false; }}
    onkeydown={(e) => { if (e.key === 'Escape') open = false; }}
/>

<div class="root" bind:this={root}>
    <button class="icon-button" title={m.menu_commands()} aria-haspopup="menu" aria-expanded={open}
        onclick={() => open = !open}>
        <Ellipsis size={16} />
    </button>
    {#if open}
        <ul class="menu" role="menu">
            {#if closed}
                <li role="none">
                    <button role="menuitem" onclick={() => run(onreopen)}>
                        <RotateCcw size={16} />{m.reopen()}
                    </button>
                </li>
            {:else}
                <li role="none">
                    <button role="menuitem" onclick={() => run(onwon)}>
                        <Trophy size={16} />{m.mark_won()}
                    </button>
                </li>
                <li role="none">
                    <button role="menuitem" onclick={() => run(onlost)}>
                        <CircleX size={16} />{m.mark_lost()}
                    </button>
                </li>
            {/if}
            <li role="none" class="separator"></li>
            <li role="none">
                <button role="menuitem" class="danger" onclick={() => run(ondelete)}>
                    <Trash2 size={16} />{m.delete()}
                </button>
            </li>
        </ul>
    {/if}
</div>

<style lang="scss">
    .root {
        position: relative;
    }
    button.icon-button {
        background: transparent;
        border: 0;
        border-radius: 8px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:hover {
            background-color: #f0f0f0;
        }
    }
    .menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin: 4px 0 0;
        padding: 4px;
        list-style: none;
        min-width: 140px;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        z-index: 100;
        & button {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            border: 0;
            border-radius: 4px;
            background: transparent;
            font-size: 14px;
            font-weight: 500;
            color: #313131;
            text-align: left;
            cursor: pointer;
            &:hover {
                background-color: #f5f5f5;
            }
            &.danger {
                color: #d33;
            }
        }
        & .separator {
            height: 1px;
            margin: 4px 0;
            background-color: #e2e2e2;
        }
    }
</style>
