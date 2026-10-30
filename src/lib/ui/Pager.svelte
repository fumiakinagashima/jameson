<script lang="ts">
    import { ChevronLeft, ChevronRight } from '@lucide/svelte';
    import { m } from '../paraglide/messages.js';
    import { PAGE_SIZE } from '../project';

    type Props = {
        page: number;
        pageCount: number;
        total: number;
        onpage: (page: number) => void;
    };
    const { page, pageCount, total, onpage }: Props = $props();

    const from = $derived((page - 1) * PAGE_SIZE + 1);
    const to = $derived(Math.min(page * PAGE_SIZE, total));
</script>

{#if pageCount > 1}
    <nav class="pager">
        <span class="range">{m.page_range({ from, to, total })}</span>
        <button title={m.previous_page()} aria-label={m.previous_page()} disabled={page <= 1}
            onclick={() => onpage(page - 1)}>
            <ChevronLeft size={20} />
        </button>
        <button title={m.next_page()} aria-label={m.next_page()} disabled={page >= pageCount}
            onclick={() => onpage(page + 1)}>
            <ChevronRight size={20} />
        </button>
    </nav>
{/if}

<style lang="scss">
    .pager {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
    }
    .range {
        font-size: 13px;
        color: #555;
    }
    button {
        background-color: transparent;
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #bbb;
        border-radius: 6px;
        color: #666;
        cursor: pointer;
        &:hover:not(:disabled) {
            background-color: #f5f5f5;
        }
        &:disabled {
            opacity: 0.4;
            cursor: default;
        }
    }
</style>
