<script lang="ts">
    import type { Snippet } from 'svelte';

    type Props = {
        closeDialog: () => void;
        width?: number;
        children: Snippet;
    };
    const { closeDialog, width = 520, children }: Props = $props();
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') closeDialog(); }} />

<div class="wrap">
    <div class="board" role="dialog" aria-modal="true" style:width="min(100%, {width}px)">
        {@render children()}
    </div>
</div>

<style lang="scss">
    .wrap {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 24px;
        z-index: 9999;
    }
    .board {
        background-color: #f9f9f9;
        border-radius: 6px;
        max-height: 100%;
        overflow-y: auto;
    }
</style>
