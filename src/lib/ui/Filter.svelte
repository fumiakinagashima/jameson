<script lang="ts">
    import { X } from '@lucide/svelte';
    import { m } from '../paraglide/messages.js';
    import { PROJECT_STATUSES, statusLabel } from '../status';

    type Props = {
        // The current filter, as loaded from the URL.
        text: string;
        status: string;
        onchange: (filter: { text: string; status: string }) => void;
        onclear: () => void;
    };

    const { text: current, status: currentStatus, onchange, onclear }: Props = $props();

    // What the inputs show. They start from the loaded filter and follow it when it changes from
    // outside (the back button, a link). A reload of the same data must not overwrite what is
    // being typed, and neither must the page catching up with what was just typed.
    // svelte-ignore state_referenced_locally
    let text = $state<string>(current);
    // svelte-ignore state_referenced_locally
    let status = $state<string>(currentStatus);

    let timer: ReturnType<typeof setTimeout> | undefined;
    // svelte-ignore state_referenced_locally
    let seenText = current;
    // svelte-ignore state_referenced_locally
    let seenStatus = currentStatus;

    $effect(() => {
        if (current !== seenText) {
            seenText = current;
            // While a change is waiting to be applied, the person is typing and their text wins.
            if (!timer) text = current;
        }
        if (currentStatus !== seenStatus) {
            seenStatus = currentStatus;
            status = currentStatus;
        }
    });

    const stopTimer = () => {
        clearTimeout(timer);
        timer = undefined;
    };
    const apply = () => {
        stopTimer();
        onchange({ text: text.trim(), status });
    };
    const typing = () => {
        stopTimer();
        timer = setTimeout(apply, 300);
    };
    const clear = () => {
        stopTimer();
        text = '';
        status = '';
        onclear();
    };
</script>

<div class="wrap">
    <div>
        <label for="text">{m.filter_text()}</label>
        <input id="text" type="text" name="text" class="text" bind:value={text}
            oninput={typing}
            onkeydown={(e) => e.key === 'Enter' && apply()} />
    </div>
    <div>
        <label for="status">{m.status()}</label>
        <select id="status" name="status" bind:value={status} onchange={apply}>
            <option value="">{m.filter_open()}</option>
            <option value="all">{m.filter_all()}</option>
            {#each PROJECT_STATUSES as st (st)}
                <option value={st}>{statusLabel(st)}</option>
            {/each}
        </select>
    </div>
    <div class="button-wrap">
        <button title={m.clear_filter()} onclick={clear}>
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
