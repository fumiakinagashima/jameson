<script lang="ts">
    import { X } from '@lucide/svelte';
    import { PROJECT_STATUSES, STATUS_LABELS } from '../status';

    type Props = {
        // The current filter, as loaded from the URL.
        text: string;
        status: string;
        onchange: (filter: { text: string; status: string }) => void;
        onclear: () => void;
    };

    const { text: current, status: currentStatus, onchange, onclear }: Props = $props();

    // Follow the loaded filter (e.g. after Clear), but stay editable while typing.
    let text = $derived(current);
    let status = $derived(currentStatus);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const apply = () => {
        clearTimeout(timer);
        onchange({ text: text.trim(), status });
    };
    const typing = () => {
        clearTimeout(timer);
        timer = setTimeout(apply, 300);
    };
</script>

<div class="wrap">
    <div>
        <label for="text">Filter text</label>
        <input id="text" type="text" name="text" class="text" bind:value={text}
            oninput={typing}
            onkeydown={(e) => e.key === 'Enter' && apply()} />
    </div>
    <div>
        <label for="status">Status</label>
        <select id="status" name="status" bind:value={status} onchange={apply}>
            <option value="">Open</option>
            <option value="all">All</option>
            {#each PROJECT_STATUSES as st (st)}
                <option value={st}>{STATUS_LABELS[st]}</option>
            {/each}
        </select>
    </div>
    <div class="button-wrap">
        <button title="Clear search condition" onclick={onclear}>
            <X size={20} />
        </button>
    </div>

</div>

<style lang="scss">
    .wrap {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 8px;
    }
    label {
        display: block;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
        color: #555;
    }
    div.button-wrap {
        display: flex;
        gap: 4px;
    }
    button {
        background-color: transparent;
        border: 0;
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #bbb;
        border-radius: 6px;
        color: #666;
        cursor: pointer;
        &:hover {
            background-color: #f5f5f5;
        }
    }
    select {
        padding: 6px;
        border: 1px solid #bbb;
        border-radius: 6px;
        font-weight: 600;
    }
    input {
        width: 100%;
        padding: 6px 8px;
        border-radius: 4px;
        border: 1px solid #bbb;
    }
    input.text {
        min-width: 350px;
    }
</style>
